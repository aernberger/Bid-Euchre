import type { FaceType } from "./enums/face.js";
import type { SuitType } from "./enums/suit.js";

export default class Card {
  suit: SuitType;
  face: FaceType;

  constructor(suit: SuitType, face: FaceType) {
    this.suit = suit;
    this.face = face;
  }

  toString(): string {
    return `${this.face} of ${this.suit}`;
  }

  equals(otherCard: Card): boolean {
    if (!(otherCard instanceof Card)) return false;
    return this.suit === otherCard.suit && this.face === otherCard.face;
  }
}
