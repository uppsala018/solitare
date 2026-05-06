'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EventTimer from '@/components/ui/EventTimer';
import MissionCard from './MissionCard';
import WeeklyBlast from './WeeklyBlast';
import { useDaily } from '@/hooks/useDaily';

function nextMidnightUTC(): Date {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

interface DailyBlastContentProps {
  onClose?: () => void;
}

export default function DailyBlastContent({ onClose }: DailyBlastContentProps) {
  const router = useRouter();
  const {
    missions,
    weeklyTokens,
    claimedMilestones,
    claimedMissionIds,
    daysLeft,
    isRoyals,
    loading,
    error,
    claimMissionReward,
    claimMilestone,
  } = useDaily();

  const midnight = useMemo(() => nextMidnightUTC(), []);

  function isLocked(index: number): boolean {
    if (index === 0) return false;
    return !missions[index - 1]?.completed;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Zap size={28} style={{ color: '#f5c842' }} />
        </motion.div>
        <span className="text-white/50 text-sm">Loading missions...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div
        className="relative flex flex-col items-center gap-2 py-5 px-4 rounded-b-3xl"
        style={{ background: 'linear-gradient(160deg, #4c2d8f 0%, #2d1b69 60%, #1a0533 100%)' }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 min-h-11 min-w-11 p-1.5 rounded-xl opacity-70 active:opacity-100"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-label="Close Daily Blast"
          >
            <X size={16} className="text-white mx-auto" />
          </button>
        )}

        <motion.div
          className="flex items-center gap-2"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={22} style={{ color: '#f5c842' }} />
          <h1 className="text-2xl text-gold tracking-wide" style={{ fontFamily: "'Fredoka One', cursive" }}>
            DAILY BLAST
          </h1>
          <Zap size={22} style={{ color: '#f5c842' }} />
        </motion.div>

        <div className="flex items-center gap-2 text-white/50 text-xs">
          <span>Missions reset in</span>
          <EventTimer endsAt={midnight} compact />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4">
        {error && (
          <div className="rounded-2xl border border-red-bright/30 bg-red-bright/10 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        {missions.map((mission, i) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={i}
            isLocked={isLocked(i)}
            isRoyals={isRoyals}
            isClaimed={claimedMissionIds.includes(mission.id)}
            onClaim={claimMissionReward}
            onPlay={() => router.push('/game')}
          />
        ))}

        {missions.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            No missions found. Please log in to access Daily Blast.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-white/30 text-xs uppercase tracking-wider">Weekly Blast</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <div className="px-4">
        <WeeklyBlast
          tokensEarned={weeklyTokens}
          claimedMilestones={claimedMilestones}
          daysLeft={daysLeft}
          isRoyals={isRoyals}
          onClaimMilestone={claimMilestone}
        />
      </div>

      {!isRoyals && (
        <motion.div
          className="mx-4 rounded-2xl p-3.5 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(76,45,143,0.6), rgba(26,5,51,0.9))',
            border: '1px solid rgba(245,200,66,0.25)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span style={{ fontSize: 28 }}>👑</span>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Double your tokens with Royals</p>
            <p className="text-white/40 text-xs">Earn 2x tokens on every mission</p>
          </div>
          <button
            className="min-h-11 px-3 rounded-xl text-xs font-bold text-purple-deep gradient-gold shrink-0"
            onClick={() => router.push('/shop')}
          >
            Join
          </button>
        </motion.div>
      )}
    </div>
  );
}
