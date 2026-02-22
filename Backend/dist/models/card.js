export default class Card {
    suit;
    face;
    constructor(suit, face) {
        this.suit = suit;
        this.face = face;
    }
    toString() {
        return `${this.face} of ${this.suit}`;
    }
    equals(otherCard) {
        if (!(otherCard instanceof Card))
            return false;
        return this.suit === otherCard.suit && this.face === otherCard.face;
    }
}
