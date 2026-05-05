'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { playSound } from '@/lib/sounds';

export function useSound() {
  const { soundEnabled } = useGameStore();

  const play = useCallback(
    (name: Parameters<typeof playSound>[0], volume?: number) => {
      if (soundEnabled) playSound(name, volume);
    },
    [soundEnabled]
  );

  return { play };
}
