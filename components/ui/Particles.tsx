'use client';

import { motion, AnimatePresence } from 'framer-motion';

type ParticleKind = 'confetti' | 'stars' | 'cash' | 'sparkle';

interface ParticlesProps {
  active: boolean;
  kind?: ParticleKind;
  count?: number;
  origin?: { x: string; y: string };
}

const COLORS = ['#f5c842', '#00d4aa', '#39ff14', '#ff3d3d', '#a78bfa', '#ffffff'];

export default function Particles({ active, kind = 'confetti', count = 50, origin = { x: '50%', y: '42%' } }: ParticlesProps) {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const distance = 90 + (i % 7) * 22;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + 120,
      rotate: (i % 2 ? 1 : -1) * (180 + i * 11),
      color: COLORS[i % COLORS.length],
      delay: (i % 10) * 0.015,
    };
  });

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {particles.map((p, i) => (
            <motion.span
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                left: origin.x,
                top: origin.y,
                color: p.color,
                width: kind === 'confetti' ? 7 : 14,
                height: kind === 'confetti' ? 12 : 14,
                background: kind === 'confetti' || kind === 'sparkle' ? p.color : 'transparent',
                borderRadius: kind === 'sparkle' ? 999 : kind === 'confetti' ? 2 : undefined,
                fontSize: kind === 'cash' ? 18 : 14,
              }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate, scale: kind === 'sparkle' ? 0.2 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: p.delay }}
            >
              {kind === 'stars' ? '★' : kind === 'cash' ? '$' : ''}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
