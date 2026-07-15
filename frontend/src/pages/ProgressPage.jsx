import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPracticeStats } from '../services/api';
import '../assets/styles/ProgressPage.css';

export default function ProgressPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPracticeStats(token)
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    let ignore = false;

    fetchPracticeStats(token)
      .then(data => {
        if (!ignore) setStats(data);
      })
      .catch(err => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const weakestLabels = useMemo(() => {
    return (stats?.byLabel || []).filter(item => item.attempts > 0).slice(0, 6);
  }, [stats]);

  const summary = stats?.summary || { attempts: 0, correct: 0, accuracy: 0, avgDistance: null };

  return (
    <main className="progress-page">
      <section className="progress-header">
        <div>
          <div className="progress-badge">
            <TrendingUp size={15} />
            Learning Progress
          </div>
          <h1>Tiến độ luyện tập</h1>
          <p>Theo dõi độ chính xác, chữ còn yếu và các lượt luyện gần nhất của bạn.</p>
        </div>
        <button type="button" onClick={loadStats} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Làm mới
        </button>
      </section>

      {error && <div className="progress-error">{error}</div>}

      <section className="summary-grid">
        <div className="summary-card">
          <span>Lượt luyện</span>
          <strong>{summary.attempts}</strong>
        </div>
        <div className="summary-card">
          <span>Số lần đúng</span>
          <strong>{summary.correct}</strong>
        </div>
        <div className="summary-card">
          <span>Độ chính xác</span>
          <strong>{summary.accuracy}%</strong>
        </div>
        <div className="summary-card">
          <span>Khoảng cách TB</span>
          <strong>{summary.avgDistance ?? 'N/A'}</strong>
        </div>
      </section>

      <section className="progress-layout">
        <div className="progress-panel">
          <div className="panel-title">
            <Target size={18} />
            <h2>Chữ cần luyện thêm</h2>
          </div>

          {weakestLabels.length === 0 ? (
            <p className="empty-text">Chưa có dữ liệu luyện tập. Hãy vào Practice và hoàn thành vài lượt trước.</p>
          ) : (
            <div className="label-list">
              {weakestLabels.map(item => (
                <div className="label-row" key={item.targetLabel}>
                  <div className="label-main">
                    <strong>{item.targetLabel}</strong>
                    <span>{item.correct}/{item.attempts} đúng</span>
                  </div>
                  <div className="label-meter">
                    <div style={{ width: `${item.accuracy}%` }} />
                  </div>
                  <span className="label-accuracy">{item.accuracy}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="progress-panel">
          <div className="panel-title">
            <BarChart3 size={18} />
            <h2>Lượt luyện gần nhất</h2>
          </div>

          {(stats?.recent || []).length === 0 ? (
            <p className="empty-text">Chưa có lượt luyện nào được lưu.</p>
          ) : (
            <div className="recent-list">
              {stats.recent.map((item, index) => (
                <div className={`recent-row ${item.isCorrect ? 'correct' : 'wrong'}`} key={`${item.createdAt}-${index}`}>
                  <div>
                    <strong>{item.targetLabel}</strong>
                    <span>Dự đoán: {item.predictedLabel}</span>
                  </div>
                  <small>{item.isCorrect ? 'Đúng' : 'Sai'}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
