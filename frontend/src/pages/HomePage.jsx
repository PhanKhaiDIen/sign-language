import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        padding: '6px 16px',
        borderRadius: 999,
        background: 'rgba(245, 230, 200, 0.1)',
        border: '1px solid rgba(245, 230, 200, 0.3)',
        color: '#F5E6C8',
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 24,
      }}>
        🤖 AI Powered Recognition
      </div>

      <h1 style={{
        fontSize: '3rem',
        color: '#fff',
        lineHeight: 1.2,
        marginBottom: 20,
        maxWidth: 700,
      }}>
        Học ngôn ngữ ký hiệu<br />
        cùng <span style={{ color: '#F5E6C8' }}>AI</span>
      </h1>

      <p style={{
        color: '#94a3b8',
        fontSize: 16,
        lineHeight: 1.7,
        maxWidth: 550,
        marginBottom: 40,
      }}>
        Nhận diện bảng chữ cái ASL theo thời gian thực bằng camera.
        Luyện tập, kiểm tra và cải thiện kỹ năng ngôn ngữ ký hiệu của bạn
        với công nghệ nhận diện bàn tay tiên tiến.
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 60 }}>
        {user ? (
          <Link to="/predictor" style={{
            padding: '14px 32px',
            borderRadius: 999,
            background: '#F5E6C8',
            color: '#0a0a0d',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Bắt đầu luyện tập →
          </Link>
        ) : (
          <>
            <Link to="/register" style={{
              padding: '14px 32px',
              borderRadius: 999,
              background: '#F5E6C8',
              color: '#0a0a0d',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}>
              Bắt đầu ngay
            </Link>
            <Link to="/login" style={{
              padding: '14px 32px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}>
              Đăng nhập
            </Link>
          </>
        )}
      </div>

      {/* Feature cards */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 900,
      }}>
        {[
          { icon: '🎥', title: 'Camera thời gian thực', desc: 'Nhận diện tức thì qua webcam' },
          { icon: '🤖', title: 'AI chính xác', desc: 'Mô hình KNN học từ dữ liệu thật' },
          { icon: '📚', title: 'Bảng chữ cái ASL', desc: 'Hướng dẫn đầy đủ 26 chữ cái' },
        ].map((f, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '24px 28px',
            width: 240,
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ color: '#F5E6C8', fontSize: 15, marginBottom: 6 }}>{f.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}