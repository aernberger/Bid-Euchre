import Card from "./card.js"
import Face from "./properties/face.js"
import Suit from "./properties/suit.js"

class Deck{
    cards;

    
    constructor(){
        this.cards = [];
        this.build()
    }

    build(){
        for(const suit of Object.values(Suit)){
            for(const face of Object.values(Face)){
                this.cards.push(new Card(suit, face))
            }
        }
    }

    //Fisher-Yates Algorithm for shuffling
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(numPlayers, cardsPerPlayer){
        const hands = [];
        for (let i = 0; i < numPlayers; i++){
            hands.push([]);
        }
        for ( let c = 0; c < cardsPerPlayer; c++){
            for (let p = 0; p < numPlayers; p++){
                const card = this.cards.pop()
                hands[player].push(card);
            }
        }

    }
    
    
}