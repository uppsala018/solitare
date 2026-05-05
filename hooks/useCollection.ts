'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import {
  COLLECTION_SETS, PACK_DEFS,
  generateRarity, collectionKey, bonusClaimedKey,
  type PackType, type SetProgress, type EarnedCard, type StoredCard,
} from '@/types/collection';

const db = supabase as unknown as Record<string, any>;

export function useCollection() {
  const { user, profile } = useAuth();

  const [progress,       setProgress]       = useState<Record<string, SetProgress>>({});
  const [loading,        setLoading]        = useState(true);
  const [bonusClaimed,   setBonusClaimed]   = useState(false);
  const [celebrationSet, setCelebrationSet] = useState<string | null>(null);

  /* ── helpers ── */
  function loadLocal(setId: string): StoredCard[] {
    if (typeof window === 'undefined' || !user) return [];
    const raw = localStorage.getItem(collectionKey(user.id, setId));
    return raw ? (JSON.parse(raw) as StoredCard[]) : [];
  }

  function saveLocal(setId: string, cards: StoredCard[]) {
    if (!user) return;
    localStorage.setItem(collectionKey(user.id, setId), JSON.stringify(cards));
  }

  /* ── fetch collection ── */
  const fetchCollection = useCallback(async () => {
    if (!user) return;

    const { data } = await db.from('card_collections')
      .select('set_name, cards_collected, completed')
      .eq('user_id', user.id);

    const map: Record<string, SetProgress> = {};
    COLLECTION_SETS.forEach((set) => {
      const cards   = loadLocal(set.id);
      const dbRow   = (data ?? []).find((r: any) => r.set_name === set.id);
      const collected = Math.max(cards.length, dbRow?.cards_collected ?? 0);
      map[set.id] = {
        setId:     set.id,
        cards:     cards.length ? cards : Array.from({ length: collected }, (_, i) => ({ n: i + 1, r: 'common' as const })),
        completed: collected >= 9,
      };
    });

    setProgress(map);

    const claimed = typeof window !== 'undefined'
      ? !!localStorage.getItem(bonusClaimedKey(user.id))
      : false;
    setBonusClaimed(claimed);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchCollection().finally(() => setLoading(false));
  }, [user, fetchCollection]);

  /* ── open pack ── */
  const openPack = useCallback(async (packType: PackType): Promise<EarnedCard[]> => {
    if (!user || !profile) return [];
    const pack = PACK_DEFS.find((p) => p.id === packType);
    if (!pack) return [];
    const gems = profile.gems ?? 0;
    if (gems < pack.cost) return [];

    // Deduct gems
    await db.from('profiles').update({ gems: gems - pack.cost }).eq('id', user.id);

    const earned: EarnedCard[] = [];

    for (let i = 0; i < pack.cards; i++) {
      const setIdx   = Math.floor(Math.random() * COLLECTION_SETS.length);
      const set      = COLLECTION_SETS[setIdx];
      const cardNum  = Math.floor(Math.random() * 9) + 1;
      const rarity   = generateRarity();
      const existing = loadLocal(set.id);
      const isDup    = existing.some((c) => c.n === cardNum);

      if (!isDup) {
        const updated = [...existing, { n: cardNum, r: rarity }];
        saveLocal(set.id, updated);

        await db.from('card_collections').upsert(
          {
            user_id:         user.id,
            set_name:        set.id,
            cards_collected: updated.length,
            cards_total:     9,
            completed:       updated.length >= 9,
          },
          { onConflict: 'user_id,set_name' }
        );

        if (updated.length >= 9) setCelebrationSet(set.id);
      }

      earned.push({ setId: set.id, setName: set.name, cardNumber: cardNum, rarity, isDuplicate: isDup });
    }

    await fetchCollection();
    await checkFullCollectionBonus();
    return earned;
  }, [user, profile, fetchCollection]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── full collection bonus ($100) ── */
  const checkFullCollectionBonus = useCallback(async () => {
    if (!user || !profile || bonusClaimed) return;
    const allDone = COLLECTION_SETS.every((s) => (progress[s.id]?.completed ?? false));
    if (!allDone) return;

    await db.from('profiles')
      .update({ cash_balance: (profile.cash_balance ?? 0) + 100 })
      .eq('id', user.id);

    localStorage.setItem(bonusClaimedKey(user.id), 'true');
    setBonusClaimed(true);
  }, [user, profile, progress, bonusClaimed]);

  /* ── utilities ── */
  const checkSetComplete  = useCallback((setId: string) => progress[setId]?.completed ?? false, [progress]);

  const getTradeableDuplicates = useCallback(() => {
    const dupes: { setId: string; setName: string; cardNumber: number; rarity: string }[] = [];
    if (!user) return dupes;
    COLLECTION_SETS.forEach((set) => {
      const cards   = loadLocal(set.id);
      const seen    = new Set<number>();
      cards.forEach((c) => {
        if (seen.has(c.n)) {
          dupes.push({ setId: set.id, setName: set.name, cardNumber: c.n, rarity: c.r });
        } else {
          seen.add(c.n);
        }
      });
    });
    return dupes;
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCollected = Object.values(progress).reduce((a, s) => a + Math.min(s.cards.length, 9), 0);

  return {
    progress,
    loading,
    totalCollected,
    bonusClaimed,
    celebrationSet,
    setCelebrationSet,
    openPack,
    checkSetComplete,
    getTradeableDuplicates,
    fetchCollection,
  };
}
