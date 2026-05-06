'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '@/hooks/useTournament';

const MEDALS = ['🥇', '🥈', '🥉'];

const RANK_BG: Record<number, string> = {
  1: 'linear-gradient(135deg, rgba(245,200,66,0.25), rgba(196,154,26,0.1))',
  2: 'linear-gradient(135deg, rgba(192,192,192,0.2), rgba(128,128,128,0.05))',
  3: 'linear-gradient(135deg, rgba(205,127,50,0.2), rgba(140,80,20,0.05))',
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  prizePool?: number;
  compact?: boolean;
}

export default function Leaderboard({ entries, currentUserId, prizePool, compact }: LeaderboardProps) {
  const userRank = entries.findIndex((e) => e.user_id === currentUserId) + 1;
  const currentUserEntry = entries.find((e) => e.user_id === currentUserId);

  return (
    <div className="flex flex-col gap-1">
      {prizePool && !compact && (
        <div className="flex gap-1.5 mb-2">
          {[['1st', 0.6], ['2nd', 0.3], ['3rd', 0.1]].map(([place, pct]) => (
            <div key={place as string} className="flex-1 flex flex-col items-center py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="text-xs text-white/40">{place}</span>
              <span className="text-xs font-bold text-gold">${(prizePool * (pct as number)).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {entries.map((entry, i) => {
          const isSelf = entry.user_id === currentUserId;
          const isTop3 = entry.rank <= 3;
          const prizeShare = prizePool ? [0.6, 0.3, 0.1][entry.rank - 1] ?? 0 : 0;

          return (
            <motion.div
              key={entry.user_id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl relative overflow-hidden"
              style={{
                background: isSelf ? 'rgba(245,200,66,0.18)' : isTop3 ? RANK_BG[entry.rank] : 'rgba(255,255,255,0.04)',
                border: isSelf ? '1px solid rgba(245,200,66,0.5)' : isTop3 ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              }}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
            >
              <div className="w-7 flex items-center justify-center shrink-0">
                {isTop3 ? <span style={{ fontSize: 18 }}>{MEDALS[entry.rank - 1]}</span> : <span className="text-white/40 font-bold text-sm">{entry.rank}</span>}
              </div>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: isSelf ? 'rgba(245,200,66,0.3)' : 'rgba(255,255,255,0.12)', color: isSelf ? '#f5c842' : 'white' }}
              >
                {entry.username[0]?.toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelf ? 'text-gold' : 'text-white'}`}>
                  {entry.username}
                  {isSelf && <span className="text-xs text-gold/60 ml-1">(you)</span>}
                </p>
                {prizePool && prizeShare > 0 && (
                  <p className="text-[10px]" style={{ color: '#39ff14' }}>
                    🏆 ${(prizePool * prizeShare).toFixed(2)}
                  </p>
                )}
              </div>

              <motion.span
                key={entry.score}
                className="font-black tabular-nums text-sm shrink-0"
                style={{ color: isSelf ? '#f5c842' : 'rgba(255,255,255,0.8)' }}
                initial={{ scale: 1.3, color: '#39ff14' }}
                animate={{ scale: 1, color: isSelf ? '#f5c842' : 'rgba(255,255,255,0.8)' }}
                transition={{ duration: 0.4 }}
              >
                {entry.score.toLocaleString()}
              </motion.span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {currentUserId && userRank === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mt-1" style={{ background: 'rgba(245,200,66,0.1)', border: '1px dashed rgba(245,200,66,0.3)' }}>
          <Crown size={14} style={{ color: '#f5c842' }} />
          <span className="text-gold text-xs">You have not scored yet</span>
        </div>
      )}

      {currentUserEntry && entries.length > 8 && (
        <div
          className="sticky bottom-0 flex items-center gap-2 px-3 py-2 rounded-xl mt-2"
          style={{ background: 'rgba(245,200,66,0.22)', border: '1px solid rgba(245,200,66,0.55)', backdropFilter: 'blur(10px)' }}
        >
          <Crown size={14} style={{ color: '#f5c842' }} />
          <span className="text-gold text-xs font-bold">Your rank: #{currentUserEntry.rank}</span>
          <span className="ml-auto text-gold text-xs font-black">{currentUserEntry.score.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
