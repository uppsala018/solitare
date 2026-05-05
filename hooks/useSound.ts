'use client';

import { useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

function makeCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const W = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = window.AudioContext || W.webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

function tone(
  ctx: AudioContext,
  freq: number,
  dur: number,
  vol = 0.25,
  type: OscillatorType = 'sine',
  delay = 0
) {
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    const t = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch (_) { /* ignore if audio ctx is closed */ }
}

export function useSound() {
  const { soundEnabled } = useGameStore();
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (!ctxRef.current) ctxRef.current = makeCtx();
    return ctxRef.current;
  }, []);

  const playFlip = useCallback(() => {
    if (!soundEnabled) return;
    const c = getCtx(); if (!c) return;
    tone(c, 900, 0.05, 0.15, 'triangle');
    tone(c, 450, 0.05, 0.10, 'triangle', 0.05);
  }, [soundEnabled, getCtx]);

  const playPlace = useCallback(() => {
    if (!soundEnabled) return;
    const c = getCtx(); if (!c) return;
    tone(c, 260, 0.12, 0.35, 'triangle');
    tone(c, 130, 0.08, 0.20, 'sine', 0.06);
  }, [soundEnabled, getCtx]);

  const playFoundation = useCallback(() => {
    if (!soundEnabled) return;
    const c = getCtx(); if (!c) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(c, f, 0.2, 0.3, 'sine', i * 0.1));
  }, [soundEnabled, getCtx]);

  const playWin = useCallback(() => {
    if (!soundEnabled) return;
    const c = getCtx(); if (!c) return;
    [523, 659, 784, 659, 784, 1047, 1047].forEach((f, i) =>
      tone(c, f, 0.28, 0.35, 'sine', i * 0.13)
    );
  }, [soundEnabled, getCtx]);

  const playInvalid = useCallback(() => {
    if (!soundEnabled) return;
    const c = getCtx(); if (!c) return;
    tone(c, 140, 0.18, 0.22, 'sawtooth');
  }, [soundEnabled, getCtx]);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    const c = getCtx(); if (!c) return;
    tone(c, 800, 0.04, 0.08, 'sine');
  }, [soundEnabled, getCtx]);

  return { playFlip, playPlace, playFoundation, playWin, playInvalid, playTick };
}
