import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Layers, RefreshCw, RotateCcw, Shuffle, SkipForward, Target, XCircle } from 'lucide-react';
import { useHandTracking } from '../hooks/useHandTracking';
import { fetchTrainingSamples } from '../services/api';
import '../assets/styles/PracticePage.css';

const K = 4;
const DIST_THRESHOLD = 0.35;
const CONFIRM_FRAMES = 28;
const NEXT_DELAY_MS = 700;
const DEFAULT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CONTROL_LABELS = new Set(['space', 'delete', 'idle']);

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
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      attempts: prev.attempts + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setFeedback(isCorrect ? 'correct' : 'wrong');

    window.setTimeout(() => {
      if (isCorrect) {
        nextTarget();
      } else {
        resetLockState();
      }
    }, NEXT_DELAY_MS);
  }, [nextTarget, resetLockState]);

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
        const color = results.multiHandedness[i].label === 'Left' ? '#f5e6c8' : '#60a5fa';
        window.drawConnectors(ctx, flipped, window.HAND_CONNECTIONS, { color, lineWidth: 4 });
        window.drawLandmarks(ctx, flipped, { color: '#ffffff', radius: 4 });
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
        <div className="practice-error">
          <XCircle size={42} />
          <h1>Không tải được dữ liệu luyện tập</h1>
          <p>{loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <section className="practice-layout">
        <div className={`practice-camera ${feedback}`}>
          <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
          <canvas ref={canvasRef} width={1280} height={720} className="practice-canvas" />

          {!dataset && (
            <div className="practice-loading">
              <RefreshCw size={30} className="practice-spin" />
              <span>Đang tải dataset luyện tập...</span>
            </div>
          )}

          <div className="practice-live-badge">
            <span />
            LIVE
          </div>
        </div>

        <aside className="practice-panel">
          <div className="practice-card target-card">
            <div className="practice-card-header">
              <Target size={16} />
              <span>Chữ cần luyện</span>
            </div>
            <div className="target-letter">{target}</div>
            <p className="target-help">Hãy làm ký hiệu này và giữ tay ổn định đến khi thanh xác nhận đầy.</p>
          </div>

          <div className={`practice-card feedback-card ${feedback}`}>
            <div className="practice-card-header">
              <Layers size={16} />
              <span>Kết quả hiện tại</span>
            </div>
            <div className="prediction-row">
              <span className="prediction-label">{prediction || '-'}</span>
              <span className="distance-label">
                {distance !== null && distance !== Infinity ? distance.toFixed(4) : 'N/A'}
              </span>
            </div>
            <div className="practice-progress-track">
              <div className="practice-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="feedback-message">
              {feedback === 'correct' && (
                <>
                  <CheckCircle2 size={18} />
                  Đúng rồi, chuyển chữ tiếp theo.
                </>
              )}
              {feedback === 'wrong' && (
                <>
                  <XCircle size={18} />
                  Chưa đúng, thử lại chữ {target}.
                </>
              )}
              {feedback === 'ready' && 'Đưa tay vào khung để bắt đầu.'}
            </div>
          </div>

          <div className="practice-card stats-card">
            <div className="stat-item">
              <span>Đúng</span>
              <strong>{stats.correct}</strong>
            </div>
            <div className="stat-item">
              <span>Lượt thử</span>
              <strong>{stats.attempts}</strong>
            </div>
            <div className="stat-item">
              <span>Độ chính xác</span>
              <strong>{accuracy}%</strong>
            </div>
            <div className="stat-item">
              <span>Chuỗi đúng</span>
              <strong>{stats.streak}</strong>
            </div>
          </div>

          <div className="practice-actions">
            <button type="button" onClick={nextTarget}>
              <SkipForward size={16} />
              Chữ khác
            </button>
            <button type="button" onClick={resetPractice}>
              <RotateCcw size={16} />
              Đặt lại
            </button>
            <button type="button" onClick={() => setTarget(getRandomLetter(practiceLetters, target))}>
              <Shuffle size={16} />
              Ngẫu nhiên
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
