export type Suit = "hearts" | "spades" | "diamonds" | "clubs";
export type Card = { suit: Suit; value: string };
export type BidType = "Low" | "Suited" | "High";

export interface Bid {
    type: BidType;
    number: number;
    suit?: Suit;
}