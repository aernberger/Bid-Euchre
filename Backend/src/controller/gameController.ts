import { Game } from "../models/game.js";
import { Bid } from "../services/bid.js";
import { Contract } from "../services/contract.js";
import { GamePhase } from "./enums/gamePhase.js";
import Player from "../models/player.js";
import Hand from "../models/hand.js";
import Deck from "../models/deck.js";
import Card from "../models/card.js";
import Team from "../models/team.js";
import { ContractType } from "../services/enums/contractType.js";
import { SuitType } from "../models/enums/suit.js";

export class GameController {
  private game!: Game;
  private players: Player[] = [];
  private phase: GamePhase = GamePhase.WAITING;

  private deck: Deck = new Deck();
  private bids: Bid[] = [];
  private highestBid: Bid | null = null;
  private currentPlayerIndex: number = 0;
  private dealerIndex: number = 0;
  
  private playerHands: Map<string, Hand> = new Map();

  addPlayer(player: Player) {
    if (this.phase !== GamePhase.WAITING) {
      throw new Error("Game has already started.");
    }
    
    if (this.players.length >= 4) {
      throw new Error("Game is full.");
    }

    this.players.push(player);

    if (this.players.length === 4) {
      this.initializeGame();
      this.phase = GamePhase.BIDDING;
    }

    return {
      type: "PLAYER_JOINED",
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
      })),
      phase: this.phase,

    };
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter(player => player.id !== playerId);
    if (this.phase !== GamePhase.WAITING) {
      this.phase = GamePhase.WAITING;
    }
    return {
      type: "PLAYER_LEFT",
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
      })),
      phase: this.phase,
    };
  }

  initializeGame() {
    const team1 = new Team(this.players[0], this.players[2], 1);
    const team2 = new Team(this.players[1], this.players[3], 2);

    this.game = new Game(this.players, [team1, team2]);
    this.dealerIndex = Math.floor(Math.random() * 4);
    this.phase = GamePhase.BIDDING;
    return {
      type: "GAME_INITIALIZED",
      players: this.players.map((player, index) => ({
        id: player.id,
        name: player.name,
        seat: index
      })),
      dealerId: this.players[this.dealerIndex].id,
      currentPlayerId: this.players[this.currentPlayerIndex].id,
      phase: this.phase,
    };
  }

  // getSingularBid(playerId: string, tricks: number, contractType: ContractType, suitType?: SuitType, loner: boolean = false){
  //   return new Bid(playerId, tricks, contractType, suitType, loner);
  // }

  // getBids(){
  //   for(let i = 0; i < this.players.length; i++) {
  //     bids[i] = this.getSingularBid();
  //   }
  // }

  // startRound() {
  //   this.phase = GamePhase.BIDDING;

  }




