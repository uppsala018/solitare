'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ScoreEvent } from '@/hooks/useGame';

interface ScorePopupProps {
  events: ScoreEvent[];
}

export default function ScorePopup({ events }: ScorePopupProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {events.map((event, index) => {
          const foundation = event.amount >= 100;
          return (
            <motion.div
              key={event.id}
              className="absolute left-1/2 font-black text-gold"
              style={{
                top: `${34 + index * 4}%`,
                x: '-50%',
                fontFamily: "'Fredoka One', cursive",
                fontSize: foundation ? 28 : 22,
                textShadow: '0 2px 8px rgba(0,0,0,0.45)',
              }}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -60, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              +{event.amount}{foundation ? ' FOUNDATION!' : ''}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
