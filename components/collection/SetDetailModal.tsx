'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import type { SetDefinition, SetProgress } from '@/types/collection';
import CardSlot from './CardSlot';

interface SetDetailModalProps {
  set: SetDefinition | null;
  progress: SetProgress | undefined;
  onClose: () => void;
  onGetPacks: () => void;
}

export default function SetDetailModal({ set, progress, onClose, onGetPacks }: SetDetailModalProps) {
  if (!set) return null;

  const collected = progress?.cards ?? [];
  const total     = Math.min(collected.length, 9);
  const complete  = progress?.completed ?? false;

  const cardMap = new Map(collected.map((c) => [c.n, c]));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Cinematic background */}
        <div className="absolute inset-0" style={{ background: set.gradient }} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}
        />

        {/* Close button */}
        <div className="relative flex justify-end p-4 safe-top">
          <button
            className="p-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto">
          <div className="flex flex-col items-center gap-6 px-5 pt-4 pb-8 max-w-sm mx-auto w-full">
            {/* Title */}
            <div className="flex flex-col items-center gap-1">
              <span style={{ fontSize: 48 }}>{set.emoji}</span>
              <h2
                className="text-3xl font-black tracking-wide text-white text-center"
                style={{ fontFamily: "'Fredoka One', cursive", textShadow: `0 0 20px ${set.accent}` }}
              >
                {set.name}
              </h2>
              <p className="text-white/50 text-sm text-center">{set.tagline}</p>
            </div>

            {/* Progress indicator */}
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${set.accent}44` }}
            >
              <span className="font-bold text-xl" style={{ color: set.accent }}>{total}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60 font-semibold">9 cards collected</span>
              {complete && <span className="text-sm">🏆</span>}
            </div>

            {/* 3×3 card grid */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {Array.from({ length: 9 }, (_, i) => (
                <CardSlot
                  key={i}
                  slotIndex={i}
                  collected={cardMap.get(i + 1) ?? null}
                  set={set}
                />
              ))}
            </div>

            {/* Trade section */}
            <div
              className="w-full rounded-2xl p-3.5 flex items-center gap-3"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Trade Duplicates</p>
                <p className="text-white/40 text-xs">Exchange cards with other players</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842' }}
              >
                Coming Soon
              </span>
            </div>

            {/* Get packs CTA */}
            {!complete && (
              <motion.button
                className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${set.accent}, ${set.accent}99)`, color: '#1a0533' }}
                whileTap={{ scale: 0.96 }}
                onClick={onGetPacks}
              >
                Get More Packs <ArrowRight size={16} />
              </motion.button>
            )}

            {/* Complete celebration */}
            {complete && (
              <motion.div
                className="w-full py-4 rounded-2xl flex flex-col items-center gap-1"
                style={{ background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.4)' }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span style={{ fontSize: 32 }}>🏆</span>
                <p className="text-teal font-bold" style={{ color: '#00d4aa' }}>Set Complete!</p>
                <p className="text-white/40 text-xs">All 9 cards collected</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
