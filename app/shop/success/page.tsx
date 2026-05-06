'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ShopSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/shop?success=1'), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen gradient-purple flex flex-col items-center justify-center gap-4 p-4 text-center">
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,212,170,0.18)', border: '1px solid rgba(0,212,170,0.5)' }}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        <span className="text-4xl">✓</span>
      </motion.div>
      <h1 className="text-2xl text-gold font-black" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Payment Complete
      </h1>
      <p className="text-white/55 text-sm max-w-xs">
        Your reward will appear after Stripe confirms the payment webhook.
      </p>
      {sessionId && <p className="text-white/30 text-[10px] break-all max-w-xs">Session: {sessionId}</p>}
      <button
        className="min-h-11 px-5 rounded-2xl gradient-gold text-purple-deep font-bold"
        onClick={() => router.replace('/shop?success=1')}
      >
        Back to Store
      </button>
    </div>
  );
}
