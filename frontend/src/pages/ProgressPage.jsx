import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, RefreshCw, Target, TrendingUp, Award, CheckCircle2, XCircle, Zap, Activity } from 'lucide-react';
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
      {/* HEADER SECTION */}
      <section className="progress-header">
        <div className="header-title-block">
          <div className="progress-badge">
            <TrendingUp size={14} />
            Hành trình học tập
          </div>
          <h1>Thống Kê Tiến Độ</h1>
          <p>Phân tích hiệu suất luyện tập và nhận diện các ký hiệu cần cải thiện.</p>
        </div>
        <button 
          type="button" 
          className="btn-refresh glass-panel" 
          onClick={loadStats} 
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </section>

      {error && (
        <div className="progress-error-banner">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STATS OVERVIEW GRID */}
      <section className="summary-grid">
        <div className="summary-card glass-panel card-blue">
          <div className="card-header-icon">
            <Activity size={20} />
          </div>
          <div className="card-info">
            <span>Tổng lượt luyện</span>
            <strong>{summary.attempts}</strong>
          </div>
        </div>

        <div className="summary-card glass-panel card-green">
          <div className="card-header-icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="card-info">
            <span>Ký hiệu đúng</span>
            <strong>{summary.correct}</strong>
          </div>
        </div>

        <div className="summary-card glass-panel card-purple">
          <div className="card-header-icon">
            <Award size={20} />
          </div>
          <div className="card-info">
            <span>Độ chính xác trung bình</span>
            <strong>{summary.accuracy}%</strong>
          </div>
        </div>

        <div className="summary-card glass-panel card-orange">
          <div className="card-header-icon">
            <Zap size={20} />
          </div>
          <div className="card-info">
            <span>Sai số khớp trung bình (Distance)</span>
            <strong>
              {summary.avgDistance !== null && summary.avgDistance !== undefined
                ? Number(summary.avgDistance).toFixed(4)
                : 'N/A'}
            </strong>
          </div>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="progress-layout">
        
        {/* WEAKEST LETTERS LIST */}
        <div className="progress-panel glass-panel">
          <div className="panel-title">
            <Target size={18} className="icon-target" />
            <h2>Cần Luyện Tập Thêm</h2>
          </div>
          <p className="panel-subtitle">Các ký hiệu có tỉ lệ chính xác chưa cao của bạn.</p>

          {weakestLabels.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có dữ liệu phân tích. Hãy vào phòng luyện tập và thử vài lượt trước nhé!</p>
            </div>
          ) : (
            <div className="label-list">
              {weakestLabels.map(item => (
                <div className="label-row" key={item.targetLabel}>
                  <div className="label-meta">
                    <div className="char-badge">{item.targetLabel}</div>
                    <div className="label-attempts">
                      <strong>{item.correct}</strong>/{item.attempts} lần đúng
                    </div>
                  </div>
                  
                  <div className="label-meter-wrapper">
                    <div className="label-meter">
                      <div 
                        className="label-meter-fill" 
                        style={{ 
                          width: `${item.accuracy}%`,
                          background: item.accuracy < 50 
                            ? 'linear-gradient(90deg, #ef4444, #f97316)' 
                            : 'linear-gradient(90deg, #f59e0b, #10b981)'
                        }} 
                      />
                    </div>
                    <span className="label-accuracy-text">{item.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT SESSIONS */}
        <div className="progress-panel glass-panel">
          <div className="panel-title">
            <BarChart3 size={18} className="icon-chart" />
            <h2>Nhật Ký Gần Đây</h2>
          </div>
          <p className="panel-subtitle">Lịch sử đánh giá thời gian thực từ camera.</p>

          {(stats?.recent || []).length === 0 ? (
            <div className="empty-state">
              <p>Chưa ghi nhận lượt thực hiện nào gần đây.</p>
            </div>
          ) : (
            <div className="recent-list">
              {stats.recent.map((item, index) => (
                <div className={`recent-row ${item.isCorrect ? 'correct' : 'wrong'}`} key={`${item.createdAt}-${index}`}>
                  <div className="recent-info">
                    <div className="recent-char-box">{item.targetLabel}</div>
                    <div className="recent-details">
                      <span className="recent-predict">Nhận diện: <strong>{item.predictedLabel || 'N/A'}</strong></span>
                      <span className="recent-time">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`status-badge ${item.isCorrect ? 'correct' : 'wrong'}`}>
                    {item.isCorrect ? 'Chính xác' : 'Chưa đúng'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}