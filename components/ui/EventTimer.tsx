'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  d: number; h: number; m: number; s: number; total: number;
}

function calcTimeLeft(endsAt: Date): TimeLeft {
  const total = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    total,
  };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

interface EventTimerProps {
  /** ISO string or Date */
  endsAt: string | Date;
  label?: string;
  /** Optional event name */
  name?: string;
  /** Optional goal/description */
  goal?: string;
  compact?: boolean;
  onExpire?: () => void;
}

export default function EventTimer({ endsAt, label, name, goal, compact, onExpire }: EventTimerProps) {
  const end        = useRef(new Date(endsAt));
  const [t, setT]  = useState<TimeLeft>(() => calcTimeLeft(end.current));
  const onExpRef   = useRef(onExpire);
  onExpRef.current = onExpire;

  useEffect(() => {
    end.current = new Date(endsAt);
    setT(calcTimeLeft(end.current));
  }, [endsAt]);

  useEffect(() => {
    const id = setInterval(() => {
      const next = calcTimeLeft(end.current);
      setT(next);
      if (next.total === 0) { clearInterval(id); onExpRef.current?.(); }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <span className="font-mono tabular-nums text-gold text-sm font-bold">
        {t.d > 0 ? `${t.d}d ` : ''}{pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {name && (
        <p className="text-white font-semibold text-sm">{name}</p>
      )}
      {label && (
        <p className="text-white/50 text-xs">{label}</p>
      )}
      <div className="flex items-center gap-1">
        {t.d > 0 && <TimeUnit value={t.d} unit="d" />}
        <TimeUnit value={t.h} unit="h" />
        <span className="text-gold/60 font-bold text-sm mb-1">:</span>
        <TimeUnit value={t.m} unit="m" />
        <span className="text-gold/60 font-bold text-sm mb-1">:</span>
        <TimeUnit value={t.s} unit="s" />
      </div>
      {goal && <p className="text-white/40 text-xs">{goal}</p>}
    </div>
  );
}

function TimeUnit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={value}
        className="font-mono font-bold text-gold tabular-nums"
        style={{ fontSize: 18 }}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {pad(value)}
      </motion.span>
      <span className="text-white/30 text-[9px] uppercase">{unit}</span>
    </div>
  );
}
