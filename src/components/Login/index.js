import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './index.css';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
    }
    if (location.state && location.state.prefillUsername) {
      setIdentifier(location.state.prefillUsername);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setError('Please enter both your email/username and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanIdentifier, password: cleanPassword }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { error: 'Server returned an invalid response. Please verify the backend is active.' };
      }

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.id);
        localStorage.setItem('username', data.username);
        if (data.email) localStorage.setItem('email', data.email);
        if (data.mobile) localStorage.setItem('mobile', data.mobile);

        navigate('/', { state: { userId: data.id } });
      } else {
        setError(data.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err) {
      console.error('Error logging in: ', err);
      setError('Unable to reach the server. Please check your internet connection or ensure the server is active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="a-bg-container">
      {/* Brand Statement: ONLY BookBridge - An Online Book Exchange Platform */}
      <div className="auth-brand-container">
        <h1 className="auth-brand-statement">BookBridge</h1>
        <p className="auth-brand-sub">An Online Book Exchange Platform</p>
      </div>

      <div className="login-container">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e5b85c', textDecoration: 'none', marginBottom: '16px', fontSize: '0.86rem', fontWeight: '600' }}>
          ← Back to 3D Book
        </Link>
        {/* Glowing Book Icon */}
        <div className="card-top-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 4.5C7 3 2.5 4.5 2 5v13.5c.5-.5 5-2 10-.5 5-1.5 9.5 0 10 .5V5c-.5-.5-5-2-10-.5zm-1 12c-4-1-7.5-.5-8 0V6.5c.5-.5 4-1 8 0v10zm10 0c-.5-.5-4-1-8 0V6.5c4-1 7.5-.5 8 0v10z"/>
          </svg>
        </div>

        <h2 className="login-header">Welcome Back</h2>
        <p className="auth-desc">Open a new chapter and continue your journey.</p>

        {successMessage && <div className="success-badge">{successMessage}</div>}
        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          {/* Username or Email ID Field */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-identifier">Username or Email ID</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email ID"
                className="auth-input"
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="auth-input password-input"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title="Show/Hide Password"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="form-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Please contact admin at 23b81a0518@cvr.ac.in to reset credentials.'); }}>
              Forgot password?
            </a>
          </div>

          {/* Large Golden Button */}
          <button type="submit" disabled={isLoading} className="auth-btn-primary">
            {isLoading ? 'Signing in with MongoDB...' : 'Login →'}
          </button>
        </form>

        <div className="or-divider"><span>OR</span></div>

        {/* Outlined Create Account Button */}
        <Link to="/signup" className="btn-outlined">
          Create Account
        </Link>

        <p className="auth-switch-text">
          Don't have an account? <Link className="auth-link-golden" to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
