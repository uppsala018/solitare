'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export const STREAK_REWARDS = [30, 40, 60, 80, 100, 150, 200] as const;
export const STREAK_GEM_BONUS = 50; // day-7 gem bonus

const db = supabase as unknown as Record<string, any>;

function todayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

export function useDailyBonus() {
  const { user, profile } = useAuth();

  const [canClaim,       setCanClaim]       = useState(false);
  const [secondsLeft,    setSecondsLeft]    = useState(0);
  const [streakDay,      setStreakDay]       = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [justClaimed,    setJustClaimed]    = useState(false);
  const tickRef                             = useRef<ReturnType<typeof setInterval>>();

  const checkStatus = useCallback(async () => {
    if (!user) return;

    const { data } = await db.from('daily_bonus_claims')
      .select('claimed_at, streak_day')
      .eq('user_id', user.id)
      .order('claimed_at', { ascending: false })
      .limit(1);

    const last = data?.[0] ?? null;

    if (!last) {
      setCanClaim(true);
      setStreakDay(1);
      return;
    }

    const lastDate = last.claimed_at.split('T')[0];
    const today    = todayUTC();
    const yest     = yesterdayUTC();

    if (lastDate === today) {
      // Already claimed today
      setCanClaim(false);
      setStreakDay(last.streak_day);
      const secs = secondsUntilMidnightUTC();
      setSecondsLeft(secs);
    } else {
      // Can claim
      setCanClaim(true);
      const nextDay = lastDate === yest ? Math.min(last.streak_day + 1, 7) : 1;
      setStreakDay(nextDay);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    checkStatus().finally(() => setLoading(false));
  }, [user, checkStatus]);

  // Countdown tick
  useEffect(() => {
    if (canClaim || secondsLeft <= 0) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tickRef.current);
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [canClaim, secondsLeft]);

  const claimBonus = useCallback(async () => {
    if (!user || !canClaim || !profile) return 0;

    const reward = STREAK_REWARDS[Math.min(streakDay - 1, 6)];

    await db.from('daily_bonus_claims').insert({
      user_id:        user.id,
      claimed_at:     new Date().toISOString(),
      tokens_awarded: reward,
      streak_day:     streakDay,
    });

    const newTokens = (profile.lightning_tokens ?? 0) + reward;
    const updates: Record<string, number> = { lightning_tokens: newTokens };

    if (streakDay === 7) updates.gems = (profile.gems ?? 0) + STREAK_GEM_BONUS;

    await db.from('profiles').update(updates).eq('id', user.id);

    setCanClaim(false);
    setJustClaimed(true);
    setSecondsLeft(secondsUntilMidnightUTC());
    setTimeout(() => setJustClaimed(false), 3000);

    return reward;
  }, [user, profile, canClaim, streakDay]);

  const formattedCountdown = (() => {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();

  return {
    canClaim, streakDay, loading, justClaimed,
    secondsLeft, formattedCountdown,
    claimBonus,
    currentReward: STREAK_REWARDS[Math.min(streakDay - 1, 6)],
  };
}
