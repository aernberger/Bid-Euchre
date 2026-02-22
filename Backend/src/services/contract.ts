import { ContractType } from "./enums/contractType.js";
import Suit, { SuitType } from "../models/properties/suit.js";
import Face, { FaceType } from "../models/properties/face.js";
import Card from "../models/card.js";
import { Bid } from "./bid.js";

const HIGH_RANK_VALUES: Record<FaceType, number> = {
    [FaceType.ACE]: 6,
    [FaceType.KING]: 5,
    [FaceType.QUEEN]: 4,
    [FaceType.JACK]: 3,
    [FaceType.TEN]: 2,
    [FaceType.NINE]: 1,
};

const LOW_RANK_VALUES: Record<FaceType, number> = {
    [FaceType.NINE]: 6,
    [FaceType.TEN]: 5,
    [FaceType.JACK]: 4,
    [FaceType.QUEEN]: 3,
    [FaceType.KING]: 2,
    [FaceType.ACE]: 1,
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
        card.face === FaceType.JACK &&
        card.suit.type === this.trumpSuit

    const isNonSuitedJack =
        card.face.type === FaceType.JACK &&
        card.suit.type !== this.trumpSuit &&
        this.isSameColorSuit(card.suit.type, this.trumpSuit)

    if (isSuitedJack) return 100

    if (isNonSuitedJack) return 99
    
    if (card.suit.type === this.trumpSuit) {
        return 80 + HIGH_RANK_VALUES[card.face.type]
    }

    // 4️⃣ Following suit (non-trump)
    if (card.suit.type === ledSuit) {
        return 40 + HIGH_RANK_VALUES[card.face.type]
    }

    // 5️⃣ Off suit junk
    return 0


