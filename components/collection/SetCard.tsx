'use client';

import { motion } from 'framer-motion';
import type { SetDefinition, SetProgress } from '@/types/collection';

interface SetCardProps {
  set: SetDefinition;
  progress: SetProgress | undefined;
  index: number;
  hasNew?: boolean;
  onClick: () => void;
}

export default function SetCard({ set, progress, index, hasNew, onClick }: SetCardProps) {
  const collected = Math.min(progress?.cards.length ?? 0, 9);
  const pct       = (collected / 9) * 100;
  const complete  = progress?.completed ?? false;
  const started   = collected > 0;

  return (
    <motion.button
      className="relative flex flex-col rounded-2xl overflow-hidden text-left w-full"
      style={{ border: complete ? `2px solid ${set.accent}` : '2px solid rgba(255,255,255,0.08)' }}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Poster art */}
      <div
        className="relative w-full"
        style={{ paddingBottom: '130%', background: set.gradient }}
      >
        {/* Overlay vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
        />

        {/* Center emoji art */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <span style={{ fontSize: 'clamp(22px, 6vw, 36px)', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }}>
            {set.emoji}
          </span>
        </div>

        {/* Complete banner */}
        {complete && (
          <motion.div
            className="absolute top-2 left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest"
              style={{ background: set.accent, color: '#1a0533' }}
            >
              ✓ COMPLETE
            </span>
          </motion.div>
        )}

        {/* NEW badge */}
        {hasNew && !complete && (
          <motion.div
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}

        {/* Locked overlay */}
        {!started && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <span className="text-white/30 text-xl">🔒</span>
          </div>
        )}

        {/* Circular progress in corner */}
        <div className="absolute bottom-2 right-2">
          <CircProg value={collected} max={9} color={set.accent} />
        </div>

        {/* Set name */}
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
          <p
            className="text-white font-black leading-tight"
            style={{ fontSize: 'clamp(9px, 2.4vw, 12px)', fontFamily: "'Fredoka One', cursive", textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          >
            {set.name}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full px-2 py-1.5"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-white/50 text-[9px]">{collected}/9</span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: complete ? set.accent : `linear-gradient(90deg,${set.accent}88,${set.accent})` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.04 }}
          >
            {/* Shimmer */}
            {started && !complete && (
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', width: '60%' }}
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2 }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}

function CircProg({ value, max, color }: { value: number; max: number; color: string }) {
  const size  = 28;
  const sw    = 2.5;
  const r     = (size - sw * 2) / 2;
  const circ  = r * 2 * Math.PI;
  const off   = circ - (Math.min(value, max) / max) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={sw} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={circ}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}
