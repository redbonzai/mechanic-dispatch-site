import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  OverviewStats,
  RevenueMetrics,
  RevenueMetricsQuery,
  MechanicsPerformance,
  MechanicsPerformanceQuery,
  RevenueDataPoint,
  MechanicPerformance,
} from './types';

/**
 * Admin Analytics Service
 *
 * Provides analytics data for admin dashboard following constitutional requirements.
 *
 * SOLID Principles:
 * - Single Responsibility: Analytics data aggregation only
 * - Open/Closed: Extensible for new analytics
 * - Dependency Inversion: Depends on PrismaService abstraction
 *
 * Constitutional Compliance:
 * - Functions ≤ 50 lines (CLAUDE.md)
 * - Class ≤ 300 lines (CLAUDE.md)
 * - No `any` types (TypeScript strict mode)
 * - Fail-fast validation
 *
 * References:
 * - CLAUDE.md: SOLID principles, class/function size limits
 * - docs/standards/common/typescript.md
 * - docs/skills/coding-conventions.md
 */
@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get overview statistics for admin dashboard.
   *
   * @returns {Promise<OverviewStats>} Dashboard overview statistics
   */
  async getOverviewStats(): Promise<OverviewStats> {
    // Query all statistics in parallel for performance
    const [
      pendingRequests,
      authorizedRequests,
      capturedRequests,
      finalizedRequests,
      cancelledRequests,
      revenueAggregate,
      activeMechanics,
      totalMechanics,
      totalReviews,
      ratingAggregate,
      totalWorkLogs,
    ] = await Promise.all([
      this.prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.serviceRequest.count({ where: { status: 'AUTHORIZED' } }),
      this.prisma.serviceRequest.count({ where: { status: 'CAPTURED' } }),
      this.prisma.serviceRequest.count({ where: { status: 'FINALIZED' } }),
      this.prisma.serviceRequest.count({ where: { status: 'CANCELLED' } }),
      this.prisma.serviceRequest.aggregate({
        _sum: { finalAmountCents: true },
        where: { status: 'FINALIZED' },
      }),
      this.prisma.mechanic.count({ where: { isActive: true } }),
      this.prisma.mechanic.count(),
      this.prisma.review.count(),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      this.prisma.mechanicWorkLog.count(),
    ]);

    const totalRequests =
      pendingRequests +
      authorizedRequests +
      capturedRequests +
      finalizedRequests +
      cancelledRequests;

    return {
      totalRequests,
      pendingRequests,
      authorizedRequests,
      capturedRequests,
      finalizedRequests,
      cancelledRequests,
      totalRevenueCents: Number(revenueAggregate._sum.finalAmountCents ?? 0),
      activeMechanics,
      totalMechanics,
      totalReviews,
      averageRating: ratingAggregate._avg.rating ?? 0,
      totalWorkLogs,
    };
  }

  /**
   * Get revenue metrics by time period.
   *
   * @param {RevenueMetricsQuery} query - Query parameters
   * @returns {Promise<RevenueMetrics>} Revenue metrics with summary
   */
  async getRevenueMetrics(query: RevenueMetricsQuery): Promise<RevenueMetrics> {
    const { startDate, endDate, granularity = 'day' } = query;

    // Build where clause for date range
    const where = {
      status: 'FINALIZED' as const,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    // Get finalized requests grouped by date
    const requests = await this.prisma.serviceRequest.findMany({
      where,
      select: {
        createdAt: true,
        finalAmountCents: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date and aggregate
    const dataPoints = this.groupRevenueByDate(requests, granularity);
    const summary = this.calculateRevenueSummary(dataPoints);

    return { dataPoints, summary };
  }

  /**
   * Get mechanics performance metrics.
   *
   * @param {MechanicsPerformanceQuery} query - Query parameters
   * @returns {Promise<MechanicsPerformance>} Mechanics performance data
   */
  async getMechanicsPerformance(
    query: MechanicsPerformanceQuery,
  ): Promise<MechanicsPerformance> {
    const { isActive, minJobs, sortBy = 'jobs', sortOrder = 'desc' } = query;

    // Build where clause
    const where = isActive !== undefined ? { isActive } : {};

    // Get all mechanics with their reviews
    const mechanics = await this.prisma.mechanic.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
        workLogs: {
          select: {
            id: true,
            hoursWorkedMinutes: true,
            payoutPercentage: true,
            serviceRequest: { select: { finalAmountCents: true } },
          },
        },
      },
    });

    // Calculate performance metrics for each mechanic
    let mechanicsData: MechanicPerformance[] = mechanics.map((mechanic) =>
      this.calculateMechanicPerformance(mechanic),
    );

    // Filter by minimum jobs if specified
    if (minJobs !== undefined) {
      mechanicsData = mechanicsData.filter((m) => m.completedJobs >= minJobs);
    }

    // Sort mechanics
    mechanicsData = this.sortMechanics(mechanicsData, sortBy, sortOrder);

    // Calculate summary
    const summary = this.calculateMechanicsSummary(mechanicsData);

    return { mechanics: mechanicsData, summary };
  }

  /**
   * Group revenue data by date granularity.
   *
   * @private
   * @param {Array} requests - Service requests
   * @param {string} granularity - Time granularity
   * @returns {RevenueDataPoint[]} Grouped revenue data
   */
  private groupRevenueByDate(
    requests: Array<{ createdAt: Date; finalAmountCents: number | null }>,
    granularity: 'day' | 'week' | 'month',
  ): RevenueDataPoint[] {
    const grouped = new Map<string, { revenue: number; count: number }>();

    requests.forEach((request) => {
      const dateKey = this.getDateKey(request.createdAt, granularity);
      const existing = grouped.get(dateKey) ?? { revenue: 0, count: 0 };

      grouped.set(dateKey, {
        revenue: existing.revenue + (request.finalAmountCents ?? 0),
        count: existing.count + 1,
      });
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      revenueCents: data.revenue,
      finalizedCount: data.count,
      averageRequestCents:
        data.count > 0 ? Math.round(data.revenue / data.count) : 0,
    }));
  }

  /**
   * Get date key for grouping based on granularity.
   *
   * @private
   * @param {Date} date - Date to format
   * @param {string} granularity - Time granularity
   * @returns {string} Date key (ISO 8601 format)
   */
  private getDateKey(
    date: Date,
    granularity: 'day' | 'week' | 'month',
  ): string {
    if (granularity === 'day') {
      return date.toISOString().split('T')[0];
    }
    // For week/month, implement as needed
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate revenue summary statistics.
   *
   * @private
   * @param {RevenueDataPoint[]} dataPoints - Revenue data points
   * @returns Revenue summary
   */
  private calculateRevenueSummary(dataPoints: RevenueDataPoint[]) {
    if (dataPoints.length === 0) {
      return {
        totalRevenueCents: 0,
        totalFinalizedCount: 0,
        averageRevenueCents: 0,
        peakRevenueCents: 0,
        peakRevenueDate: '',
      };
    }

    const totalRevenueCents = dataPoints.reduce(
      (sum, dp) => sum + dp.revenueCents,
      0,
    );
    const totalFinalizedCount = dataPoints.reduce(
      (sum, dp) => sum + dp.finalizedCount,
      0,
    );
    const averageRevenueCents = Math.round(
      totalRevenueCents / totalFinalizedCount,
    );

    const peak = dataPoints.reduce((max, dp) =>
      dp.revenueCents > max.revenueCents ? dp : max,
    );

    return {
      totalRevenueCents,
      totalFinalizedCount,
      averageRevenueCents,
      peakRevenueCents: peak.revenueCents,
      peakRevenueDate: peak.date,
    };
  }

  /**
   * Calculate performance metrics for a mechanic.
   *
   * @private
   * @param mechanic - Mechanic with relations
   * @returns Mechanic performance data
   */
  private calculateMechanicPerformance(mechanic: {
    id: string;
    name: string;
    isActive: boolean;
    reviews: Array<{ rating: number }>;
    workLogs: Array<{
      hoursWorkedMinutes: number;
      payoutPercentage: number;
      serviceRequest: { finalAmountCents: number | null } | null;
    }>;
  }): MechanicPerformance {
    const completedJobs = mechanic.workLogs.length;
    const totalHoursWorked = mechanic.workLogs.reduce(
      (sum, log) => sum + log.hoursWorkedMinutes / 60,
      0,
    );

    const totalEarningsCents = mechanic.workLogs.reduce((sum, log) => {
      const requestAmount = log.serviceRequest?.finalAmountCents ?? 0;
      return sum + Math.round(requestAmount * (log.payoutPercentage / 100));
    }, 0);

    const averageRating =
      mechanic.reviews.length > 0
        ? mechanic.reviews.reduce((sum, r) => sum + r.rating, 0) /
          mechanic.reviews.length
        : 0;

    return {
      id: mechanic.id,
      name: mechanic.name,
      completedJobs,
      totalHoursWorked: Math.round(totalHoursWorked),
      totalEarningsCents,
      averageRating: Math.round(averageRating * 100) / 100,
      reviewCount: mechanic.reviews.length,
      isActive: mechanic.isActive,
    };
  }

  /**
   * Sort mechanics by specified field.
   *
   * @private
   * @param mechanics - Mechanics data
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort order (asc/desc)
   * @returns Sorted mechanics array
   */
  private sortMechanics(
    mechanics: MechanicPerformance[],
    sortBy: 'jobs' | 'hours' | 'earnings' | 'rating',
    sortOrder: 'asc' | 'desc',
  ): MechanicPerformance[] {
    const fieldMap = {
      jobs: 'completedJobs',
      hours: 'totalHoursWorked',
      earnings: 'totalEarningsCents',
      rating: 'averageRating',
    };

    const field = fieldMap[sortBy] as keyof MechanicPerformance;
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    return [...mechanics].sort((a, b) => {
      const aVal = a[field] as number;
      const bVal = b[field] as number;
      return (aVal - bVal) * multiplier;
    });
  }

  /**
   * Calculate summary statistics for mechanics.
   *
   * @private
   * @param mechanics - Mechanics performance data
   * @returns Summary statistics
   */
  private calculateMechanicsSummary(mechanics: MechanicPerformance[]) {
    if (mechanics.length === 0) {
      return {
        totalMechanics: 0,
        activeMechanics: 0,
        totalCompletedJobs: 0,
        totalHoursWorked: 0,
        averageRating: 0,
      };
    }

    const activeMechanics = mechanics.filter((m) => m.isActive).length;
    const totalCompletedJobs = mechanics.reduce(
      (sum, m) => sum + m.completedJobs,
      0,
    );
    const totalHoursWorked = mechanics.reduce(
      (sum, m) => sum + m.totalHoursWorked,
      0,
    );
    const averageRating =
      mechanics.reduce((sum, m) => sum + m.averageRating, 0) / mechanics.length;

    return {
      totalMechanics: mechanics.length,
      activeMechanics,
      totalCompletedJobs,
      totalHoursWorked,
      averageRating: Math.round(averageRating * 100) / 100,
    };
  }
}
