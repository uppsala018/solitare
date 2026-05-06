'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/sounds';

const THEMES = [
  { id: 'classic', label: 'Classic Purple', vars: ['#1a0533', '#2d1b69', '#4c2d8f'] },
  { id: 'midnight', label: 'Midnight Black', vars: ['#050711', '#111827', '#253044'] },
  { id: 'ocean', label: 'Ocean Blue', vars: ['#03192f', '#064e7a', '#0891b2'] },
  { id: 'forest', label: 'Forest Green', vars: ['#061b12', '#14532d', '#16a34a'] },
] as const;

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const router = useRouter();
  const {
    soundEnabled,
    musicEnabled,
    hapticsEnabled,
    autoCompleteEnabled,
    theme,
    toggleSound,
    toggleMusic,
    toggleHaptics,
    toggleAutoComplete,
    setTheme,
  } = useGameStore();

  useEffect(() => {
    const selected = THEMES.find((t) => t.id === theme) ?? THEMES[0];
    document.documentElement.style.setProperty('--purple-deep', selected.vars[0]);
    document.documentElement.style.setProperty('--purple-mid', selected.vars[1]);
    document.documentElement.style.setProperty('--purple-light', selected.vars[2]);
  }, [theme]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/65 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm rounded-3xl p-5"
            style={{ y: '-50%', background: 'linear-gradient(160deg, #2d1b69, #1a0533)', border: '1px solid rgba(245,200,66,0.3)' }}
            initial={{ opacity: 0, scale: 0.9, y: '-46%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-46%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-gold font-black" style={{ fontFamily: "'Fredoka One', cursive" }}>Settings</h2>
              <button className="min-h-11 min-w-11 rounded-xl bg-white/10" onClick={onClose} aria-label="Close settings">
                <X size={18} className="mx-auto text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Toggle label="Sound" enabled={soundEnabled} onClick={toggleSound} />
              <Toggle
                label="Music"
                enabled={musicEnabled}
                onClick={() => {
                  toggleMusic();
                  if (!musicEnabled) soundEngine.startAmbient();
                  else soundEngine.stopAmbient();
                }}
              />
              <Toggle label="Haptics" enabled={hapticsEnabled} onClick={toggleHaptics} />
              <Toggle label="Auto-complete" enabled={autoCompleteEnabled} onClick={toggleAutoComplete} />

              <div className="pt-2">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((item) => (
                    <button
                      key={item.id}
                      className="min-h-11 rounded-xl px-2 text-xs font-bold border"
                      style={{
                        background: `linear-gradient(135deg, ${item.vars[0]}, ${item.vars[2]})`,
                        borderColor: theme === item.id ? '#f5c842' : 'rgba(255,255,255,0.12)',
                        color: 'white',
                      }}
                      onClick={() => setTheme(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="min-h-11 rounded-xl border border-gold/30 text-gold text-sm font-bold mt-1"
                onClick={() => router.push('/profile')}
              >
                Account Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Toggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button className="min-h-11 flex items-center justify-between rounded-xl bg-white/7 px-3 border border-white/10" onClick={onClick}>
      <span className="text-white text-sm font-semibold">{label}</span>
      <span className="relative h-6 w-11 rounded-full" style={{ background: enabled ? '#00d4aa' : 'rgba(255,255,255,0.18)' }}>
        <motion.span
          className="absolute top-1 h-4 w-4 rounded-full bg-white"
          animate={{ x: enabled ? 22 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}
