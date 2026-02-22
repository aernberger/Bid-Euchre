import Card from "./card.js";
export default class Deck {
    cards: Card[];
    constructor();
    build(): void;
    shuffle(): void;
    deal(numPlayers: number, cardsPerPlayer: number): Card[][];
}
