import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Layers, RefreshCw, RotateCcw, Shuffle, SkipForward, Target, XCircle, Activity } from 'lucide-react';
import { useHandTracking } from '../hooks/useHandTracking';
import { fetchTrainingSamples, savePracticeResult } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/PracticePage.css';

const K = 4;
const DIST_THRESHOLD = 0.35;
const CONFIRM_FRAMES = 28;
const NEXT_DELAY_MS = 700;
const DEFAULT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CONTROL_LABELS = new Set(['space', 'delete', 'idle']);

// ... (Giữ nguyên các hàm extractFeatures, euclidean, knnPredict, getRandomLetter như cũ của bạn)
function extractFeatures(results) {
  const empty = new Array(63).fill(0);
  let leftFeat = empty;
  let rightFeat = empty;

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
  if (features.every(v => v === 0)) return { label: null, distance: Infinity };

  const distances = dataset.map(sample => ({
    label: sample.label,
    dist: euclidean(features, sample.features),
  }));
  distances.sort((a, b) => a.dist - b.dist);

  const nearest = distances.slice(0, k);
  const votes = {};
  nearest.forEach(n => {
    votes[n.label] = (votes[n.label] || 0) + 1;
  });

  let bestLabel = null;
  let bestVotes = -1;
  Object.entries(votes).forEach(([label, count]) => {
    if (count > bestVotes) {
      bestVotes = count;
      bestLabel = label;
    }
  });

  return { label: bestLabel, distance: nearest[0].dist };
}

function getRandomLetter(letters, currentLetter) {
  if (letters.length <= 1) return letters[0] || 'A';

  let next = currentLetter;
  while (next === currentLetter) {
    next = letters[Math.floor(Math.random() * letters.length)];
  }
  return next;
}

export default function PracticePage() {
  const { token } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const datasetRef = useRef(null);
  const targetRef = useRef(null);
  const stableLabelRef = useRef(null);
  const stableCountRef = useRef(0);
  const lockedRef = useRef(false);

  const [dataset, setDataset] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [target, setTarget] = useState('A');
  const [prediction, setPrediction] = useState(null);
  const [distance, setDistance] = useState(null);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('ready');
  const [saveStatus, setSaveStatus] = useState('');
  const [stats, setStats] = useState({ correct: 0, attempts: 0, streak: 0 });

  useEffect(() => {
    fetchTrainingSamples()
      .then(data => setDataset(data))
      .catch(err => setLoadError(err.message));
  }, []);

  const practiceLetters = useMemo(() => {
    const labels = [...new Set((dataset || []).map(sample => sample.label))]
      .filter(label => !CONTROL_LABELS.has(label))
      .filter(label => DEFAULT_LETTERS.includes(label));

    return labels.length > 0 ? labels.sort() : DEFAULT_LETTERS;
  }, [dataset]);

  useEffect(() => {
    datasetRef.current = dataset;
  }, [dataset]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const resetLockState = useCallback(() => {
    stableLabelRef.current = null;
    stableCountRef.current = 0;
    lockedRef.current = false;
    setProgress(0);
  }, []);

  const nextTarget = useCallback(() => {
    setTarget(current => getRandomLetter(practiceLetters, current));
    setFeedback('ready');
    resetLockState();
  }, [practiceLetters, resetLockState]);

  function resetPractice() {
    setStats({ correct: 0, attempts: 0, streak: 0 });
    setFeedback('ready');
    resetLockState();
  }

  const commitAttempt = useCallback((label) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    const isCorrect = label === targetRef.current;
    const targetLabel = targetRef.current;
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      attempts: prev.attempts + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setSaveStatus('Đang lưu kết quả...');

    savePracticeResult({
      targetLabel,
      predictedLabel: label,
      isCorrect,
      distance,
    }, token)
      .then(() => setSaveStatus('Đã lưu vào tiến độ'))
      .catch(err => setSaveStatus(`Chưa lưu được: ${err.message}`));

    window.setTimeout(() => {
      if (isCorrect) {
        nextTarget();
      } else {
        resetLockState();
      }
    }, NEXT_DELAY_MS);
  }, [distance, nextTarget, resetLockState, token]);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, W, H);
    ctx.restore();

    if (results.multiHandLandmarks?.length > 0) {
      results.multiHandLandmarks.forEach((lm, i) => {
        const flipped = lm.map(p => ({ ...p, x: 1 - p.x }));
        const color = results.multiHandedness[i].label === 'Left' ? '#a78bfa' : '#38bdf8';
        window.drawConnectors(ctx, flipped, window.HAND_CONNECTIONS, { color, lineWidth: 3 });
        window.drawLandmarks(ctx, flipped, { color: '#ffffff', radius: 3 });
      });
    }

    const ds = datasetRef.current;
    if (!ds || ds.length === 0 || lockedRef.current) return;

    const features = extractFeatures(results);
    const { label, distance: dist } = knnPredict(features, ds);
    const valid = label && dist <= DIST_THRESHOLD;

    setPrediction(valid ? label : null);
    setDistance(dist);

    if (!valid) {
      stableLabelRef.current = null;
      stableCountRef.current = 0;
      setProgress(0);
      return;
    }

    if (label === stableLabelRef.current) {
      stableCountRef.current += 1;
    } else {
      stableLabelRef.current = label;
      stableCountRef.current = 1;
    }

    setProgress(Math.min(stableCountRef.current / CONFIRM_FRAMES, 1));

    if (stableCountRef.current >= CONFIRM_FRAMES) {
      commitAttempt(label);
    }
  }, [commitAttempt]);

  useHandTracking({ videoRef, onResults });

  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

  if (loadError) {
    return (
      <main className="practice-page">
        <div className="practice-error glass-panel">
          <XCircle size={48} className="error-icon" />
          <h1>Lỗi Dữ Liệu</h1>
          <p>{loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <div className="page-header">
        <h1>Luyện Tập Ký Hiệu</h1>
        <p>Thực hiện cử chỉ tay tương ứng với chữ cái được yêu cầu.</p>
      </div>

      <section className="practice-layout">
        {/* LEFT COLUMN: CAMERA */}
        <div className={`practice-camera-container ${feedback}`}>
          <div className="camera-wrapper">
            <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
            <canvas ref={canvasRef} width={1280} height={720} className="practice-canvas" />

            {!dataset && (
              <div className="practice-loading">
                <RefreshCw size={32} className="practice-spin" />
                <span>Đang tải mô hình...</span>
              </div>
            )}

            <div className="practice-live-badge">
              <span className="live-dot" /> LIVE
            </div>
            
            {/* Tích hợp Progress Bar thẳng vào viền dưới camera để trông ngầu hơn */}
            <div className="camera-progress-track">
              <div className="camera-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          
          <div className="camera-status-bar">
             {feedback === 'correct' && <><CheckCircle2 size={18} /> Chính xác! Chuẩn bị chữ tiếp theo...</>}
             {feedback === 'wrong' && <><XCircle size={18} /> Sai rồi. Vui lòng thử lại.</>}
             {feedback === 'ready' && <><Activity size={18} /> Đang chờ cử chỉ của bạn...</>}
          </div>
        </div>

        {/* RIGHT COLUMN: PANEL */}
        <aside className="practice-sidebar">
          
          {/* Target & Prediction Card */}
          <div className="glass-panel target-prediction-card">
            <div className="card-section">
              <div className="section-label"><Target size={16}/> Mục tiêu</div>
              <div className="target-letter-display">{target}</div>
            </div>
            
            <div className="divider"></div>
            
            <div className="card-section">
              <div className="section-label"><Layers size={16}/> Cảm biến</div>
              <div className={`prediction-display ${prediction === target ? 'match' : ''}`}>
                {prediction || '?'}
              </div>
              <div className="distance-badge">
                Sai số: {distance !== null && distance !== Infinity ? distance.toFixed(3) : '--'}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="glass-panel stats-grid">
            <div className="stat-box">
              <span className="stat-label">Chính xác</span>
              <span className="stat-value correct">{stats.correct}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Đã thử</span>
              <span className="stat-value">{stats.attempts}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Tỉ lệ đúng</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Chuỗi (Streak)</span>
              <span className="stat-value streak">{stats.streak} 🔥</span>
            </div>
          </div>

          {saveStatus && (
            <div className="practice-save-status">
              {saveStatus}
            </div>
          )}

          {/* Controls */}
          <div className="glass-panel controls-grid">
            <button className="btn btn-primary" onClick={nextTarget}>
              <SkipForward size={18} /> Chuyển chữ
            </button>
            <button className="btn btn-secondary" onClick={() => setTarget(getRandomLetter(practiceLetters, target))}>
              <Shuffle size={18} /> Đảo ngẫu nhiên
            </button>
            <button className="btn btn-danger" onClick={resetPractice}>
              <RotateCcw size={18} /> Làm lại từ đầu
            </button>
          </div>

        </aside>
      </section>
    </main>
  );
}
