import type GameResult from "./gameResult.js";

export interface PlayerStatsJSON {
  userId: string | number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalPoints: number;
  totalTricksWon: number;
  bidsMade: number;
  bidsWon: number;
  winPercentage: number;
}

export default class PlayerStats {
  #userId: string | number;
  #gamesPlayed = 0;
  #gamesWon = 0;
  #gamesLost = 0;
  #totalPoints = 0;
  #totalTricksWon = 0;
  #bidsMade = 0;
  #bidsWon = 0;

  constructor(userId: string | number) {
    this.#userId = userId;
  }

  recordGameResult(
    gameResult: GameResult,
    playerId: string | number,
    playerTeamId: string | number
  ): void {
    this.#gamesPlayed++;

    const playerWon = gameResult.winningTeamId === playerTeamId;

    if (playerWon) {
      this.#gamesWon++;
    } else {
      this.#gamesLost++;
    }

    const teamPoints = gameResult.teamScores[playerTeamId];
    this.#totalPoints += teamPoints;

    const tricks = gameResult.playerTricks[playerId] || 0;
    this.#totalTricksWon += tricks;

    const bid = gameResult.playerBids[playerId];
    if (bid !== undefined) {
      this.#bidsMade++;

      if (
        playerId === gameResult.bidWinnerId &&
        gameResult.contractSuccessful
      ) {
        this.#bidsWon++;
      }
    }
  }

  recordBid(success: boolean): void {
    this.#bidsMade++;
    if (success) {
      this.#bidsWon++;
    }
  }

  get winPercentage(): number {
    if (this.#gamesPlayed === 0) return 0;
    return this.#gamesWon / this.#gamesPlayed;
  }

  toJSON(): PlayerStatsJSON {
    return {
      userId: this.#userId,
      gamesPlayed: this.#gamesPlayed,
      gamesWon: this.#gamesWon,
      gamesLost: this.#gamesLost,
      totalPoints: this.#totalPoints,
      totalTricksWon: this.#totalTricksWon,
      bidsMade: this.#bidsMade,
      bidsWon: this.#bidsWon,
      winPercentage: this.winPercentage,
    };
  }
}
