'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'teal' | 'purple' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  gold:   'gradient-gold text-purple-deep font-bold',
  teal:   'bg-teal text-purple-deep font-bold',
  purple: 'bg-purple-light text-white font-semibold',
  ghost:  'border border-white/30 text-white font-semibold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-base rounded-2xl',
  lg: 'px-7 py-3.5 text-lg rounded-2xl',
};

export default function Button({ variant = 'gold', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      className={clsx(variants[variant], sizes[size], 'select-none', className)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
