import { Component } from '@angular/core';
import { ServicePageComponent } from '../../components/service-page/service-page.component';
import { ServicePageConfig } from '../../components/service-page/service-page.config';

@Component({
  selector: 'app-battery-replacement',
  standalone: true,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config"></app-service-page>`,
})
export class BatteryReplacementComponent {
  readonly config: ServicePageConfig = {
    title: 'Best Prices for Car Battery Replacement',
    subtitle: 'Get an instant quote for your car',
    ctaButtonText: 'GET A FREE QUOTE',
    pricingTable: [
      { car: 'Honda Civic', listingPrice: '$300.00', yourPrice: '$270.00' },
      { car: 'Toyota Camry', listingPrice: '$320.00', yourPrice: '$288.00' },
      { car: 'Ford F-150', listingPrice: '$350.00', yourPrice: '$315.00' },
      { car: 'BMW 328i', listingPrice: '$380.00', yourPrice: '$335.97' },
      { car: 'Mercedes-Benz C300', listingPrice: '$400.00', yourPrice: '$360.00' },
      { car: 'Nissan Altima', listingPrice: '$310.00', yourPrice: '$279.00' },
      { car: 'Jeep Grand Cherokee', listingPrice: '$360.00', yourPrice: '$324.00' },
    ],
    includedItems: [
      'Battery test',
      'Battery replacement',
      'Battery terminal cleaning',
      'Battery cable inspection',
      'Battery recycling',
    ],
    description: {
      title: 'Car Battery Replacement Service',
      content: [
        'A car battery replacement is essential when your vehicle\'s battery can no longer hold a charge or fails to start your engine. Our mobile mechanics come to your location to test, remove, and replace your battery with a new one that meets or exceeds your vehicle\'s specifications.',
        'Car batteries typically last 3-5 years, but extreme temperatures, frequent short trips, and electrical issues can shorten their lifespan. Signs of a failing battery include slow engine cranking, dim headlights, dashboard warning lights, and the engine not starting.',
      ],
      sections: [
        {
          title: 'Why choose mobile battery replacement?',
          content:
            'Our certified mechanics bring the battery to you, test your current battery and charging system, and install the new battery on-site. No need to jump-start your car or find a ride to the auto parts store. We handle everything, including proper disposal of your old battery.',
        },
        {
          title: 'What types of batteries are available?',
          content:
            'We stock a wide range of batteries including standard lead-acid, AGM (Absorbent Glass Mat), and lithium-ion batteries. Our mechanics will recommend the best battery type for your vehicle based on your make, model, and driving habits.',
        },
        {
          title: 'How long does battery replacement take?',
          content:
            'A mobile battery replacement typically takes 20-30 minutes. Our mechanics arrive with all necessary tools and equipment, test your current battery and charging system, and install the new battery while you continue with your day.',
        },
      ],
    },
    articles: [
      {
        title: 'How to tell if your car battery is dead',
        description: 'Learn the warning signs of a failing car battery.',
      },
      {
        title: 'How long do car batteries last?',
        description: 'Understanding battery lifespan and when to replace.',
      },
      {
        title: 'Alternator or Car Battery: How to Tell Which Part is the Problem',
        description: 'Diagnosing whether your issue is the battery or alternator.',
      },
    ],
  };
}














