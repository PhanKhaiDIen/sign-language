import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import SignPredictor from './components/SignPredictor';
import SignCanvas from './components/SignCanvas';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GuidePage from './pages/GuidePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#16161A',
        }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<SignPredictor />} />
            <Route path="/canvas" element={<SignCanvas />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/guide" element={<GuidePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}