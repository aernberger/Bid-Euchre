import { Server, Socket } from "socket.io";
import { GameController }  from "./gameController.js";
import Player from "../models/player.js";
import { Bid } from "../services/bid.js";
import { Contract } from "../services/contract.js";
import Trick from "../models/trick.js";
import Card from "../models/card.js";



export default class SocketHandler {
    private wss: Server;
    private controller: GameController;

    constructor(wss: Server) {
        this.wss = wss;
        this.controller = new GameController();
        this.wss.on("connection", (socket) => {
            console.log("Socket connected");
            this.registerSocketHandlers(socket);
        });
        
    }



registerSocketHandlers(socket: Socket) {
    socket.on("disconnect", () => this.disconnect(socket));
    socket.on("MessageEvent", (messageText)=> this.onMessageEvent(messageText));
    socket.on("joinGame", (data) => this.onJoinGame(socket, data));
    socket.on("placeBid", (data) => this.onPlaceBid(socket, data));
}

disconnect(socket: Socket) {
    console.log("Socket disconnected");
    const response = this.controller.removePlayer(socket.id);
    this.wss.emit("gameUpdate", response);
}

onMessageEvent(messageText: string) {
    console.log("Message event received: ", messageText);
}

onJoinGame(socket: Socket, data: any) {
    try {
        const player = new Player(socket.id, data.name);
        const response = this.controller.addPlayer(player);
        this.wss.emit("gameUpdate", response);
    } catch (error: any) {
        socket.emit("errorMessage", error.message)
    }
}

onStartGame(socket: Socket) {
    try {
        const response = this.controller.initializeGame();
        this.wss.emit("gameUpdate", response);
    } catch (error: any) {
        socket.emit("errorMessage", error.message);
    }
}

private onPlaceBid(socket: Socket, data: any) {
    try {
        const bid = new Bid(
            socket.id,
            data.tricks,
            data.contractType,
            data.suitType,
            data.loner
        );
        
        const response = this.controller.placeBid(bid);

        this.wss.emit("gameUpdate", response);

    } catch (error: any) {
        socket.emit("errorMessage", error.message);
    }

}

private onPlayCard(socket: Socket, data: any) {
    try {
        const card = new Card(
            data.suit,
            data.face
        );
        const response = this.controller.playCard(socket.id, card);
        this.wss.emit("gameUpdate", response);
    } catch (error: any) {
        socket.emit("errorMessage", error.message);
    }
}
}