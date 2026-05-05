import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { ROYALS_PLANS } from '@/lib/shopConfig';

// Stripe price IDs for Royals plans — set these in env after creating in Stripe dashboard
const PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_ROYALS_MONTHLY_PRICE_ID || '',
  annual:  process.env.STRIPE_ROYALS_ANNUAL_PRICE_ID  || '',
};

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'placeholder') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const { plan, userId, email } = await req.json();
    const stripe = getStripeServer();

    const planDef = ROYALS_PLANS.find((p) => p.id === plan);
    if (!planDef) return NextResponse.json({ error: 'Plan not found' }, { status: 400 });

    const priceId = PRICE_IDS[plan];

    let sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0];

    if (priceId) {
      // Use pre-created Stripe price
      sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?royals=success`,
        cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
        metadata: { userId, packageId: plan, packageType: 'subscription' },
        ...(email ? { customer_email: email } : {}),
      };
    } else {
      // Inline price (no pre-created price needed)
      sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency:     'usd',
            product_data: { name: `Solitaire Crown ${planDef.label}` },
            unit_amount:  Math.round(planDef.price * 100),
            recurring:    { interval: plan === 'annual' ? 'year' : 'month' },
          },
          quantity: 1,
        }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?royals=success`,
        cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
        metadata: { userId, packageId: plan, packageType: 'subscription' },
        ...(email ? { customer_email: email } : {}),
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
