declare const Suit: Readonly<{
    readonly CLUBS: "Clubs";
    readonly DIAMONDS: "Diamonds";
    readonly HEARTS: "Hearts";
    readonly SPADES: "Spades";
}>;
export type SuitType = (typeof Suit)[keyof typeof Suit];
export default Suit;
