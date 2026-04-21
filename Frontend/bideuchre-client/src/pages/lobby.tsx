import React, { useEffect, useState, useCallback } from "react";
import {
    connectSocket,
    subscribeLobby,
    createGameOnServer,
    LobbyGameSummary,
} from "../sockets/socket";

interface LobbyProps {
    token: string;
    user: any;
    onEnterGame: (gameId: string) => void;
    onLogout: () => void;
}

export default function Lobby({ token, user, onEnterGame, onLogout }: LobbyProps) {
    const [tables, setTables] = useState<LobbyGameSummary[]>([]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayName =
        (typeof user?.user_metadata?.username === "string" && user.user_metadata.username) ||
        (typeof user?.email === "string" && user.email) ||
        "Player";

    useEffect(() => {
        setError(null);
        connectSocket(token);

        let unsub: (() => void) | undefined;
        try {
            unsub = subscribeLobby(setTables);
        } catch (e: any) {
            setError(e?.message ?? "Could not open lobby");
        }

        return () => {
            unsub?.();
        };
    }, [token]);

    const handleCreate = useCallback(async () => {
        setError(null);
        setCreating(true);
        try { 
            const id = await createGameOnServer(displayName, user.id);
            onEnterGame(id);
        } catch (e: any) {
            setError(e?.message ?? "Could not create a table");
        } finally {
            setCreating(false);
        }
    }, [displayName, onEnterGame, user.id]);

    const handleJoin = useCallback(
        (gameId: string) => {
            setError(null);
            onEnterGame(gameId);
        },
        [onEnterGame]
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#1a3d2e",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "24px 16px",
                boxSizing: "border-box",
                color: "#f0f4f0",
            }}
        >
            <div
                style={{
                    width: "min(520px, 100%)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                <header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ textAlign: "left" }}>
                        <h1 style={{ margin: "0 0 6px 0", fontSize: "clamp(1.35rem, 4vw, 1.75rem)", fontWeight: 700 }}>
                            Tables
                        </h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: "15px", lineHeight: 1.45 }}>
                            Open a new table or join one that has not started yet (waiting for players).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onLogout}
                        style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.25)",
                            background: "transparent",
                            color: "#f0f4f0",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        Log out
                    </button>
                </header>

                <button
                    type="button"
                    disabled={creating}
                    onClick={handleCreate}
                    style={{
                        padding: "14px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: creating ? "#4a6b58" : "#2d6a4f",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: creating ? "wait" : "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                >
                    {creating ? "Creating table…" : "Create new table"}
                </button>

                {error ? (
                    <div
                        role="alert"
                        style={{
                            padding: "12px 14px",
                            borderRadius: "8px",
                            background: "rgba(180, 40, 40, 0.2)",
                            border: "1px solid rgba(255,120,120,0.35)",
                            fontSize: "14px",
                            textAlign: "left",
                        }}
                    >
                        {error}
                    </div>
                ) : null}

                <section style={{ textAlign: "left" }}>
                    <h2 style={{ margin: "0 0 12px 0", fontSize: "1.05rem", fontWeight: 600, opacity: 0.95 }}>
                        Join a table
                    </h2>
                    {tables.length === 0 ? (
                        <p style={{ margin: 0, opacity: 0.75, fontSize: "15px" }}>
                            No open tables yet. Create one and share the room with friends.
                        </p>
                    ) : (
                        <ul
                            style={{
                                listStyle: "none",
                                margin: 0,
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {tables.map((g) => (
                                <li
                                    key={g.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "12px",
                                        padding: "14px 16px",
                                        borderRadius: "10px",
                                        background: "rgba(0,0,0,0.22)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
                                            {g.playerCount} / 4 players
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "13px",
                                                opacity: 0.8,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            title={g.players.map((p) => p.name).join(", ")}
                                        >
                                            {g.players.map((p) => p.name).join(", ") || "Empty"}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleJoin(g.id)}
                                        disabled={g.playerCount >= 4}
                                        style={{
                                            padding: "10px 16px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: g.playerCount >= 4 ? "#555" : "#40916c",
                                            color: "#fff",
                                            fontWeight: 600,
                                            cursor: g.playerCount >= 4 ? "not-allowed" : "pointer",
                                            flexShrink: 0,
                                        }}
                                    >
                                        Join
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
