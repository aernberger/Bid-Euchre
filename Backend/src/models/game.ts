import { Contract } from "../services/contract.js"
import Card from "./card.js"
import Player from "./player.js"
import { Round } from "./round.js"
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
  
    startNewRound(contract: Contract) {
      this.currentRound = new Round(
        contract,
        this.teams
      )
    }
  
    playCard(playerId: string, card: Card) {
      if (!this.currentRound) {
        throw new Error("No active round")
      }
  
      this.currentRound.playCard(playerId, card)
  
      if (this.currentRound.isComplete()) {
        const result = this.currentRound.getRoundResult()
        this.applyRoundResult(result)
        this.currentRound = undefined
      }
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
  
    private getTeamById(teamId: number): Team {
        const team = this.teams.find(t => t.teamId === teamId)
      
        if (!team) {
          throw new Error("Team not found")
        }
      
        return team
      }
  }
