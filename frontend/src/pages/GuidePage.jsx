import { Camera, CheckCircle2, Hand, Lightbulb, Monitor, Move3D, Sparkles } from 'lucide-react';
import '../assets/styles/GuidePage.css';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const controlSigns = [
  { label: 'space', description: 'Thêm khoảng trắng khi ghép câu.' },
  { label: 'delete', description: 'Xóa ký tự cuối cùng trong văn bản.' },
  { label: 'idle', description: 'Tư thế nghỉ, không nhập ký tự.' },
];

const setupTips = [
  {
    icon: <Camera size={20} />,
    title: 'Đặt camera ngang tầm tay',
    description: 'Giữ bàn tay nằm gọn trong khung hình và cách camera khoảng 40-70 cm.',
  },
  {
    icon: <Lightbulb size={20} />,
    title: 'Dùng ánh sáng đều',
    description: 'Tránh để nguồn sáng mạnh phía sau tay vì landmark sẽ dễ bị mất nét.',
  },
  {
    icon: <Hand size={20} />,
    title: 'Giữ tư thế ổn định',
    description: 'Khi luyện tập, giữ ký hiệu khoảng một giây để hệ thống khóa kết quả.',
  },
  {
    icon: <Monitor size={20} />,
    title: 'Dùng nền đơn giản',
    description: 'Nền ít chi tiết giúp MediaPipe nhận diện bàn tay ổn định hơn.',
  },
];

const practiceSteps = [
  'Mở trang Predictor và cho phép trình duyệt truy cập webcam.',
  'Đưa tay vào vùng camera, làm đúng hình dạng chữ cái trong bảng ASL.',
  'Giữ yên tay cho đến khi thanh xác nhận đầy, ký tự sẽ được nhập tự động.',
  'Dùng Backspace để xóa nhanh hoặc Esc để hủy ký tự đang chờ xác nhận.',
];

export default function GuidePage() {
  return (
    <main className="guide-page">
      <section className="guide-hero">
        <div className="guide-hero-copy">
          <div className="guide-badge">
            <Sparkles size={14} />
            <span>ASL Practice Guide</span>
          </div>
          <h1>Bảng chữ cái ASL và cách luyện tập</h1>
          <p>
            Tham khảo hình dạng bàn tay, chuẩn bị camera đúng cách và luyện từng ký hiệu trước khi dùng trang nhận diện thời gian thực.
          </p>
        </div>

        <div className="guide-image-panel">
          <img src="/images/guide.png" alt="Bảng chữ cái ngôn ngữ ký hiệu ASL" />
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-heading">
          <Move3D size={22} />
          <div>
            <h2>Chuẩn bị trước khi nhận diện</h2>
            <p>Các điều kiện nhỏ này giúp landmark bàn tay ổn định hơn và giảm dự đoán sai.</p>
          </div>
        </div>

        <div className="tip-grid">
          {setupTips.map((tip) => (
            <article className="tip-card" key={tip.title}>
              <div className="tip-icon">{tip.icon}</div>
              <h3>{tip.title}</h3>
              <p>{tip.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section guide-two-column">
        <div>
          <div className="guide-section-heading compact">
            <CheckCircle2 size={22} />
            <div>
              <h2>Quy trình luyện tập</h2>
              <p>Làm theo thứ tự này khi demo hoặc kiểm tra độ chính xác.</p>
            </div>
          </div>

          <ol className="practice-list">
            {practiceSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="control-panel">
          <h2>Ký hiệu điều khiển</h2>
          <div className="control-list">
            {controlSigns.map((sign) => (
              <div className="control-item" key={sign.label}>
                <span>{sign.label}</span>
                <p>{sign.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-heading">
          <Hand size={22} />
          <div>
            <h2>Danh sách chữ cái đang hỗ trợ</h2>
            <p>Hệ thống hiện nhận diện 26 chữ cái ASL bằng bộ mẫu KNN đã đồng bộ lên server.</p>
          </div>
        </div>

        <div className="letter-grid" aria-label="Danh sách chữ cái ASL">
          {letters.map((letter) => (
            <div className="letter-tile" key={letter}>{letter}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
