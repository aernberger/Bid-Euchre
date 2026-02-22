import { ContractType } from "./enums/contractType.js";
import Suit, { SuitType } from "../models/properties/suit.js";
import Face, { FaceType } from "../models/properties/face.js";
import Card from "../models/card.js";
import { Bid } from "./bid.js";

const HIGH_RANK_VALUES: Record<FaceType, number> = {
    [Face.ACE]: 6,
    [Face.KING]: 5,
    [Face.QUEEN]: 4,
    [Face.JACK]: 3,
    [Face.TEN]: 2,
    [Face.NINE]: 1,
};

const LOW_RANK_VALUES: Record<FaceType, number> = {
    [Face.NINE]: 6,
    [Face.TEN]: 5,
    [Face.JACK]: 4,
    [Face.QUEEN]: 3,
    [Face.KING]: 2,
    [Face.ACE]: 1,
};

export class Contract {
  readonly type: ContractType
  readonly trumpSuit?: SuitType
  readonly tricksRequired: number
  readonly declarerId: string
  readonly loner: boolean

  constructor(winningBid: Bid) {
    this.type = winningBid.contractType
    this.trumpSuit = winningBid.suitType
    this.tricksRequired = winningBid.tricks
    this.declarerId = winningBid.bidderId
    this.loner = winningBid.loner
  }

  isMoonShot(): boolean {
    return this.loner && this.tricksRequired === 6
  }

  /**
   * Code needed for suited contract type comparison for the jacks
   */
  private isSameColorSuit(suitA: SuitType, suitB: SuitType): boolean {
    const red: SuitType[] = [Suit.HEARTS, Suit.DIAMONDS];
    const black: SuitType[] = [Suit.SPADES, Suit.CLUBS];
    return (
      (red.includes(suitA) && red.includes(suitB)) ||
      (black.includes(suitA) && black.includes(suitB))
    );
  }

  private getCardRank(card: Card, ledSuit: SuitType): number {
    // High/Low contract type
    if (this.type !== ContractType.SUITED) {
        const values =
            this.type === ContractType.LOW
                ? LOW_RANK_VALUES
                : HIGH_RANK_VALUES

        if (ledSuit && card.suit !== ledSuit) {
            return 0
        }

        return values[card.face]
    }

    // Suited contract type
    if (!this.trumpSuit) {
        throw new Error("Suited contract missing trump suit")
    }

    const isSuitedJack =
        card.face === Face.JACK &&
        card.suit === this.trumpSuit

    const isNonSuitedJack =
        card.face === Face.JACK &&
        card.suit !== this.trumpSuit &&
        this.isSameColorSuit(card.suit, this.trumpSuit)

    if (isSuitedJack) return 100

    if (isNonSuitedJack) return 99

    if (card.suit === this.trumpSuit) {
        return 80 + HIGH_RANK_VALUES[card.face]
    }

    if (card.suit === ledSuit) {
        return 40 + HIGH_RANK_VALUES[card.face]
    }

    return 0
}

    compareCards(cardA: Card, cardB: Card, ledSuit: SuitType): number {
        const rankA = this.getCardRank(cardA, ledSuit);
        const rankB = this.getCardRank(cardB, ledSuit);
        return rankA - rankB;
    }

}
