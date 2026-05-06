'use client';

import { useEffect } from 'react';
import { soundEngine } from '@/lib/sounds';
import { useGameStore } from '@/store/gameStore';

const THEME_VALUES = {
  classic: ['#1a0533', '#2d1b69', '#4c2d8f'],
  midnight: ['#050711', '#111827', '#253044'],
  ocean: ['#03192f', '#064e7a', '#0891b2'],
  forest: ['#061b12', '#14532d', '#16a34a'],
} as const;

export default function AppEffects() {
  const { soundEnabled, musicEnabled, theme } = useGameStore();

  useEffect(() => {
    soundEngine.setMuted(!soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const values = THEME_VALUES[theme] ?? THEME_VALUES.classic;
    document.documentElement.style.setProperty('--purple-deep', values[0]);
    document.documentElement.style.setProperty('--purple-mid', values[1]);
    document.documentElement.style.setProperty('--purple-light', values[2]);
  }, [theme]);

  useEffect(() => {
    if (!musicEnabled) soundEngine.stopAmbient();
  }, [musicEnabled]);

  return null;
}
