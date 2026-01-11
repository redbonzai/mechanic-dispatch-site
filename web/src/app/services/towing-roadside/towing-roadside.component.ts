import { Component } from '@angular/core';
import { ServicePageComponent } from '../../components/service-page/service-page.component';
import { ServicePageConfig } from '../../components/service-page/service-page.config';

@Component({
  selector: 'app-towing-roadside',
  standalone: true,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config"></app-service-page>`,
})
export class TowingRoadsideComponent {
  readonly config: ServicePageConfig = {
    title: 'Best Prices for Towing and Roadside Assistance',
    subtitle: '24/7 roadside assistance when you need it most',
    ctaButtonText: 'GET HELP NOW',
    pricingTable: [
      { car: 'Standard Towing', listingPrice: '$75 - $150', yourPrice: '$60 - $120' },
      { car: 'Jump Start', listingPrice: '$50.00', yourPrice: '$39.99' },
      { car: 'Tire Change', listingPrice: '$60.00', yourPrice: '$49.99' },
      { car: 'Lockout Service', listingPrice: '$70.00', yourPrice: '$59.99' },
      { car: 'Fuel Delivery', listingPrice: '$80.00', yourPrice: '$69.99' },
    ],
    includedItems: [
      '24/7 availability',
      'Fast response time',
      'Professional service',
      'Towing up to 50 miles',
      'Jump start service',
      'Tire change assistance',
      'Lockout service',
    ],
    description: {
      title: 'Towing and Roadside Assistance Service',
      content: [
        'When you\'re stranded on the side of the road, you need help fast. Our 24/7 roadside assistance service provides towing, jump starts, tire changes, lockout service, and fuel delivery whenever and wherever you need it.',
        'Whether your car won\'t start, you have a flat tire, you\'re locked out, or you need a tow, our certified mechanics and professional tow operators are available around the clock to get you back on the road.',
      ],
      sections: [
        {
          title: 'What services are included?',
          content:
            'Our roadside assistance includes towing service (up to 50 miles), jump start service for dead batteries, tire change assistance (if you have a spare), lockout service to get you back into your vehicle, and fuel delivery if you run out of gas. All services are available 24/7.',
        },
        {
          title: 'How quickly can you get here?',
          content:
            'Our average response time is 30-45 minutes, depending on your location and traffic conditions. We prioritize getting to you as quickly as possible, and you\'ll receive real-time updates on our ETA.',
        },
        {
          title: 'What if I need a tow?',
          content:
            'Our professional tow operators can transport your vehicle to your home, a repair shop, or any destination within 50 miles. We use flatbed and wheel-lift tow trucks to safely transport your vehicle without causing additional damage.',
        },
      ],
    },
    articles: [
      {
        title: 'What to do if your car breaks down',
        description: 'Step-by-step guide for handling a breakdown safely.',
      },
      {
        title: 'How to change a flat tire',
        description: 'Learn the proper way to change a tire on the side of the road.',
      },
      {
        title: 'What to do if you\'re locked out of your car',
        description: 'Options for getting back into your vehicle safely.',
      },
    ],
  };
}



















