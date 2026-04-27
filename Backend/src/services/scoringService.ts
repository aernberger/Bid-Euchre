import { RoundResult } from "../models/roundResult.js";
import Team from "../models/team.js";
import { Contract } from "./contract.js";

export class ScoringEngine {

    static calculateScore(
      contract: Contract,
      teams: Team[],
      teamTrickCounts: Map<number, number>
    ): RoundResult {
  
      const declarerTeam = teams.find(team =>
        team.hasPlayer(contract.declarerId)
      );
  
      if (!declarerTeam) {
        throw new Error("Declarer team not found");
      }
  
      const defenderTeam = teams.find(
        team => team.teamId !== declarerTeam.teamId
      );
  
      if (!defenderTeam) {
        throw new Error("Defender team not found");
      }
  
      const declarerTricks = teamTrickCounts.get(declarerTeam.teamId) ?? 0;
  
      const defenderTricks =teamTrickCounts.get(defenderTeam.teamId) ?? 0;
  
      const contractCompleted = declarerTricks >= contract.tricksRequired;
  
      let pointsAwardedToTeamId: number;
      let pointsAwarded: number;
  
      if (contractCompleted) {
        pointsAwardedToTeamId = declarerTeam.teamId;
        if(contract.loner && contract.tricksRequired === 6) {
          pointsAwarded = 12;
        } else {
          pointsAwarded = contract.tricksRequired;
        }
      } else {
        pointsAwardedToTeamId = declarerTeam.teamId;
        if (contract.loner && contract.tricksRequired === 6) {
          pointsAwarded = -12;
        } else {
          pointsAwarded = -contract.tricksRequired;
        }
      }

      return new RoundResult(
        declarerTeam.teamId,
        defenderTeam.teamId,
        declarerTricks,
        defenderTricks,
        contractCompleted,
        pointsAwardedToTeamId,
        pointsAwarded,
        contract.loner,
        contract.isMoonShot()
      );
    }
  }