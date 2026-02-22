import type { FaceType } from "./properties/face.js";
import type { SuitType } from "./properties/suit.js";
export default class Card {
    suit: SuitType;
    face: FaceType;
    constructor(suit: SuitType, face: FaceType);
    toString(): string;
    equals(otherCard: Card): boolean;
}
