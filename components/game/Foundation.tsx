'use client';

import type { Card } from '@/lib/cardUtils';
import type { Suit } from '@/lib/cardUtils';
import { suitSymbol, isRed } from '@/lib/cardUtils';
import { clsx } from 'clsx';

interface FoundationProps {
  suit: Suit;
  cards: Card[];
}

export default function Foundation({ suit, cards }: FoundationProps) {
  const top = cards[cards.length - 1];
  const red = isRed(suit);

  return (
    <div
      className={clsx(
        'w-16 h-24 rounded-lg border-2 border-dashed flex items-center justify-center',
        red ? 'border-red-400 text-red-400' : 'border-gray-400 text-gray-400'
      )}
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {top ? (
        <span className="text-2xl">{suitSymbol(suit)}</span>
      ) : (
        <span className="text-3xl opacity-30">{suitSymbol(suit)}</span>
      )}
    </div>
  );
}
