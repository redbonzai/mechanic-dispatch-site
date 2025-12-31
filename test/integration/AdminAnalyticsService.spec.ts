/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsService } from '../../src/domains/admin/analytics';
import { PrismaService } from '../../src/domains/database/prisma.service';
import {
  OverviewStats,
  RevenueMetrics,
  MechanicsPerformance,
  RevenueMetricsQuery,
  MechanicsPerformanceQuery,
} from '../../src/domains/admin/analytics';

/**
 * AdminAnalyticsService Unit Tests (80% of test pyramid)
 *
 * Following constitutional requirements:
 * - AAA pattern (Arrange-Act-Assert)
 * - Fail-fast validation
 * - Test coverage ≥ 85%
 * - Test BEFORE implementation
 *
 * References:
 * - docs/standards/testing/unit.md
 * - docs/skills/testing.md
 * - CLAUDE.md: Testing Requirements (Lines 149-181)
 */
describe('AdminAnalyticsService (Unit Tests - 80%)', () => {
  let service: AdminAnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Arrange: Create testing module with mocked Prisma
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            serviceRequest: {
              count: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
              findMany: jest.fn(),
            },
            mechanic: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            review: {
              count: jest.fn(),
              aggregate: jest.fn(),
            },
            mechanicWorkLog: {
              count: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminAnalyticsService>(AdminAnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverviewStats', () => {
    it('should return overview statistics with all counts', async () => {
      // Arrange
      const mockServiceRequestCounts = {
        PENDING: 5,
        AUTHORIZED: 3,
        CAPTURED: 10,
        FINALIZED: 20,
        CANCELLED: 2,
      };
      const mockTotalRevenue = BigInt(150000); // $1,500.00
      const mockActiveMechanics = 8;
      const mockTotalMechanics = 10;
      const mockTotalReviews = 45;
      const mockAverageRating = 4.5;
      const mockTotalWorkLogs = 35;

      jest
        .spyOn(prisma.serviceRequest, 'count')
        .mockResolvedValueOnce(mockServiceRequestCounts.PENDING)
        .mockResolvedValueOnce(mockServiceRequestCounts.AUTHORIZED)
        .mockResolvedValueOnce(mockServiceRequestCounts.CAPTURED)
        .mockResolvedValueOnce(mockServiceRequestCounts.FINALIZED)
        .mockResolvedValueOnce(mockServiceRequestCounts.CANCELLED);

      jest.spyOn(prisma.serviceRequest, 'aggregate').mockResolvedValue({
        _sum: { finalAmountCents: mockTotalRevenue },
      } as any);

      jest
        .spyOn(prisma.mechanic, 'count')
        .mockResolvedValueOnce(mockActiveMechanics)
        .mockResolvedValueOnce(mockTotalMechanics);

      jest.spyOn(prisma.review, 'count').mockResolvedValue(mockTotalReviews);
      jest.spyOn(prisma.review, 'aggregate').mockResolvedValue({
        _avg: { rating: mockAverageRating },
      } as any);

      jest
        .spyOn(prisma.mechanicWorkLog, 'count')
        .mockResolvedValue(mockTotalWorkLogs);

      // Act
      const result: OverviewStats = await service.getOverviewStats();

      // Assert
      expect(result).toEqual({
        totalRequests: 40, // Sum of all statuses
        pendingRequests: 5,
        authorizedRequests: 3,
        capturedRequests: 10,
        finalizedRequests: 20,
        cancelledRequests: 2,
        totalRevenueCents: 150000,
        activeMechanics: 8,
        totalMechanics: 10,
        totalReviews: 45,
        averageRating: 4.5,
        totalWorkLogs: 35,
      });

      expect(prisma.serviceRequest.count).toHaveBeenCalledTimes(5);
      expect(prisma.mechanic.count).toHaveBeenCalledTimes(2);
    });

    it('should return zero values when no data exists', async () => {
      // Arrange
      jest.spyOn(prisma.serviceRequest, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.serviceRequest, 'aggregate').mockResolvedValue({
        _sum: { finalAmountCents: null },
      } as any);
      jest.spyOn(prisma.mechanic, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.review, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.review, 'aggregate').mockResolvedValue({
        _avg: { rating: null },
      } as any);
      jest.spyOn(prisma.mechanicWorkLog, 'count').mockResolvedValue(0);

      // Act
      const result: OverviewStats = await service.getOverviewStats();

      // Assert
      expect(result).toEqual({
        totalRequests: 0,
        pendingRequests: 0,
        authorizedRequests: 0,
        capturedRequests: 0,
        finalizedRequests: 0,
        cancelledRequests: 0,
        totalRevenueCents: 0,
        activeMechanics: 0,
        totalMechanics: 0,
        totalReviews: 0,
        averageRating: 0,
        totalWorkLogs: 0,
      });
    });
  });

  describe('getRevenueMetrics', () => {
    it('should return revenue metrics with daily granularity', async () => {
      // Arrange
      const query: RevenueMetricsQuery = {
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        granularity: 'day',
      };

      const mockRequests = [
        { createdAt: new Date('2025-01-01'), finalAmountCents: 5000 },
        { createdAt: new Date('2025-01-01'), finalAmountCents: 5000 },
        { createdAt: new Date('2025-01-02'), finalAmountCents: 5000 },
        { createdAt: new Date('2025-01-02'), finalAmountCents: 5000 },
        { createdAt: new Date('2025-01-02'), finalAmountCents: 5000 },
        { createdAt: new Date('2025-01-03'), finalAmountCents: 6000 },
        { createdAt: new Date('2025-01-03'), finalAmountCents: 6000 },
      ];

      jest
        .spyOn(prisma.serviceRequest, 'findMany')
        .mockResolvedValue(mockRequests as any);

      // Act
      const result: RevenueMetrics = await service.getRevenueMetrics(query);

      // Assert
      expect(result.dataPoints).toHaveLength(3);
      expect(result.dataPoints[0]).toEqual({
        date: '2025-01-01',
        revenueCents: 10000,
        finalizedCount: 2,
        averageRequestCents: 5000,
      });
      expect(result.summary.totalRevenueCents).toBe(37000);
      expect(result.summary.totalFinalizedCount).toBe(7);
      expect(result.summary.averageRevenueCents).toBe(Math.round(37000 / 7));
      expect(result.summary.peakRevenueCents).toBe(15000);
      expect(result.summary.peakRevenueDate).toBe('2025-01-02');
    });

    it('should handle empty date range', async () => {
      // Arrange
      const query: RevenueMetricsQuery = {
        startDate: '2025-01-01',
        endDate: '2025-01-01',
        granularity: 'day',
      };

      jest.spyOn(prisma.serviceRequest, 'findMany').mockResolvedValue([]);

      // Act
      const result: RevenueMetrics = await service.getRevenueMetrics(query);

      // Assert
      expect(result.dataPoints).toHaveLength(0);
      expect(result.summary.totalRevenueCents).toBe(0);
      expect(result.summary.totalFinalizedCount).toBe(0);
      expect(result.summary.averageRevenueCents).toBe(0);
    });

    it('should use default granularity (day) when not specified', async () => {
      // Arrange
      const query: RevenueMetricsQuery = {
        startDate: '2025-01-01',
        endDate: '2025-01-07',
      };

      jest.spyOn(prisma.serviceRequest, 'findMany').mockResolvedValue([]);

      // Act
      await service.getRevenueMetrics(query);

      // Assert
      expect(prisma.serviceRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FINALIZED',
          }),
        }),
      );
    });
  });

  describe('getMechanicsPerformance', () => {
    it('should return mechanics performance data sorted by jobs', async () => {
      // Arrange
      const query: MechanicsPerformanceQuery = {
        sortBy: 'jobs',
        sortOrder: 'desc',
      };

      const mockMechanicsData = [
        {
          id: 'mech-1',
          name: 'John Doe',
          isActive: true,
          reviews: Array(10).fill({ rating: 4.8 }),
          workLogs: Array(15)
            .fill(null)
            .map(() => ({
              hoursWorkedMinutes: 480,
              payoutPercentage: 70,
              serviceRequest: { finalAmountCents: 10000 },
            })),
        },
        {
          id: 'mech-2',
          name: 'Jane Smith',
          isActive: true,
          reviews: Array(8).fill({ rating: 4.5 }),
          workLogs: Array(12)
            .fill(null)
            .map(() => ({
              hoursWorkedMinutes: 480,
              payoutPercentage: 70,
              serviceRequest: { finalAmountCents: 10000 },
            })),
        },
      ];

      jest
        .spyOn(prisma.mechanic, 'findMany')
        .mockResolvedValue(mockMechanicsData as any);

      // Act
      const result: MechanicsPerformance =
        await service.getMechanicsPerformance(query);

      // Assert
      expect(result.mechanics).toHaveLength(2);
      expect(result.mechanics[0].completedJobs).toBe(15);
      expect(result.mechanics[0].totalHoursWorked).toBe(120);
      expect(result.mechanics[0].totalEarningsCents).toBe(105000);
      expect(result.mechanics[0].averageRating).toBe(4.8);
      expect(result.mechanics[1].completedJobs).toBe(12);
      expect(result.mechanics[1].totalHoursWorked).toBe(96);
      expect(result.mechanics[1].totalEarningsCents).toBe(84000);
      expect(result.mechanics[1].averageRating).toBe(4.5);
      expect(result.summary.totalMechanics).toBe(2);
      expect(result.summary.activeMechanics).toBe(2);
      expect(result.summary.totalCompletedJobs).toBe(27);
      expect(result.summary.totalHoursWorked).toBe(216);
      expect(result.summary.averageRating).toBe(4.65);
    });

    it('should filter by active status when specified', async () => {
      // Arrange
      const query: MechanicsPerformanceQuery = {
        isActive: true,
      };

      jest.spyOn(prisma.mechanic, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.mechanicWorkLog, 'groupBy').mockResolvedValue([]);

      // Act
      await service.getMechanicsPerformance(query);

      // Assert
      expect(prisma.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });

    it('should filter by minimum jobs when specified', async () => {
      // Arrange
      const query: MechanicsPerformanceQuery = {
        minJobs: 10,
      };

      jest.spyOn(prisma.mechanic, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.mechanicWorkLog, 'groupBy').mockResolvedValue([]);

      // Act
      const result = await service.getMechanicsPerformance(query);

      // Assert - should filter mechanics with less than 10 jobs
      expect(result.mechanics.every((m) => m.completedJobs >= 10)).toBe(true);
    });

    it('should return empty array when no mechanics exist', async () => {
      // Arrange
      jest.spyOn(prisma.mechanic, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.mechanicWorkLog, 'groupBy').mockResolvedValue([]);

      // Act
      const result: MechanicsPerformance =
        await service.getMechanicsPerformance({});

      // Assert
      expect(result.mechanics).toHaveLength(0);
      expect(result.summary.totalMechanics).toBe(0);
      expect(result.summary.totalCompletedJobs).toBe(0);
    });
  });
});
