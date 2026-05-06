# Solitaire Crown

Solitaire Crown is a mobile-first solitaire game built with Next.js, Supabase, Stripe, Framer Motion, and PWA support. It includes lobby missions, card collection, tournament entry, realtime leaderboards, profile history, and shop flows.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Realtime, RLS, RPC
- Stripe Checkout and webhooks
- Framer Motion
- Zustand persisted client state
- next-pwa
- Capacitor dependencies for future iOS/Android packaging

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=placeholder
STRIPE_WEBHOOK_SECRET=
STRIPE_ROYALS_MONTHLY_PRICE_ID=
STRIPE_ROYALS_ANNUAL_PRICE_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
TOURNAMENT_END_SECRET=change-me
```

3. Run migrations in Supabase SQL editor in order:

```text
supabase/migrations/001_initial.sql
supabase/migrations/002_promo_codes.sql
supabase/migrations/003_notifications.sql
supabase/migrations/004_tournament_functions.sql
```

4. Optional seed data:

```text
supabase/seed.sql
```

5. Start development:

```bash
npm run dev
```

## Stripe Setup

Stripe is optional during development. If keys are set to `placeholder`, purchase APIs return `503` instead of crashing the app.

For live Stripe:

1. Create products/prices in Stripe for Royals monthly and annual plans.
2. Put the price IDs in `STRIPE_ROYALS_MONTHLY_PRICE_ID` and `STRIPE_ROYALS_ANNUAL_PRICE_ID`.
3. Create a webhook endpoint pointing to:

```text
https://your-domain.com/api/stripe/webhook
```

4. Subscribe to at least:

```text
checkout.session.completed
customer.subscription.deleted
```

5. Put the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

## Deployment

Deploy to Vercel with these environment variables configured:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_ROYALS_MONTHLY_PRICE_ID
STRIPE_ROYALS_ANNUAL_PRICE_ID
NEXT_PUBLIC_APP_URL
TOURNAMENT_END_SECRET
```

Build check:

```bash
npm run build
```

## Tournament Operations

Tournament entry and score submission use Supabase RPC functions from `004_tournament_functions.sql`:

- `enter_tournament_atomic`
- `submit_tournament_score`
- `get_tournament_leaderboard`

This avoids inconsistent client-side balance, entry, and player-count updates.

To close a tournament and distribute prizes, call:

```bash
curl -X POST https://your-domain.com/api/tournaments/end \
  -H "Content-Type: application/json" \
  -H "x-secret: $TOURNAMENT_END_SECRET" \
  -d '{"tournamentId":"TOURNAMENT_UUID"}'
```

## Mobile Builds

Capacitor packages are installed, but production mobile export needs a separate static/mobile build strategy because this app uses server API routes for Stripe and tournaments. Do not rely on `next export` for the current app without replacing those server routes with hosted APIs.

## Folder Structure

- `app/` - Next.js routes, API routes, app shell, global pages
- `components/` - game, lobby, gifts, collection, and UI components
- `hooks/` - Supabase, game, shop, tournament, sound, and daily feature hooks
- `lib/` - Supabase clients, Stripe helper, sound engine, game logic, shop config
- `store/` - persisted Zustand game settings
- `supabase/` - SQL migrations and seed data
- `types/` - shared TypeScript types
- `public/` - PWA manifest, icons, robots, sitemap, generated service worker

## Verification

Current baseline:

```bash
npx tsc --noEmit
npm run build
```

`npm run lint` still requires adding an ESLint config before it can run non-interactively.
