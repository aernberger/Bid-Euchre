import React, { useEffect, useState, useCallback } from "react";
import RulesModal from "../components/RulesModal";
import {
    connectSocket,
    subscribeLobby,
    createGameOnServer,
    rejoinGame,
    LobbyGameSummary,
} from "../sockets/socket";
import {
    createTableButtonStyle,
    lobbyContainerStyle,
    lobbyEmptyStyle,
    lobbyErrorStyle,
    lobbyHeaderActionsStyle,
    lobbyHeaderStyle,
    lobbyJoinButtonStyle,
    lobbyListItemStyle,
    lobbyListStyle,
    lobbyLogoutButtonStyle,
    lobbyPageStyle,
    lobbyPlayerCountStyle,
    lobbyPlayerInfoStyle,
    lobbyPlayerNamesStyle,
    lobbyRulesButtonStyle,
    lobbySectionStyle,
    lobbySectionTitleStyle,
    lobbySubtitleStyle,
    lobbyTitleStyle,
    lobbyTitleWrapStyle,
} from "./lobby.styles";

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
    const [showRules, setShowRules] = useState(false);
    const [resumable, setResumable] = useState<{ gameId: string; phase: string } | null>(null);

    const displayName =
        (typeof user?.user_metadata?.username === "string" && user.user_metadata.username) ||
        (typeof user?.email === "string" && user.email) ||
        "Player";

    useEffect(() => {
        setError(null);
        connectSocket(token);

        let unsub: (() => void) | undefined;
        try {
            unsub = subscribeLobby(setTables, user.id, (data) => setResumable(data));
        } catch (e: any) {
            setError(e?.message ?? "Could not open lobby");
        }

        return () => {
            unsub?.();
        };
    }, [token, user.id]);

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

    const handleRejoin = useCallback(() => {
        if (!resumable) return;
        rejoinGame(resumable.gameId, displayName, user.id);
        onEnterGame(resumable.gameId);
    }, [resumable, displayName, user.id, onEnterGame]);

    return (
        <div style={lobbyPageStyle}>
            <div style={lobbyContainerStyle}>
                <header style={lobbyHeaderStyle}>
                    <div style={lobbyHeaderActionsStyle}>
                        <button type="button" onClick={onLogout} style={lobbyLogoutButtonStyle}>
                            Log out
                        </button>
                        <button type="button" onClick={() => setShowRules(true)} style={lobbyRulesButtonStyle}>
                            Rules
                        </button>
                    </div>
                    <div style={lobbyTitleWrapStyle}>
                        <h1 style={lobbyTitleStyle}>Tables</h1>
                        <p style={lobbySubtitleStyle}>
                            Open a new table or join one that has not started yet.
                        </p>
                    </div>
                </header>

                {/* NEW: Resumable game banner */}
                {resumable && (
                    <div style={{
                        background: "#2a4a2a",
                        border: "1px solid #4a8a4a",
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}>
                        <span style={{ color: "#a8d8a8", fontSize: 14 }}>
                            You have an active game in progress ({resumable.phase.toLowerCase()}).
                        </span>
                        <button
                            type="button"
                            onClick={handleRejoin}
                            style={{
                                background: "#4a8a4a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "8px 16px",
                                cursor: "pointer",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Rejoin Game
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    disabled={creating}
                    onClick={handleCreate}
                    style={createTableButtonStyle(creating)}
                >
                    {creating ? "Creating table…" : "Create new table"}
                </button>

                {error ? <div role="alert" style={lobbyErrorStyle}>{error}</div> : null}

                <section style={lobbySectionStyle}>
                    <h2 style={lobbySectionTitleStyle}>Join a table</h2>
                    {tables.length === 0 ? (
                        <p style={lobbyEmptyStyle}>
                            No open tables yet. Create one and share the room with friends.
                        </p>
                    ) : (
                        <ul style={lobbyListStyle}>
                            {tables.map((g) => (
                                <li key={g.id} style={lobbyListItemStyle}>
                                    <div style={lobbyPlayerInfoStyle}>
                                        <div style={lobbyPlayerCountStyle}>{g.playerCount} / 4 players</div>
                                        <div style={lobbyPlayerNamesStyle}>
                                            {g.players.map((p) => p.name).join(", ") || "Empty"}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleJoin(g.id)}
                                        disabled={g.playerCount >= 4}
                                        style={lobbyJoinButtonStyle(g.playerCount >= 4)}
                                    >
                                        Join
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
            {showRules ? <RulesModal onClose={() => setShowRules(false)} /> : null}
        </div>
    );
}

