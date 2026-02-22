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
    #private;
    constructor(userId: string | number);
    recordGameResult(gameResult: GameResult, playerId: string | number, playerTeamId: string | number): void;
    recordBid(success: boolean): void;
    get winPercentage(): number;
    toJSON(): PlayerStatsJSON;
}
