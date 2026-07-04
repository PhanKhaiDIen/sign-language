import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SignPredictor from './components/SignPredictor';
import SignCanvas from './components/SignCanvas';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Footer from './components/Footer';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', backgroundColor: '#16161A' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/predictor" element={
              <ProtectedRoute><SignPredictor /></ProtectedRoute>
            } />
            <Route path="/canvas" element={
              <ProtectedRoute><SignCanvas /></ProtectedRoute>
            } />
          </Routes>
          <div>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}