'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gradient-purple z-50">
      {/* Crown SVG */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8"
      >
        <svg
          width="100"
          height="80"
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M10 65 L10 30 L30 50 L50 10 L70 50 L90 30 L90 65 Z"
            fill="#f5c842"
            stroke="#c49a1a"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <motion.rect
            x="8" y="63" width="84" height="10" rx="3"
            fill="#c49a1a"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          />
          {/* Jewels */}
          {[22, 50, 78].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx} cy={68} r={4}
              fill={i === 1 ? '#00d4aa' : '#ff3d3d'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 1 + i * 0.15 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-5xl font-bold tracking-wide glow-gold text-gold"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 0.7, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', delay: 0.4 }}
      >
        Solitaire Crown
      </motion.h1>

      {/* Loading dots */}
      <motion.div
        className="flex gap-2 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gold"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
