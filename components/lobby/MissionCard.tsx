'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, CheckCircle2, Zap, Play, Target, Trophy, Gauge, Layers, GamepadIcon } from 'lucide-react';
import type { DailyMission } from '@/types/database';

const TYPE_ICONS: Record<string, React.ElementType> = {
  play_games: GamepadIcon,
  score_practice: Target,
  foundation_cards: Layers,
  complete_fast: Gauge,
  score_tourney: Trophy,
  win_games: Trophy,
};

interface MissionCardProps {
  mission: DailyMission;
  index: number;
  isLocked: boolean;
  isRoyals?: boolean;
  isClaimed?: boolean;
  onClaim?: (id: string) => void;
  onPlay?: () => void;
}

function MissionCard({ mission, index, isLocked, isRoyals, isClaimed, onClaim, onPlay }: MissionCardProps) {
  const [claimedNow, setClaimedNow] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const claimed = claimedNow || !!isClaimed;

  const progress = Math.min(mission.progress, mission.target);
  const pct = mission.target > 0 ? (progress / mission.target) * 100 : 0;
  const Icon = TYPE_ICONS[mission.mission_type] ?? Gift;
  const reward = isRoyals ? mission.reward_tokens * 2 : mission.reward_tokens;

  async function handleClaim() {
    if (claimed || !mission.completed) return;
    setShowBurst(true);
    setClaimedNow(true);
    await onClaim?.(mission.id);
    setTimeout(() => setShowBurst(false), 1000);
  }

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: isLocked
          ? 'rgba(255,255,255,0.04)'
          : mission.completed
            ? 'linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(26,5,51,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(76,45,143,0.5) 0%, rgba(26,5,51,0.9) 100%)',
        border: mission.completed
          ? '1px solid rgba(0,212,170,0.4)'
          : isLocked
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(245,200,66,0.2)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
    >
      <AnimatePresence>{showBurst && <StarBurst />}</AnimatePresence>

      <div className="flex items-center gap-3 p-3.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isLocked
              ? 'rgba(255,255,255,0.06)'
              : mission.completed
                ? 'rgba(0,212,170,0.2)'
                : 'rgba(245,200,66,0.15)',
          }}
        >
          {isLocked ? (
            <Lock size={18} className="text-white/30" />
          ) : mission.completed ? (
            <CheckCircle2 size={18} style={{ color: '#00d4aa' }} />
          ) : (
            <Icon size={18} style={{ color: '#f5c842' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm leading-tight mb-1.5" style={{ color: isLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)' }}>
            {isLocked ? 'Complete previous missions to unlock' : mission.mission_description}
          </p>

          {!isLocked && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: mission.completed ? '#00d4aa' : '#f5c842' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-white/40 text-xs tabular-nums shrink-0">{progress}/{mission.target}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-xs font-bold"
            style={{
              background: isRoyals ? 'rgba(245,200,66,0.15)' : 'rgba(0,212,170,0.12)',
              color: isRoyals ? '#f5c842' : '#00d4aa',
            }}
          >
            <Zap size={10} />
            <span>+{reward}</span>
            {isRoyals && <span className="text-[9px]">x2</span>}
          </div>

          {!isLocked && (
            mission.completed ? (
              <motion.button
                className="min-h-11 px-3 rounded-xl text-xs font-bold text-purple-deep"
                style={{
                  background: claimed ? 'rgba(255,255,255,0.15)' : '#00d4aa',
                  color: claimed ? 'rgba(255,255,255,0.3)' : '#1a0533',
                }}
                whileTap={{ scale: 0.93 }}
                onClick={handleClaim}
                disabled={claimed}
              >
                {claimed ? 'Claimed' : 'Claim'}
              </motion.button>
            ) : (
              <motion.button
                className="min-h-11 px-3 rounded-xl text-xs font-bold flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg,#39ff14,#22c55e)', color: '#1a0533' }}
                whileTap={{ scale: 0.93 }}
                onClick={onPlay}
              >
                <Play size={10} />
                Play
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StarBurst() {
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 50 + (i % 3) * 20;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, color: ['#f5c842', '#00d4aa', '#39ff14', '#ff3d3d'][i % 4] };
  });

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.01 }}
        />
      ))}
    </motion.div>
  );
}

export default memo(MissionCard);
