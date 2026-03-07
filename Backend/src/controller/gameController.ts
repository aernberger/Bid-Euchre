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
  private playedCards: Card[] = [];
  private highestCard: Card | null = null;
  private contract: Contract | null = null;
  private ledSuit: SuitType | null = null;
  
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

      return{
        type: "BID_PASSED",
        nextPlayerID: this.players[this.currentPlayerIndex].id
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
      nextPlayerId: this.players[this.currentPlayerIndex].id
    };
  }

  private isBiddingComplete(): boolean {
    return this.bids.length >= this.players.length;
  }
      
  private endBidding() {
    if (!this.highestBid) {
      this.phase = GamePhase.WAITING;
      return {
        type: "REDEAL_REQUIRED"
      };
    }
  
    this.contract = new Contract(this.highestBid);
  
    this.game.startNewRound(this.contract);

    this.playedCards = [];
    this.highestCard = null;
    this.ledSuit = null;
  
    this.phase = GamePhase.PLAYING;

    
    const declarerIndex = this.players.findIndex(
      p => p.id === this.contract!.declarerId
    );

    if (declarerIndex === -1) {
      this.currentPlayerIndex = 0;
    } else {
      // if declarer is in the last seat, wrap to 0, otherwise +1
      this.currentPlayerIndex =
        declarerIndex === this.players.length - 1 ? 0 : declarerIndex + 1;
    }

    return {
      type: "BIDDING_COMPLETE",
      winningBid: this.highestBid,
      declarerId: this.contract.declarerId,
      phase: this.phase
    };


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

    currentPlayer.playCard(card);
  
    this.playerHands.set(currentPlayer.id, new Hand([...currentPlayer.hand]));
    this.playedCards.push(card);

    if(this.playedCards.length == 1){
      this.ledSuit = card.suit;
      this.highestCard = card;
    }

    if (!this.contract) {
      throw new Error("No active contract");
    }


    const led = this.ledSuit as SuitType;
    if (this.highestCard && this.contract.compareCards(card, this.highestCard, led) > 0) {
        this.highestCard = card;
    }

    const playedBy = currentPlayer.id;
  
  
    this.advanceTurn();
  
    if (this.isTrickComplete()) {
      const endResult: any = this.endTrick();
      if (endResult && typeof endResult === "object") {
        endResult.playedBy = playedBy;
      }
      return endResult;
    }
  
    return {
      type: "Card_Played",
      highest: this.highestCard,
      nextPlayerId: this.players[this.currentPlayerIndex].id,
      playedBy: playedBy
    };
  }

  private isTrickComplete() : boolean{
    return this.playedCards.length >= this.players.length;
  }

  private endTrick(){
    if (!this.highestCard) {
      this.phase = GamePhase.BIDDING;
      return {
        type: "REDEAL_REQUIRED"
      };
  }
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

  




