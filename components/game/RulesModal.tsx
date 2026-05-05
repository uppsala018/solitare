'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

const RULES: [string, string][] = [
  ['Goal',        'Move all 52 cards to the 4 foundation piles — Ace to King, same suit.'],
  ['Tableau',     'Build columns in descending order, alternating red and black suits.'],
  ['Stock',       'Tap the stock pile to draw a card to the waste pile.'],
  ['Auto-move',   'Tap any face-up card to move it to the best valid spot.'],
  ['Foundations', 'Start each pile with an Ace, then stack 2–3–4…K of the same suit.'],
  ['Kings',       'Only Kings (or stacks starting with a King) can fill an empty column.'],
  ['Undo',        'Reverses your last move — costs 1 gem per use.'],
];

export default function RulesModal({ open, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-50 inset-x-5 mx-auto max-w-sm rounded-3xl p-6"
            style={{
              top: '50%',
              translateY: '-50%',
              background: 'linear-gradient(160deg, #2d1b69 0%, #1a0533 100%)',
              border: '1px solid rgba(245,200,66,0.3)',
            }}
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl text-gold" style={{ fontFamily: "'Fredoka One', cursive" }}>
                How to Play
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl opacity-55 active:opacity-100"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {RULES.map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <span className="text-teal font-semibold text-sm shrink-0 w-24">{title}</span>
                  <span className="text-white/65 text-sm leading-snug">{desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
