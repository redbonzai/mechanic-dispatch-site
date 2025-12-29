import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance,
} from '../../models/analytics.model';

/**
 * Dashboard Component
 *
 * Main admin dashboard displaying analytics and key metrics.
 * Loads data from AnalyticsService on initialization.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  overview: OverviewStats | null = null;
  revenue: RevenueMetrics | null = null;
  mechanics: MechanicsPerformance | null = null;

  isLoading = true;
  error: string | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load all analytics data in parallel.
   * Sets loading and error states appropriately.
   */
  async loadData(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const [overview, revenue, mechanics] = await Promise.all([
        firstValueFrom(this.analyticsService.getOverview()),
        firstValueFrom(this.analyticsService.getRevenue()),
        firstValueFrom(this.analyticsService.getMechanics()),
      ]);

      this.overview = overview;
      this.revenue = revenue;
      this.mechanics = mechanics;
    } catch (err) {
      this.error = 'Failed to load analytics data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Retry loading data after an error.
   */
  retryLoad(): void {
    this.loadData();
  }

  /**
   * Format cents as currency string (e.g., 1234 → "$12.34").
   *
   * @param cents Amount in cents
   * @returns Formatted currency string
   */
  formatCurrency(cents: number): string {
    const dollars = cents / 100;
    const isNegative = dollars < 0;
    const absoluteDollars = Math.abs(dollars);

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absoluteDollars);

    return isNegative ? `-${formatted}` : formatted;
  }

  /**
   * Calculate completion rate percentage.
   *
   * @returns Percentage of finalized requests (0-100)
   */
  get completionRate(): number {
    if (!this.overview || this.overview.totalRequests === 0) {
      return 0;
    }
    return Math.round(
      (this.overview.finalizedRequests / this.overview.totalRequests) * 100
    );
  }
}
