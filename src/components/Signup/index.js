import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!cleanUsername || !cleanEmail || !cleanPassword || !mobile.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Full Name must be at least 3 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (cleanPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword,
          mobile: cleanMobile,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { error: 'Server returned an invalid response. Please verify the backend is running.' };
      }

      if (response.ok) {
        setError('');
        navigate('/login', {
          state: {
            successMessage: `Account created successfully for "${cleanUsername}" in MongoDB Atlas! Please log in.`,
            prefillUsername: cleanUsername,
          },
        });
      } else {
        setError(data.error || 'Error signing up. Please try again.');
      }
    } catch (err) {
      console.error('Error signing up: ', err);
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

      <div className="signup-container">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e5b85c', textDecoration: 'none', marginBottom: '16px', fontSize: '0.86rem', fontWeight: '600' }}>
          ← Back to 3D Book
        </Link>
        {/* Glowing Book Icon */}
        <div className="card-top-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 4.5C7 3 2.5 4.5 2 5v13.5c.5-.5 5-2 10-.5 5-1.5 9.5 0 10 .5V5c-.5-.5-5-2-10-.5zm-1 12c-4-1-7.5-.5-8 0V6.5c.5-.5 4-1 8 0v10zm10 0c-.5-.5-4-1-8 0V6.5c4-1 7.5-.5 8 0v10z"/>
          </svg>
        </div>

        <h2 className="signup-header">Create Your Account</h2>
        <p className="auth-desc">Your next chapter starts here.</p>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSignup} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label" htmlFor="signup-username">Full Name</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your full name"
                className="auth-input"
                autoComplete="name"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="input-group">
            <label className="input-label" htmlFor="signup-email">Email Address</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="auth-input"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="input-group">
            <label className="input-label" htmlFor="signup-mobile">Mobile Number</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <input
                id="signup-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit number"
                className="auth-input"
                autoComplete="tel"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="signup-password">Password</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 4 characters"
                className="auth-input password-input"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="input-wrapper-icon">
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="auth-input"
                autoComplete="new-password"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="auth-btn-primary" style={{ marginTop: '6px' }}>
            {isLoading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account? <Link className="auth-link-golden" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
