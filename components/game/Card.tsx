'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Card as CardType } from '@/lib/cardUtils';
import { rankLabel, suitSymbol, isRed } from '@/lib/cardUtils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ card, onClick, style }: CardProps) {
  const red = isRed(card.suit);

  if (!card.faceUp) {
    return (
      <motion.div
        className="card w-16 h-24 rounded-lg border border-purple-light cursor-pointer select-none"
        style={{
          background: 'linear-gradient(135deg, #2d1b69 0%, #1a0533 100%)',
          ...style,
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
      >
        <div className="w-full h-full rounded-lg opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #4c2d8f 0, #4c2d8f 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={clsx(
        'card w-16 h-24 rounded-lg border bg-white cursor-pointer select-none flex flex-col p-1',
        red ? 'border-red-200 text-red-600' : 'border-gray-300 text-gray-900'
      )}
      style={style}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      layout
    >
      <span className="text-sm font-bold leading-none">{rankLabel(card.rank)}</span>
      <span className="text-sm leading-none">{suitSymbol(card.suit)}</span>
      <span className="flex-1 flex items-center justify-center text-2xl">{suitSymbol(card.suit)}</span>
    </motion.div>
  );
}
