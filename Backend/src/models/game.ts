import { Contract } from '../services/contract.js';
import Card from './card.js';
import Player from './player.js';
import { PlayCardProgress, Round } from './round.js';
import { RoundResult } from './roundResult.js';
import Team from './team.js';

/**
 * game class, represents entire game and cutilizes all other backend classes
 */

export class Game {
  private currentRound?: Round;
  private readonly teams: Team[];
  private readonly players: Player[];
  private readonly winningScore = 21;

  private individualTrickCounts: Map<string, number> = new Map();

  constructor(players: Player[], teams: Team[]) {
    this.players = players;
    this.teams = teams;
    this.players.forEach((p) => this.individualTrickCounts.set(p.id, 0));
  }

  startNewRound(contract: Contract, startingLeaderId?: string) {
    this.players.forEach((p) => this.individualTrickCounts.set(p.id, 0));

    this.currentRound = new Round(
      contract,
      this.teams,
      this.players.map((player) => player.id),
      startingLeaderId,
    );
  }

  playCard(playerId: string, card: Card): PlayCardProgress {
    if (!this.currentRound) {
      throw new Error('No active round');
    }

    const progress = this.currentRound.playCard(playerId, card);
    
    if (progress.trickCompleted && progress.trickWinnerId) {
      const current = this.individualTrickCounts.get(progress.trickWinnerId) || 0;
      this.individualTrickCounts.set(progress.trickWinnerId, current + 1);
    }

    if (progress.roundResult) {
      this.applyRoundResult(progress.roundResult);
    }

    return progress;
  }

  public getIndividualTrickCounts(): Record<string, number> {
    return Object.fromEntries(this.individualTrickCounts);
  }

  private applyRoundResult(result: RoundResult) {
    const team = this.getTeamById(result.pointsAwardedToTeamId);
    team.setGameScore(result.pointsAwarded);
  }

  isGameOver(): boolean {
    return this.teams.some((team) => team.getGameScore() >= this.winningScore);
  }

  getWinningTeam(): Team | undefined {
    return this.teams.find((team) => team.getGameScore() >= this.winningScore);
  }

  private getTeamById(teamId: number): Team {
    const team = this.teams.find((t) => t.teamId === teamId);
    if (!team) throw new Error('Team not found');
    return team;
  }

  public getLegalMovesForPlayer(playerId: string, hand: Card[], contract: Contract): Card[] {
    if (!this.currentRound) {
      return hand;
    }
    return this.currentRound.getLegalMoves(hand, contract);
  }

  public getCurrentTrickPlays(): { playerId: string; card: Card }[] {
    if (!this.currentRound) {
      return [];
    }
    return this.currentRound.getCurrentTrick().getPlays();
  }

  getTeamGameScores(): { teamId: number; score: number }[] {
    return this.teams.map((t) => ({
      teamId: t.teamId,
      score: t.getGameScore(),
    }));
  }

  getTeamTricksThisRound(): Record<number, number> | null {
    if (!this.currentRound) {
      return null;
    }
    return Object.fromEntries(this.currentRound.getTeamTrickCounts());
  }

  public remapPlayerId(oldId: string, newId: string): void {
    if (this.currentRound) {
      this.currentRound.remapPlayerId(oldId, newId);
    }
    const count = this.individualTrickCounts.get(oldId);
    if (count !== undefined) {
      this.individualTrickCounts.set(newId, count);
      this.individualTrickCounts.delete(oldId);
    }
  }
}
