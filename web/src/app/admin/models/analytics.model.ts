/**
 * Admin Analytics Models
 *
 * TypeScript interfaces matching backend API types for analytics endpoints.
 * These models ensure type safety between frontend and backend communication.
 *
 * References:
 * - Backend: src/domains/admin/analytics/types.ts
 * - API Endpoints:
 *   - GET /api/admin/analytics/overview → OverviewStats
 *   - GET /api/admin/analytics/revenue → RevenueMetrics
 *   - GET /api/admin/analytics/mechanics → MechanicsPerformance
 */

/**
 * Overview statistics for admin dashboard.
 * Provides high-level metrics across the entire system.
 *
 * Endpoint: GET /api/admin/analytics/overview
 */
export interface OverviewStats {
  /** Total number of service requests (all time) */
  totalRequests: number;

  /** Number of pending service requests (status = PENDING) */
  pendingRequests: number;

  /** Number of authorized service requests (status = AUTHORIZED) */
  authorizedRequests: number;

  /** Number of captured service requests (status = CAPTURED) */
  capturedRequests: number;

  /** Number of finalized service requests (status = FINALIZED) */
  finalizedRequests: number;

  /** Number of cancelled service requests (status = CANCELLED) */
  cancelledRequests: number;

  /** Total revenue in cents (all finalized requests) */
  totalRevenueCents: number;

  /** Number of active mechanics (isActive = true) */
  activeMechanics: number;

  /** Total number of mechanics (all statuses) */
  totalMechanics: number;

  /** Total number of reviews */
  totalReviews: number;

  /** Average rating across all reviews */
  averageRating: number;

  /** Total number of work log entries */
  totalWorkLogs: number;
}

/**
 * Revenue metrics by time period.
 * Supports daily, weekly, and monthly breakdowns.
 *
 * Endpoint: GET /api/admin/analytics/revenue
 */
export interface RevenueMetrics {
  /** Revenue data points by time period (plural = array) */
  dataPoints: RevenueDataPoint[];

  /** Summary statistics (singular = object) */
  summary: RevenueSummary;
}

/**
 * Single revenue data point for a time period.
 */
export interface RevenueDataPoint {
  /** ISO 8601 date string (e.g., "2025-01-15") */
  date: string;

  /** Revenue for this period in cents */
  revenueCents: number;

  /** Number of finalized requests in this period */
  finalizedCount: number;

  /** Average request value in cents for this period */
  averageRequestCents: number;
}

/**
 * Summary statistics for revenue period.
 */
export interface RevenueSummary {
  /** Total revenue in cents for the period */
  totalRevenueCents: number;

  /** Total number of finalized requests */
  totalFinalizedCount: number;

  /** Average revenue per request in cents */
  averageRevenueCents: number;

  /** Highest single-day revenue in cents */
  peakRevenueCents: number;

  /** Date of peak revenue (ISO 8601) */
  peakRevenueDate: string;
}

/**
 * Performance metrics for all mechanics.
 *
 * Endpoint: GET /api/admin/analytics/mechanics
 */
export interface MechanicsPerformance {
  /** Performance data for each mechanic (plural = array) */
  mechanics: MechanicPerformance[];

  /** Summary statistics across all mechanics (singular = object) */
  summary: MechanicsPerformanceSummary;
}

/**
 * Performance metrics for a single mechanic.
 */
export interface MechanicPerformance {
  /** Mechanic ID */
  id: string;

  /** Mechanic name */
  name: string;

  /** Number of completed jobs (via work logs) */
  completedJobs: number;

  /** Total hours worked (sum of work log hours) */
  totalHoursWorked: number;

  /** Total earnings in cents (based on payout percentage) */
  totalEarningsCents: number;

  /** Average rating (from reviews) */
  averageRating: number;

  /** Number of reviews */
  reviewCount: number;

  /** Whether mechanic is currently active */
  isActive: boolean;
}

/**
 * Summary statistics for mechanics performance.
 */
export interface MechanicsPerformanceSummary {
  /** Total mechanics included in report */
  totalMechanics: number;

  /** Number of active mechanics */
  activeMechanics: number;

  /** Total completed jobs across all mechanics */
  totalCompletedJobs: number;

  /** Total hours worked across all mechanics */
  totalHoursWorked: number;

  /** Average rating across all mechanics */
  averageRating: number;
}

/**
 * Query parameters for revenue metrics endpoint.
 */
export interface RevenueMetricsQuery {
  /** Start date (ISO 8601, inclusive) */
  startDate?: string;

  /** End date (ISO 8601, inclusive) */
  endDate?: string;

  /** Granularity: 'day' | 'week' | 'month' (default: 'day') */
  granularity?: 'day' | 'week' | 'month';
}

/**
 * Query parameters for mechanics performance endpoint.
 */
export interface MechanicsPerformanceQuery {
  /** Filter by active status (default: show all) */
  isActive?: boolean;

  /** Minimum completed jobs filter */
  minJobs?: number;

  /** Sort by field: 'jobs' | 'hours' | 'earnings' | 'rating' (default: 'jobs') */
  sortBy?: 'jobs' | 'hours' | 'earnings' | 'rating';

  /** Sort order: 'asc' | 'desc' (default: 'desc') */
  sortOrder?: 'asc' | 'desc';
}
