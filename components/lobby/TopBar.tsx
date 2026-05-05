'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export default function TopBar() {
  const { coins } = useGameStore();

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 safe-top"
      style={{ background: 'linear-gradient(180deg, #1a0533 0%, transparent 100%)' }}>
      <h1 className="text-2xl text-gold glow-gold" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Solitaire Crown
      </h1>
      <motion.div
        className="flex items-center gap-1 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.4)' }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg">🪙</span>
        <span className="text-gold font-bold text-sm">{coins.toLocaleString()}</span>
      </motion.div>
    </header>
  );
}
