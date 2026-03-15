/**
 * Subscription plan definitions.
 * Map these to actual Stripe Price IDs via environment variables.
 *
 * STRIPE_PRICE_BASIC    - Price ID for Basic plan ($29/mo)
 * STRIPE_PRICE_PRO      - Price ID for Pro plan ($59/mo)
 * STRIPE_PRICE_PREMIUM  - Price ID for Premium plan ($99/mo)
 */

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    tier: 'BASIC' as const,
    name: 'Basic',
    priceMonthly: 2900,
    priceId: () => process.env.STRIPE_PRICE_BASIC ?? '',
    features: [
      'Profile listing in mechanic directory',
      'Appear in fix search results',
      'Basic analytics dashboard',
      'Customer contact via profile',
    ],
    trialDays: 7,
  },
  PRO: {
    tier: 'PRO' as const,
    name: 'Pro',
    priceMonthly: 5900,
    priceId: () => process.env.STRIPE_PRICE_PRO ?? '',
    features: [
      'Everything in Basic',
      'Priority placement in search results',
      'Advanced analytics (views, clicks, search appearances)',
      'Pro badge on profile',
    ],
    trialDays: 7,
  },
  PREMIUM: {
    tier: 'PREMIUM' as const,
    name: 'Premium',
    priceMonthly: 9900,
    priceId: () => process.env.STRIPE_PRICE_PREMIUM ?? '',
    features: [
      'Everything in Pro',
      'Featured badge — top placement',
      'Multi-mechanic shop management',
      'White-label profile options',
      'Dedicated account support',
    ],
    trialDays: 7,
  },
} as const;

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_PLANS;
