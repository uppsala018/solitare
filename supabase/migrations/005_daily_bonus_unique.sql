-- ============================================================
-- Solitaire Crown - prevent multiple daily bonus claims per day
-- Run in Supabase SQL editor after 004_tournament_functions.sql
-- ============================================================

create unique index if not exists idx_daily_bonus_claims_user_claim_date
  on public.daily_bonus_claims (user_id, ((claimed_at at time zone 'utc')::date));
