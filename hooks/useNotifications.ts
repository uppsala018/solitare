'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface AppNotification {
  id:         string;
  type:       'tournament_won' | 'milestone_reached' | 'daily_bonus_ready' | 'mission_complete' | 'general';
  title:      string;
  message:    string;
  read:       boolean;
  data?:      Record<string, unknown>;
  created_at: string;
}

const db = supabase as unknown as Record<string, any>;

export function useNotifications() {
  const { user }      = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await db.from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setNotifications((data ?? []) as AppNotification[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const channel = (supabase as any)
      .channel(`notif-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          setNotifications((prev) => [payload.new as AppNotification, ...prev]);
        }
      )
      .subscribe();

    return () => (supabase as any).removeChannel(channel);
  }, [user, fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    if (!user) return;
    await db.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await db.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead };
}
