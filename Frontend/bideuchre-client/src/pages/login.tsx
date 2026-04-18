import React, { useState } from 'react';

interface LoginProps {
  onAuthSuccess: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1.2.2 Enforcement on the frontend (first line of defense)
    if (password.length < 12) {
      alert("Password must be at least 12 characters.");
      return;
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
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
        alert("Account created! Please log in.");
        setIsLogin(true);
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleSubmit}>
        <input 
          type="email" placeholder="Email" 
          value={email} onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password (Min 12 chars)" 
          value={password} onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Switch to Sign Up" : "Switch to Login"}
      </button>
    </div>
  );
};

export default Login;