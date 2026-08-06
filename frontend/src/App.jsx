import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SignPredictor from './components/SignPredictor';
import SignCanvas from './components/SignCanvas';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
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
            <Route path="/practice" element={
              <ProtectedRoute><PracticePage /></ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute><ProgressPage /></ProtectedRoute>
            } />
            <Route path="/canvas" element={
              <AdminRoute><SignCanvas /></AdminRoute>
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
