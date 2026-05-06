import { supabase } from '@/lib/supabase';

const db = supabase as unknown as Record<string, any>;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export async function recordGameMissionProgress({
  userId,
  score,
  isWon,
  timeUsed,
  tournamentId,
}: {
  userId: string;
  score: number;
  isWon: boolean;
  timeUsed: number;
  tournamentId?: string;
}) {
  const today = todayStr();
  const { data, error } = await db
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('reset_date', today)
    .eq('completed', false);

  if (error) {
    console.error('Failed to load missions for game progress', error);
    return;
  }

  await Promise.all((data ?? []).map(async (mission: any) => {
    let progress = Number(mission.progress ?? 0);

    switch (mission.mission_type) {
      case 'play_games':
        progress += 1;
        break;
      case 'score_practice':
        if (!tournamentId && score >= mission.target) progress = mission.target;
        break;
      case 'score_tourney':
        if (tournamentId && score >= mission.target) progress = mission.target;
        break;
      case 'win_games':
        if (isWon) progress += 1;
        break;
      case 'complete_fast':
        if (isWon && timeUsed <= Number(mission.target) * 60) progress = mission.target;
        break;
      case 'foundation_cards':
        // Score awards 100 points per foundation move in the current game logic.
        progress = Math.max(progress, Math.min(Math.floor(score / 100), mission.target));
        break;
      default:
        return;
    }

    const nextProgress = Math.min(progress, Number(mission.target));
    const completed = nextProgress >= Number(mission.target);

    if (nextProgress !== Number(mission.progress) || completed !== Boolean(mission.completed)) {
      const { error: updateError } = await db
        .from('daily_missions')
        .update({ progress: nextProgress, completed })
        .eq('id', mission.id);
      if (updateError) console.error('Failed to update mission from game progress', updateError);
    }
  }));
}
