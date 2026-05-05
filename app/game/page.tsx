'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/useGame';
import { useTimer } from '@/hooks/useTimer';
import Deck from '@/components/game/Deck';
import Pile from '@/components/game/Pile';
import Foundation from '@/components/game/Foundation';
import Button from '@/components/ui/Button';
import type { Suit } from '@/lib/cardUtils';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export default function GamePage() {
  const { newGame } = useGameStore();
  const { gameState, drawCard } = useGame();
  const { formatted, reset } = useTimer(!!gameState && !gameState.isWon);

  useEffect(() => {
    if (!gameState) newGame();
  }, []);

  if (!gameState) return null;

  return (
    <div className="min-h-screen flex flex-col gradient-purple safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button size="sm" variant="ghost" onClick={() => window.history.back()}>← Lobby</Button>
        <span className="text-gold font-mono text-sm">{formatted}</span>
        <Button size="sm" variant="ghost" onClick={() => { newGame(); reset(); }}>New</Button>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-6 px-4 pb-2">
        <span className="text-sm text-white/60">Score: <strong className="text-white">{gameState.score}</strong></span>
        <span className="text-sm text-white/60">Moves: <strong className="text-white">{gameState.moves}</strong></span>
      </div>

      {/* Foundations */}
      <div className="flex justify-end gap-2 px-4 pb-3">
        {SUITS.map((suit) => (
          <Foundation key={suit} suit={suit} cards={gameState.foundations[suit]} />
        ))}
      </div>

      {/* Deck + waste */}
      <div className="px-4 pb-4">
        <Deck
          stockCount={gameState.stock.length}
          wasteTop={gameState.waste[0] ?? null}
          onDraw={drawCard}
        />
      </div>

      {/* Tableau */}
      <div className="flex gap-2 px-2 overflow-x-auto pb-6">
        {gameState.tableau.map((pile, i) => (
          <Pile key={i} cards={pile} />
        ))}
      </div>

      {/* Win overlay */}
      {gameState.isWon && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.h2
            className="text-5xl text-gold glow-gold mb-6"
            style={{ fontFamily: "'Fredoka One', cursive" }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            You Win! 👑
          </motion.h2>
          <p className="text-white text-lg mb-8">Score: {gameState.score}</p>
          <Button size="lg" onClick={() => { newGame(); reset(); }}>Play Again</Button>
        </motion.div>
      )}
    </div>
  );
}
