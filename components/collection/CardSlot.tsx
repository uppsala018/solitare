'use client';

import { motion } from 'framer-motion';
import { RARITY_COLORS, RARITY_GLOW, type StoredCard, type SetDefinition } from '@/types/collection';

interface CardSlotProps {
  slotIndex: number;  // 0-8
  collected: StoredCard | null;
  set: SetDefinition;
  isNew?: boolean;
}

export default function CardSlot({ slotIndex, collected, set, isNew }: CardSlotProps) {
  return (
    <motion.div
      className="relative rounded-xl overflow-hidden"
      style={{ aspectRatio: '2/3' }}
      initial={isNew ? { scale: 0.5, opacity: 0 } : { opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={isNew ? { type: 'spring', stiffness: 400, damping: 20 } : undefined}
    >
      {collected ? (
        <CollectedCard card={collected} set={set} slotIndex={slotIndex} />
      ) : (
        <EmptySlot slotIndex={slotIndex} />
      )}
    </motion.div>
  );
}

function CollectedCard({ card, set, slotIndex }: { card: StoredCard; set: SetDefinition; slotIndex: number }) {
  const isLeg = card.r === 'legendary';

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
      style={{
        background: set.gradient,
        border: `2px solid ${RARITY_COLORS[card.r]}`,
        boxShadow: RARITY_GLOW[card.r],
      }}
    >
      {/* Legendary pulse ring */}
      {isLeg && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ border: '2px solid #f5c842' }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.04, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Emoji art */}
      <span style={{ fontSize: 'clamp(16px, 4vw, 26px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
        {set.emoji}
      </span>

      {/* Card number */}
      <span
        className="text-white font-black mt-0.5"
        style={{ fontSize: 'clamp(8px, 2vw, 11px)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
      >
        #{slotIndex + 1}
      </span>

      {/* Rarity badge */}
      <div
        className="absolute bottom-1 left-0 right-0 flex justify-center"
      >
        <span
          className="px-1.5 rounded text-[8px] font-bold uppercase tracking-wider"
          style={{ background: 'rgba(0,0,0,0.6)', color: RARITY_COLORS[card.r] }}
        >
          {card.r}
        </span>
      </div>
    </div>
  );
}

function EmptySlot({ slotIndex }: { slotIndex: number }) {
  return (
    <div
      className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
      style={{ background: '#0d0820', border: '2px dashed rgba(255,255,255,0.12)' }}
    >
      {/* Back-pattern */}
      <div
        className="absolute inset-1 rounded-lg"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(245,200,66,0.05) 0, rgba(245,200,66,0.05) 1px, transparent 0, transparent 50%)',
          backgroundSize: '6px 6px',
        }}
      />
      <span className="relative text-white/15 font-bold" style={{ fontSize: 'clamp(9px, 2vw, 12px)' }}>
        #{slotIndex + 1}
      </span>
    </div>
  );
}
