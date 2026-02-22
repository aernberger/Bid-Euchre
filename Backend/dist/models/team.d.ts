import type Player from "./player.js";
export default class Team {
    player1: Player;
    player2: Player;
    handScore: number;
    gameScore: number;
    constructor(player1: Player, player2: Player);
    setHandScore(points: number): void;
    resetHandScore(): void;
    setGameScore(points: number): void;
}
