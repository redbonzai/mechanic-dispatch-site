import { Component } from '@angular/core';
import { ServicePageComponent } from '../../components/service-page/service-page.component';
import { ServicePageConfig } from '../../components/service-page/service-page.config';

@Component({
  selector: 'app-check-engine-light',
  standalone: true,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config"></app-service-page>`,
})
export class CheckEngineLightComponent {
  readonly config: ServicePageConfig = {
    title: 'Best Prices for Check Engine Light is on Diagnostic',
    subtitle: 'Get an instant quote for your car',
    ctaButtonText: 'GET A FREE QUOTE',
    pricingTable: [
      { car: 'Honda Civic', listingPrice: '$120.00', yourPrice: '$99.99' },
      { car: 'Toyota Camry', listingPrice: '$120.00', yourPrice: '$99.99' },
      { car: 'Ford F-150', listingPrice: '$140.00', yourPrice: '$119.99' },
      { car: 'BMW 3 Series', listingPrice: '$160.00', yourPrice: '$139.99' },
      { car: 'Mercedes-Benz C-Class', listingPrice: '$160.00', yourPrice: '$139.99' },
      { car: 'Nissan Altima', listingPrice: '$120.00', yourPrice: '$99.99' },
    ],
    includedItems: [
      'OBD-II diagnostic scan',
      'Code interpretation',
      'System inspection',
      'Written diagnostic report',
      'Repair recommendations',
    ],
    description: {
      title: 'Check Engine Light Diagnostic Service',
      content: [
        'When your check engine light comes on, it\'s your car\'s way of telling you something needs attention. Our certified mechanics use professional OBD-II diagnostic equipment to read the trouble codes and identify the exact problem.',
        'The check engine light can indicate a wide range of issues, from a loose gas cap to serious engine problems. Getting a professional diagnosis is the first step to understanding what\'s wrong and what needs to be fixed.',
      ],
      sections: [
        {
          title: 'What causes the check engine light to come on?',
          content:
            'Common causes include a loose or faulty gas cap, oxygen sensor failure, catalytic converter issues, mass airflow sensor problems, spark plug or ignition coil issues, and emissions system problems. Our diagnostic scan will identify the specific code and what it means for your vehicle.',
        },
        {
          title: 'How does the diagnostic process work?',
          content:
            'Our mechanic connects a professional OBD-II scanner to your vehicle\'s diagnostic port, reads the trouble codes, and interprets what they mean. They\'ll also perform a visual inspection of related systems and provide you with a detailed report explaining the issue and recommended repairs.',
        },
        {
          title: 'Is it safe to drive with the check engine light on?',
          content:
            'It depends on the issue. A solid check engine light usually means the problem isn\'t immediately critical, but you should have it checked soon. A flashing check engine light indicates a serious problem that requires immediate attention—you should avoid driving if possible and have it towed to a mechanic.',
        },
      ],
    },
    articles: [
      {
        title: 'What does the check engine light mean?',
        description: 'Understanding what your check engine light is telling you.',
      },
      {
        title: 'Is it safe to drive with the check engine light on?',
        description: 'When you can drive and when you should stop immediately.',
      },
      {
        title: 'How much does check engine light diagnosis cost?',
        description: 'Understanding diagnostic pricing and what\'s included.',
      },
    ],
  };
}


















