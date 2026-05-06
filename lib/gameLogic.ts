export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = number; // 1–13

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface GameState {
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
  moves: number;
  score: number;
  isWon: boolean;
  stockRedraws: number;
}

export type MoveSource =
  | { type: 'tableau'; pileIndex: number; cardIndex: number }
  | { type: 'waste' }
  | { type: 'foundation'; suit: Suit };

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

function makeRanks(): Rank[] {
  return Array.from({ length: 13 }, (_, i) => i + 1);
}

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    makeRanks().map((rank) => ({ id: `${suit}-${rank}`, suit, rank, faceUp: false }))
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

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function rankLabel(rank: Rank): string {
  const m: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
  return m[rank] ?? String(rank);
}

export function suitSymbol(suit: Suit): string {
  return { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[suit];
}

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

export function initGame(): GameState {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = [];
  for (let col = 0; col < 7; col++) {
    const pile = deck.splice(0, col + 1);
    pile[pile.length - 1] = { ...pile[pile.length - 1], faceUp: true };
    tableau.push(pile);
  }
  return {
    tableau,
    foundations: emptyFoundations(),
    stock: deck,
    waste: [],
    moves: 0,
    score: 0,
    isWon: false,
    stockRedraws: 0,
  };
}

export function canMoveToFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1];
  return card.suit === top.suit && card.rank === top.rank + 1;
}

export function canMoveToTableau(cards: Card[], pile: Card[]): boolean {
  if (!cards.length) return false;
  const card = cards[0];
  if (pile.length === 0) return card.rank === 13;
  const top = pile[pile.length - 1];
  return top.faceUp && isRed(card.suit) !== isRed(top.suit) && card.rank === top.rank - 1;
}

function revealTopCard(pile: Card[]): Card[] {
  if (!pile.length) return pile;
  const last = pile[pile.length - 1];
  if (last.faceUp) return pile;
  return [...pile.slice(0, -1), { ...last, faceUp: true }];
}

function deepClone(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function getSourceCards(state: GameState, source: MoveSource): Card[] {
  switch (source.type) {
    case 'tableau': return state.tableau[source.pileIndex].slice(source.cardIndex);
    case 'waste':   return state.waste.slice(0, 1);
    case 'foundation': {
      const p = state.foundations[source.suit];
      return p.length ? [p[p.length - 1]] : [];
    }
  }
}

function applyRemove(s: GameState, source: MoveSource): void {
  switch (source.type) {
    case 'tableau':
      s.tableau[source.pileIndex] = revealTopCard(
        s.tableau[source.pileIndex].slice(0, source.cardIndex)
      );
      break;
    case 'waste':
      s.waste = s.waste.slice(1);
      break;
    case 'foundation':
      s.foundations[source.suit] = s.foundations[source.suit].slice(0, -1);
      break;
  }
}

export function drawFromStock(state: GameState, maxRedraws?: number): GameState {
  const s = deepClone(state);
  if (s.stock.length === 0) {
    if (s.waste.length === 0) return s;
    if (typeof maxRedraws === 'number' && s.stockRedraws >= maxRedraws) return s;
    s.stock = [...s.waste].reverse().map((c) => ({ ...c, faceUp: false }));
    s.waste = [];
    s.stockRedraws += 1;
    return s;
  }
  const [top, ...rest] = s.stock;
  s.stock = rest;
  s.waste = [{ ...top, faceUp: true }, ...s.waste];
  s.moves += 1;
  return s;
}

function isWon(state: GameState): boolean {
  return SUITS.every((suit) => state.foundations[suit].length === 13);
}

export function moveToFoundation(state: GameState, source: MoveSource): GameState | null {
  const cards = getSourceCards(state, source);
  if (cards.length !== 1) return null;
  const card = cards[0];
  if (!canMoveToFoundation(card, state.foundations[card.suit])) return null;
  const s = deepClone(state);
  applyRemove(s, source);
  s.foundations[card.suit] = [...s.foundations[card.suit], card];
  s.score += 100;
  s.moves += 1;
  s.isWon = isWon(s);
  return s;
}

export function moveToTableau(state: GameState, source: MoveSource, toPileIndex: number): GameState | null {
  const cards = getSourceCards(state, source);
  if (!canMoveToTableau(cards, state.tableau[toPileIndex])) return null;
  if (source.type === 'tableau' && source.pileIndex === toPileIndex) return null;
  const s = deepClone(state);
  applyRemove(s, source);
  s.tableau[toPileIndex] = [...s.tableau[toPileIndex], ...cards];
  s.score += source.type === 'waste' ? 5 : 10;
  s.moves += 1;
  return s;
}

export function findBestMove(
  state: GameState,
  source: MoveSource
): { dest: 'foundation' } | { dest: 'tableau'; pileIndex: number } | null {
  const cards = getSourceCards(state, source);
  if (!cards.length) return null;
  if (cards.length === 1 && canMoveToFoundation(cards[0], state.foundations[cards[0].suit])) {
    return { dest: 'foundation' };
  }
  for (let i = 0; i < 7; i++) {
    if (source.type === 'tableau' && source.pileIndex === i) continue;
    if (state.tableau[i].length > 0 && canMoveToTableau(cards, state.tableau[i])) {
      return { dest: 'tableau', pileIndex: i };
    }
  }
  for (let i = 0; i < 7; i++) {
    if (source.type === 'tableau' && source.pileIndex === i) continue;
    if (state.tableau[i].length === 0 && canMoveToTableau(cards, state.tableau[i])) {
      return { dest: 'tableau', pileIndex: i };
    }
  }
  return null;
}

export function canAutoComplete(state: GameState): boolean {
  return (
    state.stock.length === 0 &&
    state.waste.length === 0 &&
    state.tableau.every((pile) => pile.every((c) => c.faceUp))
  );
}

export function autoCompleteStep(state: GameState): GameState | null {
  for (let i = 0; i < 7; i++) {
    const pile = state.tableau[i];
    if (!pile.length) continue;
    const card = pile[pile.length - 1];
    if (card.faceUp && canMoveToFoundation(card, state.foundations[card.suit])) {
      return moveToFoundation(state, { type: 'tableau', pileIndex: i, cardIndex: pile.length - 1 });
    }
  }
  return null;
}
