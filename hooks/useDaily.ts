'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { DailyMission } from '@/types/database';

export type Milestone = 250 | 500 | 750 | 1000;

const POOL = [
  { type: 'play_games', desc: 'Play {n} games today', targets: [2, 3, 5], rewards: [20, 30, 50] },
  { type: 'score_practice', desc: 'Score {n} points in practice mode', targets: [500, 1000, 2000], rewards: [20, 30, 50] },
  { type: 'foundation_cards', desc: 'Move {n} cards to foundation in one game', targets: [26, 39, 52], rewards: [30, 50, 100] },
  { type: 'complete_fast', desc: 'Complete a game in under {n} minutes', targets: [4, 3, 2], rewards: [30, 50, 100] },
  { type: 'score_tourney', desc: 'Score {n} or higher in a Cash Tourney', targets: [500, 1000, 1500], rewards: [30, 50, 100] },
  { type: 'win_games', desc: 'Win {n} game(s) today', targets: [1, 2, 3], rewards: [50, 100, 150] },
];

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function weekStartStr(): string {
  const d = new Date();
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function daysUntilMonday(): number {
  const day = new Date().getUTCDay();
  return day === 1 ? 7 : (8 - day) % 7 || 7;
}

function milestoneStorageKey(userId: string): string {
  return `sc-milestones-${userId}-${weekStartStr()}`;
}

function claimedMissionStorageKey(userId: string): string {
  return `sc-claimed-missions-${userId}-${todayStr()}`;
}

function readClaimedMissionIds(userId?: string) {
  if (!userId || typeof window === 'undefined') return [];
  const raw = localStorage.getItem(claimedMissionStorageKey(userId));
  return raw ? (JSON.parse(raw) as string[]) : [];
}

function writeClaimedMissionIds(userId: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(claimedMissionStorageKey(userId), JSON.stringify(ids));
}

function generateMissions(userId: string, date: string): DailyMission[] {
  const seed = date.split('-').reduce((a, n) => a + parseInt(n, 10), 0);
  const pool = [...POOL];

  return Array.from({ length: 4 }, (_, i) => {
    const idx = (seed * (i + 1) * 13) % pool.length;
    const template = pool.splice(idx % pool.length, 1)[0];
    const di = Math.min(i, template.targets.length - 1);
    return {
      id: `local-${date}-${i}`,
      user_id: userId,
      mission_type: template.type,
      mission_description: template.desc.replace('{n}', String(template.targets[di])),
      target: template.targets[di],
      progress: 0,
      reward_tokens: template.rewards[di],
      completed: false,
      reset_date: date,
    } as DailyMission;
  });
}

const db = supabase as unknown as Record<string, any>;

export function useDaily() {
  const { user, profile } = useAuth();

  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [weeklyTokens, setWeeklyTokens] = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedMissionIds, setClaimedMissionIds] = useState<string[]>([]);

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setMissions([]);
      return;
    }

    const today = todayStr();
    const localFallback = generateMissions(user.id, today);

    const { data, error: selectError } = await db
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('reset_date', today);

    if (selectError) {
      console.error('Failed to fetch daily missions', selectError);
      setError('Could not load missions from Supabase. Showing offline missions.');
      setMissions(localFallback);
      return;
    }

    if (data && data.length > 0) {
      setMissions(data as DailyMission[]);
      return;
    }

    const rows = generateMissions(user.id, today).map(({ id: _id, ...row }) => row);
    const { data: inserted, error: insertError } = await db.from('daily_missions').insert(rows).select();

    if (insertError) {
      console.error('Failed to create daily missions', insertError);
      setError('Could not create missions in Supabase. Showing offline missions.');
      setMissions(localFallback);
      return;
    }

    setMissions((inserted ?? localFallback) as DailyMission[]);
  }, [user]);

  const fetchWeekly = useCallback(async () => {
    if (!user) {
      setWeeklyTokens(0);
      setClaimedMilestones([]);
      return;
    }

    const { data, error: weeklyError } = await db
      .from('daily_missions')
      .select('reward_tokens')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('reset_date', weekStartStr());

    if (weeklyError) {
      console.error('Failed to fetch weekly tokens', weeklyError);
      setWeeklyTokens(0);
    } else {
      setWeeklyTokens((data ?? []).reduce((a: number, m: { reward_tokens: number }) => a + m.reward_tokens, 0));
    }

    const stored = typeof window !== 'undefined' ? localStorage.getItem(milestoneStorageKey(user.id)) : null;
    setClaimedMilestones(stored ? (JSON.parse(stored) as number[]) : []);
    setClaimedMissionIds(readClaimedMissionIds(user.id));
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchMissions(), fetchWeekly()]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fetchMissions, fetchWeekly]);

  const updateMissionProgress = useCallback(async (missionId: string, increment: number) => {
    if (!user) return;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.completed) return;

    const newProgress = Math.min(mission.progress + increment, mission.target);
    const completed = newProgress >= mission.target;

    if (!mission.id.startsWith('local-')) {
      const { error: updateError } = await db
        .from('daily_missions')
        .update({ progress: newProgress, completed })
        .eq('id', missionId);
      if (updateError) console.error('Failed to update mission progress', updateError);
    }

    setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, progress: newProgress, completed } : m)));
    if (completed) await fetchWeekly();
  }, [user, missions, fetchWeekly]);

  const claimMissionReward = useCallback(async (missionId: string) => {
    if (!user || !profile || claimedMissionIds.includes(missionId)) return;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission?.completed) return;

    const mult = profile.royals_tier ? 2 : 1;
    const tokens = mission.reward_tokens * mult;

    const { error: profileError } = await db
      .from('profiles')
      .update({ lightning_tokens: (profile.lightning_tokens ?? 0) + tokens })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to claim mission reward', profileError);
      return;
    }

    const next = [...claimedMissionIds, missionId];
    setClaimedMissionIds(next);
    writeClaimedMissionIds(user.id, next);
    await fetchWeekly();
  }, [user, profile, missions, fetchWeekly, claimedMissionIds]);

  const claimMilestone = useCallback(async (milestone: number) => {
    if (!user || !profile || claimedMilestones.includes(milestone) || weeklyTokens < milestone) return;

    const rewards: Record<number, number> = { 250: 0.8, 500: 2.5, 750: 4.5, 1000: 8.0 };
    const cash = rewards[milestone] ?? 0;
    const { error: profileError } = await db
      .from('profiles')
      .update({ cash_balance: (profile.cash_balance ?? 0) + cash })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to claim weekly milestone', profileError);
      return;
    }

    const next = [...claimedMilestones, milestone];
    localStorage.setItem(milestoneStorageKey(user.id), JSON.stringify(next));
    setClaimedMilestones(next);
  }, [user, profile, claimedMilestones, weeklyTokens]);

  return {
    missions,
    weeklyTokens,
    claimedMilestones,
    claimedMissionIds,
    daysLeft: daysUntilMonday(),
    isRoyals: profile?.royals_tier ?? false,
    loading,
    error,
    fetchMissions,
    updateMissionProgress,
    checkMissionComplete: (missionId: string) => missions.find((m) => m.id === missionId)?.completed ?? false,
    claimMissionReward,
    claimMilestone,
    fetchWeekly,
  };
}
