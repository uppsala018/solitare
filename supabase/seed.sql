-- ============================================================
-- Solitaire Crown — seed tournaments
-- ============================================================
insert into public.tournaments (name, theme, prize_pool, entry_fee, max_players, current_players, ends_at, multiplier, is_active)
values
  (
    'Colossal Cup',
    'Funky Fiesta',
    108.00, 6.00, 25, 3,
    now() + interval '5 hours',
    30, true
  ),
  (
    'Peak Top Four',
    'Funky Fiesta',
    44.00, 6.00, 10, 2,
    now() + interval '5 hours',
    30, true
  ),
  (
    'Top Tier Seven',
    'Funky Fiesta',
    30.00, 6.00, 7, 1,
    now() + interval '5 hours',
    27, true
  ),
  (
    'Golden Duo',
    'Funky Fiesta',
    150.00, 25.00, 8, 0,
    now() + interval '5 hours',
    125, true
  ),
  (
    'Quick Five',
    'Funky Fiesta',
    20.00, 3.00, 15, 5,
    now() + interval '5 hours',
    20, true
  ),
  (
    'Crown Championship',
    'Funky Fiesta',
    500.00, 50.00, 20, 1,
    now() + interval '5 hours',
    200, true
  );
