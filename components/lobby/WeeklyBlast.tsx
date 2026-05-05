'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Crown, DollarSign } from 'lucide-react';

const MILESTONES: { tokens: number; cash: string; emoji: string; bonus?: boolean }[] = [
  { tokens: 250,  cash: '$0.80', emoji: '💰' },
  { tokens: 500,  cash: '$2.50', emoji: '💰' },
  { tokens: 750,  cash: '$4.50', emoji: '💰' },
  { tokens: 1000, cash: '$8.00', emoji: '🏆', bonus: true },
];

const MAX = 1000;

interface WeeklyBlastProps {
  tokensEarned: number;
  claimedMilestones: number[];
  daysLeft: number;
  isRoyals: boolean;
  onClaimMilestone: (m: number) => void;
}

export default function WeeklyBlast({
  tokensEarned, claimedMilestones, daysLeft, isRoyals, onClaimMilestone,
}: WeeklyBlastProps) {
  const [pulsingMilestone, setPulsing] = useState<number | null>(null);
  const pct = Math.min((tokensEarned / MAX) * 100, 100);

  function handleClaim(tokens: number) {
    if (claimedMilestones.includes(tokens) || tokensEarned < tokens) return;
    setPulsing(tokens);
    onClaimMilestone(tokens);
    setTimeout(() => setPulsing(null), 1000);
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(45,27,105,0.8) 0%, rgba(26,5,51,0.95) 100%)',
        border: '1px solid rgba(245,200,66,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: '#f5c842' }} />
          <span className="text-white font-bold text-sm">Weekly Blast</span>
          {isRoyals && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842' }}>
              <Crown size={9} />2× tokens
            </span>
          )}
        </div>
        <span className="text-white/40 text-xs">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
      </div>

      {/* Token count */}
      <div className="flex items-center gap-1.5 mb-3">
        <Zap size={14} style={{ color: '#f5c842' }} />
        <span className="font-bold text-gold tabular-nums">{tokensEarned}</span>
        <span className="text-white/40 text-xs">/ {MAX} tokens</span>
      </div>

      {/* Progress bar + milestones */}
      <div className="relative mb-4">
        {/* Track */}
        <div className="w-full h-3 rounded-full overflow-visible" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full relative"
            style={{ background: 'linear-gradient(90deg, #f5c842, #00d4aa)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Milestone markers on the track */}
        {MILESTONES.map(({ tokens }) => {
          const pos  = (tokens / MAX) * 100;
          const done = claimedMilestones.includes(tokens);
          const reachable = tokensEarned >= tokens && !done;

          return (
            <div
              key={tokens}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${pos}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            >
              <motion.div
                className="w-3 h-3 rounded-full border-2"
                style={{
                  background: done ? '#00d4aa' : reachable ? '#f5c842' : '#2d1b69',
                  borderColor: done ? '#00d4aa' : reachable ? '#f5c842' : 'rgba(255,255,255,0.2)',
                }}
                animate={pulsingMilestone === tokens ? { scale: [1, 1.8, 1], opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 0.6 }}
              />
              {/* Gold pulse on reach */}
              {reachable && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(245,200,66,0.4)' }}
                  animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Milestone cards */}
      <div className="grid grid-cols-4 gap-1.5">
        {MILESTONES.map(({ tokens, cash, emoji, bonus }) => {
          const claimed   = claimedMilestones.includes(tokens);
          const reachable = tokensEarned >= tokens && !claimed;

          return (
            <motion.button
              key={tokens}
              className="relative flex flex-col items-center gap-1 py-2 px-1 rounded-xl overflow-hidden"
              style={{
                background: claimed
                  ? 'rgba(0,212,170,0.12)'
                  : reachable
                  ? 'rgba(245,200,66,0.12)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${claimed ? 'rgba(0,212,170,0.4)' : reachable ? 'rgba(245,200,66,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}
              whileTap={reachable ? { scale: 0.93 } : undefined}
              onClick={() => handleClaim(tokens)}
              disabled={!reachable && !claimed}
            >
              {/* Confetti burst when claimed */}
              <AnimatePresence>
                {pulsingMilestone === tokens && <MilestoneConfetti />}
              </AnimatePresence>

              <span style={{ fontSize: 16 }}>{claimed ? '✅' : reachable ? emoji : <Lock size={14} className="text-white/25" />}</span>
              <span
                className="font-bold text-xs tabular-nums"
                style={{ color: claimed ? '#00d4aa' : reachable ? '#f5c842' : 'rgba(255,255,255,0.3)' }}
              >
                {cash}
              </span>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {tokens}⚡
              </span>
              {bonus && (
                <span className="text-[8px] font-bold px-1 rounded" style={{ background: 'rgba(245,200,66,0.2)', color: '#f5c842' }}>
                  BONUS
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MilestoneConfetti() {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const r     = 40 + (i % 4) * 15;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, color: ['#f5c842','#00d4aa','#39ff14','#a855f7'][i % 4] };
  });

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.015 }}
        />
      ))}
    </motion.div>
  );
}
