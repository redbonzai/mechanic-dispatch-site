import { Component } from '@angular/core';
import { ServicePageComponent } from '../../components/service-page/service-page.component';
import { ServicePageConfig } from '../../components/service-page/service-page.config';

@Component({
  selector: 'app-pre-purchase-inspection',
  standalone: true,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config"></app-service-page>`,
})
export class PrePurchaseInspectionComponent {
  readonly config: ServicePageConfig = {
    title: 'Best Prices for Pre-purchase Car Inspection',
    subtitle: 'Get an instant quote for your car',
    ctaButtonText: 'GET AN INSPECTION',
    pricingTable: [
      { car: 'Honda Civic', listingPrice: '$150.00', yourPrice: '$135.00' },
      { car: 'Toyota Camry', listingPrice: '$150.00', yourPrice: '$135.00' },
      { car: 'Ford F-150', listingPrice: '$180.00', yourPrice: '$162.00' },
      { car: 'BMW 3 Series', listingPrice: '$200.00', yourPrice: '$180.00' },
      { car: 'Mercedes-Benz C-Class', listingPrice: '$200.00', yourPrice: '$180.00' },
      { car: 'Nissan Altima', listingPrice: '$150.00', yourPrice: '$135.00' },
    ],
    includedItems: [
      '150-point inspection',
      'Road test',
      'Fluid check',
      'Tire inspection',
      'Brake inspection',
      'Engine and transmission evaluation',
      'Written inspection report',
    ],
    description: {
      title: 'Pre-purchase Car Inspection Service',
      content: [
        'A pre-purchase car inspection is a comprehensive evaluation of a used vehicle before you buy it. Our certified mechanics perform a thorough 150-point inspection to identify any existing problems, potential issues, or hidden damage that could cost you money down the road.',
        'Buying a used car is a significant investment, and a professional inspection can save you thousands of dollars by revealing problems before you commit to the purchase. Our detailed inspection report gives you the information you need to make an informed decision or negotiate a better price.',
      ],
      sections: [
        {
          title: 'What to look for',
          content:
            'Our mechanics inspect the engine, transmission, suspension, brakes, tires, electrical system, body condition, and more. We check for signs of accidents, flood damage, mechanical issues, and wear that could indicate future problems. You\'ll receive a detailed written report with photos and recommendations.',
        },
        {
          title: 'Common issues',
          content:
            'Common problems found during pre-purchase inspections include hidden accident damage, transmission issues, engine problems, frame damage, electrical issues, and signs of poor maintenance. Knowing about these issues before you buy can help you avoid expensive repairs later.',
        },
        {
          title: 'How long does a pre-purchase inspection take?',
          content:
            'A comprehensive pre-purchase inspection typically takes 60-90 minutes. Our mechanic will thoroughly examine the vehicle, test drive it, and compile a detailed report. You can be present during the inspection to ask questions and learn about the vehicle\'s condition.',
        },
      ],
    },
    articles: [
      {
        title: 'What does a pre-purchase inspection include?',
        description: 'Learn what our mechanics check during a pre-purchase inspection.',
      },
      {
        title: 'How long does a pre-purchase inspection take?',
        description: 'Understanding the inspection process and timeline.',
      },
      {
        title: 'Commonly overlooked issues when buying a used car',
        description: 'What to watch out for when purchasing a used vehicle.',
      },
    ],
  };
}













