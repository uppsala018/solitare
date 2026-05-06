'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

type SupabaseResult<T> = { data: T; error: { message: string } | null };

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out. Check your connection and Supabase settings.`)), ms);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await withTimeout<SupabaseResult<Profile | null>>(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single() as unknown as Promise<SupabaseResult<Profile | null>>,
        8000,
        'Profile fetch'
      );
      if (error) console.error('Failed to fetch profile', error);
      setProfile(data ?? null);
    } catch (error) {
      console.error('Profile fetch failed', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    withTimeout(supabase.auth.getSession(), 8000, 'Session check')
      .then(({ data }) => {
        const u = data.session?.user ?? null;
        setUser(u);
        if (u) void fetchProfile(u.id);
      })
      .catch((error) => {
        console.error('Session check failed', error);
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchProfile(u.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        12000,
        'Sign in'
      );
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        void fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (error) {
      console.error('Sign in failed', error);
      return { error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  };

  const signInWithGoogle = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin ? `${origin}/auth/callback?next=/lobby` : undefined,
      },
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username },
            emailRedirectTo: origin ? `${origin}/auth/callback?next=/lobby` : undefined,
          },
        }),
        12000,
        'Sign up'
      );
      if (error) return { error: error.message };
      if (data.session?.user) {
        setUser(data.session.user);
        void fetchProfile(data.session.user.id);
        return { error: null };
      }
      return { error: null, needsConfirmation: true };
    } catch (error) {
      console.error('Sign up failed', error);
      return { error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  };

  const resetPassword = async (email: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: origin ? `${origin}/auth/callback?next=/auth` : undefined,
        }),
        12000,
        'Password reset'
      );
      return { error: error?.message ?? null };
    } catch (error) {
      console.error('Password reset failed', error);
      return { error: error instanceof Error ? error.message : 'Password reset failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  return { user, profile, loading, signIn, signInWithGoogle, signUp, resetPassword, signOut, refreshProfile };
}
