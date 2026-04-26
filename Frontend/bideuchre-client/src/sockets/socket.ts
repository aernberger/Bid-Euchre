// src/sockets/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export type LobbyGameSummary = {
    id: string;
    playerCount: number;
    players: { id: string; name: string }[];
};

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

function runWhenConnected(sock: Socket, fn: () => void) {
    if (sock.connected) fn();
    else sock.once("connect", fn);
}

/**
 * Opens (or reuses) the socket connection. Does not join a table — call joinGameRoom from the game screen.
 */
export function connectSocket(token: string, onReady?: (socketId: string) => void) {
    if (socket) {
        if (socket.auth && (socket.auth as { token?: string }).token !== token) {
            socket.disconnect();
            socket = null;
        } else {
            runWhenConnected(socket, () => {
                if (socket?.id) onReady?.(socket.id);
            });
            return socket;
        }
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
        if (socket?.id) onReady?.(socket.id);
    });

    return socket;
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}

export function getSocket(): Socket {
    if (!socket) throw new Error("Socket not connected");
    return socket;
}

export function getMyPlayerId(): string | null {
    return socket?.id ?? null;
}

export function joinGameRoom(gameId: string, displayName: string, supabaseId: string) {
    const sock = getSocket();
    sock.emit("joinGame", { gameId, name: displayName || "Player", supabaseId });
}

export function leaveGameRoom() {
    try {
        getSocket().emit("leaveGame");
    } catch {
        /* not connected */
    }
}

export function subscribeLobby(
    onList: (games: LobbyGameSummary[]) => void,
    supabaseId?: string,
    onResumableGame?: (data: { gameId: string; phase: string }) => void
) {
    const sock = getSocket();
    const onLobbyGames = (games: LobbyGameSummary[]) => onList(games);
    const onResumable = (data: { gameId: string; phase: string }) => {
        onResumableGame?.(data);
    };

    sock.emit("lobbySubscribe", { supabaseId });
    sock.on("lobbyGames", onLobbyGames);
    sock.on("resumableGame", onResumable);

    return () => {
        sock.emit("lobbyUnsubscribe");
        sock.off("lobbyGames", onLobbyGames);
        sock.off("resumableGame", onResumable);
    };
}

export function rejoinGame(gameId: string, displayName: string, supabaseId: string) {
    const sock = getSocket();
    sock.emit("joinGame", { gameId, name: displayName, supabaseId });
}

export function createGameOnServer(displayName: string, supabaseId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const sock = getSocket();
        const t = window.setTimeout(() => {
            sock.off("gameCreated", onCreated);
            reject(new Error("Timed out creating a table"));
        }, 12000);
        const onCreated = (payload: { gameId?: string }) => {
            window.clearTimeout(t);
            sock.off("gameCreated", onCreated);
            if (payload?.gameId) resolve(payload.gameId);
            else reject(new Error("No game id returned"));
        };
        sock.once("gameCreated", onCreated);
        sock.emit("createGame", { name: displayName || "Player", supabaseId });
    });
}

export function placeBid(data: {
    tricks: number;
    contractType: number;
    suitType?: string;
    loner?: boolean;
}) {
    const sock = getSocket();
    console.log("Sending bid:", data);
    sock.emit("placeBid", data);
}

export function playCard(data: { suit: string; face: string }) {
    const sock = getSocket();
    console.log("Playing card:", data);
    sock.emit("playCard", data);
}

const faceToValue: Record<string, string> = {
    "9": "9",
    "10": "10",
    Jack: "J",
    Queen: "Q",
    King: "K",
    Ace: "A",
};

function toFrontendCard(c: { suit: string; face: string }) {
    return { suit: c.suit.toLowerCase(), value: faceToValue[c.face] ?? c.face };
}

export function registerGameListeners(
    setGameState: (state: any) => void,
    setMyHand?: (data: {
        cards: { suit: string; value: string }[];
        playableCards: { suit: string; value: string }[];
    }) => void,
    onError?: (message: string) => void
) {
    const sock = getSocket();

    const onGameUpdate = (state: any) => {
        console.log("Game update:", state);
        setGameState(state);
    };

    const onYourHand = (
        payload:
            | { cards?: { suit: string; face: string }[]; playableCards?: { suit: string; face: string }[] }
            | { suit: string; face: string }[]
    ) => {
        const isLegacy = Array.isArray(payload);
        const cards = (isLegacy ? payload : (payload.cards ?? [])).map(toFrontendCard);
        const playableCards = isLegacy ? cards : (payload.playableCards ?? []).map(toFrontendCard);
        setMyHand?.({ cards, playableCards });
    };

    const onErrorMessage = (msg: string) => {
        onError?.(msg);
        alert(msg);
    };

    sock.on("gameUpdate", onGameUpdate);
    sock.on("yourHand", onYourHand);
    sock.on("errorMessage", onErrorMessage);

    return () => {
        sock.off("gameUpdate", onGameUpdate);
        sock.off("yourHand", onYourHand);
        sock.off("errorMessage", onErrorMessage);
    };
}
