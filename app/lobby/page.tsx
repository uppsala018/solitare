'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import TopBar from '@/components/lobby/TopBar';
import TournamentCard from '@/components/lobby/TournamentCard';
import DailyBlastContent from '@/components/lobby/DailyBlastContent';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';

const TOURNAMENTS = [
  { title: 'Daily Classic',   prize: '5,000 Coins',  timeLeft: '2h 14m', players: 1284 },
  { title: 'Speed Challenge', prize: '10,000 Coins', timeLeft: '45m',    players: 876  },
  { title: 'Weekly Grand Prix',prize: '50,000 Coins',timeLeft: '3d 6h',  players: 4521 },
];

export default function LobbyPage() {
  const { newGame }       = useGameStore();
  const router            = useRouter();
  const [showBlast, setShowBlast] = useState(false);

  function handlePlay() {
    newGame();
    router.push('/game');
  }

  return (
    <div className="min-h-screen flex flex-col gradient-purple">
      <TopBar />

      <main className="flex-1 flex flex-col gap-5 px-4 py-5 max-w-lg mx-auto w-full pb-8">
        {/* Hero */}
        <motion.div
          className="flex flex-col items-center gap-4 py-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl text-gold glow-gold text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Ready to Play?
          </h2>
          <Button size="lg" variant="gold" onClick={handlePlay}>Play Now</Button>
        </motion.div>

        {/* Daily Blast banner */}
        <motion.button
          onClick={() => setShowBlast(true)}
          className="w-full rounded-2xl p-4 flex items-center gap-3 text-left"
          style={{
            background: 'linear-gradient(135deg, #4c2d8f 0%, #2d1b69 100%)',
            border: '1px solid rgba(245,200,66,0.35)',
          }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            animate={{ filter: ['drop-shadow(0 0 6px #f5c842)', 'drop-shadow(0 0 14px #f5c842)', 'drop-shadow(0 0 6px #f5c842)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={26} style={{ color: '#f5c842' }} />
          </motion.div>
          <div className="flex-1">
            <p className="text-gold font-bold text-base" style={{ fontFamily: "'Fredoka One', cursive" }}>
              DAILY BLAST
            </p>
            <p className="text-white/50 text-xs">Complete missions · earn ⚡ tokens</p>
          </div>
          <span className="text-white/40 text-sm">›</span>
        </motion.button>

        {/* Quick links */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'Collection', emoji: '🃏', href: '/collection' },
            { label: 'Gifts',      emoji: '🎁', href: '/gifts'      },
            { label: 'Shop',       emoji: '👑', href: '/shop'       },
            { label: 'Auth',       emoji: '🔑', href: '/auth'       },
          ].map(({ label, emoji, href }) => (
            <motion.a
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-white/60">{label}</span>
            </motion.a>
          ))}
        </div>

        {/* Tournaments */}
        <section>
          <h3 className="text-base text-white/70 font-semibold mb-3">⚔️ Live Tournaments</h3>
          <div className="flex flex-col gap-3">
            {TOURNAMENTS.map((t) => (
              <TournamentCard key={t.title} {...t} />
            ))}
          </div>
        </section>
      </main>

      {/* Daily Blast modal overlay */}
      <AnimatePresence>
        {showBlast && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBlast(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-y-auto"
              style={{ maxHeight: '92vh', background: '#1a0533' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1" />
              <DailyBlastContent onClose={() => setShowBlast(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
