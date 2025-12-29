import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CarDatabaseService } from '../../car-database.service';

interface PriceComparison {
  car: string;
  service: string;
  estimate: string;
  savings: string;
  dealerPrice: string;
  location: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly carDb = inject(CarDatabaseService);

  quoteForm = this.fb.group({
    zipcode: ['76227'],
    year: [''],
    make: [''],
    model: [''],
    trim: [''],
    service: [''],
  });

  years: number[] = [];
  makes: string[] = [];
  models: string[] = [];
  trims: Array<{ trim: string; engineType: string }> = [];
  loadingMakes = false;
  loadingModels = false;
  loadingTrims = false;

  readonly priceComparisons: PriceComparison[] = [
    {
      car: '2001 Toyota Prius',
      service: 'Pre purchase car inspection',
      estimate: '$175',
      savings: '-35%',
      dealerPrice: '$108.00 - $150.00',
      location: 'Los Angeles, CA',
    },
    {
      car: '1996 GMC Yukon',
      service: 'Brake pads replacement',
      estimate: '$245',
      savings: '-15%',
      dealerPrice: '$188.73 - $234.23',
      location: 'San Francisco, CA',
    },
    {
      car: '2000 Chrysler Cirrus',
      service: 'Battery replacement',
      estimate: '$246',
      savings: '-3%',
      dealerPrice: '$220.00 - $255.00',
      location: 'San Diego, CA',
    },
    {
      car: '1996 Mitsubishi Montero',
      service: 'Timing belt replacement',
      estimate: '$1302',
      savings: '2%',
      dealerPrice: '$1266.39 - $1409.89',
      location: 'San Diego, CA',
    },
  ];

  ngOnInit(): void {
    this.loadYears();
  }

  async loadYears(): Promise<void> {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);
  }

  async onYearChange(): Promise<void> {
    const year = this.quoteForm.get('year')?.value;
    if (year) {
      this.loadingMakes = true;
      this.makes = [];
      this.models = [];
      this.trims = [];
      this.quoteForm.patchValue({ make: '', model: '', trim: '' });
      try {
        this.makes = await this.carDb.getMakes(parseInt(year));
      } catch (error) {
        console.error('Error loading makes:', error);
      } finally {
        this.loadingMakes = false;
      }
    }
  }

  async onMakeChange(): Promise<void> {
    const year = this.quoteForm.get('year')?.value;
    const make = this.quoteForm.get('make')?.value;
    if (year && make) {
      this.loadingModels = true;
      this.models = [];
      this.trims = [];
      this.quoteForm.patchValue({ model: '', trim: '' });
      try {
        this.models = await this.carDb.getModels(parseInt(year), make);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        this.loadingModels = false;
      }
    }
  }

  async onModelChange(): Promise<void> {
    const year = this.quoteForm.get('year')?.value;
    const make = this.quoteForm.get('make')?.value;
    const model = this.quoteForm.get('model')?.value;
    if (year && make && model) {
      this.loadingTrims = true;
      this.trims = [];
      this.quoteForm.patchValue({ trim: '' });
      try {
        this.trims = await this.carDb.getTrims(parseInt(year), make, model);
      } catch (error) {
        console.error('Error loading trims:', error);
      } finally {
        this.loadingTrims = false;
      }
    }
  }

  getEstimate(): void {
    // Navigate to services page or show estimate
    this.router.navigate(['/services']);
  }
}


















