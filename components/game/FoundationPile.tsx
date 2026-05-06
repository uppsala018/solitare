'use client';

import { useDrop } from 'react-dnd';
import type { Card, Suit } from '@/lib/gameLogic';
import { canMoveToFoundation, suitSymbol, rankLabel, isRed } from '@/lib/gameLogic';
import { DRAG_TYPE, type DragItem } from '@/types/game';

interface FoundationPileProps {
  suit: Suit;
  cards: Card[];
  onDrop: (item: DragItem) => void;
}

export default function FoundationPile({ suit, cards, onDrop }: FoundationPileProps) {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: DRAG_TYPE,
    canDrop: (item) => item.cards.length === 1 && canMoveToFoundation(item.cards[0], cards),
    drop: onDrop,
    collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  });

  const top      = cards[cards.length - 1];
  const complete = cards.length === 13;
  const red      = isRed(suit);
  const sColor   = red ? '#dc2626' : '#1e1b4b';

  const borderColor = isOver && canDrop
    ? '#39ff14'
    : complete
    ? 'rgba(0,212,170,0.8)'
    : 'rgba(255,255,255,0.2)';

  const boxShadow = isOver && canDrop
    ? '0 0 12px rgba(57,255,20,0.55)'
    : complete
    ? '0 0 8px rgba(0,212,170,0.4)'
    : undefined;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className="w-full h-[var(--game-card-h)] rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{
        background: complete ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.07)',
        border: `2px ${isOver && canDrop ? 'solid' : complete ? 'solid' : 'dashed'} ${borderColor}`,
        boxShadow,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {top ? (
        <div
          className="absolute inset-0 bg-white rounded-lg flex flex-col border"
          style={{ borderColor: red ? '#fca5a5' : '#d1d5db', color: sColor }}
        >
          <div className="flex flex-col items-start px-0.5 pt-0.5 leading-none">
            <span className="font-black" style={{ fontSize: 'clamp(8px,2.2vw,12px)', lineHeight: 1.1 }}>
              {rankLabel(top.rank)}
            </span>
            <span style={{ fontSize: 'clamp(7px,1.8vw,10px)', lineHeight: 1 }}>{suitSymbol(suit)}</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span style={{ fontSize: 'clamp(13px,3.5vw,22px)' }}>{suitSymbol(suit)}</span>
          </div>
        </div>
      ) : (
        <span className="opacity-25" style={{ fontSize: 'clamp(15px,4vw,26px)', color: red ? '#dc2626' : '#fff' }}>
          {suitSymbol(suit)}
        </span>
      )}
    </div>
  );
}
