'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gem } from 'lucide-react';
import { PACK_DEFS, RARITY_COLORS, RARITY_GLOW, COLLECTION_SETS, type PackType, type EarnedCard } from '@/types/collection';

type Stage = 'select' | 'opening' | 'reveal' | 'done';

interface PackOpenModalProps {
  open: boolean;
  userGems: number;
  onClose: () => void;
  onOpenPack: (type: PackType) => Promise<EarnedCard[]>;
}

export default function PackOpenModal({ open, userGems, onClose, onOpenPack }: PackOpenModalProps) {
  const [stage,         setStage]         = useState<Stage>('select');
  const [chosenPack,    setChosenPack]     = useState<PackType | null>(null);
  const [earnedCards,   setEarnedCards]    = useState<EarnedCard[]>([]);
  const [revealedCount, setRevealedCount]  = useState(0);
  const [busy,          setBusy]           = useState(false);

  function handleClose() {
    setStage('select');
    setChosenPack(null);
    setEarnedCards([]);
    setRevealedCount(0);
    onClose();
  }

  async function handleOpen(packType: PackType) {
    if (busy) return;
    setBusy(true);
    setChosenPack(packType);
    setStage('opening');

    setTimeout(async () => {
      const cards = await onOpenPack(packType);
      setEarnedCards(cards);
      setStage('reveal');
      setBusy(false);

      // Reveal cards one by one
      for (let i = 0; i < cards.length; i++) {
        await new Promise<void>((res) => setTimeout(res, i === 0 ? 200 : 500));
        setRevealedCount(i + 1);
      }
    }, 1200);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/75 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ maxHeight: '92vh', background: 'linear-gradient(160deg, #2d1b69, #1a0533)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-xl text-gold font-bold" style={{ fontFamily: "'Fredoka One', cursive" }}>
                {stage === 'select' ? 'Open a Pack' : stage === 'opening' ? 'Opening…' : stage === 'reveal' || stage === 'done' ? 'Cards Earned!' : ''}
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm font-bold text-purple-300">
                  <Gem size={14} className="text-purple-400" />
                  {userGems.toLocaleString()}
                </span>
                <button onClick={handleClose} className="p-1.5 rounded-xl opacity-60" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(92vh - 80px)' }}>
              {/* Pack selection */}
              {stage === 'select' && (
                <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {PACK_DEFS.map((pack) => {
                    const canAfford = userGems >= pack.cost;
                    return (
                      <motion.button
                        key={pack.id}
                        className="relative w-full rounded-2xl p-4 flex items-center gap-4 text-left overflow-hidden"
                        style={{
                          background: pack.highlight
                            ? 'linear-gradient(135deg, rgba(76,45,143,0.8), rgba(45,27,105,0.9))'
                            : 'rgba(255,255,255,0.06)',
                          border: pack.highlight
                            ? '1px solid rgba(245,200,66,0.4)'
                            : '1px solid rgba(255,255,255,0.1)',
                          opacity: canAfford ? 1 : 0.45,
                        }}
                        whileTap={canAfford ? { scale: 0.97 } : undefined}
                        onClick={() => canAfford && handleOpen(pack.id)}
                        disabled={!canAfford}
                      >
                        {pack.highlight && (
                          <span className="absolute top-2 right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                            style={{ background: '#f5c842', color: '#1a0533' }}>
                            BEST VALUE
                          </span>
                        )}
                        <span style={{ fontSize: 36 }}>{pack.emoji}</span>
                        <div className="flex-1">
                          <p className="text-white font-bold">{pack.name}</p>
                          <p className="text-white/50 text-sm">{pack.cards} {pack.cards === 1 ? 'card' : 'cards'}</p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <Gem size={12} className="text-purple-400" />
                          <span className="font-bold text-sm text-white">{pack.cost}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Opening animation */}
              {stage === 'opening' && (
                <div className="flex flex-col items-center justify-center py-12 gap-6">
                  <motion.div
                    style={{ fontSize: 72 }}
                    animate={{
                      scale:  [1, 1.1, 1],
                      filter: ['drop-shadow(0 0 8px #f5c842)', 'drop-shadow(0 0 30px #f5c842)', 'drop-shadow(0 0 8px #f5c842)'],
                      rotate: [0, -3, 3, -3, 0],
                    }}
                    transition={{ duration: 0.6, repeat: 2 }}
                  >
                    {PACK_DEFS.find((p) => p.id === chosenPack)?.emoji ?? '📦'}
                  </motion.div>
                  <p className="text-white/60 text-sm">Opening your pack…</p>
                </div>
              )}

              {/* Card reveal */}
              {(stage === 'reveal' || stage === 'done') && (
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {earnedCards.slice(0, revealedCount).map((card, i) => (
                      <RevealedCard key={i} card={card} index={i} />
                    ))}
                  </AnimatePresence>

                  {revealedCount >= earnedCards.length && earnedCards.length > 0 && (
                    <motion.button
                      className="mt-3 w-full py-3.5 rounded-2xl font-bold gradient-gold text-purple-deep"
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleClose}
                    >
                      Awesome! View Collection
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RevealedCard({ card, index }: { card: EarnedCard; index: number }) {
  const set     = COLLECTION_SETS.find((s) => s.id === card.setId);
  const isLeg   = card.rarity === 'legendary';

  return (
    <motion.div
      className="relative w-full rounded-2xl overflow-hidden flex items-center gap-4 p-3.5"
      style={{
        background: set?.gradient ?? 'rgba(255,255,255,0.05)',
        border: `2px solid ${RARITY_COLORS[card.rarity]}`,
        boxShadow: RARITY_GLOW[card.rarity],
      }}
      initial={{ x: -40, opacity: 0, rotateY: -90 }}
      animate={{ x: 0, opacity: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.05 }}
    >
      {isLeg && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: '2px solid #f5c842' }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      <span style={{ fontSize: 36, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }}>
        {set?.emoji ?? '🃏'}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm">{card.setName}</p>
        <p className="text-white/50 text-xs">Card #{card.cardNumber}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className="px-2 py-0.5 rounded-lg text-xs font-bold uppercase"
          style={{ background: 'rgba(0,0,0,0.4)', color: RARITY_COLORS[card.rarity] }}
        >
          {card.rarity}
        </span>
        {card.isDuplicate && (
          <span className="text-[10px] text-white/40">duplicate</span>
        )}
        {!card.isDuplicate && (
          <span className="text-[10px]" style={{ color: '#00d4aa' }}>NEW ✓</span>
        )}
      </div>
    </motion.div>
  );
}
