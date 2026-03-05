import type Player from "./player.js";

export default class Team {
  teamId: number;
  player1: Player;
  player2: Player;
  handScore: number = 0;
  gameScore: number = 0;

  constructor(player1: Player, player2: Player, teamId: number) {
    this.player1 = player1;
    this.player2 = player2;
    this.teamId = teamId;
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

  getGameScore(): number{
    return this.gameScore;
  }

  hasPlayer(playerId: string): boolean {
    return this.player1.id === playerId || this.player2.id === playerId;
  }
}
