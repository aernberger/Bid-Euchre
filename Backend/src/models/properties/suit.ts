const Suit = Object.freeze({
  CLUBS: 'Clubs',
  DIAMONDS: 'Diamonds',
  HEARTS: 'Hearts',
  SPADES: 'Spades',
} as const);

export type SuitType = (typeof Suit)[keyof typeof Suit];
export default Suit;
