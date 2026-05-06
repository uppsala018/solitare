export interface GemPackage {
  id: string;
  label: string;
  gems: number;
  price: number;
  badge?: string;
  popular?: boolean;
}

export interface CashPackage {
  id: string;
  label: string;
  cash: number;
  price: number;
  badge?: string;
}

export interface RoyalsPlan {
  id: 'monthly' | 'annual';
  label: string;
  price: number;
  period: string;
  badge?: string;
  savePct?: number;
}

// Edit prices here. Stripe Checkout uses inline price_data, so you do not need
// to manually create products or prices in Stripe Dashboard.
export const GEM_PACKAGES: GemPackage[] = [
  { id: 'starter', label: 'Starter', gems: 100, price: 0.99 },
  { id: 'popular', label: 'Popular', gems: 550, price: 4.99, badge: 'BEST VALUE', popular: true },
  { id: 'pro', label: 'Pro', gems: 1200, price: 9.99 },
  { id: 'mega', label: 'Mega', gems: 2500, price: 19.99 },
  { id: 'ultimate', label: 'Ultimate', gems: 6500, price: 49.99 },
];

export const CASH_PACKAGES: CashPackage[] = [
  { id: 'cash_5', label: '$5 Bonus Cash', cash: 5, price: 4.99 },
  { id: 'cash_10', label: '$10 Bonus Cash', cash: 10, price: 9.99, badge: 'POPULAR' },
  { id: 'cash_25', label: '$25 Bonus Cash', cash: 25, price: 24.99 },
];

export const ROYALS_PLANS: RoyalsPlan[] = [
  { id: 'monthly', label: 'Monthly Royals', price: 9.99, period: '/month' },
  { id: 'annual', label: 'Annual Royals', price: 59.99, period: '/year', badge: 'SAVE 50%', savePct: 50 },
];

export const ROYALS_PERKS = [
  '2x daily bonus tokens',
  '2x Weekly Blast tokens',
  'Exclusive Royals tournaments',
  'Ad-free experience',
  'Priority customer support',
  'Crown badge on profile',
];
