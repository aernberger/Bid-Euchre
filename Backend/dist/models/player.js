export default class Player {
    id;
    name;
    hand = [];
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    setCards(cards) {
        this.hand = cards;
    }
    playCard(cardToPlay) {
        const index = this.hand.findIndex((card) => card.equals(cardToPlay));
        if (index === -1) {
            throw new Error('Card not in hand');
        }
        const [removedCard] = this.hand.splice(index, 1);
        return removedCard;
    }
    clearHand() {
        this.hand = [];
    }
}
