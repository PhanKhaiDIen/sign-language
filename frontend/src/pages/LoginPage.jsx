import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      login(data.user, data.token);

      navigate("/predictor");
    } catch (err) {
      setError(err.message || "Login failed");
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

        {/* LEFT */}

        <div className="hero">

          <div className="hero-content">

            <div className="badge">
              AI Powered
            </div>

            <h1>
              Sign Language
              <br />
              Recognition
            </h1>

            <p>

              Communicate without barriers.

              <br />

              Detect and translate sign language
              in real time using Artificial Intelligence.

            </p>

            <div className="cards">

              <div className="info-card">

                🎥

                <h3>Realtime Camera</h3>

                <span>Detect hand gestures instantly.</span>

              </div>

              <div className="info-card">

                🤖

                <h3>AI Recognition</h3>

                <span>Powered by Deep Learning.</span>

              </div>

              <div className="info-card">

                ⚡

                <h3>Fast Response</h3>

                <span>Prediction in milliseconds.</span>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="login-box">

          <div className="glass-card">

            <div className="logo">

              🤟

            </div>

            <h2>

              Welcome Back

            </h2>

            <p className="subtitle">

              Sign in to continue

            </p>

            <form onSubmit={handleSubmit}>

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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>

              {error && (

                <div className="error-box">

                  {error}

                </div>

              )}

              <button
                className="login-button"
                disabled={loading}
              >

                {loading ? "Signing In..." : "Sign In"}

              </button>

            </form>

            <div className="divider">

              <span>OR</span>

            </div>

            <button className="google-button">

              Continue with Google

            </button>

            <p className="register">

              Don't have an account?

              <Link to="/register">

                Register

              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}