import type Card from "./card.js";

export default class Player {
  id: string | number;
  name: string;
  hand: Card[] = [];

  constructor(id: string | number, name: string) {
    this.id = id;
    this.name = name;
  }

  setCards(cards: Card[]): void {
    this.hand = cards;
  }

  playCard(cardToPlay: Card): Card {
    const index = this.hand.findIndex((card) => card.equals(cardToPlay));
    if (index === -1) {
      throw new Error('Card not in hand');
    }
    const [removedCard] = this.hand.splice(index, 1);
    return removedCard;
  }

  clearHand(): void {
    this.hand = [];
  }
}
