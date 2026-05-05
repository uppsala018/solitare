'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';

const DAILY_REWARDS = [
  { day: 1, reward: '100 Coins',  emoji: '🪙', claimed: true  },
  { day: 2, reward: '250 Coins',  emoji: '🪙', claimed: true  },
  { day: 3, reward: '1 Pack',     emoji: '🃏', claimed: false },
  { day: 4, reward: '500 Coins',  emoji: '🪙', claimed: false },
  { day: 5, reward: '2 Packs',    emoji: '🃏', claimed: false },
  { day: 6, reward: '1000 Coins', emoji: '💰', claimed: false },
  { day: 7, reward: 'Crown Pack', emoji: '👑', claimed: false },
];

export default function GiftsPage() {
  const { addCoins } = useGameStore();
  const [claimed, setClaimed] = useState<number[]>([1, 2]);

  function claim(day: number) {
    if (claimed.includes(day)) return;
    setClaimed([...claimed, day]);
    addCoins(100 * day);
  }

  return (
    <div className="min-h-screen gradient-purple px-4 py-8 safe-top safe-bottom">
      <motion.h1
        className="text-4xl text-gold text-center mb-8"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Daily Gifts
      </motion.h1>

      <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 sm:grid-cols-4">
        {DAILY_REWARDS.map((item, i) => {
          const isClaimed = claimed.includes(item.day);
          const isToday = item.day === Math.min(...DAILY_REWARDS.filter(r => !claimed.includes(r.day)).map(r => r.day));
          return (
            <motion.div
              key={item.day}
              className="flex flex-col items-center gap-2 rounded-2xl p-3"
              style={{
                background: isClaimed ? 'rgba(0,212,170,0.1)' : isToday ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isClaimed ? 'rgba(0,212,170,0.4)' : isToday ? 'rgba(245,200,66,0.5)' : 'rgba(255,255,255,0.1)'}`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
            >
              <span className="text-xs text-white/50">Day {item.day}</span>
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-xs text-white/70 text-center leading-tight">{item.reward}</span>
              {isClaimed ? (
                <span className="text-teal text-xs">✓ Claimed</span>
              ) : (
                <Button size="sm" variant={isToday ? 'gold' : 'ghost'} onClick={() => claim(item.day)}>
                  {isToday ? 'Claim' : 'Locked'}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
