import { Contract } from '../services/contract.js';
import { ScoringEngine } from '../services/scoringService.js';
import Card from './card.js';
import { RoundResult } from './roundResult.js';
import Team from './team.js';
import Trick from './trick.js';

/**
 * scores each round based on the number of tricks. checks if round is over, and if contract is made.
 */

export interface PlayCardProgress {
  roundResult: RoundResult | null;
  trickCompleted: boolean;
  nextPlayerId: string;
  trickWinnerId: string | null;
}

export class Round {
  private tricks: Trick[] = [];
  private currentTrick: Trick;
  private teamTrickCounts: Map<number, number> = new Map();
  private readonly activeTurnOrder: string[];

  constructor(
    private readonly contract: Contract,
    private readonly teams: Team[],
    private turnOrder: string[],
    private readonly startingLeaderId?: string,
  ) {
    teams.forEach((team) => {
      this.teamTrickCounts.set(team.teamId, 0);
    });

    this.activeTurnOrder = this.buildActiveTurnOrder();
    this.currentTrick = this.createNewTrick(this.startingLeaderId);
  }

  playCard(playerId: string, card: Card): PlayCardProgress {
    this.currentTrick.playCard(playerId, card);
    const trickLeaderId = this.currentTrick.getLeaderId() ?? playerId;

    if (this.currentTrick.isComplete()) {
      const winnerId = this.currentTrick.getWinner();
      this.recordTrickWin(winnerId);
      this.tricks.push(this.currentTrick);
      this.currentTrick = this.createNewTrick(winnerId);

      if (this.isComplete()) {
        return {
          roundResult: this.getRoundResult(),
          trickCompleted: true,
          nextPlayerId: winnerId,
          trickWinnerId: winnerId,
        };
      }
      return {
        roundResult: null,
        trickCompleted: true,
        nextPlayerId: winnerId,
        trickWinnerId: winnerId,
      };
    }

    const playsSoFar = this.currentTrick.getPlays().length;
    const nextPlayerId = this.getPlayerByOffset(trickLeaderId, playsSoFar);

    return {
      roundResult: null,
      trickCompleted: false,
      nextPlayerId,
      trickWinnerId: null,
    };
  }

  public getCurrentTrick(): Trick {
    return this.currentTrick;
  }

  public getLegalMoves(hand: Card[], contract: Contract): Card[] {
    const ledSuit = this.currentTrick.getLeadSuit();

    if (ledSuit === undefined) {
      return hand;
    }

    const followSuitCards = hand.filter((card) => contract.getEffectiveSuit(card) === ledSuit);

    return followSuitCards.length > 0 ? followSuitCards : hand;
  }

  private recordTrickWin(playerId: string) {
    const team = this.getTeamByPlayer(playerId);
    const count = this.teamTrickCounts.get(team.teamId)!;
    this.teamTrickCounts.set(team.teamId, count + 1);
  }

  private createNewTrick(leaderId?: string): Trick {
    const maxPlays = this.activeTurnOrder.length;
    return new Trick(this.contract, maxPlays, leaderId);
  }

  private getPlayerByOffset(startingPlayerId: string, offset: number): string {
    const startIndex = this.activeTurnOrder.findIndex((id) => id === startingPlayerId);
    if (startIndex === -1) {
      throw new Error('Could not determine next player order');
    }
    return this.activeTurnOrder[(startIndex + offset) % this.activeTurnOrder.length];
  }

  private buildActiveTurnOrder(): string[] {
    if (!this.contract.loner) {
      return [...this.turnOrder];
    }

    const declarerTeam = this.teams.find((team) => team.hasPlayer(this.contract.declarerId));
    if (!declarerTeam) {
      return [...this.turnOrder];
    }

    const declarerPartnerId = this.turnOrder.find(
      (playerId) => playerId !== this.contract.declarerId && declarerTeam.hasPlayer(playerId),
    );

    if (!declarerPartnerId) {
      return [...this.turnOrder];
    }

    return this.turnOrder.filter((playerId) => playerId !== declarerPartnerId);
  }

  isComplete(): boolean {
    return this.tricks.length === 6;
  }

  getTeamTrickCounts(): ReadonlyMap<number, number> {
    return new Map(this.teamTrickCounts);
  }

  getTeamByPlayer(playerId: string) {
    const team = this.teams.find((team) => team.hasPlayer(playerId));

    if (!team) {
      throw new Error('Player not assigned to any team');
    }

    return team;
  }

  getRoundResult(): RoundResult {
    return ScoringEngine.calculateScore(this.contract, this.teams, this.teamTrickCounts);
  }

  public remapPlayerId(oldId: string, newId: string): void {
    const index = this.turnOrder.findIndex((id) => id === oldId);
    if (index !== -1) {
      (this.turnOrder as string[])[index] = newId;
    }
  }
}
