// src/sockets/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(
    token: string,
    playerName?: string,
    onConnect?: (socketId: string) => void
) {
    if (socket) return socket;

    // Use environment variable or fallback to localhost
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

    socket = io(SOCKET_URL, {
        auth: { token }, // This sends the JWT to the server
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
        console.log("Connected to game server as:", playerName);
        socket?.emit("joinGame", { name: playerName || "Player" });
        if (socket?.id) onConnect?.(socket.id);
    });

    return socket;
}

// ... keep getSocket, getMyPlayerId, and your listeners the same ...

export function getSocket() {
    if (!socket) throw new Error("Socket not connected");
    return socket;
}

export function getMyPlayerId(): string | null {
    return socket?.id ?? null;
}

export function placeBid(data:{
    tricks: number;
    contractType: number;
    suitType?: string;
    loner?: boolean;
}) {
    const socket = getSocket();
    console.log("Sending bid:", data);
    socket.emit("placeBid", data);
}

export function playCard(data:{
    suit: string;
    face: string;
}) {
    const socket = getSocket();
    console.log("Playing card:", data);
    socket.emit("playCard", data);
}

const faceToValue: Record<string, string> = {
    "9": "9", "10": "10", "Jack": "J", "Queen": "Q", "King": "K", "Ace": "A"
};

function toFrontendCard(c: { suit: string; face: string }) {
    return { suit: c.suit.toLowerCase(), value: faceToValue[c.face] ?? c.face };
}

export function registerGameListeners(
    setGameState: (state: any) => void,
    setMyHand?: (data: { cards: { suit: string; value: string }[]; playableCards: { suit: string; value: string }[] }) => void,
    onError?: (message: string) => void
) {
    const socket = getSocket();

    const onGameUpdate = (state: any) => {
        console.log("Game update:", state);
        setGameState(state);
    };

    const onYourHand = (payload: { cards?: { suit: string; face: string }[]; playableCards?: { suit: string; face: string }[] } | { suit: string; face: string }[]) => {
        const isLegacy = Array.isArray(payload);
        const cards = (isLegacy ? payload : (payload.cards ?? [])).map(toFrontendCard);
        const playableCards = isLegacy ? cards : (payload.playableCards ?? []).map(toFrontendCard);
        setMyHand?.({ cards, playableCards });
    };

    const onErrorMessage = (msg: string) => {
        onError?.(msg);
        alert(msg);
    };

    socket.on("gameUpdate", onGameUpdate);
    socket.on("yourHand", onYourHand);
    socket.on("errorMessage", onErrorMessage);

    return () => {
        socket.off("gameUpdate", onGameUpdate);
        socket.off("yourHand", onYourHand);
        socket.off("errorMessage", onErrorMessage);
    };
}