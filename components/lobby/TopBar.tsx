'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/ui/NotificationBell';

export default function TopBar() {
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Guest';

  return (
    <header
      className="w-full flex items-center justify-between px-4 py-3 safe-top gap-2"
      style={{ background: 'linear-gradient(180deg, #1a0533 0%, transparent 100%)' }}
    >
      <h1 className="text-2xl text-gold glow-gold shrink-0" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Solitaire Crown
      </h1>

      <div className="flex items-center gap-2 min-w-0">
        {user ? (
          <motion.div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full min-w-0 max-w-40"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <UserRound size={13} className="text-gold shrink-0" />
            <span className="text-white font-bold text-xs truncate">{displayName}</span>
          </motion.div>
        ) : (
          <Link
            href="/auth"
            className="min-h-11 px-3 rounded-full flex items-center text-xs font-bold text-purple-deep gradient-gold"
          >
            Sign in
          </Link>
        )}

        <motion.div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
        >
          <span className="text-sm" aria-hidden>💎</span>
          <span className="text-purple-300 font-bold text-xs tabular-nums">{(profile?.gems ?? 0).toLocaleString()}</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.4)' }}
        >
          <span className="text-sm" aria-hidden>🪙</span>
          <span className="text-gold font-bold text-xs tabular-nums">${(profile?.cash_balance ?? 0).toFixed(2)}</span>
        </motion.div>

        {user && (
          <button
            className="min-h-11 min-w-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            onClick={signOut}
            aria-label="Sign out"
            title={`Signed in as ${displayName}. Click to sign out.`}
          >
            <LogOut size={15} className="text-white/70" />
          </button>
        )}

        <NotificationBell />
      </div>
    </header>
  );
}
