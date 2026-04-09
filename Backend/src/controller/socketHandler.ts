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

    /** Sends each player their hand and playable cards via private yourHand event. */
    private sendHandsToPlayers() {
        for (const player of this.controller.getPlayers()) {
            const hand = this.controller.getPlayerHand(player.id);
            const playableCards = this.controller.getPlayableCards(player.id);
            if (hand) {
                const socket = this.wss.sockets.sockets.get(player.id);
                if (socket) {
                    socket.emit("yourHand", { cards: hand, playableCards: playableCards ?? [] });
                }
            }
        }
    }

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
    socket.on("playCard", (data) => this.onPlayCard(socket, data));
}

disconnect(socket: Socket) {
    console.log("Socket disconnected");
    const response = this.controller.removePlayer(socket.id);
    const fullState = { ...this.controller.getPublicState(), ...response };
    this.wss.to("game").emit("gameUpdate", fullState);
    this.sendHandsToPlayers();
}

onMessageEvent(messageText: string) {
    console.log("Message event received: ", messageText);
}

onJoinGame(socket: Socket, data: any) {
    try {
        socket.join("game");
        const player = new Player(socket.id, data?.name || "Player");
        const response = this.controller.addPlayer(player);
        const fullState = { ...this.controller.getPublicState(), ...response };
        this.wss.to("game").emit("gameUpdate", fullState);
        this.sendHandsToPlayers();
    } catch (error: any) {
        socket.emit("errorMessage", error.message);
    }
}

onStartGame(socket: Socket) {
    try {
        const response = this.controller.initializeGame();
        const fullState = { ...this.controller.getPublicState(), ...response };
        this.wss.emit("gameUpdate", fullState);
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
        const fullState = { ...this.controller.getPublicState(), ...response };
        this.wss.to("game").emit("gameUpdate", fullState);
        this.sendHandsToPlayers();
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
        // Merge with public state so clients get phase, players, etc.; include playedCards for all to see
        const fullState = { ...this.controller.getPublicState(), ...response };
        this.wss.to("game").emit("gameUpdate", fullState);
        this.sendHandsToPlayers();
    } catch (error: any) {
        socket.emit("errorMessage", error.message);
    }
}
}