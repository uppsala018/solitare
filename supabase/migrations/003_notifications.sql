-- ============================================================
-- Solitaire Crown — notifications
-- Run in Supabase SQL editor after 002_promo_codes.sql
-- ============================================================

create table if not exists public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  type       text        not null default 'general',
  title      text        not null,
  message    text        not null default '',
  read       boolean     not null default false,
  data       jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: select own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications: update own" on public.notifications for update using (auth.uid() = user_id);
create policy "notifications: insert own" on public.notifications for insert with check (auth.uid() = user_id);

-- Enable realtime on tournament_entries so leaderboards update live
alter table public.tournament_entries replica identity full;
alter table public.notifications      replica identity full;

-- Index for fast leaderboard queries
create index if not exists idx_tournament_entries_score
  on public.tournament_entries(tournament_id, score desc);
