'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'tournament' | 'coins';

export interface ToastData {
  id?:       string;
  type:      ToastType;
  title:     string;
  message?:  string;
  emoji?:    string;
  duration?: number;
}

interface ToastCtx { showToast: (t: Omit<ToastData, 'id'>) => void; }

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

const BG: Record<ToastType, string> = {
  success:    'rgba(0,30,0,0.97)',
  error:      'rgba(40,0,0,0.97)',
  tournament: 'rgba(45,27,105,0.97)',
  coins:      'rgba(50,35,0,0.97)',
  info:       'rgba(15,15,30,0.97)',
};
const BORDER: Record<ToastType, string> = {
  success:    'rgba(57,255,20,0.55)',
  error:      'rgba(255,61,61,0.55)',
  tournament: 'rgba(245,200,66,0.5)',
  coins:      'rgba(245,200,66,0.5)',
  info:       'rgba(255,255,255,0.18)',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastData & { id: string })[]>([]);

  const showToast = useCallback((t: Omit<ToastData, 'id'>) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x: { id: string }) => x.id !== id)),
      t.duration ?? 4000
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pt-4 safe-top pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto"
              style={{
                background: BG[toast.type],
                border:     `1px solid ${BORDER[toast.type]}`,
                boxShadow:  '0 6px 24px rgba(0,0,0,0.5)',
              }}
              initial={{ opacity: 0, y: -20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit   ={{ opacity: 0, y: -12, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            >
              {toast.emoji && <span style={{ fontSize: 22, flexShrink: 0 }}>{toast.emoji}</span>}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-white/55 text-xs mt-0.5 leading-snug">{toast.message}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
