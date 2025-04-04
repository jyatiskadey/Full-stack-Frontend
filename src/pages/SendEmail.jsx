import React, { useState } from 'react';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();

    const response = await fetch('https://social-media-backend-2-xdnp.onrender.com/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleResetRequest}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default PasswordResetRequest;
