import { Component } from '@angular/core';
import { ServicePageComponent } from '../../components/service-page/service-page.component';
import { ServicePageConfig } from '../../components/service-page/service-page.config';

@Component({
  selector: 'app-brake-pad-replacement',
  standalone: true,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config"></app-service-page>`,
})
export class BrakePadReplacementComponent {
  readonly config: ServicePageConfig = {
    title: 'Best Prices for Brake Pad Replacement',
    subtitle: 'We bring the shop to you. Get an instant quote for your car.',
    ctaButtonText: 'GET A FREE QUOTE',
    pricingTable: [
      { car: 'Honda Civic', listingPrice: '$200 - $300', yourPrice: '$180 - $270' },
      { car: 'Toyota Camry', listingPrice: '$220 - $320', yourPrice: '$198 - $288' },
      { car: 'Ford F-150', listingPrice: '$250 - $350', yourPrice: '$225 - $315' },
      { car: 'BMW 3 Series', listingPrice: '$300 - $400', yourPrice: '$270 - $360' },
      { car: 'Mercedes-Benz C-Class', listingPrice: '$320 - $420', yourPrice: '$288 - $378' },
      { car: 'Nissan Altima', listingPrice: '$210 - $310', yourPrice: '$189 - $279' },
    ],
    includedItems: [
      'New brake pads',
      'Brake fluid check and top-off',
      'Brake system inspection',
      '12-month/12,000-mile warranty',
    ],
    description: {
      title: 'Brake Pad Replacement Service',
      content: [
        'Brake pad replacement is a critical safety service that ensures your vehicle can stop safely and effectively. Our certified mobile mechanics come to your location to inspect your brake system, replace worn brake pads, and ensure everything is working correctly.',
        'Brake pads typically need replacement every 30,000 to 70,000 miles, depending on driving habits and conditions. Signs that you need new brake pads include squealing or grinding noises, reduced stopping power, vibration when braking, or the brake warning light on your dashboard.',
      ],
      sections: [
        {
          title: 'Here\'s what\'s included in your brake pad replacement',
          content:
            'Our service includes inspection of your entire brake system, replacement of worn brake pads with high-quality parts, brake fluid check and top-off if needed, and a thorough test drive to ensure everything is working correctly. We also inspect rotors, calipers, and brake lines for any issues.',
        },
        {
          title: 'Why you should choose Mechanic Dispatch',
          content:
            'Our ASE-certified mechanics use only high-quality brake pads that meet or exceed OEM specifications. We provide transparent, upfront pricing with no hidden fees, and all work is backed by our 12-month/12,000-mile warranty. Plus, we come to you, saving you time and hassle.',
        },
        {
          title: 'When to get a brake pad replacement',
          content:
            'If you hear squealing or grinding when braking, notice reduced stopping power, feel vibration in the steering wheel or brake pedal, or see the brake warning light, it\'s time to have your brakes inspected. Don\'t wait—brake issues can be dangerous and lead to more expensive repairs if ignored.',
        },
      ],
    },
    articles: [
      {
        title: 'What are the signs of a bad brake pad?',
        description: 'Learn to recognize when your brake pads need replacement.',
      },
      {
        title: 'How often should I replace my brake pads?',
        description: 'Understanding brake pad lifespan and replacement intervals.',
      },
      {
        title: 'How much does brake pad replacement cost?',
        description: 'A guide to brake pad replacement pricing.',
      },
    ],
  };
}



















