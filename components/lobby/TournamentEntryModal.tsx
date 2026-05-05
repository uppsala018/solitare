'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, DollarSign } from 'lucide-react';
import type { Tournament } from '@/types/database';

interface TournamentEntryModalProps {
  tournament:    Tournament | null;
  userBalance:   number;
  onClose:       () => void;
  onConfirm:     (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function TournamentEntryModal({
  tournament, userBalance, onClose, onConfirm,
}: TournamentEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  if (!tournament) return null;

  const canAfford = userBalance >= tournament.entry_fee;
  const isFull    = tournament.current_players >= tournament.max_players;
  const spotsLeft = tournament.max_players - tournament.current_players;

  const prizes = [
    { place: '1st', pct: 0.6, amount: tournament.prize_pool * 0.6 },
    { place: '2nd', pct: 0.3, amount: tournament.prize_pool * 0.3 },
    { place: '3rd', pct: 0.1, amount: tournament.prize_pool * 0.1 },
  ];

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const result = await onConfirm(tournament!.id);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Failed to enter');
  }

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 bg-black/70 z-40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed z-50 inset-x-4 mx-auto max-w-sm rounded-3xl overflow-hidden"
          style={{ top: '50%', translateY: '-50%', background: 'linear-gradient(160deg,#2d1b69,#1a0533)', border: '2px solid rgba(245,200,66,0.35)' }}
          initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', damping: 22 }}
        >
          {/* Theme banner */}
          <div
            className="px-5 py-4 flex items-center gap-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(76,45,143,0.8), rgba(26,5,51,0.9))' }}
          >
            <Trophy size={24} style={{ color: '#f5c842' }} />
            <div className="flex-1 min-w-0">
              <p className="text-gold font-black text-lg leading-tight truncate" style={{ fontFamily: "'Fredoka One', cursive" }}>
                {tournament.name}
              </p>
              <p className="text-white/50 text-xs">{tournament.theme} · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl opacity-60" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Prize breakdown */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Prize Breakdown</p>
              <div className="flex gap-2">
                {prizes.map(({ place, amount }) => (
                  <div
                    key={place}
                    className="flex-1 flex flex-col items-center py-2.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="text-white/40 text-xs">{place}</span>
                    <span className="text-gold font-black text-base">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multiplier info */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span className="text-white/60 text-xs">x{tournament.multiplier} multiplier · {tournament.max_players} max players</span>
            </div>

            {/* Balance + entry fee */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div>
                <p className="text-white/40 text-xs">Your balance</p>
                <p className={`font-bold text-base ${canAfford ? 'text-white' : 'text-red-400'}`}>
                  ${userBalance.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs">Entry fee</p>
                <p className="text-gold font-bold text-base">${tournament.entry_fee.toFixed(2)}</p>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-center text-sm font-semibold"
                  style={{ color: '#ff3d3d' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Confirm button */}
            <motion.button
              className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2"
              style={{
                background: canAfford && !isFull ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.1)',
                color: canAfford && !isFull ? 'white' : 'rgba(255,255,255,0.3)',
              }}
              whileTap={canAfford && !isFull ? { scale: 0.96 } : undefined}
              onClick={handleConfirm}
              disabled={!canAfford || isFull || loading}
            >
              <DollarSign size={18} />
              {isFull ? 'Tournament Full' : !canAfford ? 'Insufficient Balance' : loading ? 'Entering…' : `ENTER TOURNAMENT — $${tournament.entry_fee.toFixed(2)}`}
            </motion.button>

            <p className="text-center text-white/30 text-xs">
              After entering, play your best game — your top score counts!
            </p>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
