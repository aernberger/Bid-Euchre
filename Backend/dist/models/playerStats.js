export default class PlayerStats {
    #userId;
    #gamesPlayed = 0;
    #gamesWon = 0;
    #gamesLost = 0;
    #totalPoints = 0;
    #totalTricksWon = 0;
    #bidsMade = 0;
    #bidsWon = 0;
    constructor(userId) {
        this.#userId = userId;
    }
    recordGameResult(gameResult, playerId, playerTeamId) {
        this.#gamesPlayed++;
        const playerWon = gameResult.winningTeamId === playerTeamId;
        if (playerWon) {
            this.#gamesWon++;
        }
        else {
            this.#gamesLost++;
        }
        const teamPoints = gameResult.teamScores[playerTeamId];
        this.#totalPoints += teamPoints;
        const tricks = gameResult.playerTricks[playerId] || 0;
        this.#totalTricksWon += tricks;
        const bid = gameResult.playerBids[playerId];
        if (bid !== undefined) {
            this.#bidsMade++;
            if (playerId === gameResult.bidWinnerId &&
                gameResult.contractSuccessful) {
                this.#bidsWon++;
            }
        }
    }
    recordBid(success) {
        this.#bidsMade++;
        if (success) {
            this.#bidsWon++;
        }
    }
    get winPercentage() {
        if (this.#gamesPlayed === 0)
            return 0;
        return this.#gamesWon / this.#gamesPlayed;
    }
    toJSON() {
        return {
            userId: this.#userId,
            gamesPlayed: this.#gamesPlayed,
            gamesWon: this.#gamesWon,
            gamesLost: this.#gamesLost,
            totalPoints: this.#totalPoints,
            totalTricksWon: this.#totalTricksWon,
            bidsMade: this.#bidsMade,
            bidsWon: this.#bidsWon,
            winPercentage: this.winPercentage,
        };
    }
}
