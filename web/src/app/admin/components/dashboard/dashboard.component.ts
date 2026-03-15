import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import {
  OverviewStats,
  SubscriptionMetrics,
  TopQueriesResponse,
  SearchVolumeResponse,
  MechanicAnalyticsResponse,
} from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  overview: OverviewStats | null = null;
  subscriptions: SubscriptionMetrics | null = null;
  topQueries: TopQueriesResponse | null = null;
  searchVolume: SearchVolumeResponse | null = null;
  mechanicAnalytics: MechanicAnalyticsResponse | null = null;

  isLoading = true;
  error: string | null = null;

  constructor(private readonly analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const [overview, subscriptions, topQueries, searchVolume, mechanicAnalytics] =
        await Promise.all([
          firstValueFrom(this.analyticsService.getOverview()),
          firstValueFrom(this.analyticsService.getSubscriptions()),
          firstValueFrom(this.analyticsService.getTopQueries()),
          firstValueFrom(this.analyticsService.getSearchVolume()),
          firstValueFrom(this.analyticsService.getMechanicAnalytics()),
        ]);

      this.overview = overview;
      this.subscriptions = subscriptions;
      this.topQueries = topQueries;
      this.searchVolume = searchVolume;
      this.mechanicAnalytics = mechanicAnalytics;
    } catch {
      this.error = 'Failed to load analytics data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  retryLoad(): void {
    void this.loadData();
  }

  formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  }

  formatNumber(n: number): string {
    return new Intl.NumberFormat('en-US').format(n);
  }

  tierLabel(tier: string | null): string {
    const map: Record<string, string> = { PREMIUM: 'Premium', PRO: 'Pro', BASIC: 'Basic' };
    return tier ? (map[tier] ?? tier) : '—';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'badge--active',
      TRIALING: 'badge--trial',
      PAST_DUE: 'badge--warning',
      CANCELLED: 'badge--danger',
      INACTIVE: 'badge--muted',
    };
    return map[status] ?? 'badge--muted';
  }
}
