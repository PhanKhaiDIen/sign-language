import { useCallback, useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

const K = 5;
const DIST_THRESHOLD = 0.3;   // nghiêm ngặt hơn, giảm nhận nhầm
const DATASET_URL = '/data/sign_alphabet_dataset.json';
const CONFIRM_FRAMES = 36;    // ~0.8s giữ ổn định mới commit, cho bạn thời gian phản ứng/rút tay
const COOLDOWN_MS = 900;      // nghỉ sau khi thêm 1 ký tự, tránh gõ lặp liên tục

function extractFeatures(results) {
    const empty = new Array(63).fill(0);
    let leftFeat = empty, rightFeat = empty;

    results.multiHandLandmarks?.forEach((lm, i) => {
        const handedness = results.multiHandedness[i].label;
        const wrist = lm[0];
        const norm = lm.flatMap(p => [p.x - wrist.x, p.y - wrist.y, p.z - wrist.z]);
        if (handedness === 'Left') rightFeat = norm;
        else leftFeat = norm;
    });

    return [...leftFeat, ...rightFeat];
}

function euclidean(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const d = a[i] - b[i];
        sum += d * d;
    }
    return Math.sqrt(sum);
}

function knnPredict(features, dataset, k = K) {
    const isEmpty = features.every(v => v === 0);
    if (isEmpty) return { label: null, distance: Infinity };

    const distances = dataset.map(sample => ({
        label: sample.label,
        dist: euclidean(features, sample.features)
    }));
    distances.sort((a, b) => a.dist - b.dist);

    const nearest = distances.slice(0, k);
    const votes = {};
    nearest.forEach(n => { votes[n.label] = (votes[n.label] || 0) + 1; });

    let bestLabel = null, bestVotes = -1;
    Object.entries(votes).forEach(([lb, count]) => {
        if (count > bestVotes) { bestVotes = count; bestLabel = lb; }
    });

    return { label: bestLabel, distance: nearest[0].dist };
}

export default function SignPredictor() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [dataset, setDataset] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [distance, setDistance] = useState(null);
    const [text, setText] = useState('');
    const [pendingLabel, setPendingLabel] = useState(null);
    const [pendingProgress, setPendingProgress] = useState(0); // 0 -> 1

    useEffect(() => {
        fetch(DATASET_URL)
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(data => setDataset(data))
            .catch(err => setLoadError(err.message));
    }, []);

    
    const datasetRef = useRef(null);
    useEffect(() => { datasetRef.current = dataset; }, [dataset]);

    const stableLabelRef = useRef(null);
    const stableCountRef = useRef(0);
    const cooldownUntilRef = useRef(0);

    function commitLabel(lb) {
        if (lb === 'space') {
            setText(prev => prev + ' ');
        } else if (lb === 'delete') {
            setText(prev => prev.slice(0, -1));
        } else if (lb === 'idle') {
            // idle không làm gì cả
        } else {
            setText(prev => prev + lb);
        }
    }

    // Xoá nhanh bằng bàn phím, không cần ra hình tay "delete"
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Backspace') {
                e.preventDefault();
                setText(prev => prev.slice(0, -1));
            } else if (e.key === 'Escape') {
                // Huỷ ký tự đang chờ xác nhận ngay lập tức (hạ tay xuống cũng được, đây là cách nhanh hơn)
                stableLabelRef.current = null;
                stableCountRef.current = 0;
                setPendingLabel(null);
                setPendingProgress(0);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onResults = useCallback((results) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        ctx.save();
        ctx.clearRect(0, 0, W, H);
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(results.image, 0, 0, W, H);
        ctx.restore();

        if (results.multiHandLandmarks?.length > 0) {
            results.multiHandLandmarks.forEach((lm, i) => {
                const flipped = lm.map(p => ({ ...p, x: 1 - p.x }));
                const color = results.multiHandedness[i].label === 'Left' ? '#fbbf24' : '#38bdf8';
                window.drawConnectors(ctx, flipped, window.HAND_CONNECTIONS, { color, lineWidth: 3 });
                window.drawLandmarks(ctx, flipped, { color: '#fff', radius: 3 });
            });
        }
        const ds = datasetRef.current;
        if (!ds || ds.length === 0) return;

        const features = extractFeatures(results);
        const { label: lb, distance: dist } = knnPredict(features, ds);
        const valid = lb && dist <= DIST_THRESHOLD;

        setPrediction(valid ? lb : null);
        setDistance(dist);

        const now = Date.now();
        if (!valid) {
            stableLabelRef.current = null;
            stableCountRef.current = 0;
            setPendingLabel(null);
            setPendingProgress(0);
            return;
        }

        if (lb === stableLabelRef.current) {
            stableCountRef.current += 1;
        } else {
            stableLabelRef.current = lb;
            stableCountRef.current = 1;
        }

        const inCooldown = now < cooldownUntilRef.current;
        if (inCooldown) {
            setPendingLabel(null);
            setPendingProgress(0);
        } else {
            setPendingLabel(lb);
            setPendingProgress(Math.min(stableCountRef.current / CONFIRM_FRAMES, 1));
        }

        if (stableCountRef.current === CONFIRM_FRAMES && !inCooldown) {
            commitLabel(lb);
            cooldownUntilRef.current = now + COOLDOWN_MS;
            setPendingLabel(null);
            setPendingProgress(0);
        }
    }, []);

    useHandTracking({ videoRef, onResults });

    function speakText() {
        if (!text.trim()) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'vi-VN'; // đổi thành 'en-US' nếu ghép tên tiếng Anh
        utter.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    }

    function clearText() {
        setText('');
    }

    if (loadError) {
        return (
            <div style={{ color: '#ef4444', padding: 20 }}>
                Không tải được dataset: {loadError}
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '90vw', maxWidth: 1280, aspectRatio: '16/9', margin: '0 auto', borderRadius: 12, overflow: 'hidden' }}>
            <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
            <canvas ref={canvasRef} width={1280} height={720} style={{ width: '100%', height: '100%' }} />

            {!dataset && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    Đang tải dataset...
                </div>
            )}

            <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: 10, color: '#fff', fontFamily: 'sans-serif', minWidth: 140 }}>
                <div style={{ fontSize: 48, fontWeight: 800, textAlign: 'center' }}>{prediction ?? '—'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    khoảng cách: {distance !== null && distance !== Infinity ? distance.toFixed(3) : '-'}
                </div>

                {/* Progress bar xác nhận: cho thấy chữ sắp được thêm và còn bao lâu.
                    Rút tay ra hoặc đổi hình tay khác để huỷ nếu thấy sai. */}
                {pendingLabel && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: '#fbbf24', textAlign: 'center', marginBottom: 4 }}>
                            sắp thêm "{pendingLabel}"...
                        </div>
                        <div style={{ height: 6, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${pendingProgress * 100}%`,
                                background: '#fbbf24',
                                transition: 'width 0.05s linear'
                            }} />
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, background: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 10, color: '#fff', fontFamily: 'sans-serif' }}>
                <div style={{ fontSize: 24, fontWeight: 700, minHeight: 32, letterSpacing: 2, marginBottom: 8 }}>
                    {text || <span style={{ color: '#64748b' }}>...</span>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={speakText}>🔊 Đọc tên</button>
                    <button onClick={clearText}>🗑 Xoá chuỗi</button>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                    Giữ yên hình tay ~0.8s để thêm 1 chữ (xem thanh vàng phía trên) • nhấn <b>Backspace</b> để xoá nhanh ký tự cuối • <b>Esc</b> để huỷ chữ đang chờ xác nhận
                </div>
            </div>
        </div>
    );
}