'use client';

import { motion } from 'framer-motion';
import type { Card as CardType } from '@/lib/cardUtils';
import Card from './Card';

interface PileProps {
  cards: CardType[];
  onCardClick?: (cardIndex: number) => void;
}

export default function Pile({ cards, onCardClick }: PileProps) {
  return (
    <div className="relative w-16" style={{ minHeight: 96 + (cards.length - 1) * 24 }}>
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          className="absolute"
          style={{ top: i * 24 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: i * 0.02 }}
        >
          <Card card={card} onClick={() => onCardClick?.(i)} />
        </motion.div>
      ))}
    </div>
  );
}
