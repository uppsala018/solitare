-- ============================================================
-- Solitaire Crown — initial schema
-- ============================================================

-- profiles
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  username          text unique,
  avatar_url        text,
  cash_balance      decimal(10,2) not null default 0.00,
  gems              integer       not null default 125,
  lightning_tokens  integer       not null default 0,
  level             integer       not null default 1,
  xp                integer       not null default 0,
  xp_to_next_level  integer       not null default 1000,
  royals_tier       boolean       not null default false,
  royals_expires_at timestamptz,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

-- tournaments
create table if not exists public.tournaments (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  theme           text        not null default 'Funky Fiesta',
  prize_pool      decimal(10,2) not null default 0.00,
  entry_fee       decimal(10,2) not null default 0.00,
  max_players     integer     not null default 10,
  current_players integer     not null default 0,
  ends_at         timestamptz not null,
  multiplier      integer     not null default 1,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now()
);

-- tournament_entries
create table if not exists public.tournament_entries (
  id            uuid        primary key default gen_random_uuid(),
  tournament_id uuid        not null references public.tournaments(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  score         integer     not null default 0,
  rank          integer,
  prize_won     decimal(10,2) not null default 0.00,
  entered_at    timestamptz not null default now(),
  unique(tournament_id, user_id)
);

-- daily_missions
create table if not exists public.daily_missions (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references public.profiles(id) on delete cascade,
  mission_type        text        not null,
  mission_description text        not null,
  target              integer     not null default 1,
  progress            integer     not null default 0,
  reward_tokens       integer     not null default 1,
  completed           boolean     not null default false,
  reset_date          date        not null default current_date
);

-- card_collections
create table if not exists public.card_collections (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.profiles(id) on delete cascade,
  set_name         text        not null,
  cards_collected  integer     not null default 0,
  cards_total      integer     not null default 13,
  completed        boolean     not null default false,
  prize_won        decimal(10,2) not null default 0.00,
  created_at       timestamptz not null default now(),
  unique(user_id, set_name)
);

-- daily_bonus_claims
create table if not exists public.daily_bonus_claims (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.profiles(id) on delete cascade,
  claimed_at     timestamptz not null default now(),
  tokens_awarded integer     not null default 0,
  streak_day     integer     not null default 1
);

-- game_sessions
create table if not exists public.game_sessions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.profiles(id) on delete cascade,
  tournament_id  uuid        references public.tournaments(id) on delete set null,
  score          integer     not null default 0,
  moves          integer     not null default 0,
  time_remaining integer     not null default 0,
  completed      boolean     not null default false,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- Updated_at trigger for profiles
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.tournaments        enable row level security;
alter table public.tournament_entries enable row level security;
alter table public.daily_missions     enable row level security;
alter table public.card_collections   enable row level security;
alter table public.daily_bonus_claims enable row level security;
alter table public.game_sessions      enable row level security;

-- profiles: own row only
create policy "profiles: select own"  on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own"  on public.profiles for update using (auth.uid() = id);

-- tournaments: everyone can read active tournaments
create policy "tournaments: read active" on public.tournaments for select using (is_active = true);

-- tournament_entries
create policy "entries: select own"  on public.tournament_entries for select using (auth.uid() = user_id);
create policy "entries: insert own"  on public.tournament_entries for insert with check (auth.uid() = user_id);
create policy "entries: update own"  on public.tournament_entries for update using (auth.uid() = user_id);

-- daily_missions
create policy "missions: select own" on public.daily_missions for select using (auth.uid() = user_id);
create policy "missions: insert own" on public.daily_missions for insert with check (auth.uid() = user_id);
create policy "missions: update own" on public.daily_missions for update using (auth.uid() = user_id);

-- card_collections
create policy "collections: select own" on public.card_collections for select using (auth.uid() = user_id);
create policy "collections: insert own" on public.card_collections for insert with check (auth.uid() = user_id);
create policy "collections: update own" on public.card_collections for update using (auth.uid() = user_id);

-- daily_bonus_claims
create policy "bonus: select own" on public.daily_bonus_claims for select using (auth.uid() = user_id);
create policy "bonus: insert own" on public.daily_bonus_claims for insert with check (auth.uid() = user_id);

-- game_sessions
create policy "sessions: select own" on public.game_sessions for select using (auth.uid() = user_id);
create policy "sessions: insert own" on public.game_sessions for insert with check (auth.uid() = user_id);
create policy "sessions: update own" on public.game_sessions for update using (auth.uid() = user_id);
