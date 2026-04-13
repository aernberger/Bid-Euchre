import { Contract } from "../services/contract.js"
import Card from "./card.js"
import Player from "./player.js"
import { PlayCardProgress, Round } from "./round.js"
import { RoundResult } from "./roundResult.js"
import Team from "./team.js"

export class Game {
  private currentRound?: Round
  private readonly teams: Team[]
  private readonly players: Player[]

  private readonly winningScore = 21;

  constructor(players: Player[], teams: Team[]) {
    this.players = players
    this.teams = teams
  }

  startNewRound(contract: Contract, startingLeaderId?: string) {
    this.currentRound = new Round(
      contract,
      this.teams,
      this.players.map(player => player.id),
      startingLeaderId
    )
  }

  playCard(playerId: string, card: Card): PlayCardProgress {
    if (!this.currentRound) {
      throw new Error("No active round")
    }

    const progress = this.currentRound.playCard(playerId, card)

    if (progress.roundResult) {
      this.applyRoundResult(progress.roundResult)
      this.currentRound = undefined
    }

    return progress
  }

  private applyRoundResult(result: RoundResult) {
    const team = this.getTeamById(result.pointsAwardedToTeamId)
    team.setGameScore(result.pointsAwarded)
  }

  isGameOver(): boolean {
    return this.teams.some(
      team => team.getGameScore() >= this.winningScore
    )
  }

  getWinningTeam(): Team | undefined {
    return this.teams.find(
      team => team.getGameScore() >= this.winningScore
    )
  }

  public getLegalMovesForPlayer(playerId: string, hand: Card[], contract: Contract): Card[] {
    if (!this.currentRound) {
      return hand;
    }
    return this.currentRound.getLegalMoves(hand, contract);
  }

  public getCurrentTrickPlays(): { playerId: string; card: Card }[] {
    if (!this.currentRound) {
      return []
    }
    return this.currentRound.getCurrentTrick().getPlays()
  }

  getTeamGameScores(): { teamId: number; score: number }[] {
    return this.teams.map((t) => ({
      teamId: t.teamId,
      score: t.getGameScore(),
    }))
  }

  /** Tricks taken this round by team, or null when not in a playing round. */
  getTeamTricksThisRound(): Record<number, number> | null {
    if (!this.currentRound) {
      return null
    }
    return Object.fromEntries(this.currentRound.getTeamTrickCounts())
  }

  private getTeamById(teamId: number): Team {
    const team = this.teams.find(t => t.teamId === teamId)

    if (!team) {
      throw new Error("Team not found")
    }

    return team
  }
}
