import { Server, Socket } from "socket.io";

export default class SocketHandler {
    private wss: Server;

    constructor(wss: Server) {
        this.wss = wss;
        this.wss.on("connection", (socket) => {
            console.log("Socket connected");
            this.registerSocketHandlers(socket);
        });
    }



registerSocketHandlers(socket: Socket) {
    socket.on("disconnect", () => this.disconnect(socket));
    socket.on("MessageEvent", (messageText)=> this.onMessageEvent(messageText));
}

disconnect(socket: Socket) {
    console.log("Socket disconnected");
}

onMessageEvent(messageText: string) {
    console.log("Message event received: ", messageText);
}

}