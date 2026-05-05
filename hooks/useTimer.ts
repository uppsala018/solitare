'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TOTAL = 300; // 5:00

export function useTimer(onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start  = useCallback(() => setRunning(true), []);
  const pause  = useCallback(() => setRunning(false), []);
  const reset  = useCallback(() => { setRunning(false); setTimeLeft(TOTAL); }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return {
    timeLeft,
    running,
    formatted: `${mm}:${ss}`,
    bonus: timeLeft * 2,
    start,
    pause,
    reset,
  };
}
