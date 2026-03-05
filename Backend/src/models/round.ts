import { Contract } from "../services/contract.js"
import Card from "./card.js"
import { RoundResult } from "./roundResult.js"
import Team from "./team.js"
import Trick from "./trick.js"

export class Round {
    private tricks: Trick[] = []
    private currentTrick: Trick
    private teamTrickCounts: Map<number, number> = new Map()
  
    constructor(
      private readonly contract: Contract,
      private readonly teams: Team[]
    ) {
      teams.forEach(team => {
        this.teamTrickCounts.set(team.teamId, 0)
      })
  
      this.currentTrick = this.createNewTrick()
    }
  
    playCard(playerId: string, card: Card) {
      this.currentTrick.playCard(playerId, card)
  
      if (this.currentTrick.isComplete()) {
        const winnerId = this.currentTrick.getWinner()
        this.recordTrickWin(winnerId)
  
        this.tricks.push(this.currentTrick)
        this.currentTrick = this.createNewTrick(winnerId)
      }
    }
  
    private recordTrickWin(playerId: string) {
      const team = this.getTeamByPlayer(playerId)
      const count = this.teamTrickCounts.get(team.teamId)!
      this.teamTrickCounts.set(team.teamId, count + 1)
    }
  
    private createNewTrick(leaderId?: string): Trick {
      const maxPlays = this.contract.loner ? 3 : 4
      return new Trick(this.contract, maxPlays, leaderId)
    }
  
    isComplete(): boolean {
      return this.tricks.length === 6
    }

    getTeamByPlayer(playerId : string) {
        const team = this.teams.find(team =>
          team.hasPlayer(playerId)
        )
      
        if (!team) {
          throw new Error("Player not assigned to any team")
        }
      
        return team
    }
  
    getRoundResult(): RoundResult {
        const declarerTeam = this.getTeamByPlayer(this.contract.declarerId)
        const defenderTeam = this.teams.find(team => team !== declarerTeam)
        if (!defenderTeam) {
            throw new Error("Could not determine opposing team")
        }
      
        const declarerTricks = this.teamTrickCounts.get(declarerTeam.teamId)!
        const defenderTricks = this.teamTrickCounts.get(defenderTeam.teamId)!
        const contractMade =
          declarerTricks >= this.contract.tricksRequired
      
        let pointsAwardedToTeamId: number
        let pointsAwarded: number
      
        if (contractMade) {
          pointsAwardedToTeamId = declarerTeam.teamId
          pointsAwarded = declarerTricks
        } else {
          pointsAwardedToTeamId = defenderTeam.teamId
          pointsAwarded = this.contract.tricksRequired
        }
      
        return new RoundResult(
          declarerTeam.teamId,
          defenderTeam.teamId,
          declarerTricks,
          defenderTricks,
          contractMade,
          pointsAwardedToTeamId,
          pointsAwarded,
          this.contract.loner,
          this.contract.isMoonShot()
        )
      }
  }