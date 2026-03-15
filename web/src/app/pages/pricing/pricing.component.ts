import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Plan {
  tier: string;
  name: string;
  price: number;
  badge?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent {
  readonly plans: Plan[] = [
    {
      tier: 'BASIC',
      name: 'Basic',
      price: 29,
      features: [
        'Profile listing in mechanic directory',
        'Appear in fix search results',
        'Basic analytics dashboard',
        'Customer contact via your profile',
        '7-day free trial',
      ],
      cta: 'Start free trial',
      highlighted: false,
    },
    {
      tier: 'PRO',
      name: 'Pro',
      price: 59,
      badge: 'Most popular',
      features: [
        'Everything in Basic',
        'Priority placement in search results',
        'Advanced analytics (views, clicks, appearances)',
        'Pro badge on your profile',
        'Search keyword performance insights',
        '7-day free trial',
      ],
      cta: 'Start free trial',
      highlighted: true,
    },
    {
      tier: 'PREMIUM',
      name: 'Premium',
      price: 99,
      features: [
        'Everything in Pro',
        'Featured badge — top search placement',
        'Multi-mechanic shop management',
        'White-label profile options',
        'Dedicated account support',
        '7-day free trial',
      ],
      cta: 'Start free trial',
      highlighted: false,
    },
  ];

  readonly faqs = [
    {
      q: 'Is there a free trial?',
      a: 'Yes — every plan includes a 7-day free trial. Your card is charged after the trial ends. Cancel anytime.',
    },
    {
      q: 'How does the search matching work?',
      a: 'When a driver searches for a repair (e.g. "brake grinding"), we match their search to mechanics whose listed skills include brake repair. You appear automatically.',
    },
    {
      q: 'What does "priority placement" mean?',
      a: 'Pro and Premium mechanics appear higher in search results than Basic tier mechanics, and are more likely to be shown when a relevant search is performed.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Cancel with one click from your dashboard. You\'ll remain active until the end of your billing period.',
    },
    {
      q: 'Is there a contract or commitment?',
      a: 'No contracts. All plans are billed month-to-month. Upgrade, downgrade, or cancel at any time.',
    },
    {
      q: 'How do drivers contact me?',
      a: 'Drivers can view your profile, which shows your phone number, website, and location. We track profile views and link clicks so you can see your interest metrics.',
    },
  ];
}
