import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './AdminAnalyticsService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  OverviewStats,
  RevenueMetrics,
  RevenueMetricsQuery,
  MechanicsPerformance,
  MechanicsPerformanceQuery,
} from './types';

/**
 * Admin Analytics Controller
 *
 * Handles HTTP requests for analytics endpoints following constitutional requirements.
 *
 * Security:
 * - All endpoints protected with JWT auth guard
 * - Input validation on query parameters
 * - No sensitive data exposed
 *
 * Constitutional Compliance:
 * - Functions ≤ 50 lines (CLAUDE.md)
 * - Security-by-default (all routes protected)
 * - Fail-fast validation
 *
 * References:
 * - CLAUDE.md: Security-by-Default (Lines 183-215)
 * - docs/standards/common/security.md
 * - docs/admin/ADMIN_API_SPECIFICATION.md
 */
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard) // Protect all analytics endpoints
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  /**
   * GET /admin/analytics/overview
   *
   * Get dashboard overview statistics.
   *
   * @returns {Promise<OverviewStats>} Overview statistics
   *
   * Security: JWT required
   */
  @Get('overview')
  async getOverview(): Promise<OverviewStats> {
    return this.analyticsService.getOverviewStats();
  }

  /**
   * GET /admin/analytics/revenue
   *
   * Get revenue metrics by time period.
   *
   * @param {RevenueMetricsQuery} query - Query parameters
   * @returns {Promise<RevenueMetrics>} Revenue metrics
   *
   * Security: JWT required
   * Validation: Date format validation
   */
  @Get('revenue')
  async getRevenue(
    @Query() query: RevenueMetricsQuery,
  ): Promise<RevenueMetrics> {
    // Validate date formats if provided
    if (query.startDate) {
      this.validateDateFormat(query.startDate, 'startDate');
    }
    if (query.endDate) {
      this.validateDateFormat(query.endDate, 'endDate');
    }

    return this.analyticsService.getRevenueMetrics(query);
  }

  /**
   * GET /admin/analytics/mechanics
   *
   * Get mechanics performance metrics.
   *
   * @param {MechanicsPerformanceQuery} query - Query parameters
   * @returns {Promise<MechanicsPerformance>} Mechanics performance
   *
   * Security: JWT required
   * Validation: Query parameter validation
   */
  @Get('mechanics')
  async getMechanics(
    @Query() query: MechanicsPerformanceQuery,
  ): Promise<MechanicsPerformance> {
    // Convert string query params to proper types
    const parsedQuery: MechanicsPerformanceQuery = {
      isActive:
        query.isActive !== undefined
          ? String(query.isActive) === 'true'
          : undefined,
      minJobs:
        query.minJobs !== undefined
          ? parseInt(String(query.minJobs), 10)
          : undefined,
      sortBy: query.sortBy || 'jobs',
      sortOrder: query.sortOrder || 'desc',
    };

    // Validate minJobs is positive
    if (parsedQuery.minJobs !== undefined && parsedQuery.minJobs < 0) {
      throw new Error('minJobs must be a positive number');
    }

    return this.analyticsService.getMechanicsPerformance(parsedQuery);
  }

  /**
   * Validate ISO 8601 date format.
   *
   * @private
   * @param {string} dateString - Date string to validate
   * @param {string} fieldName - Field name for error message
   * @throws {Error} If date format is invalid
   */
  private validateDateFormat(dateString: string, fieldName: string): void {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Invalid ${fieldName} format. Expected ISO 8601 date string`,
      );
    }
  }
}
