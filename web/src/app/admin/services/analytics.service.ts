/**
 * Analytics Service
 * 
 * Angular service for consuming admin analytics API endpoints.
 * 
 * Constitutional Compliance:
 * - Functions ≤ 50 lines
 * - RxJS observables for async operations
 * - HttpClient with proper query params
 * - No any types (TypeScript strict mode)
 * 
 * Backend API: src/domains/admin/analytics/
 * 
 * References:
 * - docs/standards/common/typescript.md
 * - CLAUDE.md: SOLID principles
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly baseUrl = '/api/admin/analytics';

  constructor(private http: HttpClient) {}

  /**
   * Get overview statistics for admin dashboard.
   * 
   * @returns Observable of overview stats
   * 
   * Endpoint: GET /api/admin/analytics/overview
   */
  getOverview(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${this.baseUrl}/overview`);
  }

  /**
   * Get revenue metrics by time period.
   * 
   * @param startDate - Start date (ISO 8601, optional)
   * @param endDate - End date (ISO 8601, optional)
   * @param granularity - Time granularity ('day' | 'week' | 'month', optional)
   * @returns Observable of revenue metrics
   * 
   * Endpoint: GET /api/admin/analytics/revenue
   */
  getRevenue(
    startDate?: string,
    endDate?: string,
    granularity?: 'day' | 'week' | 'month'
  ): Observable<RevenueMetrics> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (granularity) {
      params = params.set('granularity', granularity);
    }

    return this.http.get<RevenueMetrics>(`${this.baseUrl}/revenue`, { params });
  }

  /**
   * Get mechanics performance metrics.
   * 
   * @param isActive - Filter by active status (optional)
   * @param minJobs - Minimum completed jobs filter (optional)
   * @param sortBy - Sort by field (optional)
   * @param sortOrder - Sort order (optional)
   * @returns Observable of mechanics performance
   * 
   * Endpoint: GET /api/admin/analytics/mechanics
   */
  getMechanics(
    isActive?: boolean,
    minJobs?: number,
    sortBy?: 'jobs' | 'hours' | 'earnings' | 'rating',
    sortOrder?: 'asc' | 'desc'
  ): Observable<MechanicsPerformance> {
    let params = new HttpParams();

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }
    if (minJobs !== undefined) {
      params = params.set('minJobs', minJobs.toString());
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    if (sortOrder) {
      params = params.set('sortOrder', sortOrder);
    }

    return this.http.get<MechanicsPerformance>(`${this.baseUrl}/mechanics`, { params });
  }
}
