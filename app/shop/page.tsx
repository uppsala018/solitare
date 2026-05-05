'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const COIN_PACKS = [
  { id: 'coins_500',   label: '500 Coins',   price: '$0.99',  emoji: '🪙', popular: false },
  { id: 'coins_1200',  label: '1,200 Coins', price: '$1.99',  emoji: '💰', popular: false },
  { id: 'coins_3500',  label: '3,500 Coins', price: '$4.99',  emoji: '💰', popular: true  },
  { id: 'coins_10000', label: '10,000 Coins',price: '$9.99',  emoji: '💎', popular: false },
];

const ROYALS = [
  { id: 'royals_monthly', label: 'Royals Monthly', price: '$4.99/mo', emoji: '👑', perks: ['2x coins', 'Exclusive decks', 'No ads'] },
  { id: 'royals_annual',  label: 'Royals Annual',  price: '$29.99/yr', emoji: '🏆', perks: ['3x coins', 'All decks', 'VIP tournaments', 'No ads'] },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen gradient-purple px-4 py-8 safe-top safe-bottom">
      <motion.h1
        className="text-4xl text-gold text-center mb-8"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Crown Shop
      </motion.h1>

      <div className="max-w-lg mx-auto flex flex-col gap-8">
        {/* Royals */}
        <section>
          <h2 className="text-lg text-white/70 font-semibold mb-3">Royals Membership 👑</h2>
          <div className="flex flex-col gap-3">
            {ROYALS.map((r, i) => (
              <motion.div
                key={r.id}
                className="rounded-2xl p-4"
                style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4c2d8f 100%)', border: '1px solid rgba(245,200,66,0.5)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{r.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold">{r.label}</p>
                    <p className="text-gold text-sm">{r.price}</p>
                  </div>
                  <Button size="sm" variant="gold">Subscribe</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {r.perks.map((p) => <Badge key={p} label={p} color="gold" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Coin packs */}
        <section>
          <h2 className="text-lg text-white/70 font-semibold mb-3">Coin Packs</h2>
          <div className="grid grid-cols-2 gap-3">
            {COIN_PACKS.map((pack, i) => (
              <motion.div
                key={pack.id}
                className="relative rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${pack.popular ? 'rgba(245,200,66,0.6)' : 'rgba(255,255,255,0.1)'}` }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                {pack.popular && <Badge label="Popular" color="gold" />}
                <span className="text-4xl">{pack.emoji}</span>
                <p className="text-white font-semibold text-sm text-center">{pack.label}</p>
                <Button size="sm" variant="teal">{pack.price}</Button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
