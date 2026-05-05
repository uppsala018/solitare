import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { GEM_PACKAGES, CASH_PACKAGES } from '@/lib/shopConfig';

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'placeholder') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const { packageId, packageType, userId } = await req.json();
    const stripe = getStripeServer();

    let amount = 0;
    let description = '';

    if (packageType === 'gems') {
      const pkg = GEM_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 400 });
      amount = Math.round(pkg.price * 100);
      description = `${pkg.gems} Gems`;
    } else if (packageType === 'cash') {
      const pkg = CASH_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 400 });
      amount = Math.round(pkg.price * 100);
      description = `$${pkg.cash} Bonus Cash`;
    } else {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description,
      metadata: { userId, packageId, packageType },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
