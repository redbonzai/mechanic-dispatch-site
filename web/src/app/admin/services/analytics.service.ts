import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance,
  RevenueMetricsQuery,
  MechanicsPerformanceQuery,
} from '../models/analytics.model';

/**
 * Analytics Service
 *
 * Provides access to admin analytics API endpoints.
 * All endpoints require JWT authentication via interceptor.
 *
 * Endpoints:
 * - GET /api/admin/analytics/overview
 * - GET /api/admin/analytics/revenue
 * - GET /api/admin/analytics/mechanics
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly baseUrl = '/api/admin/analytics';

  constructor(private http: HttpClient) {}

  /**
   * Fetch overview statistics for admin dashboard.
   *
   * @returns Observable of overview stats including totals for requests,
   *          revenue, mechanics, reviews, and average ratings
   */
  getOverview(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${this.baseUrl}/overview`);
  }

  /**
   * Fetch revenue metrics with optional filtering.
   *
   * @param query Optional query parameters for date range and granularity
   * @returns Observable of revenue metrics with data points and summary
   */
  getRevenue(query?: RevenueMetricsQuery): Observable<RevenueMetrics> {
    const params = this.buildHttpParams(query);
    return this.http.get<RevenueMetrics>(`${this.baseUrl}/revenue`, {
      params,
    });
  }

  /**
   * Fetch mechanics performance metrics with optional filtering.
   *
   * @param query Optional query parameters for filtering and sorting
   * @returns Observable of mechanics performance data with summary
   */
  getMechanics(
    query?: MechanicsPerformanceQuery
  ): Observable<MechanicsPerformance> {
    const params = this.buildHttpParams(query);
    return this.http.get<MechanicsPerformance>(`${this.baseUrl}/mechanics`, {
      params,
    });
  }

  /**
   * Build HttpParams from query object, filtering undefined values.
   *
   * @param query Query object with optional parameters
   * @returns HttpParams instance for HTTP request
   */
  private buildHttpParams(
    query?: RevenueMetricsQuery | MechanicsPerformanceQuery
  ): HttpParams {
    let params = new HttpParams();

    if (!query) {
      return params;
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
