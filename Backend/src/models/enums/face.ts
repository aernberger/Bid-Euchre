const Face = Object.freeze({
  NINE: '9',
  TEN: '10',
  JACK: 'Jack',
  QUEEN: 'Queen',
  KING: 'King',
  ACE: 'Ace',
} as const);

export type FaceType = (typeof Face)[keyof typeof Face];
export default Face;
