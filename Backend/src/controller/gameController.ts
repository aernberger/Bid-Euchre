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

  /** Returns the list of players in the game (for iterating when sending hands). */
  getPlayers() {
    return [...this.players];
  }

  /** Returns a player's hand as serialized cards (suit, face) for sending to that client only. */
  getPlayerHand(playerId: string): { suit: string; face: string }[] | null {
    const hand = this.playerHands.get(playerId);
    if (!hand) return null;
    return hand.getCards().map((c) => ({ suit: c.suit, face: c.face }));
  }

  /** Returns which cards a player can legally play (follow-suit rules). Used to disable illegal cards in UI. */
  getPlayableCards(playerId: string): { suit: string; face: string }[] | null {
    const hand = this.playerHands.get(playerId);
    if (!hand) return null;
    const playable = hand.getPlayableCards(this.ledSuit as SuitType | undefined);
    return playable.map((c) => ({ suit: c.suit, face: c.face }));
  }

  /** Returns a minimal public state snapshot for clients (phase, players, currentPlayerId, highestBid, winningBid, playedCards). */
  getPublicState() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const playerHandCounts: Record<string, number> = {};
    for (const [id, hand] of this.playerHands) {
      playerHandCounts[id] = hand.getCards().length;
    }
    const base = {
      phase: this.phase,
      players: this.players.map((p) => ({ id: p.id, name: p.name })),
      currentPlayerId: currentPlayer?.id ?? null,
      highestBid: this.highestBid,
      winningBid: this.winningBid,
      playerHandCounts,
    };
    // Include playedCards in PLAYING phase so all clients see the current trick (not just the one who played)
    if (this.phase === GamePhase.PLAYING && this.playedCards.length > 0) {
      return {
        ...base,
        playedCards: this.playedCards.map((c) => ({ suit: c.suit, face: c.face })),
      };
    }
    return base;
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

    this.winningBid = this.highestBid;
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


public playCard(playerId: string, card: Card){
    if (this.phase !== GamePhase.PLAYING) {
      throw new Error("Game is not in playing phase");
    }

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (!currentPlayer) {
      throw new Error("No current player");
    }

    if (currentPlayer.id !== playerId) {
      throw new Error("Not your turn");
    }

    // Use Hand from playerHands (Player.hand is not synced); Hand enforces follow-suit rules
    const hand = this.playerHands.get(currentPlayer.id);
    if (!hand) throw new Error("No hand for player");
    hand.playCard(card, this.ledSuit as SuitType | undefined);
    this.playedCards.push(card);

    if(this.playedCards.length == 1){
      this.ledSuit = card.suit;
      this.highestCard = card;
    }

    if (!this.contract) {
      throw new Error("No active contract");
    }

  const currentPlayer = this.players[this.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    throw new Error("Not your turn");
  }

  // let Player validate/remove the card from their hand
  currentPlayer.playCard(card);
  // keep controller's cache in sync
  this.playerHands.set(playerId, new Hand([...currentPlayer.hand]));

    const playedBy = currentPlayer.id;
  
  
    this.advanceTurn();
  
    if (this.isTrickComplete()) {
      const endResult: any = this.endTrick();
      if (endResult && typeof endResult === "object") {
        endResult.playedBy = playedBy;
      }
      return endResult;
    }
  
    // Include playedCards so all clients can display the current trick in the center
    return {
      type: "Card_Played",
      highest: this.highestCard,
      nextPlayerId: this.players[this.currentPlayerIndex].id,
      playedBy: playedBy,
      playedCards: this.playedCards.map((c) => ({ suit: c.suit, face: c.face })),
    };
  }

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
    // Clear trick state for next trick; return TrickComplete so frontend clears center
    this.playedCards = [];
    this.highestCard = null;
    this.ledSuit = null;
    return {
      type: "TrickComplete",
      nextPlayerId: this.players[this.currentPlayerIndex].id,
    };
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

  




