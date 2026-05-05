'use client';

import { motion } from 'framer-motion';
import { STREAK_REWARDS } from '@/hooks/useDailyBonus';

interface StreakIndicatorProps {
  currentDay: number; // 1-7
}

export default function StreakIndicator({ currentDay }: StreakIndicatorProps) {
  return (
    <div className="flex items-end justify-between w-full gap-1">
      {STREAK_REWARDS.map((reward, i) => {
        const day        = i + 1;
        const isComplete = day < currentDay;
        const isCurrent  = day === currentDay;

        return (
          <div key={day} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              className="w-full rounded-lg flex items-center justify-center font-bold relative"
              style={{
                height: 30 + i * 3,
                background: isComplete
                  ? 'linear-gradient(135deg,#c49a1a,#f5c842)'
                  : isCurrent
                  ? 'rgba(245,200,66,0.25)'
                  : 'rgba(255,255,255,0.07)',
                border: isCurrent ? '1.5px solid #f5c842' : '1.5px solid transparent',
                color: isComplete ? '#1a0533' : isCurrent ? '#f5c842' : 'rgba(255,255,255,0.4)',
                fontSize: 11,
              }}
              animate={isCurrent ? {
                boxShadow: ['0 0 0px #f5c842', '0 0 10px rgba(245,200,66,0.6)', '0 0 0px #f5c842'],
              } : {}}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              {isComplete ? '✓' : day}
            </motion.div>
            <span className="text-[8px] tabular-nums" style={{ color: isCurrent ? '#f5c842' : 'rgba(255,255,255,0.3)' }}>
              {reward}⚡
            </span>
          </div>
        );
      })}
    </div>
  );
}
