'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useTournament } from '@/hooks/useTournament';
import { useToast } from '@/components/ui/Toast';
import Leaderboard from '@/components/lobby/Leaderboard';
import EventTimer from '@/components/ui/EventTimer';
import TournamentEntryModal from '@/components/lobby/TournamentEntryModal';
import type { Tournament } from '@/types/database';

const db = supabase as unknown as Record<string, any>;

export default function TournamentPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;

  const { user, profile }    = useAuth();
  const { enterTournament, leaderboard, subscribeToLeaderboard } = useTournament();
  const { showToast }        = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [showEntry,  setShowEntry]  = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await db.from('tournaments').select('*').eq('id', id).single();
      setTournament(data ?? null);
      setLoading(false);
    }
    load();
    const unsub = subscribeToLeaderboard(id);
    return unsub;
  }, [id, subscribeToLeaderboard]);

  useEffect(() => {
    if (!user || !id) return;
    async function checkEntry() {
      const { data } = await db.from('tournament_entries')
        .select('id').eq('tournament_id', id).eq('user_id', user!.id).single();
      setHasEntered(!!data);
    }
    checkEntry();
  }, [user, id]);

  async function handleEnter(tournamentId: string) {
    const result = await enterTournament(tournamentId);
    if (result.success) {
      setHasEntered(true);
      setShowEntry(false);
      showToast({ type: 'tournament', title: 'Entered!', message: 'Good luck! Play your best game.', emoji: '🏆' });
    }
    return result;
  }

  function handlePlay() {
    router.push(`/game?tournamentId=${id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-purple flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Trophy size={28} style={{ color: '#f5c842' }} />
        </motion.div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen gradient-purple flex flex-col items-center justify-center gap-4">
        <p className="text-white/50">Tournament not found</p>
        <button onClick={() => router.back()} className="text-gold text-sm">← Back</button>
      </div>
    );
  }

  const isFull    = tournament.current_players >= tournament.max_players;
  const spotsLeft = tournament.max_players - tournament.current_players;

  return (
    <div className="min-h-screen gradient-purple flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div
        className="relative px-4 py-4 flex flex-col gap-3"
        style={{ background: 'linear-gradient(160deg, rgba(76,45,143,0.9), rgba(26,5,51,0.95))' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl opacity-70" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-white/50 text-xs">{tournament.theme}</p>
            <h1 className="text-xl text-gold font-black" style={{ fontFamily: "'Fredoka One', cursive" }}>
              {tournament.name}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-white/40 text-[10px]">PRIZE POOL</p>
            <p className="text-gold font-black text-xl">${tournament.prize_pool.toFixed(2)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Entry', value: `$${tournament.entry_fee.toFixed(2)}` },
            { label: 'Players', value: `${tournament.current_players}/${tournament.max_players}` },
            { label: 'Multiplier', value: `x${tournament.multiplier}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="text-white/40 text-[10px]">{label}</span>
              <span className="text-white font-bold text-sm">{value}</span>
            </div>
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-white/40 text-xs">Tournament ends in</span>
          <EventTimer endsAt={tournament.ends_at} compact />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm font-semibold">Live Leaderboard</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs">Live</span>
          </div>
        </div>
        <Leaderboard
          entries={leaderboard}
          currentUserId={user?.id}
          prizePool={tournament.prize_pool}
        />
        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No scores yet — be first!</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 inset-x-0 px-4 py-3 safe-bottom flex gap-3"
        style={{ background: 'rgba(13,8,32,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {hasEntered ? (
          <motion.button
            className="flex-1 py-3.5 rounded-2xl font-black text-base gradient-gold text-purple-deep"
            whileTap={{ scale: 0.96 }}
            onClick={handlePlay}
          >
            🎮 Play Again
          </motion.button>
        ) : isFull ? (
          <div className="flex-1 py-3.5 rounded-2xl font-bold text-center text-white/40 border border-white/20">
            👁 WATCH MODE
          </div>
        ) : (
          <motion.button
            className="flex-1 py-3.5 rounded-2xl font-black text-base"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowEntry(true)}
          >
            JOIN NOW — ${tournament.entry_fee.toFixed(2)} · {spotsLeft} left
          </motion.button>
        )}
      </div>

      <TournamentEntryModal
        tournament={showEntry ? tournament : null}
        userBalance={profile?.cash_balance ?? 0}
        onClose={() => setShowEntry(false)}
        onConfirm={handleEnter}
      />
    </div>
  );
}
