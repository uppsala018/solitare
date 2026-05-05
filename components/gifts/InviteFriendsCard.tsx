'use client';

import { motion } from 'framer-motion';
import { Share2, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function InviteFriendsCard() {
  const { user } = useAuth();

  async function handleShare() {
    const refUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://solitairecrown.app'}?ref=${user?.id ?? ''}`;
    const shareData = {
      title: 'Join Solitaire Crown!',
      text: 'Play the best mobile solitaire and win real prizes! Join with my link.',
      url: refUrl,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(refUrl);
        alert('Link copied!');
      }
    } catch (_) { /* user cancelled */ }
  }

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden p-5 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, #0a1a3d 0%, #1a3a6e 50%, #0f2857 100%)',
        border: '1.5px solid rgba(96,165,250,0.3)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Coming soon ribbon */}
      <div
        className="absolute top-4 right-0 px-3 py-0.5 text-[10px] font-black tracking-widest"
        style={{ background: '#f5c842', color: '#1a0533', borderRadius: '4px 0 0 4px' }}
      >
        COMING SOON
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(96,165,250,0.2)' }}
        >
          <Users size={24} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <p className="text-white font-bold text-base">Invite Friends</p>
          <p className="text-white/50 text-sm">Earn 500 tokens per friend who plays a tournament</p>
        </div>
      </div>

      <motion.button
        className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 opacity-60"
        style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd' }}
        whileTap={{ scale: 0.96 }}
        onClick={handleShare}
      >
        <Share2 size={16} />
        Share Your Link
      </motion.button>
    </motion.div>
  );
}
