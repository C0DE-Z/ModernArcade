export type Card = {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
  face: string;
};

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
} as const;

export const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
} as const;

export type Deck = Card[];

export function createDeck(): Deck {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  const values = [
    { value: 11, face: 'A' },
    { value: 2, face: '2' },
    { value: 3, face: '3' },
    { value: 4, face: '4' },
    { value: 5, face: '5' },
    { value: 6, face: '6' },
    { value: 7, face: '7' },
    { value: 8, face: '8' },
    { value: 9, face: '9' },
    { value: 10, face: '10' },
    { value: 10, face: 'J' },
    { value: 10, face: 'Q' },
    { value: 10, face: 'K' },
  ];

  const deck: Deck = [];
  for (const suit of suits) {
    for (const { value, face } of values) {
      deck.push({ suit, value, face });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Deck): Deck {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function getCardDisplay(card: Card): string {
  const suitSymbols = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️',
  };
  return `${card.face}${suitSymbols[card.suit]}`;
}
