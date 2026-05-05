'use client';

import { motion } from 'framer-motion';

interface TournamentCardProps {
  title: string;
  prize: string;
  timeLeft: string;
  players: number;
  onJoin?: () => void;
}

export default function TournamentCard({ title, prize, timeLeft, players, onJoin }: TournamentCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4c2d8f 100%)', border: '1px solid rgba(245,200,66,0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        <span className="text-xs text-teal bg-teal/10 px-2 py-0.5 rounded-full">{timeLeft}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏆</span>
        <span className="text-gold font-bold text-lg">{prize}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">{players.toLocaleString()} players</span>
        <motion.button
          className="px-4 py-1.5 rounded-full text-sm font-bold text-purple-deep gradient-gold"
          whileTap={{ scale: 0.95 }}
          onClick={onJoin}
        >
          Join
        </motion.button>
      </div>
    </motion.div>
  );
}
