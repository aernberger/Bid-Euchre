export default class GameResult {
    winningTeamId;
    teamScores;
    playerTricks;
    playerBids;
    contractType;
    bidWinnerId;
    contractSuccessful;
    constructor({ winningTeamId, teamScores, playerTricks, playerBids, contractType, bidWinnerId, contractSuccessful, }) {
        this.winningTeamId = winningTeamId;
        this.teamScores = teamScores;
        this.playerTricks = playerTricks;
        this.playerBids = playerBids;
        this.contractType = contractType;
        this.bidWinnerId = bidWinnerId;
        this.contractSuccessful = contractSuccessful;
    }
}
