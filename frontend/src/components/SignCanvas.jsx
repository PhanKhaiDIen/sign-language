import { useCallback, useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

const HOLD_FRAMES = 15;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CONTROL_LABELS = ['space', 'delete', 'idle'];
const ALL_LABELS = [...LETTERS, ...CONTROL_LABELS];

function loadDataset() {
    return JSON.parse(localStorage.getItem('signDataset') || '[]');
}

function countByLabel(dataset) {
    const c = {};
    dataset.forEach(s => { c[s.label] = (c[s.label] || 0) + 1; });
    return c;
}

export default function SignCanvas() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null); // Ref dùng cho input file ẩn

    const [label, setLabel] = useState(LETTERS[0]);
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [bufferCount, setBufferCount] = useState(0);
    const [dataset, setDataset] = useState(loadDataset);

    const counts = countByLabel(dataset);
    const totalSamples = dataset.length;

    useEffect(() => {
        localStorage.setItem('signDataset', JSON.stringify(dataset));
    }, [dataset]);

    // Refs dùng cho vòng lặp xử lý frame realtime (MediaPipe)
    /* eslint-disable react-hooks/refs */
    const captureBuffer = useRef([]);
    const recordingRef = useRef(false);
    const recordingLabelRef = useRef(LETTERS[0]);
    /* eslint-enable react-hooks/refs */

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

    function finishRecording(recordedLabel) {
        /* eslint-disable-next-line react-hooks/refs */
        recordingRef.current = false;
        setIsRecording(false);
        setBufferCount(0);

        /* eslint-disable-next-line react-hooks/refs */
        const frames = captureBuffer.current;
        const avg = new Array(126).fill(0);
        frames.forEach(f => f.forEach((v, i) => { avg[i] += v / frames.length; }));

        setDataset(prev => [...prev, { label: recordedLabel, features: avg }]);
        /* eslint-disable-next-line react-hooks/refs */
        captureBuffer.current = [];
    }

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

        /* eslint-disable react-hooks/refs */
        if (recordingRef.current) {
            captureBuffer.current.push(extractFeatures(results));
            setBufferCount(captureBuffer.current.length);
            if (captureBuffer.current.length >= HOLD_FRAMES) {
                finishRecording(recordingLabelRef.current);
            }
        }
        /* eslint-enable react-hooks/refs */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useHandTracking({ videoRef, onResults });

    function startCountdownThenRecord() {
        /* eslint-disable-next-line react-hooks/refs */
        recordingLabelRef.current = label;
        let c = 2;
        setCountdown(c);
        const timer = setInterval(() => {
            c -= 1;
            setCountdown(c);
            if (c <= 0) {
                clearInterval(timer);
                setCountdown(0);
                /* eslint-disable react-hooks/refs */
                captureBuffer.current = [];
                setBufferCount(0);
                recordingRef.current = true;
                /* eslint-enable react-hooks/refs */
                setIsRecording(true);
            }
        }, 700);
    }

    function downloadDataset() {
        const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sign_alphabet_dataset.json';
        a.click();
    }

    // --- THÊM HÀM IMPORT Ở ĐÂY ---
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    // Nối dữ liệu mới vào dataset hiện tại để mở rộng
                    setDataset(prev => [...prev, ...importedData]);
                    alert(`Đã import thành công ${importedData.length} mẫu!`);
                } else {
                    alert('Lỗi: File JSON không đúng định dạng (cần là một mảng).');
                }
            } catch (error) {
                alert('Lỗi khi đọc file JSON: ' + error.message);
            }
            // Reset input để có thể import cùng 1 file nhiều lần nếu muốn
            event.target.value = null; 
        };
        reader.readAsText(file);
    }

    function clearDataset() {
        if (!confirm('Xoá hết dữ liệu?')) return;
        setDataset([]);
    }

    function undoLastSample() {
        setDataset(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (!confirm(`Xoá mẫu cuối cùng (nhãn "${last.label}")?`)) return prev;
            return prev.slice(0, -1);
        });
    }

    return (
        <div style={{ position: 'relative', width: '90vw', maxWidth: 1280, aspectRatio: '16/9', margin: '0 auto', borderRadius: 12, overflow: 'hidden' }}>
            <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
            <canvas ref={canvasRef} width={1280} height={720} style={{ width: '100%', height: '100%' }} />

            {countdown > 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#fff', textShadow: '0 0 20px #000' }}>
                    {countdown}
                </div>
            )}
            {isRecording && (
                <div style={{ position: 'absolute', top: 14, left: 14, color: '#ef4444', fontWeight: 800, fontSize: 18 }}>
                    ● GIỮ YÊN TAY... ({bufferCount}/{HOLD_FRAMES})
                </div>
            )}

            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, background: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 10, color: '#fff', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    <select value={label} onChange={e => setLabel(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
                        {ALL_LABELS.map(l => (
                            <option key={l} value={l}>{l} ({counts[l] || 0} mẫu)</option>
                        ))}
                    </select>
                    <button onClick={startCountdownThenRecord} disabled={isRecording}>🔴 Ghi mẫu "{label}"</button>
                    <button onClick={undoLastSample} disabled={isRecording || totalSamples === 0}>↩️ Xoá mẫu cuối</button>
                    <span>Tổng: {totalSamples} mẫu</span>
                    
                    {/* Thẻ input ẩn để chọn file */}
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileImport} 
                    />
                    {/* Nút bấm để kích hoạt thẻ input ẩn */}
                    <button onClick={() => fileInputRef.current?.click()}>📂 Import JSON</button>
                    
                    <button onClick={downloadDataset}>💾 Tải dataset.json</button>
                    <button onClick={clearDataset}>🗑 Xoá hết</button>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Đưa tay vào khung, chọn ký hiệu, bấm Ghi mẫu → giữ yên tư thế trong lúc đếm "GIỮ YÊN TAY"
                </div>
            </div>
        </div>
    );
}