import { randomUUID } from "node:crypto";
import { Server, Socket } from "socket.io";
import { GameController } from "./gameController.js";
import Player from "../models/player.js";
import { Bid } from "../services/bid.js";
import Card from "../models/card.js";
import { GamePhase } from "./enums/gamePhase.js";
import { StatsService } from "../services/statsService.js";


interface PlayerJoinData {
    name?: string;
    supabaseId?: string;
    gameId?: string;
}

const lobbyRoom = "lobby";

function gameRoomName(gameId: string) {
    return `game:${gameId}`;
}

export default class SocketHandler {
    private wss: Server;
    private controller!: GameController;
    private games = new Map<string, GameController>();
    /** socket.id → gameId while seated at a table */
    private socketToGame = new Map<string, string>();

    private userToSocket = new Map<string, string>();

    constructor(wss: Server) {
        this.wss = wss;
        this.controller = new GameController();
        this.wss.on("connection", (socket) => {
            console.log("Socket connected");
            this.registerSocketHandlers(socket);
        });
    }

    private getLobbySnapshot() {
        return Array.from(this.games.entries())
            .filter(([, c]) => c.getPhase() === GamePhase.WAITING && c.getPlayers().length < 4)
            .map(([id, c]) => ({
                id,
                playerCount: c.getPlayers().length,
                players: c.getPlayers().map((p) => ({ id: p.id, name: p.name })),
            }));
    }

    private broadcastLobby() {
        const snapshot = this.getLobbySnapshot();
        this.wss.to(lobbyRoom).emit("lobbyGames", snapshot);
    }

    private sendHandsToPlayers(gameId: string) {
        const controller = this.games.get(gameId);
        if (!controller) return;
        for (const player of controller.getPlayers()) {
            const hand = controller.getPlayerHand(player.id);
            const playableCards = controller.getPlayableCards(player.id);
            if (hand) {
                const sock = this.wss.sockets.sockets.get(player.id);
                if (sock) {
                    sock.emit("yourHand", { cards: hand, playableCards: playableCards ?? [] });
                }
            }
        }
    }

    private emitGameUpdate(gameId: string, patch: Record<string, unknown>) {
        const controller = this.games.get(gameId);
        if (!controller) return;
        const fullState = { ...controller.getPublicState(), ...patch };
        this.wss.to(gameRoomName(gameId)).emit("gameUpdate", fullState);
        this.sendHandsToPlayers(gameId);
    }

    private enforceSingleSession(supabaseId: string, socketId: string) {
        if (!supabaseId) return;

        const existingSocketId = this.userToSocket.get(supabaseId);

        if (existingSocketId && existingSocketId !== socketId) {
            const oldSocket = this.wss.sockets.sockets.get(existingSocketId);
            if (oldSocket) {
                console.log(`Kicking old session for user ${supabaseId}`);
                oldSocket.emit("errorMessage", "You have been logged in from another tab.");
                oldSocket.disconnect(true); // true forces immediate close
            }
        }

        // Register this socket as the active one for this user
        this.userToSocket.set(supabaseId, socketId);
    }

    private detachSocketFromCurrentGame(socket: Socket, emitUpdates: boolean) {
        const gameId = this.socketToGame.get(socket.id);
        if (!gameId) return;
        const controller = this.games.get(gameId);
        socket.leave(gameRoomName(gameId));
        this.socketToGame.delete(socket.id);

        if (!controller) {
            this.broadcastLobby();
            return;
        }

        const wasInGame = controller.getPlayers().some((p) => p.id === socket.id);
        let response: Record<string, unknown> | null = null;
        if (wasInGame) {
            response = controller.removePlayer(socket.id);
        }

        const remaining = controller.getPlayers().length;
        if (remaining === 0) {
            this.games.delete(gameId);
        } else if (emitUpdates && response) {
            const fullState = { ...controller.getPublicState(), ...response };
            this.wss.to(gameRoomName(gameId)).emit("gameUpdate", fullState);
            this.sendHandsToPlayers(gameId);
        }

        this.broadcastLobby();
    }

    registerSocketHandlers(socket: Socket) {
        socket.on("disconnect", () => this.disconnect(socket));
        socket.on("MessageEvent", (messageText) => this.onMessageEvent(messageText));
        socket.on("lobbySubscribe", () => this.onLobbySubscribe(socket));
        socket.on("lobbyUnsubscribe", () => this.onLobbyUnsubscribe(socket));
        socket.on("createGame", (data) => this.onCreateGame(socket, data));
        socket.on("joinGame", (data) => this.onJoinGame(socket, data));
        socket.on("leaveGame", () => this.onLeaveGame(socket));
        socket.on("placeBid", (data) => this.onPlaceBid(socket, data));
        socket.on("playCard", (data) => this.onPlayCard(socket, data));
    }

    disconnect(socket: Socket) {
        console.log("Socket disconnected");
        for (const [uId, sId] of this.userToSocket.entries()) {
            if (sId === socket.id) {
                this.userToSocket.delete(uId);
                break;
            }
        }
        this.detachSocketFromCurrentGame(socket, true);
    }

    onMessageEvent(messageText: string) {
        console.log("Message event received: ", messageText);
    }

    onLobbySubscribe(socket: Socket) {
        socket.join(lobbyRoom);
        socket.emit("lobbyGames", this.getLobbySnapshot());
    }

    onLobbyUnsubscribe(socket: Socket) {
        socket.leave(lobbyRoom);
    }

    onCreateGame(socket: Socket, data: PlayerJoinData) {
        try {
            if (data.supabaseId) this.enforceSingleSession(data.supabaseId, socket.id);

            this.detachSocketFromCurrentGame(socket, true);

            const gameId = randomUUID();
            const controller = new GameController();
            this.games.set(gameId, controller);


            const player = new Player(
                socket.id,
                data?.name || "Player",
                data.supabaseId || ""
            );

            // TEMP DEBUG LOG
            console.log(`[Table Create] Player ${player.name} initialized with DB ID: ${player.supabaseId}`);

            const response = controller.addPlayer(player);

            socket.leave(lobbyRoom);
            socket.join(gameRoomName(gameId));
            this.socketToGame.set(socket.id, gameId);

            this.emitGameUpdate(gameId, response);
            this.broadcastLobby();
            socket.emit("gameCreated", { gameId });
        } catch (error: any) {
            socket.emit("errorMessage", error.message);
        }
    }

    onJoinGame(socket: Socket, data: PlayerJoinData) {
        try {
            if (data.supabaseId) this.enforceSingleSession(data.supabaseId, socket.id);

            const gameId = data?.gameId;
            if (!gameId || typeof gameId !== "string") {
                socket.emit("errorMessage", "Select a game to join.");
                return;
            }

            const controller = this.games.get(gameId);
            if (!controller) {
                socket.emit("errorMessage", "That table no longer exists.");
                return;
            }

            if (controller.getPhase() !== GamePhase.WAITING) {
                socket.emit("errorMessage", "This game has already started.");
                return;
            }

            const prev = this.socketToGame.get(socket.id);
            if (prev && prev !== gameId) {
                this.detachSocketFromCurrentGame(socket, true);
            }

            const alreadySeated = controller.getPlayers().some((p) => p.id === socket.id);
            let response: Record<string, unknown>;
            if (!alreadySeated) {
                const player = new Player(socket.id, data?.name || "Player", data.supabaseId || "");
                response = controller.addPlayer(player);
            } else {
                response = { type: "REJOINED", players: controller.getPlayers().map((p) => ({ id: p.id, name: p.name })) };
            }

            socket.leave(lobbyRoom);
            socket.join(gameRoomName(gameId));
            this.socketToGame.set(socket.id, gameId);

            this.emitGameUpdate(gameId, response);
            this.broadcastLobby();
        } catch (error: any) {
            socket.emit("errorMessage", error.message);
        }
    }

    onLeaveGame(socket: Socket) {
        this.detachSocketFromCurrentGame(socket, true);
    }

    private onPlaceBid(socket: Socket, data: any) {
        try {
            const gameId = this.socketToGame.get(socket.id);
            if (!gameId) {
                socket.emit("errorMessage", "You are not seated at a table.");
                return;
            }
            const controller = this.games.get(gameId);
            if (!controller) {
                socket.emit("errorMessage", "Game not found.");
                return;
            }

            const bid = new Bid(
                socket.id,
                data.tricks,
                data.contractType,
                data.suitType,
                data.loner
            );

            const response = controller.placeBid(bid);
            this.emitGameUpdate(gameId, response);
        } catch (error: any) {
            socket.emit("errorMessage", error.message);
        }
    }

    private async onPlayCard(socket: Socket, data: any) {
        try {
            // 1. Find which game this socket belongs to
            const gameId = this.socketToGame.get(socket.id);
            if (!gameId) {
                socket.emit("errorMessage", "You are not in an active game.");
                return;
            }

            const controller = this.games.get(gameId);
            if (!controller) {
                socket.emit("errorMessage", "Game session not found.");
                return;
            }

            const card = new Card(data.suit, data.face);

            // 2. Execute the play on the CORRECT controller
            const response = controller.playCard(socket.id, card);

            // 3. Update the UI using your multi-game helper
            // This handles emitting to the right room and updating hands
            this.emitGameUpdate(gameId, response);

            // 4. RUN STATS IN THE BACKGROUND
            if (response.stats) {
                console.log(`[Game ${gameId}] Round ended. Syncing to Supabase...`);

                try {
                    await StatsService.recordRoundStats(
                        controller.getPlayers(), // Use the specific game's players
                        response.stats.roundResult!,
                        response.stats.declarerId!,
                        response.stats.bidAmount ?? 0,
                        response.stats.playerTrickCounts
                    );

                    if (response.type === "GAME_COMPLETE") {
                        await StatsService.recordGameStats(
                            controller.getPlayers(),
                            response.winnerTeamId ?? 0
                        );
                    }
                } catch (dbError: any) {
                    console.error("STATS ERROR:", dbError.message);
                }
            }

        } catch (error: any) {
            console.error("GAME LOGIC ERROR:", error.message);
            socket.emit("errorMessage", error.message);
        }
    }


}