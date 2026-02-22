declare const Face: Readonly<{
    readonly NINE: "9";
    readonly TEN: "10";
    readonly JACK: "Jack";
    readonly QUEEN: "Queen";
    readonly KING: "King";
    readonly ACE: "Ace";
}>;
export type FaceType = (typeof Face)[keyof typeof Face];
export default Face;
