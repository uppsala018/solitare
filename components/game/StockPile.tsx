'use client';

import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import type { Card } from '@/lib/gameLogic';
import { rankLabel, suitSymbol, isRed } from '@/lib/gameLogic';
import { DRAG_TYPE, type DragItem } from '@/types/game';

interface StockPileProps {
  stockCount: number;
  waste: Card[];
  onDraw: () => void;
  onWasteTap?: () => void;
}

function WasteTop({ card, onTap }: { card: Card; onTap?: () => void }) {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { cards: [card], source: { type: 'waste' } },
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  const red = isRed(card.suit);
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className="w-full h-full bg-white rounded-lg border flex flex-col cursor-grab overflow-hidden"
      style={{
        borderColor: red ? '#fca5a5' : '#d1d5db',
        color: red ? '#dc2626' : '#1e1b4b',
        opacity: isDragging ? 0.4 : 1,
      }}
      onClick={onTap}
    >
      <div className="flex flex-col items-start px-0.5 pt-0.5 leading-none shrink-0">
        <span className="font-black" style={{ fontSize: 'clamp(8px,2.2vw,12px)', lineHeight: 1.1 }}>
          {rankLabel(card.rank)}
        </span>
        <span style={{ fontSize: 'clamp(7px,1.8vw,10px)', lineHeight: 1 }}>{suitSymbol(card.suit)}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span style={{ fontSize: 'clamp(13px,3.5vw,22px)' }}>{suitSymbol(card.suit)}</span>
      </div>
    </div>
  );
}

export default function StockPile({ stockCount, waste, onDraw, onWasteTap }: StockPileProps) {
  const wasteTop = waste[0] ?? null;

  return (
    <div className="flex gap-0.5 w-full">
      {/* Stock */}
      <motion.div
        className="flex-1 h-[var(--game-card-h)] rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
        style={{ background: '#1a0533', border: '2px solid rgba(245,200,66,0.4)' }}
        whileTap={{ scale: 0.93 }}
        onClick={onDraw}
      >
        {stockCount > 0 ? (
          <>
            <div
              className="absolute inset-1 rounded-sm"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(245,200,66,0.13) 0, rgba(245,200,66,0.13) 1px, transparent 0, transparent 50%)',
                backgroundSize: '6px 6px',
              }}
            />
            <span className="relative z-10 font-bold text-gold" style={{ fontSize: 'clamp(8px,2.2vw,12px)' }}>
              {stockCount}
            </span>
          </>
        ) : (
          <span className="text-gold opacity-50" style={{ fontSize: 'clamp(14px,4vw,20px)' }}>↺</span>
        )}
      </motion.div>

      {/* Waste */}
      <div
        className="flex-1 h-[var(--game-card-h)] rounded-lg overflow-hidden"
        style={
          wasteTop
            ? undefined
            : { background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)' }
        }
      >
        {wasteTop && <WasteTop card={wasteTop} onTap={onWasteTap} />}
      </div>
    </div>
  );
}
