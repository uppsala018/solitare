import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GEM_PACKAGES, CASH_PACKAGES } from '@/lib/shopConfig';

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || stripeKey === 'placeholder') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const sig  = req.headers.get('stripe-signature') ?? '';
  const body = await req.text();
  const stripe = getStripeServer();

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(body, sig, webhookSecret)
      : JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = supabaseAdmin as unknown as Record<string, any>;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session  = event.data.object as Record<string, any>;
      const userId     = session.metadata?.userId;
      const packageId  = session.metadata?.packageId;
      const pkgType    = session.metadata?.packageType;
      if (!userId) break;

      if (pkgType === 'gems') {
        const pkg = GEM_PACKAGES.find((p) => p.id === packageId);
        if (pkg) {
          const { data: prof } = await admin.from('profiles').select('gems').eq('id', userId).single();
          await admin.from('profiles').update({ gems: (prof?.gems ?? 0) + pkg.gems }).eq('id', userId);
        }
      } else if (pkgType === 'cash') {
        const pkg = CASH_PACKAGES.find((p) => p.id === packageId);
        if (pkg) {
          const { data: prof } = await admin.from('profiles').select('cash_balance').eq('id', userId).single();
          await admin.from('profiles').update({ cash_balance: (prof?.cash_balance ?? 0) + pkg.cash }).eq('id', userId);
        }
      } else if (pkgType === 'subscription') {
        const expiresAt = packageId === 'annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() +  30 * 24 * 60 * 60 * 1000).toISOString();
        await admin.from('profiles').update({ royals_tier: true, royals_expires_at: expiresAt }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Record<string, any>;
      const userId = sub.metadata?.userId;
      if (userId) {
        await admin.from('profiles').update({ royals_tier: false, royals_expires_at: null }).eq('id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
