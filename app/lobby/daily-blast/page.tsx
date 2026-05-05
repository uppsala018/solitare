'use client';

import { motion } from 'framer-motion';
import DailyBlastContent from '@/components/lobby/DailyBlastContent';

export default function DailyBlastPage() {
  return (
    <motion.div
      className="min-h-screen gradient-purple"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DailyBlastContent />
    </motion.div>
  );
}
