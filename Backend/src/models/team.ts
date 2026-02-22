import type Player from "./player.js";

export default class Team {
  player1: Player;
  player2: Player;
  handScore: number = 0;
  gameScore: number = 0;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
  }

  setHandScore(points: number): void {
    this.handScore += points;
  }

  resetHandScore(): void {
    this.handScore = 0;
  }

  setGameScore(points: number): void {
    this.gameScore += points;
  }
}
