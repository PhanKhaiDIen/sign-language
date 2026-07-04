export default function GuidePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 24px 60px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <h2 style={{ color: '#F5E6C8', marginBottom: 8 }}>Bảng chữ cái ASL</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, textAlign: 'center', maxWidth: 500 }}>
        Tham khảo hình dạng bàn tay cho từng chữ cái trước khi luyện tập ở trang Predictor.
      </p>
      <img
        src="/images/guide.png"
        alt="ASL Alphabet Guide"
        style={{
          maxWidth: '100%',
          width: 700,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
    </div>
  );
}