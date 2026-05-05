'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

const SETS = [
  { name: 'Classic Royal',  owned: 4, total: 13, emoji: '🃏' },
  { name: 'Golden Age',     owned: 7, total: 13, emoji: '✨' },
  { name: 'Midnight Noir',  owned: 2, total: 13, emoji: '🌙' },
  { name: 'Ocean Dream',    owned: 0, total: 13, emoji: '🌊' },
];

export default function CollectionPage() {
  return (
    <div className="min-h-screen gradient-purple px-4 py-8 safe-top safe-bottom">
      <motion.h1
        className="text-4xl text-gold text-center mb-8"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Collection
      </motion.h1>

      <div className="max-w-lg mx-auto flex flex-col gap-4">
        {SETS.map((set, i) => (
          <motion.div
            key={set.name}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{set.emoji}</span>
              <div className="flex-1">
                <p className="text-white font-semibold">{set.name}</p>
                <p className="text-white/50 text-xs">{set.owned} / {set.total} cards</p>
              </div>
              <Button size="sm" variant="teal">Open Pack</Button>
            </div>
            <ProgressBar value={set.owned} max={set.total} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
