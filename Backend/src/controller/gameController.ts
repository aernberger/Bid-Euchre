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
import Trick from "../models/trick.js";

export class GameController {
  private game!: Game;
  private players: Player[] = [];
  private phase: GamePhase = GamePhase.WAITING;

  private deck: Deck = new Deck();
  private bids: Bid[] = [];
  private highestBid: Bid | null = null;
  private winningBid: Bid | null = null;
  private currentPlayerIndex: number = 0;
  private dealerIndex: number = 0;
  private contract: Contract | null = null;

  private playerHands: Map<string, Hand> = new Map();

  /** Returns a minimal public state snapshot for clients (phase, players, currentPlayerId, highestBid, winningBid). */
  getPublicState() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    return {
      phase: this.phase,
      players: this.players.map((p) => ({ id: p.id, name: p.name })),
      currentPlayerId: currentPlayer?.id ?? null,
      highestBid: this.highestBid,
      winningBid: this.winningBid,
    };
  }

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

    this.deck = new Deck();
    this.deck.shuffle();

    const CARDS_PER_PLAYER = 6;
    const hands = this.deck.deal(this.players.length, CARDS_PER_PLAYER);

    this.playerHands.clear();
    for (let i = 0; i < this.players.length; i++) {
      const hand = new Hand(hands[i] || []);
      this.playerHands.set(this.players[i].id, hand);
    }

    // first to act is player left of dealer
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;

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

  placeBid(bid: Bid) {
    if (this.phase !== GamePhase.BIDDING) {
      throw new Error("Game is not in bidding phase");
    }

    const currentPlayer = this.players[this.currentPlayerIndex];

    if (currentPlayer.id !==  bid.bidderId) {
      throw new Error("Not your turn");
    }

    if(bid.isPass()){
      this.bids.push(bid);
      this.advanceTurn();
      if(this.isBiddingComplete()){
        return this.endBidding();
      }

      return {
        type: "BID_PASSED",
        nextPlayerId: this.players[this.currentPlayerIndex].id,
        currentPlayerId: this.players[this.currentPlayerIndex].id,
      };
    }

    if (this.highestBid && !bid.beats(this.highestBid)) {
      throw new Error("Bid must be higher than current highest bid");
    }
  
    this.highestBid = bid;
    this.bids.push(bid);
  
    this.advanceTurn();
  
    if (this.isBiddingComplete()) {
      return this.endBidding();
    }
  
    return {
      type: "BID_PLACED",
      highestBid: this.highestBid,
      nextPlayerId: this.players[this.currentPlayerIndex].id,
      currentPlayerId: this.players[this.currentPlayerIndex].id,
    };
  }

  private isBiddingComplete(): boolean {
    return this.bids.length >= this.players.length;
  }
      
  private endBidding() {
    if (!this.highestBid) {
      this.phase = GamePhase.WAITING;
      return {
        type: "REDEAL_REQUIRED",
      };
    }
  
    this.contract = new Contract(this.highestBid);
  
     // determine first player: player to the left of the declarer
    const declarerIndex = this.players.findIndex(
      p => p.id === this.contract!.declarerId
    );

    if (declarerIndex === -1) {
      this.currentPlayerIndex = 0;
    } else {
      this.currentPlayerIndex =
        declarerIndex === this.players.length - 1 ? 0 : declarerIndex + 1;
    }

    // pass the player id who will lead the first trick into Game.startNewRound
    const startingLeaderId = this.players[this.currentPlayerIndex].id;
    this.game.startNewRound(this.contract, startingLeaderId);


    this.phase = GamePhase.PLAYING;

    return {
      type: "BIDDING_COMPLETE",
      winningBid: this.highestBid,
      declarerId: this.contract.declarerId,
      phase: this.phase
    };

  }

  private getPlayerIndex(playerId: string): number {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx === -1) throw new Error("Player not found: " + playerId);
    return idx;
  }

  private advanceTurn(): void {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }


public playCard(playerId: string, card: Card) {
  if (this.phase !== GamePhase.PLAYING) {
    throw new Error("Game is not in playing phase");
  }

  const currentPlayer = this.players[this.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    throw new Error("Not your turn");
  }

  // let Player validate/remove the card from their hand
  currentPlayer.playCard(card);
  // keep controller's cache in sync
  this.playerHands.set(playerId, new Hand([...currentPlayer.hand]));

  // delegate trick/round handling to Game (which uses Round/Trick)
  const roundResult = this.game.playCard(playerId, card);

  // basic turn progression (Game/Round will decide next leader internally)
  this.advanceTurn();

  if (roundResult) {
    // round finished — return summary and check for game end
    if (this.game.isGameOver()) {
      const winner = this.game.getWinningTeam();
      this.phase = GamePhase.WAITING;
      return {
        type: "GAME_COMPLETE",
        winnerTeamId: winner?.teamId,
        round: roundResult,
      };
    }
    return { type: "ROUND_COMPLETE", roundResult };
  }

  return {
    type: "CARD_PLAYED",
    playerId,
    nextPlayerId: this.players[this.currentPlayerIndex].id,
    playedBy: playerId,
  };
}

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

  




