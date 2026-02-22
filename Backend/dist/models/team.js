export default class Team {
    player1;
    player2;
    handScore = 0;
    gameScore = 0;
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
    }
    setHandScore(points) {
        this.handScore += points;
    }
    resetHandScore() {
        this.handScore = 0;
    }
    setGameScore(points) {
        this.gameScore += points;
    }
}
