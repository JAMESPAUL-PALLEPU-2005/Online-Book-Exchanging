import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (username.trim() === '' || email.trim() === '' || password.trim() === '') {
      setError('Fill in all required details');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (mobile.trim().length !== 10) {
      setError('Mobile number must be 10 digits');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          mobile: mobile.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup successful');
        setError('');
        navigate('/login');
      } else {
        setError(data.error || 'Error signing up. Please try again.');
      }
    } catch (e) {
      console.error('Error signing up: ', e);
      setError('Error signing up. Please check your connection and try again.');
    }
  };

  return (
    <div className="a-bg-container">
      <h1 className="website-heading auth-head">ONLINE BOOK EXCHANGE</h1>
      <div className="signup-container">
        <h1 className="signup-header">Sign Up</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="input-box"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email ID"
          className="input-box"
        />
        <input
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile Number"
          className="input-box"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input-box"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="input-box"
        />
        <button onClick={handleSignup} className="btn">Sign Up</button>
        {error && <p className="error-message">{error}</p>}
        <p className="aboutText">
          Already have an account? <Link className="hyp" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
