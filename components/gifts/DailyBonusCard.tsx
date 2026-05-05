'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import StreakIndicator from './StreakIndicator';
import { useDailyBonus, STREAK_REWARDS, STREAK_GEM_BONUS } from '@/hooks/useDailyBonus';

export default function DailyBonusCard() {
  const { canClaim, streakDay, loading, justClaimed, formattedCountdown, currentReward, claimBonus } = useDailyBonus();
  const [claiming, setClaiming] = useState(false);

  async function handleClaim() {
    if (claiming || !canClaim) return;
    setClaiming(true);
    await claimBonus();
    setClaiming(false);
  }

  const isDay7 = streakDay === 7;

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden p-5 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, #3d2800 0%, #6b4a00 40%, #2d1b00 100%)',
        border: '1.5px solid rgba(245,200,66,0.4)',
        boxShadow: '0 4px 24px rgba(245,200,66,0.15)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Gold shimmer border on day 7 */}
      {isDay7 && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: '2px solid #f5c842' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Header row */}
      <div className="flex items-center gap-3">
        <motion.span
          style={{ fontSize: 40 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎁
        </motion.span>
        <div className="flex-1">
          <p className="text-gold font-black text-lg leading-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Daily Bonus
          </p>
          <div className="flex items-center gap-1">
            <Zap size={13} style={{ color: '#00d4aa' }} />
            <span className="font-bold text-sm" style={{ color: '#00d4aa' }}>
              {currentReward} tokens
              {isDay7 && <span className="ml-1 text-purple-300">+ {STREAK_GEM_BONUS}💎</span>}
            </span>
          </div>
        </div>

        {/* Streak badge */}
        <div
          className="flex flex-col items-center px-2 py-1 rounded-xl"
          style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)' }}
        >
          <span className="text-xs text-white/50">Day</span>
          <span className="text-xl font-black text-gold leading-tight">{streakDay}</span>
          <span className="text-xs text-white/50">of 7</span>
        </div>
      </div>

      {/* Streak bar */}
      <StreakIndicator currentDay={streakDay} />

      {/* Claim or countdown */}
      <AnimatePresence mode="wait">
        {canClaim ? (
          <motion.button
            key="claim"
            className="w-full py-3.5 rounded-2xl font-black text-base relative overflow-hidden"
            style={{
              background: justClaimed
                ? '#00d4aa'
                : 'linear-gradient(135deg, #39ff14, #22c55e)',
              color: '#1a0533',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={handleClaim}
            disabled={claiming}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', width: '60%' }}
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative">
              {justClaimed ? `✓ +${currentReward} tokens!` : claiming ? '…' : `CLAIM +${currentReward} ⚡`}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="countdown"
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,61,61,0.15)', border: '1px solid rgba(255,61,61,0.4)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>NEXT IN:</span>
            <span className="font-mono font-black text-base tabular-nums" style={{ color: '#ff3d3d' }}>
              {formattedCountdown}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
