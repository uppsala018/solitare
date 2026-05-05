'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { DailyMission } from '@/types/database';

export type Milestone = 250 | 500 | 750 | 1000;

export interface WeeklyState {
  tokensThisWeek: number;
  claimedMilestones: number[];
  daysLeft: number;
}

/* ── mission pool ── */
const POOL = [
  { type: 'play_games',      desc: 'Play {n} games today',                         targets: [2, 3, 5],         rewards: [20, 30, 50]  },
  { type: 'score_practice',  desc: 'Score {n} points in practice mode',             targets: [500, 1000, 2000], rewards: [20, 30, 50]  },
  { type: 'foundation_cards',desc: 'Move {n} cards to foundation in one game',      targets: [26, 39, 52],      rewards: [30, 50, 100] },
  { type: 'complete_fast',   desc: 'Complete a game in under {n} minutes',          targets: [4, 3, 2],         rewards: [30, 50, 100] },
  { type: 'score_tourney',   desc: 'Score {n} or higher in a Cash Tourney',         targets: [500, 1000, 1500], rewards: [30, 50, 100] },
  { type: 'win_games',       desc: 'Win {n} game(s) today',                         targets: [1, 2, 3],         rewards: [50, 100, 150] },
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
  const day = new Date().getUTCDay(); // 0=Sun
  return day === 1 ? 7 : (8 - day) % 7 || 7;
}

function milestoneStorageKey(userId: string): string {
  return `sc-milestones-${userId}-${weekStartStr()}`;
}

function generateMissions(userId: string, date: string) {
  const seed = date.split('-').reduce((a, n) => a + parseInt(n), 0);
  const pool  = [...POOL];
  const rows   = [];
  for (let i = 0; i < 4; i++) {
    const idx      = (seed * (i + 1) * 13) % pool.length;
    const template = pool.splice(idx % pool.length, 1)[0];
    const di       = Math.min(i, template.targets.length - 1);
    rows.push({
      user_id:             userId,
      mission_type:        template.type,
      mission_description: template.desc.replace('{n}', String(template.targets[di])),
      target:              template.targets[di],
      progress:            0,
      reward_tokens:       template.rewards[di],
      completed:           false,
      reset_date:          date,
    });
  }
  return rows;
}

const db = supabase as unknown as Record<string, any>;

export function useDaily() {
  const { user, profile } = useAuth();

  const [missions,          setMissions]          = useState<DailyMission[]>([]);
  const [weeklyTokens,      setWeeklyTokens]      = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
  const [loading,           setLoading]           = useState(true);

  /* ── fetch / generate today's missions ── */
  const fetchMissions = useCallback(async () => {
    if (!user) return;
    const today = todayStr();

    const { data } = await db.from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('reset_date', today);

    if (data && data.length > 0) {
      setMissions(data as DailyMission[]);
      return;
    }

    const rows = generateMissions(user.id, today);
    const { data: inserted } = await db.from('daily_missions').insert(rows).select();
    if (inserted) setMissions(inserted as DailyMission[]);
  }, [user]);

  /* ── fetch weekly token total ── */
  const fetchWeekly = useCallback(async () => {
    if (!user) return;
    const ws = weekStartStr();

    const { data } = await db.from('daily_missions')
      .select('reward_tokens')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('reset_date', ws);

    const total = (data ?? []).reduce((a: number, m: { reward_tokens: number }) => a + m.reward_tokens, 0);
    setWeeklyTokens(total);

    const stored = typeof window !== 'undefined'
      ? localStorage.getItem(milestoneStorageKey(user.id))
      : null;
    setClaimedMilestones(stored ? (JSON.parse(stored) as number[]) : []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([fetchMissions(), fetchWeekly()]).finally(() => setLoading(false));
  }, [user, fetchMissions, fetchWeekly]);

  /* ── update progress ── */
  const updateMissionProgress = useCallback(async (missionId: string, increment: number) => {
    if (!user) return;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.completed) return;

    const newProgress = Math.min(mission.progress + increment, mission.target);
    const completed   = newProgress >= mission.target;

    await db.from('daily_missions')
      .update({ progress: newProgress, completed })
      .eq('id', missionId);

    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, progress: newProgress, completed } : m))
    );

    if (completed) await fetchWeekly();
  }, [user, missions, fetchWeekly]);

  const checkMissionComplete = useCallback(
    (missionId: string) => missions.find((m) => m.id === missionId)?.completed ?? false,
    [missions]
  );

  /* ── claim mission reward ── */
  const claimMissionReward = useCallback(async (missionId: string) => {
    if (!user || !profile) return;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission?.completed) return;

    const mult   = profile.royals_tier ? 2 : 1;
    const tokens = mission.reward_tokens * mult;

    await db.from('profiles')
      .update({ lightning_tokens: (profile.lightning_tokens ?? 0) + tokens })
      .eq('id', user.id);

    await fetchWeekly();
  }, [user, profile, missions, fetchWeekly]);

  /* ── claim weekly milestone ── */
  const claimMilestone = useCallback(async (milestone: number) => {
    if (!user || !profile || claimedMilestones.includes(milestone)) return;
    if (weeklyTokens < milestone) return;

    const rewards: Record<number, number> = { 250: 0.8, 500: 2.5, 750: 4.5, 1000: 8.0 };
    const cash = rewards[milestone] ?? 0;

    await db.from('profiles')
      .update({ cash_balance: (profile.cash_balance ?? 0) + cash })
      .eq('id', user.id);

    const next = [...claimedMilestones, milestone];
    localStorage.setItem(milestoneStorageKey(user.id), JSON.stringify(next));
    setClaimedMilestones(next);
  }, [user, profile, claimedMilestones, weeklyTokens]);

  return {
    missions,
    weeklyTokens,
    claimedMilestones,
    daysLeft: daysUntilMonday(),
    isRoyals: profile?.royals_tier ?? false,
    loading,
    fetchMissions,
    updateMissionProgress,
    checkMissionComplete,
    claimMissionReward,
    claimMilestone,
    fetchWeekly,
  };
}
