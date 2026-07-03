import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      color: '#F5E6C8',
      fontFamily: 'sans-serif',
      fontSize: 14
    }}>
      <Link to="/" style={{ color: '#F5E6C8' }}>Predictor</Link>
      <Link to="/canvas" style={{ color: '#F5E6C8' }}>Ghi mẫu</Link>
      {user ? (
        <>
          <span style={{ color: '#94a3b8' }}>Xin chào, {user.username}</span>
          <button onClick={handleLogout}>Đăng xuất</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: '#F5E6C8' }}>Đăng nhập</Link>
          <Link to="/register" style={{ color: '#F5E6C8' }}>Đăng ký</Link>
        </>
      )}
    </nav>
  );
}