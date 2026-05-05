'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';

const TYPE_EMOJI: Record<string, string> = {
  tournament_won:    '🏆',
  milestone_reached: '⚡',
  daily_bonus_ready: '🎁',
  mission_complete:  '✅',
  general:           '📢',
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle() {
    setOpen((o) => !o);
  }

  return (
    <div ref={ref} className="relative">
      <motion.button
        className="relative p-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        whileTap={{ scale: 0.93 }}
        onClick={toggle}
        aria-label="Notifications"
      >
        <Bell size={18} className="text-white/80" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#ff3d3d', color: 'white' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-11 w-72 rounded-2xl overflow-hidden z-40"
            style={{ background: 'rgba(26,5,51,0.97)', border: '1px solid rgba(245,200,66,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit   ={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-bold text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-white/40 hover:text-white/70">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X size={14} className="text-white/40" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <span style={{ fontSize: 32 }}>🔔</span>
                  <p className="text-white/30 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <NotifRow key={n.id} notif={n} onRead={markRead} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifRow({ notif, onRead }: { notif: AppNotification; onRead: (id: string) => void }) {
  const ago = timeAgo(notif.created_at);
  return (
    <motion.button
      className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/5 last:border-0"
      style={{ background: notif.read ? 'transparent' : 'rgba(245,200,66,0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_EMOJI[notif.type] ?? '📢'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-tight ${notif.read ? 'text-white/60' : 'text-white font-semibold'}`}>
          {notif.title}
        </p>
        {notif.message && (
          <p className="text-white/40 text-[10px] mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
        )}
        <p className="text-white/25 text-[9px] mt-1">{ago}</p>
      </div>
      {!notif.read && (
        <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
      )}
    </motion.button>
  );
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)   return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
