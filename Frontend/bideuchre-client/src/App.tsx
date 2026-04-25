// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import Game from "./pages/game";
import Login from "./pages/login";
import Lobby from "./pages/lobby";
import PlayerPopup from "./components/PlayerPopup";
import { disconnectSocket, leaveGameRoom } from "./sockets/socket";

const ACTIVE_GAME_KEY = "be-active-game-id";

function readStoredGameId(): string | null {
    try {
        return sessionStorage.getItem(ACTIVE_GAME_KEY);
    } catch {
        return null;
    }
}

export default function App() {
  // 1. Switch to sessionStorage for initial state
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("sb-token"));
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeGameId, setActiveGameId] = useState<string | null>(() => readStoredGameId());

  useEffect(() => {
    // 2. Load user from sessionStorage
    const savedUser = sessionStorage.getItem("sb-user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  // 3. Save to sessionStorage  
  const handleAuthSuccess = (newToken: string, userData: any) => {
        sessionStorage.setItem("sb-token", newToken);
        sessionStorage.setItem("sb-user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        setActiveGameId(null);
        try {
            sessionStorage.removeItem(ACTIVE_GAME_KEY);
        } catch {
            /* ignore */
        }
    };

    const handleLogout = () => {
         // 4. Clear sessionStorage
        leaveGameRoom();
        disconnectSocket();
        sessionStorage.removeItem("sb-token");
        sessionStorage.removeItem("sb-user");
        sessionStorage.removeItem(ACTIVE_GAME_KEY);
        setToken(null);
        setUser(null);
        setActiveGameId(null);
    };

    const enterGame = useCallback((gameId: string) => {
        try {
            sessionStorage.setItem(ACTIVE_GAME_KEY, gameId);
        } catch {
            /* ignore */
        }
        setActiveGameId(gameId);
    }, []);

    const leaveTable = useCallback(() => {
        leaveGameRoom();
        try {
            sessionStorage.removeItem(ACTIVE_GAME_KEY);
        } catch {
            /* ignore */
        }
        setActiveGameId(null);
    }, []);

    if (loading) return <div className="loading">Initializing...</div>;

    return (
        <div className="App">
            {!token ? (
                <Login onAuthSuccess={handleAuthSuccess} />
            ) : activeGameId ? (
                <Game
                    token={token}
                    user={user}
                    gameId={activeGameId}
                    onLeaveTable={leaveTable}
                    onLogout={handleLogout}
                />
            ) : (
                <Lobby token={token} user={user} onEnterGame={enterGame} onLogout={handleLogout} />
            )}
            {token ? <PlayerPopup /> : null}
        </div>
    );
}
