import { Card, Suit, createDeck, shuffle, canStackOnTableau, canStackOnFoundation } from './cardUtils';

export interface GameState {
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
  moves: number;
  score: number;
  isWon: boolean;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export function initGame(): GameState {
  const deck = shuffle(createDeck());

  const tableau: Card[][] = Array.from({ length: 7 }, (_, col) =>
    deck.splice(0, col + 1).map((c, i, arr) => ({
      ...c,
      faceUp: i === arr.length - 1,
    }))
  );

  const foundations = Object.fromEntries(SUITS.map((s) => [s, []])) as Record<Suit, Card[]>;

  return {
    tableau,
    foundations,
    stock: deck.map((c) => ({ ...c, faceUp: false })),
    waste: [],
    moves: 0,
    score: 0,
    isWon: false,
  };
}

export function checkWin(state: GameState): boolean {
  return SUITS.every((s) => state.foundations[s].length === 13);
}

export function flipStock(state: GameState): GameState {
  if (state.stock.length === 0) {
    return {
      ...state,
      stock: [...state.waste].reverse().map((c) => ({ ...c, faceUp: false })),
      waste: [],
    };
  }
  const [top, ...rest] = state.stock;
  return {
    ...state,
    stock: rest,
    waste: [{ ...top, faceUp: true }, ...state.waste],
    moves: state.moves + 1,
  };
}

export function moveToFoundation(state: GameState, card: Card, fromTableauIndex: number): GameState | null {
  const foundation = state.foundations[card.suit];
  const topCard = foundation[foundation.length - 1] ?? null;
  if (!canStackOnFoundation(card, topCard, card.suit)) return null;

  const newTableau = state.tableau.map((pile, i) => {
    if (i !== fromTableauIndex) return pile;
    const updated = pile.slice(0, -1);
    if (updated.length > 0) updated[updated.length - 1] = { ...updated[updated.length - 1], faceUp: true };
    return updated;
  });

  return {
    ...state,
    tableau: newTableau,
    foundations: { ...state.foundations, [card.suit]: [...foundation, card] },
    moves: state.moves + 1,
    score: state.score + 10,
    isWon: checkWin({ ...state, foundations: { ...state.foundations, [card.suit]: [...foundation, card] } }),
  };
}
