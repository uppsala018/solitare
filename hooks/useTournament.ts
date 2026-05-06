'use client';

import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Tournament } from '@/types/database';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  rank: number;
  prize_won: number;
}

export interface TournamentHistoryRow {
  id: string;
  tournament_id: string;
  score: number;
  rank: number | null;
  prize_won: number;
  entered_at: string;
  tournament: { name: string; prize_pool: number; entry_fee: number; ends_at: string } | null;
}

const db = supabase as unknown as Record<string, any>;

export function useTournament() {
  const { user, profile } = useAuth();

  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const fetchActiveTournaments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db
      .from('tournaments')
      .select('*')
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString())
      .order('prize_pool', { ascending: false });

    if (error) console.error('Failed to fetch active tournaments', error);
    setActiveTournaments((data ?? []) as Tournament[]);
    setLoading(false);
  }, []);

  const enterTournament = useCallback(
    async (tournamentId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !profile) return { success: false, error: 'Sign in required' };

      const { data, error } = await db.rpc('enter_tournament_atomic', {
        p_tournament_id: tournamentId,
      });

      if (error) {
        console.error('Failed to enter tournament', error);
        return { success: false, error: error.message };
      }

      return (data ?? { success: false, error: 'Tournament entry failed' }) as {
        success: boolean;
        error?: string;
      };
    },
    [user, profile]
  );

  const submitScore = useCallback(
    async (tournamentId: string, score: number, _moves?: number, _timeRemaining?: number) => {
      if (!user) return;

      const { error } = await db.rpc('submit_tournament_score', {
        p_tournament_id: tournamentId,
        p_score: score,
      });

      if (error) console.error('Failed to submit tournament score', error);
    },
    [user]
  );

  const subscribeToLeaderboard = useCallback((tournamentId: string) => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function fetchLB() {
      const { data, error } = await db.rpc('get_tournament_leaderboard', {
        p_tournament_id: tournamentId,
      });

      if (error) {
        console.error('Failed to fetch tournament leaderboard', error);
        return;
      }

      setLeaderboard(
        (data ?? []).map((entry: any, index: number) => ({
          user_id: String(entry.user_id),
          username: entry.username ?? 'Player',
          score: Number(entry.score ?? 0),
          rank: Number(entry.rank ?? index + 1),
          prize_won: Number(entry.prize_won ?? 0),
        }))
      );
    }

    function debouncedFetchLB() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fetchLB, 500);
    }

    fetchLB();

    channelRef.current = (supabase as any)
      .channel(`lb-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_entries', filter: `tournament_id=eq.${tournamentId}` },
        debouncedFetchLB
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      if (channelRef.current) (supabase as any).removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, []);

  const fetchUserHistory = useCallback(async (): Promise<TournamentHistoryRow[]> => {
    if (!user) return [];

    const { data, error } = await db
      .from('tournament_entries')
      .select('*, tournaments!tournament_id(name, prize_pool, entry_fee, ends_at)')
      .eq('user_id', user.id)
      .order('entered_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch tournament history', error);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      ...row,
      prize_won: Number(row.prize_won ?? 0),
      tournament: row.tournaments ?? null,
    }));
  }, [user]);

  return {
    activeTournaments,
    leaderboard,
    loading,
    fetchActiveTournaments,
    enterTournament,
    submitScore,
    subscribeToLeaderboard,
    fetchUserHistory,
  };
}
