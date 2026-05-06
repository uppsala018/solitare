'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { PackType } from '@/types/collection';

const db = supabase as unknown as Record<string, any>;

export function useShop() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const initiatePurchase = useCallback(async (
    packageId: string,
    packageType: 'gems' | 'cash' | 'subscription'
  ) => {
    if (!user) { setError('Please sign in to purchase.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ packageId, packageType, userId: user.id, email: user.email }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      if (json.url) window.location.href = json.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const purchaseGems  = useCallback((id: string) => initiatePurchase(id, 'gems'),         [initiatePurchase]);
  const purchaseCash  = useCallback((id: string) => initiatePurchase(id, 'cash'),         [initiatePurchase]);
  const subscribeRoyals = useCallback((plan: string) => initiatePurchase(plan, 'subscription'), [initiatePurchase]);

  const redeemPromoCode = useCallback(async (code: string): Promise<{ success: boolean; message: string; reward?: { type: string; amount: number } }> => {
    if (!user || !profile) return { success: false, message: 'Sign in required' };

    const upper = code.trim().toUpperCase();

    // Check if code exists and is valid
    const { data: codeRow } = await db.from('promo_codes')
      .select('*')
      .eq('code', upper)
      .eq('active', true)
      .single();

    if (!codeRow) return { success: false, message: 'Invalid or expired code' };
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      return { success: false, message: 'This code has expired' };
    }
    if (codeRow.max_uses !== null && codeRow.used_count >= codeRow.max_uses) {
      return { success: false, message: 'This code has reached its usage limit' };
    }

    // Check if user already claimed this code
    const { data: alreadyClaimed } = await db.from('promo_code_claims')
      .select('id')
      .eq('user_id', user.id)
      .eq('code', upper)
      .single();

    if (alreadyClaimed) return { success: false, message: 'You have already used this code' };

    // Apply reward
    const amount = Number(codeRow.reward_amount);
    const updates: Record<string, number> = {};
    switch (codeRow.reward_type) {
      case 'tokens': updates.lightning_tokens = (profile.lightning_tokens ?? 0) + amount; break;
      case 'gems':   updates.gems             = (profile.gems   ?? 0) + amount; break;
      case 'cash':   updates.cash_balance     = (profile.cash_balance ?? 0) + amount; break;
    }

    await Promise.all([
      db.from('profiles').update(updates).eq('id', user.id),
      db.from('promo_code_claims').insert({ user_id: user.id, code: upper }),
      db.from('promo_codes').update({ used_count: codeRow.used_count + 1 }).eq('code', upper),
    ]);

    return { success: true, message: `Code applied! +${amount} ${codeRow.reward_type}`, reward: { type: codeRow.reward_type, amount } };
  }, [user, profile]);

  return { loading, error, setError, purchaseGems, purchaseCash, subscribeRoyals, redeemPromoCode };
}
