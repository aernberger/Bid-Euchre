import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string, playerName?: string) {
    console.log("Connecting socket with token: ", token);
    socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
        socket?.emit("joinGame", { name: playerName || "Player" });
    });

    return socket;
}

export function getSocket(){
    if(!socket) throw new Error("Socket not connected");
    return socket;
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

export function registerGameListeners(setGameState: any) {
    const socket = getSocket();

    socket.on("gameUpdate", (state) => {
        console.log("Game update:", state);
        setGameState(state);
    });

    socket.on("errorMessage", (msg) => {
        alert(msg);
    });
}