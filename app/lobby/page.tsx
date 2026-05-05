'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/lobby/TopBar';
import TournamentCard from '@/components/lobby/TournamentCard';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';

const TOURNAMENTS = [
  { title: 'Daily Classic', prize: '5,000 Coins', timeLeft: '2h 14m', players: 1284 },
  { title: 'Speed Challenge', prize: '10,000 Coins', timeLeft: '45m', players: 876 },
  { title: 'Weekly Grand Prix', prize: '50,000 Coins', timeLeft: '3d 6h', players: 4521 },
];

export default function LobbyPage() {
  const { newGame } = useGameStore();
  const router = useRouter();

  function handlePlay() {
    newGame();
    router.push('/game');
  }

  return (
    <div className="min-h-screen flex flex-col gradient-purple">
      <TopBar />

      <main className="flex-1 flex flex-col gap-6 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Hero */}
        <motion.div
          className="flex flex-col items-center gap-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl text-gold glow-gold text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Ready to Play?
          </h2>
          <Button size="lg" variant="gold" onClick={handlePlay}>
            Play Now
          </Button>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Collection', emoji: '🃏', href: '/collection' },
            { label: 'Gifts',      emoji: '🎁', href: '/gifts' },
            { label: 'Shop',       emoji: '👑', href: '/shop' },
          ].map(({ label, emoji, href }) => (
            <motion.a
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs text-white/70">{label}</span>
            </motion.a>
          ))}
        </div>

        {/* Tournaments */}
        <section>
          <h3 className="text-lg text-white/80 font-semibold mb-3">Live Tournaments</h3>
          <div className="flex flex-col gap-3">
            {TOURNAMENTS.map((t) => (
              <TournamentCard key={t.title} {...t} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
