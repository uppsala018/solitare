'use client';

import { memo } from 'react';
import { useDrag } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType, MoveSource } from '@/lib/gameLogic';
import { isRed, rankLabel, suitSymbol } from '@/lib/gameLogic';
import { DRAG_TYPE, type DragItem } from '@/types/game';

interface CardProps {
  card: CardType;
  source?: MoveSource;
  stackCards?: CardType[];
  onClick?: () => void;
  onDoubleClick?: () => void;
  isDimmed?: boolean;
}

function Card({
  card, source, stackCards = [], onClick, onDoubleClick, isDimmed,
}: CardProps) {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { cards: [card, ...stackCards], source: source! },
    canDrag: () => !!source && card.faceUp,
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  return (
    <div
      ref={source && card.faceUp ? (drag as unknown as React.Ref<HTMLDivElement>) : undefined}
      className="w-full h-full relative select-none card"
      style={{
        opacity: isDragging || isDimmed ? 0.35 : 1,
        cursor: source && card.faceUp ? 'grab' : 'default',
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={card.faceUp ? 'face-up' : 'face-down'}
          className="absolute inset-0"
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: 90, opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {card.faceUp ? <FaceUp card={card} /> : <FaceDown />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default memo(Card);

function FaceUp({ card }: { card: CardType }) {
  const red   = isRed(card.suit);
  const color = red ? '#dc2626' : '#1e1b4b';
  const r     = rankLabel(card.rank);
  const s     = suitSymbol(card.suit);

  return (
    <div
      className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden"
      style={{ color }}
    >
      <div className="flex flex-col items-start px-0.5 pt-0.5 leading-none shrink-0">
        <span className="font-black" style={{ fontSize: 'clamp(8px, 2.2vw, 12px)', lineHeight: 1.1 }}>{r}</span>
        <span style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', lineHeight: 1 }}>{s}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span style={{ fontSize: 'clamp(13px, 3.5vw, 22px)' }}>{s}</span>
      </div>
      <div
        className="flex flex-col items-end px-0.5 pb-0.5 leading-none shrink-0"
        style={{ transform: 'rotate(180deg)' }}
      >
        <span className="font-black" style={{ fontSize: 'clamp(8px, 2.2vw, 12px)', lineHeight: 1.1 }}>{r}</span>
        <span style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', lineHeight: 1 }}>{s}</span>
      </div>
    </div>
  );
}

function FaceDown() {
  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden relative"
      style={{ background: '#1a0533', border: '2px solid rgba(245,200,66,0.45)' }}
    >
      <div
        className="absolute inset-1 rounded-sm"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(245,200,66,0.13) 0, rgba(245,200,66,0.13) 1px, transparent 0, transparent 50%), repeating-linear-gradient(-45deg, rgba(245,200,66,0.13) 0, rgba(245,200,66,0.13) 1px, transparent 0, transparent 50%)',
          backgroundSize: '6px 6px',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="opacity-20" style={{ fontSize: 'clamp(13px, 3.5vw, 20px)' }}>♛</span>
      </div>
    </div>
  );
}
