import type Card from "./card.js";
export default class Player {
    id: string | number;
    name: string;
    hand: Card[];
    constructor(id: string | number, name: string);
    setCards(cards: Card[]): void;
    playCard(cardToPlay: Card): Card;
    clearHand(): void;
}
