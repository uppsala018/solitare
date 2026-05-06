import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { CASH_PACKAGES, GEM_PACKAGES, ROYALS_PLANS } from '@/lib/shopConfig';

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'placeholder') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const { packageId, packageType, userId, email } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const stripe = getStripeServer();

    if (packageType === 'subscription') {
      const plan = ROYALS_PLANS.find((p) => p.id === packageId);
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Solitaire Crown ${plan.label}` },
            unit_amount: Math.round(plan.price * 100),
            recurring: { interval: packageId === 'annual' ? 'year' : 'month' },
          },
          quantity: 1,
        }],
        success_url: `${appUrl}/shop?royals=success`,
        cancel_url: `${appUrl}/shop`,
        metadata: { userId, packageId, packageType },
        ...(email ? { customer_email: email } : {}),
      });

      return NextResponse.json({ url: session.url });
    }

    const isGems = packageType === 'gems';
    const gemPackage = isGems ? GEM_PACKAGES.find((p) => p.id === packageId) : undefined;
    const cashPackage = !isGems ? CASH_PACKAGES.find((p) => p.id === packageId) : undefined;
    const price = gemPackage?.price ?? cashPackage?.price;
    const productName = gemPackage ? `${gemPackage.gems} Gems` : cashPackage ? `$${cashPackage.cash} Bonus Cash` : null;

    if (!price || !productName) return NextResponse.json({ error: 'Package not found' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/shop?success=1`,
      cancel_url: `${appUrl}/shop`,
      metadata: { userId, packageId, packageType },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create Stripe checkout session', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
