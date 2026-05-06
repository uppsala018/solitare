'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Zap, Gem, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTournament, type TournamentHistoryRow } from '@/hooks/useTournament';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/auth/RequireAuth';

const db = supabase as unknown as Record<string, any>;

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const BADGES = [
  { id: 'first_win',    emoji: '🏆', label: 'First Win',      desc: 'Won your first tournament',      check: (s: any) => s.wins >= 1 },
  { id: 'high_roller',  emoji: '💰', label: 'High Roller',    desc: 'Entered a $25+ tournament',      check: (s: any) => s.maxEntry >= 25 },
  { id: 'centurion',    emoji: '💯', label: 'Centurion',      desc: 'Scored 1000+ points',             check: (s: any) => s.bestScore >= 1000 },
  { id: 'royals_club',  emoji: '👑', label: 'Royals Club',    desc: 'Active Royals member',            check: (s: any) => s.isRoyals },
  { id: 'collector',    emoji: '🃏', label: 'Collector',      desc: 'Completed 1 card set',            check: (s: any) => s.completedSets >= 1 },
  { id: 'lightning',    emoji: '⚡', label: 'Token Earner',   desc: 'Earned 500 tokens',               check: (s: any) => s.tokens >= 500 },
];

function xpForLevel(lvl: number) { return lvl * lvl * 300; }

export default function ProfilePage() {
  const router               = useRouter();
  const { profile }          = useAuth();
  const { fetchUserHistory } = useTournament();

  const [history,   setHistory]   = useState<TournamentHistoryRow[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const [hist, scoreRes] = await Promise.all([
        fetchUserHistory(),
        db.from('game_sessions').select('score').order('score', { ascending: false }).limit(1).single(),
      ]);
      setHistory(hist);
      setBestScore(scoreRes.data?.score ?? 0);
      setLoading(false);
    }
    load();
  }, [fetchUserHistory]);

  const stats = useMemo(() => {
    const wins      = history.filter((h) => h.rank === 1).length;
    const total     = history.length;
    const earnings  = history.reduce((a, h) => a + (h.prize_won ?? 0), 0);
    const maxEntry  = Math.max(0, ...history.map((h) => h.tournament?.entry_fee ?? 0));
    return {
      wins, total, earnings, maxEntry, bestScore,
      winRate:      total > 0 ? Math.round((wins / total) * 100) : 0,
      isRoyals:     profile?.royals_tier ?? false,
      tokens:       profile?.lightning_tokens ?? 0,
      completedSets: 0, // would come from card_collections
    };
  }, [history, bestScore, profile]);

  const level    = profile?.level ?? 1;
  const xp       = profile?.xp ?? 0;
  const xpNeeded = xpForLevel(level);
  const xpPct    = Math.min((xp / xpNeeded) * 100, 100);

  const earnedBadges = BADGES.filter((b) => b.check(stats));

  if (loading) {
    return (
      <div className="min-h-screen gradient-purple flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Star size={28} style={{ color: '#f5c842' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <RequireAuth>
    <div className="min-h-screen gradient-purple flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div
        className="px-4 py-4 flex flex-col gap-4"
        style={{ background: 'linear-gradient(160deg, rgba(76,45,143,0.9), rgba(26,5,51,0.95))' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl opacity-70" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-xl text-gold font-black" style={{ fontFamily: "'Fredoka One', cursive" }}>My Profile</h1>
        </div>

        {/* Avatar + name + level */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
            style={{ background: 'linear-gradient(135deg, #4c2d8f, #2d1b69)', border: '2px solid rgba(245,200,66,0.4)' }}
          >
            {profile?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">{profile?.username ?? 'Player'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,200,66,0.2)', color: '#f5c842' }}>
                Lv.{level}
              </span>
              {profile?.royals_tier && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                  👑 Royals
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>XP {xp.toLocaleString()}</span>
                <span>{xpNeeded.toLocaleString()} to Lv.{level + 1}</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#f5c842,#00d4aa)' }}
                  initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Balance row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <TrendingUp size={14} />, label: 'Cash', value: `$${(profile?.cash_balance ?? 0).toFixed(2)}`, color: '#39ff14' },
            { icon: <Gem size={14} />,        label: 'Gems', value: (profile?.gems ?? 0).toLocaleString(),          color: '#a78bfa' },
            { icon: <Zap size={14} />,        label: 'Tokens', value: stats.tokens.toLocaleString(),                color: '#f5c842' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center py-2 rounded-xl gap-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span style={{ color }}>{icon}</span>
              <span className="text-white font-bold text-sm tabular-nums">{value}</span>
              <span className="text-white/40 text-[10px]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 pb-8">
        {/* Stats */}
        <section>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Tournament Stats</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Total Played', value: stats.total,                    emoji: '🎮' },
              { label: 'Wins',         value: stats.wins,                     emoji: '🏆' },
              { label: 'Win Rate',     value: `${stats.winRate}%`,            emoji: '📈' },
              { label: 'Total Earned', value: `$${stats.earnings.toFixed(2)}`,emoji: '💰' },
              { label: 'Best Score',   value: bestScore.toLocaleString(),     emoji: '⭐' },
              { label: 'Best Entry',   value: `$${stats.maxEntry.toFixed(2)}`,emoji: '💎' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 20 }}>{emoji}</span>
                <div>
                  <p className="text-white/45 text-[10px]">{label}</p>
                  <p className="text-white font-bold text-sm tabular-nums">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Badges */}
        <section>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Badges ({earnedBadges.length}/{BADGES.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {BADGES.map((badge) => {
              const earned = badge.check(stats);
              return (
                <motion.div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl"
                  style={{
                    background: earned ? 'rgba(245,200,66,0.12)' : 'rgba(255,255,255,0.04)',
                    border: earned ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    opacity: earned ? 1 : 0.45,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: earned ? 1 : 0.45, scale: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <span style={{ fontSize: 26 }}>{badge.emoji}</span>
                  <p className="text-white text-[10px] font-semibold text-center leading-tight px-1">{badge.label}</p>
                  <p className="text-white/35 text-[8px] text-center leading-tight px-1">{badge.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Tournament history */}
        <section>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Recent Tournaments</p>
          {history.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">No tournaments yet — enter one from the lobby!</div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span style={{ fontSize: 20 }}>{row.rank && row.rank <= 3 ? RANK_MEDAL[row.rank] : row.rank ? `#${row.rank}` : '–'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{row.tournament?.name ?? 'Tournament'}</p>
                    <p className="text-white/40 text-xs">{row.score.toLocaleString()} pts · {new Date(row.entered_at).toLocaleDateString()}</p>
                  </div>
                  {row.prize_won > 0 && (
                    <span className="font-bold text-sm" style={{ color: '#39ff14' }}>
                      +${row.prize_won.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
    </RequireAuth>
  );
}
