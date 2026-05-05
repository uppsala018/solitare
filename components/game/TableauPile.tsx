'use client';

import { useDrop } from 'react-dnd';
import type { Card, MoveSource } from '@/lib/gameLogic';
import { canMoveToTableau } from '@/lib/gameLogic';
import { DRAG_TYPE, type DragItem } from '@/types/game';
import GameCard from './Card';

const CARD_H    = 72;
const FD_OFFSET = 16; // face-down overlap offset
const FU_OFFSET = 24; // face-up overlap offset

interface TableauPileProps {
  pile: Card[];
  pileIndex: number;
  onDrop: (item: DragItem, toPileIndex: number) => void;
  onCardClick: (pileIndex: number, cardIndex: number) => void;
  onCardDblClick: (pileIndex: number, cardIndex: number) => void;
}

export default function TableauPile({
  pile, pileIndex, onDrop, onCardClick, onCardDblClick,
}: TableauPileProps) {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: DRAG_TYPE,
    canDrop: (item) => {
      if (item.source.type === 'tableau' && item.source.pileIndex === pileIndex) return false;
      return canMoveToTableau(item.cards, pile);
    },
    drop: (item) => onDrop(item, pileIndex),
    collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  });

  // Compute stacked height
  const totalH =
    pile.length === 0
      ? CARD_H
      : pile.slice(0, -1).reduce((acc, c) => acc + (c.faceUp ? FU_OFFSET : FD_OFFSET), 0) + CARD_H;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className="relative w-full"
      style={{
        height: totalH,
        minHeight: CARD_H,
        borderRadius: 8,
        border: isOver && canDrop ? '2px solid rgba(57,255,20,0.65)' : '2px solid transparent',
        boxShadow: isOver && canDrop ? '0 0 10px rgba(57,255,20,0.4)' : undefined,
        background: pile.length === 0 ? 'rgba(255,255,255,0.05)' : undefined,
        transition: 'border-color 0.12s',
      }}
    >
      {pile.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white opacity-20" style={{ fontSize: 18 }}>K</span>
        </div>
      )}

      {pile.map((card, i) => {
        const top       = pile.slice(0, i).reduce((acc, c) => acc + (c.faceUp ? FU_OFFSET : FD_OFFSET), 0);
        const source: MoveSource = { type: 'tableau', pileIndex, cardIndex: i };
        const stackCards = pile.slice(i + 1);

        return (
          <div
            key={card.id}
            className="absolute w-full"
            style={{ top, height: CARD_H, zIndex: i + 1 }}
          >
            <GameCard
              card={card}
              source={card.faceUp ? source : undefined}
              stackCards={card.faceUp ? stackCards : []}
              onClick={() => onCardClick(pileIndex, i)}
              onDoubleClick={() => onCardDblClick(pileIndex, i)}
            />
          </div>
        );
      })}
    </div>
  );
}
