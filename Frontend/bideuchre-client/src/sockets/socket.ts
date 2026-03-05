import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token:string){
    console.log("Connecting socket with token: ", token);
    socket=io("http://localhost:3000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
    });

    return socket;
}

export function getSocket(){
    if(!socket) throw new Error("Socket not connected");
    return socket;
}