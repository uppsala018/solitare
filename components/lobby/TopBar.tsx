'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/ui/NotificationBell';

export default function TopBar() {
  const { profile } = useAuth();

  return (
    <header
      className="w-full flex items-center justify-between px-4 py-3 safe-top gap-2"
      style={{ background: 'linear-gradient(180deg, #1a0533 0%, transparent 100%)' }}
    >
      <h1 className="text-2xl text-gold glow-gold shrink-0" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Solitaire Crown
      </h1>

      <div className="flex items-center gap-2">
        <motion.div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
        >
          <span className="text-sm" aria-hidden>💎</span>
          <span className="text-purple-300 font-bold text-xs tabular-nums">{(profile?.gems ?? 0).toLocaleString()}</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.4)' }}
        >
          <span className="text-sm" aria-hidden>🪙</span>
          <span className="text-gold font-bold text-xs tabular-nums">${(profile?.cash_balance ?? 0).toFixed(2)}</span>
        </motion.div>

        <NotificationBell />
      </div>
    </header>
  );
}
