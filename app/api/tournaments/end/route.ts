import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const admin = supabaseAdmin as unknown as Record<string, any>;

export async function POST(req: NextRequest) {
  // Simple auth guard — set TOURNAMENT_END_SECRET in env
  const secret = req.headers.get('x-secret');
  if (secret !== (process.env.TOURNAMENT_END_SECRET ?? 'dev-secret')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tournamentId } = await req.json();
  if (!tournamentId) return NextResponse.json({ error: 'Missing tournamentId' }, { status: 400 });

  try {
    // Fetch tournament
    const { data: tourney } = await admin.from('tournaments').select('*').eq('id', tournamentId).single();
    if (!tourney) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

    // Fetch entries ordered by score
    const { data: entries } = await admin.from('tournament_entries')
      .select('id, user_id, score')
      .eq('tournament_id', tournamentId)
      .order('score', { ascending: false });

    if (!entries || entries.length === 0) {
      await admin.from('tournaments').update({ is_active: false }).eq('id', tournamentId);
      return NextResponse.json({ message: 'No entries, tournament closed' });
    }

    // Calculate prize distribution
    const pool = Number(tourney.prize_pool);
    const splits =
      entries.length === 1 ? [1.0] :
      entries.length === 2 ? [0.7, 0.3] :
                              [0.6, 0.3, 0.1];

    const updates = entries.slice(0, splits.length).map((entry: any, i: number) => ({
      entryId:  entry.id,
      userId:   entry.user_id,
      rank:     i + 1,
      prize:    pool * splits[i],
    }));

    interface WinnerRow { entryId: string; userId: string; rank: number; prize: number; }

    // Apply prizes and ranks
    await Promise.all([
      // Update entry ranks + prize_won
      ...updates.map((w: WinnerRow) =>
        admin.from('tournament_entries')
          .update({ rank: w.rank, prize_won: w.prize })
          .eq('id', w.entryId)
      ),
      // Update remaining entries with just rank
      ...entries.slice(splits.length).map((entry: any, i: number) =>
        admin.from('tournament_entries')
          .update({ rank: splits.length + i + 1, prize_won: 0 })
          .eq('id', entry.id)
      ),
      // Add cash to winners' profiles
      ...updates.map((w: WinnerRow) =>
        admin.from('profiles').select('cash_balance').eq('id', w.userId).single()
          .then(({ data: prof }: any) =>
            admin.from('profiles')
              .update({ cash_balance: (prof?.cash_balance ?? 0) + w.prize })
              .eq('id', w.userId)
          )
      ),
      // Close tournament
      admin.from('tournaments').update({ is_active: false }).eq('id', tournamentId),
    ]);

    // Send notifications to winners
    const notifInserts = updates.map((w: WinnerRow) => ({
      user_id: w.userId,
      type:    'tournament_won',
      title:   w.rank === 1 ? '🏆 You won!' : `You placed #${w.rank}!`,
      message: `${tourney.name} — You earned $${w.prize.toFixed(2)}!`,
    }));

    if (notifInserts.length > 0) {
      await admin.from('notifications').insert(notifInserts);
    }

    return NextResponse.json({
      distributed: updates.length,
      totalPrize:  pool,
      winners:     updates,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
