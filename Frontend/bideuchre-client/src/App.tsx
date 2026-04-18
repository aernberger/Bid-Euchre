// src/App.tsx
import React, { useState, useEffect } from "react";
import Game from "./pages/game";
import Login from "./pages/login";

export default function App() {
  // 1. Switch to sessionStorage for initial state
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("sb-token"));
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Load user from sessionStorage
    const savedUser = sessionStorage.getItem("sb-user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const handleAuthSuccess = (newToken: string, userData: any) => {
    // 3. Save to sessionStorage
    sessionStorage.setItem("sb-token", newToken);
    sessionStorage.setItem("sb-user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    // 4. Clear sessionStorage
    sessionStorage.removeItem("sb-token");
    sessionStorage.removeItem("sb-user");
    setToken(null);
    setUser(null);
  };

  if (loading) return <div className="loading">Initializing...</div>;

  return (
    <div className="App">
      {!token ? (
        <Login onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Game 
          token={token} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}