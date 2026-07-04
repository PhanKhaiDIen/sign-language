import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkStyle = {
    color: '#F5E6C8',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
  };

  return (
    <nav style={{
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '10px 24px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      fontFamily: 'sans-serif',
      marginBottom: 20
    }}>
      <Link to="/" style={linkStyle}>Predictor</Link>
      <Link to="/canvas" style={linkStyle}>Ghi mẫu</Link>
      {user ? (
        <>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>👋 {user.username}</span>
          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 999,
            padding: '4px 14px',
            fontSize: 12,
            cursor: 'pointer'
          }}>Đăng xuất</button>
        </>
      ) : (
        <>
          <Link to="/login" style={linkStyle}>Đăng nhập</Link>
          <Link to="/register" style={linkStyle}>Đăng ký</Link>
        </>
      )}
    </nav>
  );
}