/**
 * Dashboard Component
 * 
 * Admin analytics dashboard displaying overview stats, revenue metrics,
 * and mechanics performance.
 * 
 * Constitutional Compliance:
 * - Component ≤ 300 lines
 * - Functions ≤ 50 lines
 * - OnInit lifecycle hook
 * - Loading and error state handling
 * - No any types
 * 
 * References:
 * - docs/standards/common/typescript.md
 * - CLAUDE.md: SOLID principles
 */

import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance
} from '../../models/analytics.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Data properties
  overviewStats: OverviewStats | null = null;
  revenueMetrics: RevenueMetrics | null = null;
  mechanicsPerformance: MechanicsPerformance | null = null;

  // UI state
  loading = true;
  error: string | null = null;

  // Table columns for mechanics performance
  displayedColumns: string[] = ['name', 'completedJobs', 'totalHoursWorked', 'averageRating'];

  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Initialize component and load dashboard data.
   */
  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data in parallel.
   * 
   * Sets loading state and handles errors gracefully.
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load all analytics data in parallel using Promise.all
    Promise.all([
      this.analyticsService.getOverview().toPromise(),
      this.analyticsService.getRevenue().toPromise(),
      this.analyticsService.getMechanics().toPromise()
    ])
      .then(([overview, revenue, mechanics]) => {
        // Success: Populate data
        this.overviewStats = overview || null;
        this.revenueMetrics = revenue || null;
        this.mechanicsPerformance = mechanics || null;
        this.loading = false;
      })
      .catch(err => {
        // Error: Set error message and stop loading
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error('Dashboard error:', err);
      });
  }

  /**
   * Format cents to currency string.
   * 
   * @param cents - Amount in cents
   * @returns Formatted currency string (e.g., "$123.45")
   */
  formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
