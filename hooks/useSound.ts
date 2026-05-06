'use client';

import { useCallback } from 'react';
import { soundEngine } from '@/lib/sounds';
import { useGameStore } from '@/store/gameStore';

function syncMute(soundEnabled: boolean) {
  soundEngine.setMuted(!soundEnabled);
}

export function useSound() {
  const { soundEnabled } = useGameStore();

  const playFlip = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.cardFlip();
  }, [soundEnabled]);

  const playPlace = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.cardPlace();
  }, [soundEnabled]);

  const playFoundation = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.foundationComplete();
  }, [soundEnabled]);

  const playWin = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.gameWin();
  }, [soundEnabled]);

  const playInvalid = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.invalidMove();
  }, [soundEnabled]);

  const playTick = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.countdown();
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    syncMute(soundEnabled);
    soundEngine.buttonClick();
  }, [soundEnabled]);

  return { playFlip, playPlace, playFoundation, playWin, playInvalid, playTick, playClick };
}
