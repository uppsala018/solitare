import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const getStripe = () =>
  loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
