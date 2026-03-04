export class RoundResult {
    constructor(
      public readonly declarerTeamId: number,
      public readonly defenderTeamId: number,
      public readonly declarerTricks: number,
      public readonly defenderTricks: number,
      public readonly contractMade: boolean,
      public readonly pointsAwardedToTeamId: number,
      public readonly pointsAwarded: number,
      public readonly loner: boolean,
      public readonly moonShot: boolean
    ) {}
  }