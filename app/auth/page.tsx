'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, username);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/lobby');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-purple px-4 safe-top safe-bottom">
      {/* Crown + title */}
      <motion.div
        className="flex flex-col items-center mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <svg width="72" height="56" viewBox="0 0 100 80" fill="none" className="mb-3">
          <path d="M10 65 L10 30 L30 50 L50 10 L70 50 L90 30 L90 65 Z" fill="#f5c842" stroke="#c49a1a" strokeWidth="2" strokeLinejoin="round" />
          <rect x="8" y="63" width="84" height="10" rx="3" fill="#c49a1a" />
          {[22, 50, 78].map((cx, i) => (
            <circle key={cx} cx={cx} cy={68} r={4} fill={i === 1 ? '#00d4aa' : '#ff3d3d'} />
          ))}
        </svg>
        <h1 className="text-4xl text-gold glow-gold" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Solitaire Crown
        </h1>
      </motion.div>

      {/* Card */}
      <motion.div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: 'rgba(45,27,105,0.85)', border: '1px solid rgba(245,200,66,0.25)', backdropFilter: 'blur(12px)' }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Tab switcher */}
        <div className="flex rounded-2xl overflow-hidden mb-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200"
              style={{
                background: mode === m ? 'linear-gradient(135deg,#f5c842,#c49a1a)' : 'transparent',
                color: mode === m ? '#1a0533' : 'rgba(255,255,255,0.5)',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="username"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-gold text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-gold text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-gold text-sm"
          />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-red-bright text-xs text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-purple-deep text-base gradient-gold disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <p className="text-center text-white/40 text-xs mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            className="text-gold underline underline-offset-2"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
