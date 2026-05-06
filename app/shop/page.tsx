'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, ArrowLeft, Crown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import { CASH_PACKAGES, GEM_PACKAGES, ROYALS_PERKS, ROYALS_PLANS } from '@/lib/shopConfig';
import RequireAuth from '@/components/auth/RequireAuth';

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, refreshProfile } = useAuth();
  const { loading, error, setError, purchaseGems, purchaseCash, subscribeRoyals } = useShop();
  const [tab, setTab] = useState<'gems' | 'cash' | 'royals'>('gems');
  const paymentSuccess = searchParams.get('success') === '1';

  useEffect(() => {
    if (!paymentSuccess) return;
    refreshProfile();
    const timer = setTimeout(refreshProfile, 2500);
    return () => clearTimeout(timer);
  }, [paymentSuccess, refreshProfile]);

  const stripeReady = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'placeholder';

  function handleBuy(fn: () => void) {
    if (!stripeReady) {
      alert('Payments coming soon. Add Stripe keys in Vercel environment variables first.');
      return;
    }
    fn();
  }

  return (
    <RequireAuth>
    <div className="min-h-screen gradient-purple flex flex-col safe-top safe-bottom">
      <div
        className="relative flex flex-col gap-3 px-4 py-4"
        style={{ background: 'linear-gradient(180deg, rgba(45,27,105,0.95) 0%, transparent 100%)' }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/lobby')}
            className="min-h-11 min-w-11 rounded-xl opacity-70"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-label="Back to lobby"
          >
            <ArrowLeft size={18} className="text-white mx-auto" />
          </button>

          <h1 className="text-2xl text-gold font-black tracking-wide" style={{ fontFamily: "'Fredoka One', cursive" }}>
            STORE
          </h1>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <Gem size={14} className="text-purple-400" />
            <span className="font-bold text-sm text-white tabular-nums">{(profile?.gems ?? 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {([['gems', 'Gems'], ['cash', 'Cash'], ['royals', 'Royals']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="min-h-11 flex-1 rounded-xl text-sm font-bold transition-all"
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

      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            className="mx-4 mb-2 px-4 py-2 rounded-xl text-sm text-center font-semibold"
            style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.4)', color: '#00d4aa' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Payment complete. Balance updates after Stripe webhook confirmation.
          </motion.div>
        )}
        {error && (
          <motion.div
            className="mx-4 px-4 py-2 rounded-xl text-sm text-center font-semibold"
            style={{ background: 'rgba(255,61,61,0.15)', border: '1px solid rgba(255,61,61,0.4)', color: '#ff3d3d' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setError(null)}
          >
            {error} (tap to dismiss)
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-10 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {tab === 'gems' && (
            <motion.div key="gems" className="flex flex-col gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-white/50 text-sm">Use gems to open card packs and enter premium tournaments.</p>
              {GEM_PACKAGES.map((pkg, i) => (
                <StoreRow
                  key={pkg.id}
                  delay={i * 0.06}
                  popular={pkg.popular}
                  badge={pkg.badge}
                  icon="💎"
                  title={`${pkg.gems.toLocaleString()} Gems`}
                  subtitle={`${pkg.label} Pack`}
                  price={pkg.price}
                  loading={loading}
                  onClick={() => handleBuy(() => purchaseGems(pkg.id))}
                />
              ))}
            </motion.div>
          )}

          {tab === 'cash' && (
            <motion.div key="cash" className="flex flex-col gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-white/50 text-sm">Bonus cash is added to your in-game balance for tournaments.</p>
              {CASH_PACKAGES.map((pkg, i) => (
                <StoreRow
                  key={pkg.id}
                  delay={i * 0.08}
                  popular={Boolean(pkg.badge)}
                  badge={pkg.badge}
                  icon="💵"
                  title={`$${pkg.cash} Bonus Cash`}
                  subtitle={pkg.label}
                  price={pkg.price}
                  loading={loading}
                  onClick={() => handleBuy(() => purchaseCash(pkg.id))}
                  green
                />
              ))}
            </motion.div>
          )}

          {tab === 'royals' && (
            <motion.div key="royals" className="flex flex-col gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex flex-col items-center gap-2 py-4">
                <motion.span style={{ fontSize: 56 }} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>👑</motion.span>
                <h2 className="text-2xl text-gold text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>Royals Membership</h2>
                <p className="text-white/50 text-sm text-center max-w-xs">The ultimate Solitaire Crown experience.</p>
              </div>

              <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,200,66,0.2)' }}>
                {ROYALS_PERKS.map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#00d4aa' }} />
                    <span className="text-white/80 text-sm">{perk}</span>
                  </div>
                ))}
              </div>

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
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full" style={{ background: '#39ff14', color: '#1a0533' }}>
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gold">${plan.price}</span>
                    <span className="text-white/50 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-white font-semibold">{plan.label}</p>
                  {plan.savePct && <p className="text-[#39ff14] text-xs font-bold">Save {plan.savePct}% vs monthly</p>}
                  <motion.button
                    className="min-h-11 w-full rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: plan.id === 'annual' ? 'linear-gradient(135deg,#f5c842,#c49a1a)' : 'rgba(245,200,66,0.2)', color: plan.id === 'annual' ? '#1a0533' : '#f5c842' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleBuy(() => subscribeRoyals(plan.id))}
                    disabled={loading || (profile?.royals_tier ?? false)}
                  >
                    <Crown size={14} />
                    {profile?.royals_tier ? 'Active' : `Subscribe ${plan.period}`}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </RequireAuth>
  );
}

function StoreRow({
  delay,
  popular,
  badge,
  icon,
  title,
  subtitle,
  price,
  loading,
  onClick,
  green,
}: {
  delay: number;
  popular?: boolean;
  badge?: string;
  icon: string;
  title: string;
  subtitle: string;
  price: number;
  loading: boolean;
  onClick: () => void;
  green?: boolean;
}) {
  return (
    <motion.div
      className="relative rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: popular ? (green ? 'linear-gradient(135deg,#1a3d00,#2d6600)' : 'linear-gradient(135deg,#2d1b69,#4c2d8f)') : 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${popular ? (green ? 'rgba(57,255,20,0.4)' : 'rgba(245,200,66,0.5)') : 'rgba(255,255,255,0.1)'}`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: green ? '#39ff14' : '#f5c842', color: '#1a0533' }}>
          {badge}
        </span>
      )}
      <span style={{ fontSize: 32 }}>{icon}</span>
      <div className="flex-1">
        <p className="text-white font-bold">{title}</p>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </div>
      <motion.button
        className="min-h-11 px-4 rounded-xl font-bold text-sm"
        style={{ background: popular ? (green ? '#39ff14' : 'linear-gradient(135deg,#f5c842,#c49a1a)') : green ? 'rgba(57,255,20,0.2)' : 'rgba(245,200,66,0.2)', color: popular ? '#1a0533' : green ? '#39ff14' : '#f5c842' }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        disabled={loading}
      >
        ${price.toFixed(2)}
      </motion.button>
    </motion.div>
  );
}
