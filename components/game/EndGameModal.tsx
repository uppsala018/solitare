'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface EndGameModalProps {
  open: boolean;
  isWon: boolean;
  score: number;
  moves: number;
  timeUsed: number;
  timeBonus: number;
  isTournament?: boolean;
  onPlayAgain: () => void;
}

export default function EndGameModal({
  open, isWon, score, moves, timeUsed, timeBonus, isTournament, onPlayAgain,
}: EndGameModalProps) {
  const router      = useRouter();
  const finalScore  = score + (isWon ? timeBonus : 0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!open) { setDisplay(0); return; }
    let n    = 0;
    const step = Math.max(1, Math.ceil(finalScore / 60));
    const id   = setInterval(() => {
      n = Math.min(n + step, finalScore);
      setDisplay(n);
      if (n >= finalScore) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [open, finalScore]);

  const mm = String(Math.floor(timeUsed / 60)).padStart(2, '0');
  const ss = String(timeUsed % 60).padStart(2, '0');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed z-50 inset-x-5 mx-auto max-w-sm rounded-3xl p-6 flex flex-col items-center gap-4"
            style={{
              top: '50%',
              translateY: '-50%',
              background: 'linear-gradient(160deg, #2d1b69 0%, #1a0533 100%)',
              border: '2px solid rgba(245,200,66,0.4)',
            }}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.82, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
          >
            <span style={{ fontSize: 52 }}>{isWon ? '👑' : '⏰'}</span>

            <h2
              className="text-3xl text-gold glow-gold"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              {isWon ? 'You Win!' : "Time's Up!"}
            </h2>

            <div className="w-full flex flex-col gap-2">
              <Row label="Score"    value={display.toLocaleString()} gold />
              {isWon && timeBonus > 0 && <Row label="Time Bonus" value={`+${timeBonus}`} />}
              <Row label="Moves"    value={moves} />
              <Row label="Time"     value={`${mm}:${ss}`} />
            </div>

            {isTournament ? (
              <p className="text-white/50 text-sm text-center">
                Score recorded — waiting for tournament results…
              </p>
            ) : (
              <div className="flex gap-3 w-full pt-1">
                <button
                  onClick={() => router.push('/lobby')}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white/70 border border-white/20"
                >
                  Lobby
                </button>
                <button
                  onClick={onPlayAgain}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-purple-deep gradient-gold"
                >
                  Play Again
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, gold }: { label: string; value: string | number; gold?: boolean }) {
  return (
    <div
      className="flex justify-between items-center px-3 py-1.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <span className="text-white/55 text-sm">{label}</span>
      <span className={`font-bold text-sm ${gold ? 'text-gold' : 'text-white'}`}>{value}</span>
    </div>
  );
}
