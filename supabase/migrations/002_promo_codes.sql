-- ============================================================
-- Solitaire Crown — promo codes, social claims
-- Run this in Supabase SQL editor after 001_initial.sql
-- ============================================================

-- promo_codes
create table if not exists public.promo_codes (
  id            uuid          primary key default gen_random_uuid(),
  code          text          unique not null,
  reward_type   text          not null check (reward_type in ('tokens', 'gems', 'cash')),
  reward_amount numeric(10,2) not null,
  max_uses      integer,
  used_count    integer       not null default 0,
  expires_at    timestamptz,
  active        boolean       not null default true,
  created_at    timestamptz   not null default now()
);

-- promo_code_claims
create table if not exists public.promo_code_claims (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  code       text        not null,
  claimed_at timestamptz not null default now(),
  unique(user_id, code)
);

-- social_claims (track once-per-platform follows)
create table if not exists public.social_claims (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  platform   text        not null,
  claimed_at timestamptz not null default now(),
  unique(user_id, platform)
);

-- RLS
alter table public.promo_codes       enable row level security;
alter table public.promo_code_claims enable row level security;
alter table public.social_claims     enable row level security;

create policy "promo_codes: read active"   on public.promo_codes       for select using (active = true);
create policy "promo_claims: select own"   on public.promo_code_claims for select using (auth.uid() = user_id);
create policy "promo_claims: insert own"   on public.promo_code_claims for insert with check (auth.uid() = user_id);
create policy "social_claims: select own"  on public.social_claims     for select using (auth.uid() = user_id);
create policy "social_claims: insert own"  on public.social_claims     for insert with check (auth.uid() = user_id);

-- Seed promo codes
insert into public.promo_codes (code, reward_type, reward_amount, max_uses, active) values
  ('WELCOME',   'tokens', 100,  null, true),
  ('BONUS50',   'gems',    50,  1000, true),
  ('CROWN2024', 'cash',     5,   100, true)
on conflict (code) do nothing;
