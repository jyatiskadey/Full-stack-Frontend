import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import fetch from 'node-fetch';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      navigate('/error'); // Redirect if no token in the URL
    }
  }, [token, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    const response = await fetch('https://social-media-backend-2-xdnp.onrender.com/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleResetPassword}>
        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
