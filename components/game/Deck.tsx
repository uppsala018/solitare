'use client';

import { motion } from 'framer-motion';
import type { Card } from '@/lib/cardUtils';
import { rankLabel, suitSymbol, isRed } from '@/lib/cardUtils';

interface DeckProps {
  stockCount: number;
  wasteTop: Card | null;
  onDraw: () => void;
}

export default function Deck({ stockCount, wasteTop, onDraw }: DeckProps) {
  return (
    <div className="flex gap-3">
      {/* Stock */}
      <motion.div
        className="w-16 h-24 rounded-lg border-2 border-purple-light cursor-pointer flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #1a0533 100%)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onDraw}
      >
        {stockCount > 0 ? (
          <span className="text-gold font-bold text-lg">{stockCount}</span>
        ) : (
          <span className="text-2xl opacity-50">↺</span>
        )}
      </motion.div>

      {/* Waste */}
      {wasteTop ? (
        <div
          className="w-16 h-24 rounded-lg border bg-white flex flex-col p-1"
          style={{ borderColor: isRed(wasteTop.suit) ? '#fca5a5' : '#d1d5db', color: isRed(wasteTop.suit) ? '#dc2626' : '#111827' }}
        >
          <span className="text-sm font-bold leading-none">{rankLabel(wasteTop.rank)}</span>
          <span className="text-sm leading-none">{suitSymbol(wasteTop.suit)}</span>
          <span className="flex-1 flex items-center justify-center text-2xl">{suitSymbol(wasteTop.suit)}</span>
        </div>
      ) : (
        <div className="w-16 h-24 rounded-lg border-2 border-dashed border-purple-light opacity-30" />
      )}
    </div>
  );
}
