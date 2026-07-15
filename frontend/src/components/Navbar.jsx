import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const navLinks = [
    { path: '/predictor', label: 'Predictor' },
    { path: '/practice', label: 'Practice' },
    { path: '/progress', label: 'Progress' },
    { path: '/guide', label: 'Hướng dẫn' },
    { path: '/canvas', label: 'Ghi mẫu' },
  ];

  return (
    <header style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <nav style={{
        width: '100%',
        maxWidth: 1280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderRadius: 16,
        background: 'rgba(20, 20, 24, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
        }}>
          <span style={{ fontSize: 22 }}>🤟</span>
          <span style={{
            color: '#F5E6C8',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: 0.3,
          }}>
            Fingerspelling
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 6 }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive(link.path) ? '#0a0a0d' : '#cbd5e1',
                background: isActive(link.path) ? '#F5E6C8' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F5E6C8, #d4b982)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#0a0a0d',
                }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                  {user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#fca5a5',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                color: '#cbd5e1',
              }}>
                Đăng nhập
              </Link>
              <Link to="/register" style={{
                padding: '8px 18px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                color: '#0a0a0d',
                background: '#F5E6C8',
              }}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
