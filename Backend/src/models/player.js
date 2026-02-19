//import bid

class Player{
    id
    name
    hand

    controller(id, name){
        this.id = id;
        this.name = name;
    }

    setCards(cards){
        this.hands = cards;
    }

    playCard(cardToPlay) {
        const index = this.hand.findIndex(card =>
            card.equals(cardToPlay)
        );

        if (index === -1) {
            throw new Error("Card not in hand");
        }

        const [removedCard] = this.hand.splice(index, 1);
        return removedCard;
    }

    //implement when you make bid class
    
    // makeBid(bidValue, contractType){
    //     return new Bid(this.id, bidValue, contractType)
    // }
    
    clearHand(){
        this.hand = []
    }



}