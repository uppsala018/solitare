-- ============================================================
-- Solitaire Crown - tournament RPC helpers
-- Run in Supabase SQL editor after 003_notifications.sql
-- ============================================================

create or replace function public.enter_tournament_atomic(p_tournament_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tournament public.tournaments%rowtype;
  v_balance numeric;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Sign in required');
  end if;

  select * into v_tournament
  from public.tournaments
  where id = p_tournament_id
  for update;

  if not found or not v_tournament.is_active or v_tournament.ends_at <= now() then
    return jsonb_build_object('success', false, 'error', 'Tournament not available');
  end if;

  if v_tournament.current_players >= v_tournament.max_players then
    return jsonb_build_object('success', false, 'error', 'Tournament is full');
  end if;

  if exists (
    select 1 from public.tournament_entries
    where tournament_id = p_tournament_id and user_id = v_user_id
  ) then
    return jsonb_build_object('success', false, 'error', 'You already entered this tournament');
  end if;

  select cash_balance into v_balance
  from public.profiles
  where id = v_user_id
  for update;

  if coalesce(v_balance, 0) < v_tournament.entry_fee then
    return jsonb_build_object(
      'success', false,
      'error', format('Need $%s - you have $%s', v_tournament.entry_fee, coalesce(v_balance, 0))
    );
  end if;

  update public.profiles
  set cash_balance = cash_balance - v_tournament.entry_fee
  where id = v_user_id;

  insert into public.tournament_entries (tournament_id, user_id, score)
  values (p_tournament_id, v_user_id, 0);

  update public.tournaments
  set current_players = current_players + 1
  where id = p_tournament_id;

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.submit_tournament_score(
  p_tournament_id uuid,
  p_score integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Sign in required');
  end if;

  update public.tournament_entries
  set score = greatest(score, p_score),
      rank = null
  where tournament_id = p_tournament_id
    and user_id = v_user_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Tournament entry not found');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.get_tournament_leaderboard(p_tournament_id uuid)
returns table (
  user_id uuid,
  username text,
  score integer,
  prize_won numeric,
  rank integer
)
language sql
security definer
set search_path = public
as $$
  select
    e.user_id,
    coalesce(p.username, 'Player') as username,
    e.score,
    e.prize_won,
    row_number() over (order by e.score desc, e.entered_at asc)::integer as rank
  from public.tournament_entries e
  left join public.profiles p on p.id = e.user_id
  where e.tournament_id = p_tournament_id
  order by e.score desc, e.entered_at asc;
$$;

grant execute on function public.enter_tournament_atomic(uuid) to authenticated;
grant execute on function public.submit_tournament_score(uuid, integer) to authenticated;
grant execute on function public.get_tournament_leaderboard(uuid) to authenticated, anon;
