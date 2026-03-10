import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(
    token: string,
    playerName?: string,
    onConnect?: (socketId: string) => void
) {
    console.log("Connecting socket with token: ", token);
    if (socket) {
        console.log("Socket already connected");
        return;
    }
    socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
        socket?.emit("joinGame", { name: playerName || "Player" });
        if (socket?.id) onConnect?.(socket.id);
    });

    return socket;
}

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
    setMyHand?: (data: { cards: { suit: string; value: string }[]; playableCards: { suit: string; value: string }[] }) => void
) {
    const socket = getSocket();

    socket.on("gameUpdate", (state) => {
        console.log("Game update:", state);
        setGameState(state);
    });

    socket.on("yourHand", (payload: { cards?: { suit: string; face: string }[]; playableCards?: { suit: string; face: string }[] } | { suit: string; face: string }[]) => {
        const isLegacy = Array.isArray(payload);
        const cards = (isLegacy ? payload : (payload.cards ?? [])).map(toFrontendCard);
        const playableCards = isLegacy ? cards : (payload.playableCards ?? []).map(toFrontendCard);
        setMyHand?.({ cards, playableCards });
    });

    socket.on("errorMessage", (msg) => {
        alert(msg);
    });
}