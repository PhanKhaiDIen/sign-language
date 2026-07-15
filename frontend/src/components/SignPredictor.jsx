import { useCallback, useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { Volume2, Trash2, Cpu, Layers, Keyboard, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import '../assets/styles/SignPredictor.css';
import { fetchTrainingSamples } from '../services/api';

const K = 4;
const DIST_THRESHOLD = 0.35;   
const CONFIRM_FRAMES = 36;
const COOLDOWN_MS = 900;      

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
    const [pendingProgress, setPendingProgress] = useState(0); 

    useEffect(() => {
        fetchTrainingSamples()
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
            // Không thực hiện hành động
        } else {
            setText(prev => prev + lb);
        }
    }

    useEffect(() => {
        function handleKeyDown(e) {
            const target = e.target;
            const isTypingTarget =
                target instanceof HTMLElement &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable);

            if (isTypingTarget) return;

            if (e.key === 'Backspace') {
                e.preventDefault();
                setText(prev => prev.slice(0, -1));
            } else if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar') {
                e.preventDefault();
                setText(prev => prev + ' ');
            } else if (e.key === 'Escape') {
                stableLabelRef.current = null;
                stableCountRef.current = 0;
                setPendingLabel(null);
                setPendingProgress(0);
            }
        }
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
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
                const color = results.multiHandedness[i].label === 'Left' ? '#F5E6C8' : '#60a5fa';
                window.drawConnectors(ctx, flipped, window.HAND_CONNECTIONS, { color, lineWidth: 4 });
                window.drawLandmarks(ctx, flipped, { color: '#ffffff', radius: 4 });
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
        utter.lang = 'vi-VN'; 
        utter.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    }

    function clearText() {
        setText('');
    }

    if (loadError) {
        return (
            <div className="predictor-page">
                <div className="error-container">
                    <AlertTriangle size={48} className="error-icon" />
                    <h2>Lỗi kết nối hệ thống</h2>
                    <p>Không thể tải bộ dữ liệu cấu hình ký hiệu: {loadError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="predictor-page">
            <div className="predictor-layout">

                {/* CỘT TRÁI: Khu vực Camera live stream dữ liệu */}
                <div className={`camera-panel ${prediction ? 'has-prediction' : ''}`}>
                    <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
                    <canvas ref={canvasRef} width={1280} height={720} className="predictor-canvas" />

                    {!dataset && (
                        <div className="loading-overlay">
                            <RefreshCw size={32} className="spin-icon" />
                            <span>ĐỒNG BỘ DỮ LIỆU KNN DATASET...</span>
                        </div>
                    )}

                    <div className="rec-dot-badge">
                        <span className="dot"></span>
                        <span className="text"> LIVE </span>
                    </div>
                </div>

                {/* CỘT PHẢI: Bảng điều khiển & phân tích chỉ số */}
                <div className="side-panel">

                    {/* Khung chữ cái đang nhận diện */}
                    <div className="panel-card prediction-card">
                        <div className="card-header">
                            <Cpu size={16} />
                            <span>KẾT QUẢ NHẬN DIỆN</span>
                        </div>
                        <div className={`prediction-letter ${prediction ? 'active-text' : ''}`}>
                            {prediction ?? '—'}
                        </div>
                        <div className="prediction-distance">
                            <Layers size={14} />
                            <span>Khoảng cách vector: {distance !== null && distance !== Infinity ? distance.toFixed(4) : 'N/A'}</span>
                        </div>

                        {pendingLabel && (
                            <div className="pending-box">
                                <div className="pending-text">
                                    <Sparkles size={12} className="sparkle" />
                                    Đang khóa ký tự <strong>"{pendingLabel}"</strong>
                                </div>
                                <div className="pending-bar-track">
                                    <div
                                        className="pending-bar-fill"
                                        style={{ width: `${pendingProgress * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Khung biên dịch chuỗi văn bản kết quả */}
                    <div className="panel-card text-card">
                        <div className="card-header">
                            <Keyboard size={16} />
                            <span>VĂN BẢN ĐÃ DỊCH CHỮ</span>
                        </div>
                        <div className="text-output-area">
                            {text || <span className="text-placeholder">Hệ thống đang chờ ký hiệu từ tay bạn...</span>}
                        </div>
                        
                        <div className="text-actions">
                            <button onClick={speakText} className="btn-action btn-speak" disabled={!text.trim()}>
                                <Volume2 size={16} />
                                Đọc phát âm
                            </button>
                            <button onClick={clearText} className="btn-action btn-clear" disabled={!text}>
                                <Trash2 size={16} />
                                Xóa toàn bộ
                            </button>
                        </div>
                    </div>

                    {/* Card phím tắt hướng dẫn thông minh */}
                    <div className="panel-card hint-card">
                        <div className="hint-title">💡 HƯỚNG DẪN ĐIỀU KHIỂN NHANH</div>
                        <ul className="hint-list">
                            <li>Giữ yên tư thế bàn tay trong <b>0.8 giây</b> để máy gõ chữ tự động.</li>
                            <li>Ấn nút <b>Backspace</b> trên bàn phím máy tính để xóa nhanh 1 chữ cái.</li>
                            <li>Ấn nút <b>Esc</b> để hủy bỏ tiến trình nạp chữ hiện tại lập tức.</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
