import type Card from './card.js';

export default class Player {
  id: string; // This is the socket.id
  supabaseId: string; // The UUID from auth.users / profiles
  name: string;
  hand: Card[] = [];
  teamId: number | null = null; // Helpful for the scoring service later

  constructor(id: string, name: string, supabaseId: string) {
    this.id = id;
    this.name = name;
    this.supabaseId = supabaseId;
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
