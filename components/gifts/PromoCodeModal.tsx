'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Zap, Gem, DollarSign } from 'lucide-react';
import { useShop } from '@/hooks/useShop';

interface PromoCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PromoCodeModal({ open, onClose }: PromoCodeModalProps) {
  const { redeemPromoCode } = useShop();
  const [code,    setCode]    = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reward,  setReward]  = useState<{ type: string; amount: number } | null>(null);

  async function handleApply() {
    if (!code.trim() || status === 'loading') return;
    setStatus('loading');
    const result = await redeemPromoCode(code);
    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      setReward(result.reward ?? null);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  }

  function handleClose() {
    setCode('');
    setStatus('idle');
    setMessage('');
    setReward(null);
    onClose();
  }

  const RewardIcon = reward?.type === 'gems' ? Gem : reward?.type === 'cash' ? DollarSign : Zap;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/65 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} />
          <motion.div
            className="fixed z-50 inset-x-5 mx-auto max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{ top: '50%', translateY: '-50%', background: 'linear-gradient(160deg,#2d1b69,#1a0533)', border: '1px solid rgba(245,200,66,0.3)' }}
            initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={18} style={{ color: '#f97316' }} />
                <h3 className="text-lg font-bold text-white">Promo Code</h3>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-xl opacity-60" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <X size={15} className="text-white" />
              </button>
            </div>

            {status === 'success' && reward ? (
              <motion.div
                className="flex flex-col items-center gap-3 py-4"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              >
                <motion.span style={{ fontSize: 48 }} animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>🎉</motion.span>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                  style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.4)' }}
                >
                  <RewardIcon size={18} style={{ color: '#00d4aa' }} />
                  <span className="font-bold text-lg" style={{ color: '#00d4aa' }}>+{reward.amount} {reward.type}</span>
                </div>
                <p className="text-white/60 text-sm text-center">{message}</p>
                <button className="mt-2 px-6 py-2.5 rounded-2xl gradient-gold text-purple-deep font-bold" onClick={handleClose}>
                  Awesome!
                </button>
              </motion.div>
            ) : (
              <>
                <p className="text-white/50 text-sm">Enter a promo code to receive free tokens, gems, or bonus cash.</p>

                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); }}
                  className="w-full px-4 py-3 rounded-2xl text-center font-bold tracking-widest text-base"
                  style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${status === 'error' ? '#ff3d3d' : 'rgba(255,255,255,0.15)'}`, color: 'white', outline: 'none' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.p className="text-center text-sm" style={{ color: '#ff3d3d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  className="w-full py-3 rounded-2xl font-bold text-base disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleApply}
                  disabled={!code.trim() || status === 'loading'}
                >
                  {status === 'loading' ? 'Checking…' : 'APPLY CODE'}
                </motion.button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
