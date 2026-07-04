import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import "../assets/styles/LoginPage.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(username, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="background">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <div className="login-wrapper">
        <div className="hero">
          <div className="hero-content">
            <div className="badge">AI Powered</div>
            <h1>Join the<br />Community</h1>
            <p>
              Create your account and start practicing
              <br />
              sign language with real-time AI feedback.
            </p>
            <div className="cards">
              <div className="info-card">
                🎯
                <h3>Practice Mode</h3>
                <span>Track your progress over time.</span>
              </div>
              <div className="info-card">
                📚
                <h3>Learn ASL</h3>
                <span>26 letters, structured lessons.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-box">
          <div className="glass-card">
            <div className="logo">🤟</div>
            <h2>Create Account</h2>
            <p className="subtitle">Start your sign language journey</p>

            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-box">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-box">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && <div className="error-box">{error}</div>}

              <button className="login-button" disabled={loading}>
                {loading ? "Creating..." : "Sign Up"}
              </button>
            </form>

            <p className="register">
              Already have an account?
              <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}