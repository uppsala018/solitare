'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DailyBonusCard   from '@/components/gifts/DailyBonusCard';
import InviteFriendsCard from '@/components/gifts/InviteFriendsCard';
import RoyalsCard        from '@/components/gifts/RoyalsCard';
import SocialFollowCard  from '@/components/gifts/SocialFollowCard';
import PromoCodeModal    from '@/components/gifts/PromoCodeModal';

export default function GiftsPage() {
  const router = useRouter();
  const [showPromo, setShowPromo] = useState(false);

  return (
    <div className="min-h-screen gradient-purple flex flex-col safe-top safe-bottom">
      {/* ── Red ribbon header ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8b0000 0%, #c0392b 40%, #8b0000 100%)' }}
      >
        {/* Ribbon diagonal stripes */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 1px, transparent 0, transparent 10px)',
          }}
        />

        <div className="relative flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl opacity-70"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <ArrowLeft size={18} className="text-white" />
          </button>

          <motion.h1
            className="text-4xl font-black tracking-wider text-center"
            style={{
              fontFamily: "'Fredoka One', cursive",
              color: '#f5c842',
              textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(245,200,66,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            GIFTS
          </motion.h1>

          <div className="w-9" /> {/* spacer */}
        </div>

        {/* Bottom ribbon fold */}
        <div className="relative h-4 overflow-hidden">
          <div
            className="absolute inset-x-0 -bottom-2 h-6"
            style={{
              background: 'linear-gradient(180deg, rgba(139,0,0,0.8), transparent)',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            }}
          />
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto w-full pb-8">
        <DailyBonusCard />

        <InviteFriendsCard />

        <RoyalsCard />

        <SocialFollowCard />

        {/* Promo code section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-base"
            style={{
              background: 'linear-gradient(135deg, #c2410c, #f97316)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowPromo(true)}
          >
            <Tag size={18} />
            ADD PROMO CODE
          </motion.button>
        </motion.div>
      </div>

      <PromoCodeModal open={showPromo} onClose={() => setShowPromo(false)} />
    </div>
  );
}
