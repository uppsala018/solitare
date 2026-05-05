'use client';

import { useGameStore } from '@/store/gameStore';
import { flipStock, moveToFoundation } from '@/lib/gameLogic';

export function useGame() {
  const { gameState, setGameState } = useGameStore();

  function drawCard() {
    if (!gameState) return;
    setGameState(flipStock(gameState));
  }

  function sendToFoundation(cardIndex: number, pileIndex: number) {
    if (!gameState) return;
    const card = gameState.tableau[pileIndex][cardIndex];
    const next = moveToFoundation(gameState, card, pileIndex);
    if (next) setGameState(next);
  }

  return { gameState, drawCard, sendToFoundation };
}
