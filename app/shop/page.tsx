'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, ArrowLeft, Crown, Check, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import { GEM_PACKAGES, CASH_PACKAGES, ROYALS_PLANS, ROYALS_PERKS } from '@/lib/shopConfig';

export default function ShopPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { loading, error, setError, purchaseGems, purchaseCash, subscribeRoyals } = useShop();
  const [tab, setTab] = useState<'gems' | 'cash' | 'royals'>('gems');

  const stripeReady = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'placeholder';

  function handleBuy(fn: () => void) {
    if (!stripeReady) {
      alert('Payments coming soon! Stripe keys not yet configured.');
      return;
    }
    fn();
  }

  return (
    <div className="min-h-screen gradient-purple flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div
        className="relative flex flex-col gap-3 px-4 py-4"
        style={{ background: 'linear-gradient(180deg, rgba(45,27,105,0.95) 0%, transparent 100%)' }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-xl opacity-70" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>

          <h1 className="text-2xl text-gold font-black tracking-wide" style={{ fontFamily: "'Fredoka One', cursive" }}>
            STORE
          </h1>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <Gem size={14} className="text-purple-400" />
            <span className="font-bold text-sm text-white tabular-nums">{(profile?.gems ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {([['gems','💎 Gems'],['cash','💰 Cash'],['royals','👑 Royals']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: tab === id ? 'linear-gradient(135deg,#f5c842,#c49a1a)' : 'transparent',
                color: tab === id ? '#1a0533' : 'rgba(255,255,255,0.5)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mx-4 px-4 py-2 rounded-xl text-sm text-center font-semibold"
            style={{ background: 'rgba(255,61,61,0.15)', border: '1px solid rgba(255,61,61,0.4)', color: '#ff3d3d' }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onClick={() => setError(null)}
          >
            {error} (tap to dismiss)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-10 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Gems tab */}
          {tab === 'gems' && (
            <motion.div key="gems" className="flex flex-col gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-white/50 text-sm">Use gems to open card packs and enter premium tournaments.</p>
              {GEM_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  className="relative rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: pkg.popular ? 'linear-gradient(135deg,#2d1b69,#4c2d8f)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${pkg.popular ? 'rgba(245,200,66,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {pkg.badge && (
                    <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: '#f5c842', color: '#1a0533' }}>
                      {pkg.badge}
                    </span>
                  )}
                  <span style={{ fontSize: 32 }}>💎</span>
                  <div className="flex-1">
                    <p className="text-white font-bold">{pkg.gems.toLocaleString()} Gems</p>
                    <p className="text-white/40 text-xs">{pkg.label} Pack</p>
                  </div>
                  <motion.button
                    className="px-4 py-2 rounded-xl font-bold text-sm"
                    style={{ background: pkg.popular ? 'linear-gradient(135deg,#f5c842,#c49a1a)' : 'rgba(245,200,66,0.2)', color: pkg.popular ? '#1a0533' : '#f5c842' }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleBuy(() => purchaseGems(pkg.id))}
                    disabled={loading}
                  >
                    ${pkg.price.toFixed(2)}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Cash tab */}
          {tab === 'cash' && (
            <motion.div key="cash" className="flex flex-col gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-white/50 text-sm">Bonus cash is added to your in-game balance for tournaments.</p>
              {CASH_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  className="relative rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: pkg.badge ? 'linear-gradient(135deg,#1a3d00,#2d6600)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${pkg.badge ? 'rgba(57,255,20,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {pkg.badge && (
                    <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: '#39ff14', color: '#1a0533' }}>
                      {pkg.badge}
                    </span>
                  )}
                  <span style={{ fontSize: 32 }}>💵</span>
                  <div className="flex-1">
                    <p className="text-white font-bold">${pkg.cash} Bonus Cash</p>
                    <p className="text-white/40 text-xs">{pkg.label}</p>
                  </div>
                  <motion.button
                    className="px-4 py-2 rounded-xl font-bold text-sm"
                    style={{ background: pkg.badge ? '#39ff14' : 'rgba(57,255,20,0.2)', color: '#1a0533' }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleBuy(() => purchaseCash(pkg.id))}
                    disabled={loading}
                  >
                    ${pkg.price.toFixed(2)}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Royals tab */}
          {tab === 'royals' && (
            <motion.div key="royals" className="flex flex-col gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Crown hero */}
              <div className="flex flex-col items-center gap-2 py-4">
                <motion.span style={{ fontSize: 56 }} animate={{ filter: ['drop-shadow(0 0 8px #f5c842)', 'drop-shadow(0 0 20px #f5c842)', 'drop-shadow(0 0 8px #f5c842)'] }} transition={{ duration: 2, repeat: Infinity }}>👑</motion.span>
                <h2 className="text-2xl text-gold text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>Royals Membership</h2>
                <p className="text-white/50 text-sm text-center max-w-xs">The ultimate Solitaire Crown experience</p>
              </div>

              {/* Perks list */}
              <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,200,66,0.2)' }}>
                {ROYALS_PERKS.map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#00d4aa' }} />
                    <span className="text-white/80 text-sm">{perk}</span>
                  </div>
                ))}
              </div>

              {/* Plan cards */}
              {ROYALS_PLANS.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  className="relative rounded-2xl p-4 flex flex-col gap-3"
                  style={{
                    background: plan.id === 'annual' ? 'linear-gradient(135deg,#2d1b69,#4c2d8f)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${plan.id === 'annual' ? 'rgba(245,200,66,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {plan.badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full"
                      style={{ background: '#39ff14', color: '#1a0533' }}>
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gold">${plan.price}</span>
                    <span className="text-white/50 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-white font-semibold">{plan.label}</p>
                  {plan.savePct && (
                    <p className="text-[#39ff14] text-xs font-bold">Save {plan.savePct}% vs monthly</p>
                  )}
                  <motion.button
                    className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: plan.id === 'annual' ? 'linear-gradient(135deg,#f5c842,#c49a1a)' : 'rgba(245,200,66,0.2)', color: plan.id === 'annual' ? '#1a0533' : '#f5c842' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleBuy(() => subscribeRoyals(plan.id))}
                    disabled={loading || (profile?.royals_tier ?? false)}
                  >
                    <Crown size={14} />
                    {profile?.royals_tier ? '✓ Active' : `Subscribe ${plan.period}`}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
