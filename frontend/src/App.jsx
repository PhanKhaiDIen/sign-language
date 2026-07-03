import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import SignPredictor from './components/SignPredictor';
import SignCanvas from './components/SignCanvas';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#0D0D0D',
          gap: '12px',
          paddingTop: 20
        }}>
          <h1 style={{ color: '#F5E6C8', fontSize: '1.4rem' }}>Fingerspelling Test</h1>
          <Navbar />

          <Routes>
            <Route path="/" element={<SignPredictor />} />
            <Route path="/canvas" element={<SignCanvas />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}