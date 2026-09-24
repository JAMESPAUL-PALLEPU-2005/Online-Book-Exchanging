import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      setError('Fill in the details');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.id);
        localStorage.setItem('username', data.username);
        navigate('/', { state: { userId: data.id } });
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (e) {
      console.error('Error logging in: ', e);
      setError('Error logging in. Please check your connection and try again.');
    }
  };

  return (
    <div className="a-bg-container">
      <h1 className="website-heading auth-head">ONLINE BOOK EXCHANGE</h1>
      <div className="login-container">
        <h1 className="login-header">Login</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="input-box"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input-box"
        />
        <button onClick={handleLogin} className="btn">Login</button>
        {error && <p className="error-message">{error}</p>}
        <p className="aboutText">
          Don't have an account? <Link className="hyp" to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
