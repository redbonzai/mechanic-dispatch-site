import { Component } from '@angular/core';
import { ServicePageComponent } from '../../components/service-page/service-page.component';
import { ServicePageConfig } from '../../components/service-page/service-page.config';

@Component({
  selector: 'app-car-not-starting',
  standalone: true,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config"></app-service-page>`,
})
export class CarNotStartingComponent {
  readonly config: ServicePageConfig = {
    title: 'Best Prices for Car is not starting Inspection',
    subtitle: 'Our certified mobile mechanics come to you 7 days a week between 7 AM and 9 PM.',
    ctaButtonText: 'SCHEDULE A MECHANIC',
    pricingTable: [
      { car: 'Honda Civic', listingPrice: '$194.00', yourPrice: '$149.99' },
      { car: 'Toyota Camry', listingPrice: '$194.00', yourPrice: '$149.99' },
      { car: 'Ford F-150', listingPrice: '$194.00', yourPrice: '$149.99' },
      { car: 'Dodge Ram 2500', listingPrice: '$194.00', yourPrice: '$149.99' },
      { car: 'BMW 3 Series', listingPrice: '$220.00', yourPrice: '$169.99' },
      { car: 'Mercedes-Benz C-Class', listingPrice: '$220.00', yourPrice: '$169.99' },
    ],
    includedItems: [
      'Comprehensive diagnostic scan',
      'Battery and charging system test',
      'Starter and alternator inspection',
      'Fuel system check',
      'Detailed written report',
    ],
    description: {
      title: 'Car is not starting Inspection Service',
      content: [
        'When your car won\'t start, it can be frustrating and stressful. Our certified mobile mechanics come to your location to diagnose the problem quickly and accurately. We use professional diagnostic equipment to identify the root cause, whether it\'s a battery issue, starter problem, fuel system failure, or something else.',
        'Common reasons your car may not start include a dead or weak battery, faulty starter motor, bad alternator, fuel pump failure, ignition system problems, or security system issues. Our mechanics will test each system methodically to find the exact problem.',
      ],
      sections: [
        {
          title: 'What to expect during a mobile car diagnostic',
          content:
            'Our mechanic will arrive at your location with professional diagnostic equipment. They\'ll test your battery and charging system, check the starter and alternator, inspect the fuel system, and run diagnostic codes if your vehicle has a check engine light. You\'ll receive a detailed written report explaining what\'s wrong and what needs to be fixed.',
        },
        {
          title: 'Common reasons your car won\'t start',
          content:
            'Bad fuel pump, bad spark plugs, bad timing belt, bad ignition coil, bad battery or loose/corroded terminals, bad starter, or wiring problems. Our mechanics are trained to diagnose all of these issues quickly and accurately.',
        },
        {
          title: 'How important is this service?',
          content:
            'A car that won\'t start can leave you stranded and disrupt your daily routine. Getting a professional diagnosis is the first step to getting back on the road. Our mobile service means you don\'t have to worry about towing your car to a shop—we come to you.',
        },
      ],
    },
    articles: [
      {
        title: 'Alternator or Car Battery: How to Tell Which Part is the Problem',
        description: 'Learn to diagnose whether your issue is the battery or alternator.',
      },
      {
        title: 'Why won\'t my car start?',
        description: 'Common causes and solutions for cars that won\'t start.',
      },
      {
        title: 'How to jump start a car',
        description: 'Step-by-step guide to safely jump starting your vehicle.',
      },
    ],
  };
}



















