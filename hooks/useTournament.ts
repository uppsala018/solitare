'use client';

import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Tournament } from '@/types/database';

export interface LeaderboardEntry {
  user_id:   string;
  username:  string;
  score:     number;
  rank:      number;
  prize_won: number;
}

export interface TournamentHistoryRow {
  id:           string;
  tournament_id: string;
  score:        number;
  rank:         number | null;
  prize_won:    number;
  entered_at:   string;
  tournament:   { name: string; prize_pool: number; entry_fee: number; ends_at: string } | null;
}

const db = supabase as unknown as Record<string, any>;

export function useTournament() {
  const { user, profile } = useAuth();

  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [leaderboard,       setLeaderboard]       = useState<LeaderboardEntry[]>([]);
  const [loading,           setLoading]           = useState(false);
  const channelRef = useRef<any>(null);

  /* ── fetch active tournaments ── */
  const fetchActiveTournaments = useCallback(async () => {
    setLoading(true);
    const { data } = await db.from('tournaments')
      .select('*')
      .eq('is_active', true)
      .order('prize_pool', { ascending: false });
    setActiveTournaments((data ?? []) as Tournament[]);
    setLoading(false);
  }, []);

  /* ── enter tournament ── */
  const enterTournament = useCallback(
    async (tournamentId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !profile) return { success: false, error: 'Sign in required' };

      const { data: tourney } = await db.from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (!tourney) return { success: false, error: 'Tournament not found' };

      const balance = profile.cash_balance ?? 0;
      if (balance < tourney.entry_fee) {
        return { success: false, error: `Need $${tourney.entry_fee.toFixed(2)} — you have $${balance.toFixed(2)}` };
      }
      if (tourney.current_players >= tourney.max_players) {
        return { success: false, error: 'Tournament is full' };
      }

      const { data: existing } = await db.from('tournament_entries')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      if (existing) return { success: false, error: 'You already entered this tournament' };

      await Promise.all([
        db.from('profiles')
          .update({ cash_balance: balance - tourney.entry_fee })
          .eq('id', user.id),
        db.from('tournament_entries')
          .insert({ tournament_id: tournamentId, user_id: user.id, score: 0 }),
        db.from('tournaments')
          .update({ current_players: tourney.current_players + 1 })
          .eq('id', tournamentId),
      ]);

      return { success: true };
    },
    [user, profile]
  );

  /* ── submit score ── */
  const submitScore = useCallback(
    async (tournamentId: string, score: number, moves: number, timeRemaining: number) => {
      if (!user) return;
      await db.from('tournament_entries')
        .update({ score, rank: null })
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);
    },
    [user]
  );

  /* ── realtime leaderboard ── */
  const subscribeToLeaderboard = useCallback((tournamentId: string) => {
    async function fetchLB() {
      const { data } = await db.from('tournament_entries')
        .select('user_id, score, prize_won, profiles(username)')
        .eq('tournament_id', tournamentId)
        .order('score', { ascending: false });

      setLeaderboard(
        (data ?? []).map((e: any, i: number) => ({
          user_id:   e.user_id,
          username:  e.profiles?.username ?? 'Player',
          score:     e.score,
          rank:      i + 1,
          prize_won: e.prize_won ?? 0,
        }))
      );
    }

    fetchLB();

    channelRef.current = (supabase as any)
      .channel(`lb-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_entries', filter: `tournament_id=eq.${tournamentId}` },
        fetchLB
      )
      .subscribe();

    return () => {
      if (channelRef.current) (supabase as any).removeChannel(channelRef.current);
    };
  }, []);

  /* ── user tournament history ── */
  const fetchUserHistory = useCallback(async (): Promise<TournamentHistoryRow[]> => {
    if (!user) return [];
    const { data } = await db.from('tournament_entries')
      .select('*, tournaments!tournament_id(name, prize_pool, entry_fee, ends_at)')
      .eq('user_id', user.id)
      .order('entered_at', { ascending: false })
      .limit(20);
    return (data ?? []).map((row: any) => ({
      ...row,
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
