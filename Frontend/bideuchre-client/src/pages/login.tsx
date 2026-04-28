import React, { useState } from 'react';
import {
  loginCardStyle,
  loginErrorStyle,
  loginFormStyle,
  loginHelpTextStyle,
  loginInputStyle,
  loginPageStyle,
  loginPrimaryButtonStyle,
  loginSecondaryButtonStyle,
  loginSubtitleStyle,
  loginTitleStyle,
} from './login.styles';

interface LoginProps {
  onAuthSuccess: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1.2.2 Enforcement on the frontend (first line of defense)
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Carry the token to App.tsx
          onAuthSuccess(data.session.access_token, data.user);
        } else {
          alert('Account created! Please log in.');
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setError(data.error ?? 'Authentication failed.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginPageStyle}>
      <div style={loginCardStyle}>
        <h1 style={loginTitleStyle}>Bid Euchre</h1>
        <p style={loginSubtitleStyle}>
          {isLogin
            ? 'Welcome back. Log in to join a table.'
            : 'Create your account to start playing.'}
        </p>
        <form onSubmit={handleSubmit} style={loginFormStyle}>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            style={loginInputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Password (Min 12 chars)"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            style={loginInputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" style={loginPrimaryButtonStyle(loading)} disabled={loading}>
            {loading ? 'Working...' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>
        {error ? <p style={loginErrorStyle}>{error}</p> : null}
        <p style={loginHelpTextStyle}>Passwords must be at least 12 characters.</p>
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={loginSecondaryButtonStyle}
          type="button"
          disabled={loading}
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
};

export default Login;
