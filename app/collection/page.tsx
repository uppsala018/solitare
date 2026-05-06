'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/auth/RequireAuth';
import SetCard from '@/components/collection/SetCard';
import SetDetailModal from '@/components/collection/SetDetailModal';
import PackOpenModal from '@/components/collection/PackOpenModal';
import { COLLECTION_SETS, TOTAL_CARDS, type SetDefinition } from '@/types/collection';

export default function CollectionPage() {
  const router = useRouter();
  const { profile }        = useAuth();
  const {
    progress, loading, totalCollected, bonusClaimed,
    celebrationSet, setCelebrationSet,
    openPack,
  } = useCollection();

  const [selectedSet, setSelectedSet]   = useState<SetDefinition | null>(null);
  const [showPacks,   setShowPacks]     = useState(false);
  const [showInfo,    setShowInfo]      = useState(false);
  const [showBonus,   setShowBonus]     = useState(false);

  const overallPct = TOTAL_CARDS > 0 ? (totalCollected / TOTAL_CARDS) * 100 : 0;

  // Marquee lights count
  const marqueeCount = 18;

  /* ── celebration for $100 bonus ── */
  const handleBonusClose = () => setShowBonus(false);

  // Show bonus overlay when claimed
  if (bonusClaimed && showBonus) {
    return <BonusOverlay onClose={handleBonusClose} />;
  }

  return (
    <RequireAuth>
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0820' }}>
      {/* ── Cinematic header ── */}
      <div
        className="relative overflow-hidden safe-top"
        style={{
          background: 'linear-gradient(160deg, #1c1409 0%, #3d2800 40%, #1a0533 100%)',
          paddingBottom: 20,
        }}
      >
        {/* Marquee lights — top row */}
        <MarqueeLights count={marqueeCount} />

        {/* Back nav */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={() => router.back()} className="p-2 rounded-xl opacity-70" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <button onClick={() => setShowInfo(true)} className="p-2 rounded-xl opacity-70" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <Info size={18} className="text-white" />
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1 px-4 pb-1">
          <motion.h1
            className="text-3xl font-black tracking-widest text-center"
            style={{
              fontFamily: "'Fredoka One', cursive",
              background: 'linear-gradient(90deg, #f5c842, #ffd700, #f5c842)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            BLOCKBUSTER SAGA
          </motion.h1>

          {/* $100 bonus banner */}
          <motion.div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-1"
            style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.4)' }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs font-bold text-gold">Complete the Collection to Win:</span>
            <span className="text-xs font-black" style={{ color: '#39ff14' }}>💰$100 BONUS</span>
          </motion.div>
        </div>

        {/* Overall progress bar */}
        <div className="px-5 mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/60 text-xs">Your Progress</span>
            <span className="text-gold font-bold text-sm tabular-nums">
              {loading ? '…' : `${totalCollected}/${TOTAL_CARDS}`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f5c842, #39ff14)' }}
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Marquee lights — bottom row */}
        <MarqueeLights count={marqueeCount} bottom />
      </div>

      {/* ── Set grid ── */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-24">
        {loading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ aspectRatio: '2/3.4', background: 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {COLLECTION_SETS.map((set, i) => (
              <SetCard
                key={set.id}
                set={set}
                progress={progress[set.id]}
                index={i}
                onClick={() => setSelectedSet(set)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky bottom action bar ── */}
      <div
        className="fixed bottom-0 inset-x-0 flex items-center justify-between px-6 py-3 safe-bottom"
        style={{ background: 'rgba(13,8,32,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
      >
        {/* TRADE button */}
        <div className="relative">
          <motion.button
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #c49a1a, #f5c842)', color: '#1a0533' }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {}} // coming soon
          >
            <span className="text-lg">🔄</span>
          </motion.button>
          <span
            className="absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full"
            style={{ background: '#f5c842', color: '#1a0533' }}
          >
            Soon
          </span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white/40 text-[10px]">{totalCollected}/{TOTAL_CARDS} cards</span>
          <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #f5c842, #39ff14)', transition: 'width 1s ease' }}
            />
          </div>
        </div>

        {/* GET PACKS button */}
        <motion.button
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-purple-deep gradient-gold"
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPacks(true)}
        >
          <ShoppingBag size={15} />
          GET PACKS
        </motion.button>
      </div>

      {/* ── Set detail modal ── */}
      <AnimatePresence>
        {selectedSet && (
          <SetDetailModal
            set={selectedSet}
            progress={progress[selectedSet.id]}
            onClose={() => setSelectedSet(null)}
            onGetPacks={() => { setSelectedSet(null); setShowPacks(true); }}
          />
        )}
      </AnimatePresence>

      {/* ── Pack opening modal ── */}
      <PackOpenModal
        open={showPacks}
        userGems={profile?.gems ?? 0}
        onClose={() => setShowPacks(false)}
        onOpenPack={openPack}
      />

      {/* ── Info modal ── */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInfo(false)} />
            <motion.div
              className="fixed z-50 inset-x-5 mx-auto max-w-sm rounded-3xl p-6"
              style={{ top: '50%', translateY: '-50%', background: 'linear-gradient(160deg,#2d1b69,#1a0533)', border: '1px solid rgba(245,200,66,0.3)' }}
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
            >
              <h3 className="text-xl text-gold mb-4 font-bold text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>How It Works</h3>
              <div className="flex flex-col gap-3">
                {[
                  ['🃏', 'Earn cards', 'Play tournaments, claim daily bonuses, and open packs.'],
                  ['📚', 'Complete sets', 'Collect all 9 cards in a set to mark it complete.'],
                  ['🏆', 'Win the saga', 'Complete all 15 sets to claim the $100 bonus cash.'],
                  ['⚡', 'Rarity matters', 'Common → Rare → Epic → Legendary. Rarer cards glow!'],
                ].map(([emoji, title, desc]) => (
                  <div key={title as string} className="flex gap-3">
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{title}</p>
                      <p className="text-white/50 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full py-2.5 rounded-xl font-bold gradient-gold text-purple-deep text-sm" onClick={() => setShowInfo(false)}>Got it!</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Set celebration ── */}
      <AnimatePresence>
        {celebrationSet && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCelebrationSet(null)}
          >
            <motion.div
              className="flex flex-col items-center gap-4 p-8 rounded-3xl mx-6"
              style={{ background: 'linear-gradient(160deg,#2d1b69,#1a0533)', border: '2px solid rgba(245,200,66,0.5)' }}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Fireworks />
              <span style={{ fontSize: 52 }}>🏆</span>
              <h3 className="text-2xl text-gold text-center glow-gold" style={{ fontFamily: "'Fredoka One', cursive" }}>
                {COLLECTION_SETS.find((s) => s.id === celebrationSet)?.name} Complete!
              </h3>
              <p className="text-white/60 text-sm text-center">All 9 cards collected</p>
              <button className="px-6 py-2.5 rounded-2xl gradient-gold text-purple-deep font-bold" onClick={() => setCelebrationSet(null)}>
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </RequireAuth>
  );
}

/* ── sub-components ── */

function MarqueeLights({ count, bottom }: { count: number; bottom?: boolean }) {
  return (
    <div className={`absolute ${bottom ? 'bottom-0' : 'top-0'} inset-x-0 flex justify-around px-2 py-0.5`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i % 3 === 0 ? '#f5c842' : i % 3 === 1 ? '#ff6b35' : '#ffd700' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.07 }}
        />
      ))}
    </div>
  );
}

function Fireworks() {
  const particles = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => {
      const angle = (i / 32) * Math.PI * 2;
      const r     = 60 + (i % 4) * 20;
      return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, color: ['#f5c842','#ff3d3d','#00d4aa','#39ff14','#a855f7'][i % 5] };
    }), []
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.015 }}
        />
      ))}
    </div>
  );
}

function BonusOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-purple"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <Fireworks />
      <motion.div
        className="flex flex-col items-center gap-5 p-8"
        initial={{ scale: 0.6 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      >
        <span style={{ fontSize: 72 }}>🏆</span>
        <h1 className="text-4xl text-gold glow-gold text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Saga Complete!
        </h1>
        <p className="text-2xl font-bold text-center" style={{ color: '#39ff14' }}>
          💰 $100 BONUS CASH
        </p>
        <p className="text-white/50 text-sm text-center">Added to your balance!</p>
        <motion.button
          className="mt-4 px-8 py-3.5 rounded-2xl gradient-gold text-purple-deep font-bold text-lg"
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          Claim Reward 🎉
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
