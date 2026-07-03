import { useCallback, useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

const K = 5;
const DIST_THRESHOLD = 0.35;
const DATASET_URL = '/data/sign_alphabet_dataset.json';

function extractFeatures(results) {
    const empty = new Array(63).fill(0);
    let leftFeat = empty, rightFeat = empty;

    results.multiHandLandmarks?.forEach((lm, i) => {
        const handedness = results.multiHandedness[i].label;
        const wrist = lm[0];
        const norm = lm.flatMap(p => [p.x - wrist.x, p.y - wrist.y, p.z - wrist.z]);
        // Giữ đúng logic hoán đổi giống lúc ghi mẫu để feature khớp nhau
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
    Object.entries(votes).forEach(([label, count]) => {
        if (count > bestVotes) { bestVotes = count; bestLabel = label; }
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

    useEffect(() => {
        fetch(DATASET_URL)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => setDataset(data))
            .catch(err => setLoadError(err.message));
    }, []);

    /* eslint-disable react-hooks/refs */
    const datasetRef = useRef(null);
    useEffect(() => { datasetRef.current = dataset; }, [dataset]);
    /* eslint-enable react-hooks/refs */

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

        /* eslint-disable-next-line react-hooks/refs */
        const ds = datasetRef.current;
        if (!ds || ds.length === 0) return;

        const features = extractFeatures(results);
        const { label, distance: dist } = knnPredict(features, ds);

        if (label && dist <= DIST_THRESHOLD) {
            setPrediction(label);
        } else {
            setPrediction(null);
        }
        setDistance(dist);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useHandTracking({ videoRef, onResults });

    if (loadError) {
        return (
            <div style={{ color: '#ef4444', padding: 20 }}>
                Không tải được dataset: {loadError}. Kiểm tra lại file có ở đúng
                <code> public/data/sign_ABC_90samples.json</code> không.
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

            <div style={{
                position: 'absolute', top: 14, left: 14,
                background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: 10,
                color: '#fff', fontFamily: 'sans-serif'
            }}>
                <div style={{ fontSize: 48, fontWeight: 800, textAlign: 'center' }}>
                    {prediction ?? '—'}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    khoảng cách: {distance !== null && distance !== Infinity ? distance.toFixed(3) : '-'}
                </div>
            </div>
        </div>
    );
}