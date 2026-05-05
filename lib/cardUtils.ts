export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${suit}-${rank}`,
      suit,
      rank,
      faceUp: false,
    }))
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isRed(suit: Suit) {
  return suit === 'hearts' || suit === 'diamonds';
}

export function rankLabel(rank: Rank): string {
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return String(rank);
}

export function suitSymbol(suit: Suit): string {
  return { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[suit];
}

export function canStackOnTableau(card: Card, target: Card): boolean {
  return isRed(card.suit) !== isRed(target.suit) && card.rank === target.rank - 1;
}

export function canStackOnFoundation(card: Card, topCard: Card | null, suit: Suit): boolean {
  if (card.suit !== suit) return false;
  if (!topCard) return card.rank === 1;
  return card.rank === topCard.rank + 1;
}
