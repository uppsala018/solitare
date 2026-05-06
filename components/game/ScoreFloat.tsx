'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MOTIVATIONAL = [
  { threshold: 1000, text: '★ Keep it up!' },
  { threshold: 2000, text: 'Amazing!' },
  { threshold: 3000, text: 'Unstoppable!' },
];

interface ScoreFloatProps {
  totalScore: number;
}

export default function ScoreFloat({ totalScore }: ScoreFloatProps) {
  const shown = useRef(new Set<number>());
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const hit = MOTIVATIONAL.find((m) => totalScore >= m.threshold && !shown.current.has(m.threshold));
    if (hit) {
      shown.current.add(hit.threshold);
      setBanner(hit.text);
      const timer = setTimeout(() => setBanner(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [totalScore]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner}
            className="absolute inset-x-0 flex justify-center"
            style={{ top: '28%' }}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <div
              className="px-6 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(26,5,51,0.95)', border: '2px solid rgba(245,200,66,0.55)' }}
            >
              <p className="text-2xl text-gold" style={{ fontFamily: "'Fredoka One', cursive", textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}>
                {banner}
              </p>
              <div className="flex justify-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    style={{ fontSize: 13 }}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.1, repeat: 1 }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
