
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, Bot, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import '../assets/styles/HomePage.css'; // Nhớ tạo file CSS này nhé

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    { icon: <Video size={28} />, title: 'Camera thời gian thực', desc: 'Nhận diện tức thì qua webcam với độ trễ cực thấp.' },
    { icon: <Bot size={28} />, title: 'AI chính xác', desc: 'Mô hình KNN tối ưu, học trực tiếp từ dữ liệu hình thái thực tế.' },
    { icon: <BookOpen size={28} />, title: 'Bảng chữ cái ASL', desc: 'Thư viện hướng dẫn chi tiết và trực quan cho cả 26 chữ cái.' },
  ];

  return (
    <div className="home-container">
      {/* Đèn nền phát sáng ảo diệu */}
      <div className="ambient-glow"></div>

      {/* Badge AI */}
      <div className="hero-badge">
        <Sparkles size={14} className="sparkle-icon" />
        <span>AI-POWERED ASL RECOGNITION</span>
      </div>

      {/* Tiêu đề chính */}
      <h1 className="hero-title">
        Học ngôn ngữ ký hiệu<br />
        cùng <span className="highlight-text">Trí tuệ nhân tạo</span>
      </h1>

      {/* Mô tả dự án */}
      <p className="hero-subtitle">
        Phá bỏ rào cản giao tiếp bằng công nghệ. Nhận diện bảng chữ cái ASL theo thời gian thực, 
        giúp bạn luyện tập, kiểm tra và cải thiện kỹ năng một cách trực quan nhất.
      </p>

      {/* Nhóm nút bấm CTA */}
      <div className="cta-group">
        {user ? (
          <Link to="/predictor" className="btn-primary">
            Bắt đầu luyện tập <ArrowRight size={18} />
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn-primary">
              Bắt đầu ngay
            </Link>
            <Link to="/login" className="btn-secondary">
              Đăng nhập
            </Link>
          </>
        )}
      </div>

      {/* Danh sách thẻ tính năng */}
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon-wrapper">{f.icon}</div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}