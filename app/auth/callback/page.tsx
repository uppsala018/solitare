'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const code = params.get('code');
      const next = params.get('next') || '/lobby';

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Supabase auth callback failed', error);
          if (!cancelled) setMessage('Verification failed. Please sign in again.');
          setTimeout(() => router.replace('/auth?error=verification_failed'), 1600);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setMessage('No session found. Please sign in again.');
        setTimeout(() => router.replace('/auth'), 1600);
        return;
      }

      if (!cancelled) setMessage('Verified. Redirecting...');
      router.replace(next);
    }

    completeAuth();
    return () => { cancelled = true; };
  }, [params, router]);

  return (
    <div className="min-h-screen gradient-purple flex flex-col items-center justify-center gap-4 p-4 text-center">
      <motion.div
        className="w-16 h-16 rounded-full border-2 border-gold border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <h1 className="text-2xl text-gold font-black" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Solitaire Crown
      </h1>
      <p className="text-white/60 text-sm">{message}</p>
    </div>
  );
}
