'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import EventTimer from '@/components/ui/EventTimer';
import Leaderboard from './Leaderboard';
import type { Tournament } from '@/types/database';
import type { LeaderboardEntry } from '@/hooks/useTournament';

interface TournamentResultsModalProps {
  open: boolean;
  tournament: Tournament | null;
  myScore: number;
  myMoves: number;
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  onPlayAgain: () => void;
  onClose: () => void;
}

export default function TournamentResultsModal({
  open,
  tournament,
  myScore,
  myMoves,
  leaderboard,
  currentUserId,
  onPlayAgain,
  onClose,
}: TournamentResultsModalProps) {
  if (!tournament) return null;

  const myEntry = leaderboard.find((e) => e.user_id === currentUserId);
  const myRank = myEntry?.rank ?? null;
  const rankEmoji = myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : myRank ? `#${myRank}` : '-';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/75 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '92vh', background: 'linear-gradient(160deg,#2d1b69,#1a0533)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-2 shrink-0" />

            <div className="flex items-center justify-between px-5 pb-3 shrink-0">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">{tournament.name}</p>
                <p className="text-gold font-black text-xl" style={{ fontFamily: "'Fredoka One', cursive" }}>Your Results</p>
              </div>
              <button onClick={onClose} className="min-h-11 min-w-11 rounded-xl opacity-70" style={{ background: 'rgba(255,255,255,0.1)' }} aria-label="Close tournament results">
                <X size={16} className="text-white mx-auto" />
              </button>
            </div>

            <div className="px-5 pb-4 shrink-0">
              <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,200,66,0.25)' }}>
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <span style={{ fontSize: 32 }}>{typeof rankEmoji === 'string' && rankEmoji.startsWith('#') ? '🎮' : rankEmoji}</span>
                  <span className="text-white/40 text-xs">Rank {myRank ?? '-'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/50 text-xs">YOUR SCORE</p>
                  <p className="text-gold font-black text-3xl tabular-nums" style={{ fontFamily: "'Fredoka One', cursive" }}>{myScore.toLocaleString()}</p>
                  <p className="text-white/40 text-xs">{myMoves} moves</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-white/40 text-xs">Ends in</p>
                  <EventTimer endsAt={tournament.ends_at} compact />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Live Leaderboard</p>
              <Leaderboard entries={leaderboard} currentUserId={currentUserId} prizePool={Number(tournament.prize_pool)} />
            </div>

            <div className="flex gap-3 px-5 py-3 shrink-0 safe-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={onClose} className="min-h-11 flex-1 rounded-2xl border border-white/20 text-white/60 text-sm font-semibold">Close</button>
              <motion.button className="min-h-11 flex-1 rounded-2xl gradient-gold text-purple-deep font-bold text-sm flex items-center justify-center gap-1.5" whileTap={{ scale: 0.96 }} onClick={onPlayAgain}>
                <RotateCcw size={14} /> Play Again
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
