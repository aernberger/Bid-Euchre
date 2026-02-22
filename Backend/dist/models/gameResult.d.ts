import type { ContractTypeValue } from "../services/properties/contractType.js";
export interface GameResultData {
    winningTeamId: string | number;
    teamScores: Record<string | number, number>;
    playerTricks: Record<string | number, number>;
    playerBids: Record<string | number, unknown>;
    contractType: ContractTypeValue;
    bidWinnerId: string | number;
    contractSuccessful: boolean;
}
export default class GameResult {
    winningTeamId: string | number;
    teamScores: Record<string | number, number>;
    playerTricks: Record<string | number, number>;
    playerBids: Record<string | number, unknown>;
    contractType: ContractTypeValue;
    bidWinnerId: string | number;
    contractSuccessful: boolean;
    constructor({ winningTeamId, teamScores, playerTricks, playerBids, contractType, bidWinnerId, contractSuccessful, }: GameResultData);
}
