'use client';

import { motion } from 'framer-motion';
import { Crown, Lock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROYALS_PERKS } from '@/lib/shopConfig';
import { useAuth } from '@/hooks/useAuth';

export default function RoyalsCard() {
  const { profile } = useAuth();
  const router     = useRouter();
  const isRoyals   = profile?.royals_tier ?? false;
  const expiresAt  = profile?.royals_expires_at;

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden p-5 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, #2d1b69 0%, #4c2d8f 50%, #1a0533 100%)',
        border: `1.5px solid ${isRoyals ? 'rgba(245,200,66,0.6)' : 'rgba(245,200,66,0.2)'}`,
        boxShadow: isRoyals ? '0 4px 24px rgba(245,200,66,0.2)' : undefined,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Active badge */}
      {isRoyals && (
        <motion.div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: 'rgba(0,212,170,0.2)', border: '1px solid rgba(0,212,170,0.5)', color: '#00d4aa' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Check size={10} /> ACTIVE
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <motion.div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,200,66,0.2)' }}
          animate={isRoyals ? { filter: ['drop-shadow(0 0 6px #f5c842)', 'drop-shadow(0 0 14px #f5c842)', 'drop-shadow(0 0 6px #f5c842)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown size={24} style={{ color: '#f5c842' }} />
        </motion.div>
        <div>
          <p className="text-gold font-black text-base" style={{ fontFamily: "'Fredoka One', cursive" }}>Royals Get MORE</p>
          {isRoyals && expiresAt ? (
            <p className="text-white/50 text-xs">Renews {new Date(expiresAt).toLocaleDateString()}</p>
          ) : (
            <p className="text-white/50 text-xs">Premium membership</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {ROYALS_PERKS.map((perk) => (
          <div key={perk} className="flex items-center gap-1.5">
            <Check size={11} style={{ color: isRoyals ? '#00d4aa' : '#f5c842', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: isRoyals ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)' }}>
              {perk}
            </span>
          </div>
        ))}
      </div>

      {!isRoyals && (
        <motion.button
          className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 gradient-gold text-purple-deep"
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push('/shop')}
        >
          <Lock size={15} /> UNLOCK ROYALS
        </motion.button>
      )}
    </motion.div>
  );
}
