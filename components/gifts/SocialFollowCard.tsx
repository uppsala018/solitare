'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  emoji: '🔵', url: 'https://facebook.com/solitairecrown',  reward: 50 },
  { id: 'instagram', label: 'Instagram', emoji: '📸', url: 'https://instagram.com/solitairecrown', reward: 50 },
] as const;

type Platform = typeof PLATFORMS[number]['id'];

const db = supabase as unknown as Record<string, any>;

export default function SocialFollowCard() {
  const { user, profile } = useAuth();
  const [claimed, setClaimed] = useState<Platform[]>([]);
  const [loading, setLoading] = useState<Platform | null>(null);

  async function handleClaim(platform: Platform, url: string, reward: number) {
    if (!user || !profile || claimed.includes(platform) || loading) return;

    // Check if already claimed in DB
    const { data: existing } = await db.from('social_claims')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    if (existing) { setClaimed((prev) => prev.includes(platform) ? prev : [...prev, platform]); return; }

    setLoading(platform);
    window.open(url, '_blank');

    // After opening the link, award the reward
    await Promise.all([
      db.from('social_claims').insert({ user_id: user.id, platform }),
      db.from('profiles').update({ lightning_tokens: (profile.lightning_tokens ?? 0) + reward }).eq('id', user.id),
    ]);

    setClaimed((prev) => [...prev, platform]);
    setLoading(null);
  }

  return (
    <motion.div
      className="rounded-3xl overflow-hidden p-5 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)',
        border: '1.5px solid rgba(255,255,255,0.1)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.15)' }}>
          <Gift size={20} style={{ color: '#f5c842' }} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">FOLLOW US — ENJOY FREE GIFTS</p>
          <p className="text-white/40 text-xs">Claim 50⚡ tokens per platform</p>
        </div>
      </div>

      <div className="flex gap-2.5">
        {PLATFORMS.map(({ id, label, emoji, url, reward }) => {
          const done = claimed.includes(id);
          return (
            <motion.button
              key={id}
              className="flex-1 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-sm"
              style={{
                background: done ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${done ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.12)'}`,
                color: done ? '#00d4aa' : 'rgba(255,255,255,0.8)',
                opacity: loading === id ? 0.6 : 1,
              }}
              whileTap={!done ? { scale: 0.95 } : undefined}
              onClick={() => handleClaim(id, url, reward)}
              disabled={done || !!loading}
            >
              <span>{emoji}</span>
              <span>{done ? '✓' : label}</span>
              {!done && <span className="text-[10px] text-white/40">+{reward}⚡</span>}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
