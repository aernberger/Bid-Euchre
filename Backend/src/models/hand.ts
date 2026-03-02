import Card from "./card.js"
import { SuitType } from "./properties/suit.js"

export default class Hand {
  private cards: Card[] = []

  constructor(initialCards: Card[]) {
    this.cards = [...initialCards]
  }

  getCards(): Card[] {
    return [...this.cards]
  }

  hasCard(card: Card): boolean {
    return this.cards.some(
      c => c.suit === card.suit && c.face === card.face
    )
  }

  removeCard(card: Card): void {
    const index = this.cards.findIndex(
      c => c.suit === card.suit && c.face === card.face
    )

    if (index === -1) {
      throw new Error("Card not in hand")
    }

    this.cards.splice(index, 1)
  }

  hasSuit(suit: SuitType): boolean {
    return this.cards.some(c => c.suit === suit)
  }

  getPlayableCards(leadSuit?: SuitType): Card[] {
    if (!leadSuit) {
      return this.getCards()
    }

    if (this.hasSuit(leadSuit)) {
      return this.cards.filter(c => c.suit === leadSuit)
    }

    return this.getCards()
  }

  playCard(card: Card, leadSuit?: SuitType): void {
    const playable = this.getPlayableCards(leadSuit)

    const isLegal = playable.some(
      c => c.suit === card.suit && c.face === card.face
    )

    if (!isLegal) {
      throw new Error("Illegal card play (must follow suit)")
    }

    this.removeCard(card)
  }

  isEmpty(): boolean {
    return this.cards.length === 0
  }
}