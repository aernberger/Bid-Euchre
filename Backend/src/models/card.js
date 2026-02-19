import Face from "./properties/face.js"
import Suit from "./properties/suit.js"

class Card {
    #suit;
    #face;
    constructor(suit, face) {
        this.suit = suit;
        this.face = face;
    }

    toString() {
        return `${this.face} of ${this.suit}`;
    }

    equals(otherCard) {
        if (!(otherCard instanceof Card)) return false;
    
        return this.suit === otherCard.suit &&
               this.face === otherCard.face;
    }

    //Move following code to contract class in services

    // equals(otherCard, contractType) {
        
    //     if (contractType === ContractType.HIGH || contractType === ContractType.LOW) {
    //         return this.getFace() === otherCard.getFace();
    //     } else {

    //     }
    //     return false;
        

    // }


}
