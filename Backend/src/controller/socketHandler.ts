import { randomUUID } from 'node:crypto';
import { Server, Socket } from 'socket.io';
import { GameController } from './gameController.js';
import Player from '../models/player.js';
import { Bid } from '../services/bid.js';
import Card from '../models/card.js';
import { GamePhase } from './enums/gamePhase.js';
import { StatsService } from '../services/statsService.js';
import { supabaseAdmin as supabase } from '../supabaseClient.js';

/**
 * handles socket connectionsbetween backend and supabase
 */

interface PlayerJoinData {
  name?: string;
  supabaseId?: string;
  gameId?: string;
}

const lobbyRoom = 'lobby';

function gameRoomName(gameId: string) {
  return `game:${gameId}`;
}

export default class SocketHandler {
  private wss: Server;
  private controller!: GameController;
  private games = new Map<string, GameController>();
  private socketToGame = new Map<string, string>();

  private userToSocket = new Map<string, string>();
  private intentionalLeave = new Set<string>();

  constructor(wss: Server) {
    this.wss = wss;
    this.controller = new GameController();
    this.wss.on('connection', (socket) => {
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
    this.wss.to(lobbyRoom).emit('lobbyGames', snapshot);
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
          sock.emit('yourHand', { cards: hand, playableCards: playableCards ?? [] });
        }
      }
    }
  }

  private emitGameUpdate(gameId: string, patch: Record<string, unknown>) {
    const controller = this.games.get(gameId);
    if (!controller) return;
    const fullState = { ...controller.getPublicState(), ...patch };
    this.wss.to(gameRoomName(gameId)).emit('gameUpdate', fullState);
    this.sendHandsToPlayers(gameId);
  }

  private enforceSingleSession(supabaseId: string, socketId: string) {
    if (!supabaseId) return;

    const existingSocketId = this.userToSocket.get(supabaseId);

    if (existingSocketId && existingSocketId !== socketId) {
      const oldSocket = this.wss.sockets.sockets.get(existingSocketId);
      if (oldSocket) {
        oldSocket.emit('errorMessage', 'You have been logged in from another tab.');
        oldSocket.disconnect(true);
      }
    }

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
      this.wss.to(gameRoomName(gameId)).emit('gameUpdate', fullState);
      this.sendHandsToPlayers(gameId);
    }

    this.broadcastLobby();
  }

  registerSocketHandlers(socket: Socket) {
    socket.on('disconnect', () => this.disconnect(socket));
    socket.on('MessageEvent', (messageText) => this.onMessageEvent(messageText));
    socket.on('lobbySubscribe', (data) => this.onLobbySubscribe(socket, data));
    socket.on('lobbyUnsubscribe', () => this.onLobbyUnsubscribe(socket));
    socket.on('createGame', (data) => this.onCreateGame(socket, data));
    socket.on('joinGame', (data) => this.onJoinGame(socket, data));
    socket.on('leaveGame', () => this.onLeaveGame(socket));
    socket.on('placeBid', (data) => this.onPlaceBid(socket, data));
    socket.on('playCard', (data) => this.onPlayCard(socket, data));
  }

  disconnect(socket: Socket) {

    for (const [uId, sId] of this.userToSocket.entries()) {
      if (sId === socket.id) {
        this.userToSocket.delete(uId);
        break;
      }
    }

    const gameId = this.socketToGame.get(socket.id);
    if (gameId) {
      const controller = this.games.get(gameId);
      const player = controller?.getPlayers().find((p) => p.id === socket.id);

      if (player?.supabaseId) {
        supabase
          .rpc('set_player_connection', {
            p_game_id: gameId,
            p_user_id: player.supabaseId,
            p_connected: false,
          });
      }

      socket.leave(gameRoomName(gameId));
      this.socketToGame.delete(socket.id);
      this.wss.to(gameRoomName(gameId)).emit('playerDisconnected', {
        ...controller?.getPublicState(),
        type: 'PLAYER_DISCONNECTED',
        disconnectedPlayerId: socket.id,
      });

      this.broadcastLobby();
    }
  }

  onMessageEvent(messageText: string) {
    console.log('Message event received: ', messageText);
  }

  onLobbySubscribe(socket: Socket, data?: { supabaseId?: string }) {
    socket.join(lobbyRoom);
    socket.emit('lobbyGames', this.getLobbySnapshot());

    if (data?.supabaseId) {
      for (const [gameId, controller] of this.games.entries()) {
        const player = controller.getPlayers().find((p) => p.supabaseId === data.supabaseId);

        if (player && controller.getPhase() !== GamePhase.WAITING) {
          socket.emit('resumableGame', {
            gameId,
            phase: controller.getPhase(),
          });
          break;
        }
      }
    }
  }

  onLobbyUnsubscribe(socket: Socket) {
    socket.leave(lobbyRoom);
  }

  async onCreateGame(socket: Socket, data: PlayerJoinData) {
    try {
      if (data.supabaseId) this.enforceSingleSession(data.supabaseId, socket.id);

      this.detachSocketFromCurrentGame(socket, true);

      const gameId = randomUUID();
      const controller = new GameController();
      this.games.set(gameId, controller);

      const player = new Player(socket.id, data?.name || 'Player', data.supabaseId || '');

      const response = controller.addPlayer(player);

      if (data.supabaseId) {
        const { error: gameError } = await supabase.from('games').insert({
          id: gameId,
          phase: 'WAITING',
          team1_score: 0,
          team2_score: 0,
        });

        if (gameError) {
          console.error('[DB] Failed to insert game:', gameError.message);
        } else {
          const { error: playerError } = await supabase.from('game_players').insert({
            game_id: gameId,
            user_id: data.supabaseId,
            team_number: 1,
            seat_position: 0,
            is_connected: true,
          });

          if (playerError) {
            console.error('[DB] Failed to insert game creator:', playerError.message);
          }
        }
      }

      socket.leave(lobbyRoom);
      socket.join(gameRoomName(gameId));
      this.socketToGame.set(socket.id, gameId);

      this.emitGameUpdate(gameId, response);

      this.wss.to(gameRoomName(gameId)).emit('playerReconnected', {
        ...controller.getPublicState(),
        type: 'PLAYER_RECONNECTED',
        reconnectedPlayerId: socket.id,
      });

      this.broadcastLobby();
      socket.emit('gameCreated', { gameId });
    } catch (error: any) {
      socket.emit('errorMessage', error.message);
    }
  }

async onJoinGame(socket: Socket, data: PlayerJoinData) {
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

    const prev = this.socketToGame.get(socket.id);
    if (prev && prev !== gameId) this.detachSocketFromCurrentGame(socket, true);

    const existingPlayer = controller.getPlayers()
        .find(p => p.supabaseId === data.supabaseId);

    try {
        if (existingPlayer) {
            await this.handleReconnect(socket, data, gameId, controller, existingPlayer);
        } else {
            await this.handleNewJoin(socket, data, gameId, controller);
        }
    } catch (error: any) {
        socket.emit("errorMessage", error.message);
    }
}

private async handleReconnect(
    socket: Socket,
    data: PlayerJoinData,
    gameId: string,
    controller: GameController,
    existingPlayer: Player
) {
    const oldSocketId = existingPlayer.id;
    const isReconnect = !this.wss.sockets.sockets.has(oldSocketId) || (!!data.supabaseId && this.intentionalLeave.has(data.supabaseId));

    if (data.supabaseId) this.intentionalLeave.delete(data.supabaseId);

    existingPlayer.id = socket.id;
    this.socketToGame.delete(oldSocketId);
    controller.remapPlayerSocketId(oldSocketId, socket.id);

    if (data.supabaseId) {
        supabase.rpc("set_player_connection", {
            p_game_id: gameId,
            p_user_id: data.supabaseId,
            p_connected: true,
        }).then(({ error }) => {
            if (error) console.error("[DB] set_player_connection failed:", error.message);
        });
    }

    socket.leave(lobbyRoom);
    socket.join(gameRoomName(gameId));
    this.socketToGame.set(socket.id, gameId);

    const response = {
        type: "PLAYER_RECONNECTED",
        players: controller.getPlayers().map(p => ({ id: p.id, name: p.name })),
    };

    this.emitGameUpdate(gameId, response);
    this.broadcastLobby();

    if (isReconnect) {
        this.wss.to(gameRoomName(gameId)).emit("playerReconnected", {
            ...controller.getPublicState(),
            type: "PLAYER_RECONNECTED",
            reconnectedPlayerId: socket.id,
        });
    }

    await this.deliverHand(socket, data.supabaseId ?? null, controller);
}

private async handleNewJoin(
    socket: Socket,
    data: PlayerJoinData,
    gameId: string,
    controller: GameController
) {
    if (controller.getPhase() !== GamePhase.WAITING) {
        socket.emit("errorMessage", "This game has already started.");
        return;
    }

    const player = new Player(socket.id, data?.name || "Player", data.supabaseId || "");
    const response = controller.addPlayer(player);

    socket.leave(lobbyRoom);
    socket.join(gameRoomName(gameId));
    this.socketToGame.set(socket.id, gameId);
    this.emitGameUpdate(gameId, response);
    this.broadcastLobby();

    const hand = controller.getPlayerHand(socket.id);
    const playableCards = controller.getPlayableCards(socket.id);
    socket.emit("yourHand", { cards: hand, playableCards: playableCards ?? [] });

    if (data.supabaseId) {
        await this.persistNewPlayer(data.supabaseId, gameId, controller);
    }

    if (response.type === "GAME_INITIALIZED") {
        await this.persistInitialRoundAndHands(gameId, controller);
    }
}

private async persistNewPlayer(
    supabaseId: string,
    gameId: string,
    controller: GameController
) {
    const seatPosition = controller.getPlayers().length - 1;
    const teamNumber = seatPosition % 2 === 0 ? 1 : 2;
    await supabase.from("game_players").upsert({
        game_id: gameId,
        user_id: supabaseId,
        team_number: teamNumber,
        seat_position: seatPosition,
        is_connected: true,
    }, { onConflict: "game_id,user_id" });
}

private async persistInitialRoundAndHands(
    gameId: string,
    controller: GameController
) {
    await supabase.from("games").update({ phase: "BIDDING" }).eq("id", gameId);

    const { data: roundRow, error: roundError } = await supabase
        .from("rounds")
        .insert({
            game_id: gameId,
            round_number: controller.getCurrentRoundNumber(),
            phase: "BIDDING",
            turn_order: controller.getPlayers().map(p => p.supabaseId),
            team_trick_counts: { "1": 0, "2": 0 },
        })
        .select()
        .single();

    if (roundError || !roundRow) return;

    controller.currentRoundDbId = roundRow.id;

    const hands = controller.getHandsForPersistence();
    for (const { supabaseId, cards } of hands) {
        await supabase.from("player_hands").upsert(
            { round_id: roundRow.id, user_id: supabaseId, cards },
            { onConflict: "round_id,user_id" }
        );
    }
}

private async deliverHand(
    socket: Socket,
    supabaseId: string | null,
    controller: GameController
) {
    let hand = controller.getPlayerHand(socket.id);

    if (hand.length === 0 && supabaseId && controller.currentRoundDbId) {
        const { data: handData } = await supabase
            .from("player_hands")
            .select("cards")
            .eq("round_id", controller.currentRoundDbId)
            .eq("user_id", supabaseId)
            .single();

        if (handData?.cards?.length > 0) {
            controller.restoreHand(socket.id, handData?.cards);
            hand = controller.getPlayerHand(socket.id);
        }
    }

    const playableCards = controller.getPlayableCards(socket.id);
    socket.emit("yourHand", { cards: hand, playableCards: playableCards ?? [] });
}

  onLeaveGame(socket: Socket) {
    const gameId = this.socketToGame.get(socket.id);
    const controller = gameId ? this.games.get(gameId) : undefined;
    const player = controller?.getPlayers().find((p) => p.id === socket.id);
    const phase = controller?.getPhase();

    if (phase && phase !== GamePhase.WAITING) {
      if (player?.supabaseId && gameId) {
        this.intentionalLeave.add(player.supabaseId);
        supabase.rpc('set_player_connection', {
          p_game_id: gameId,
          p_user_id: player.supabaseId,
          p_connected: false,
        });
      }

      socket.leave(gameRoomName(gameId!));
      this.socketToGame.delete(socket.id);
      this.wss.to(gameRoomName(gameId!)).emit('playerDisconnected', {
        ...controller?.getPublicState(),
        type: 'PLAYER_DISCONNECTED',
        disconnectedPlayerId: socket.id,
      });

      this.broadcastLobby();
      return;
    }

    if (player?.supabaseId && gameId) {
      supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', player.supabaseId)
    }

    this.detachSocketFromCurrentGame(socket, true);
  }

  private async onPlaceBid(socket: Socket, data: any) {
    try {
      const gameId = this.socketToGame.get(socket.id);
      if (!gameId) {
        socket.emit('errorMessage', 'You are not seated at a table.');
        return;
      }
      const controller = this.games.get(gameId);
      if (!controller) {
        socket.emit('errorMessage', 'Game not found.');
        return;
      }

      const bid = new Bid(socket.id, data.tricks, data.contractType, data.suitType, data.loner);
      const response = controller.placeBid(bid);
      this.emitGameUpdate(gameId, response);

      if (response.type === 'BIDDING_COMPLETE') {
        const contract = controller.getContractForPersistence();

        if (controller.currentRoundDbId) {
          const { error } = await supabase
            .from('rounds')
            .update({
              phase: 'PLAYING',
              contract,
              starting_leader_id: contract?.declarerSupabaseId ?? null,
            })
            .eq('id', controller.currentRoundDbId);

          if (error) {
            console.error('[DB] Failed to update round to PLAYING:', error.message);
          }
        } else {
          console.warn('[DB] No currentRoundDbId — was GAME_INITIALIZED returned by addPlayer?');
        }
      }
    } catch (error: any) {
      socket.emit('errorMessage', error.message);
    }
  }

  private async onPlayCard(socket: Socket, data: any) {
    try {
      const gameId = this.socketToGame.get(socket.id);
      if (!gameId) {
        socket.emit('errorMessage', 'You are not in an active game.');
        return;
      }
      const controller = this.games.get(gameId);
      if (!controller) {
        socket.emit('errorMessage', 'Game session not found.');
        return;
      }

      const card = new Card(data.suit, data.face);
      const response = controller.playCard(socket.id, card);
      this.emitGameUpdate(gameId, response);

      await supabase.from('games').update(controller.getSerializableState()).eq('id', gameId);

      const roundId = controller.currentRoundDbId;
      if (roundId) {
        const hands = controller.getHandsForPersistence();
        for (const { supabaseId, cards } of hands) {
          await supabase
            .from('player_hands')
            .upsert(
              { round_id: roundId, user_id: supabaseId, cards },
              { onConflict: 'round_id,user_id' },
            );
        }

        if (response.type === 'ROUND_COMPLETE') {
          await supabase.from('rounds').update({ is_complete: true }).eq('id', roundId);
          controller.currentRoundDbId = null;

          const { data: newRoundRow, error: roundError } = await supabase
            .from('rounds')
            .insert({
              game_id: gameId,
              round_number: controller.getCurrentRoundNumber(),
              phase: 'BIDDING',
              turn_order: controller.getPlayers().map((p) => p.supabaseId),
              team_trick_counts: { '1': 0, '2': 0 },
            })
            .select()
            .single();

          if (roundError) {
            console.error('[DB] Failed to insert new round:', roundError.message);
          } else if (newRoundRow) {
            controller.currentRoundDbId = newRoundRow.id;

            const newHands = controller.getHandsForPersistence();
            for (const { supabaseId, cards } of newHands) {
              await supabase
                .from('player_hands')
                .upsert(
                  { round_id: newRoundRow.id, user_id: supabaseId, cards },
                  { onConflict: 'round_id,user_id' },
                );
            }
          }
        }

        if (response.type === 'GAME_COMPLETE') {
          await supabase.from('rounds').update({ is_complete: true }).eq('id', roundId);
          await supabase
            .from('games')
            .update({ is_complete: true, winner_team: response.winnerTeamId })
            .eq('id', gameId);
          controller.currentRoundDbId = null;
        }
      }

      if (response.stats) {
        try {
          await StatsService.recordRoundStats(
            controller.getPlayers(),
            response.stats.roundResult!,
            response.stats.declarerId!,
            response.stats.bidAmount ?? 0,
            response.stats.playerTrickCounts,
          );
          if (response.type === 'GAME_COMPLETE') {
            await StatsService.recordGameStats(controller.getPlayers(), response.winnerTeamId ?? 0);
          }
        } catch (dbError: any) {
          console.error('STATS ERROR:', dbError.message);
        }
      }
    } catch (error: any) {
      console.error('GAME LOGIC ERROR:', error.message);
      socket.emit('errorMessage', error.message);
    }
  }
}
