import { Test, TestingModule } from '@nestjs/testing';
import {
  AdminAnalyticsService,
  PlatformOverviewStats,
  TopSearchQuery,
  SearchVolumePoint,
  MechanicAnalyticsSummary,
  SubscriptionMetrics,
} from '../../src/domains/admin/analytics';
import { PrismaService } from '../../src/domains/database/prisma.service';

describe('AdminAnalyticsService (Unit Tests - 80%)', () => {
  let service: AdminAnalyticsService;

  const mockPrisma = {
    user: {
      count: jest.fn(),
    },
    mechanic: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    searchQuery: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    mechanicSubscription: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminAnalyticsService>(AdminAnalyticsService);
    void module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── getOverviewStats ───────────────────────────────────────────────────────

  describe('getOverviewStats', () => {
    it('should return platform overview statistics', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(420);

      mockPrisma.mechanic.count
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(55)
        .mockResolvedValueOnce(3);

      mockPrisma.searchQuery.count.mockResolvedValue(4000);
      mockPrisma.review.count.mockResolvedValue(210);
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.6 },
      } as never);

      const result: PlatformOverviewStats = await service.getOverviewStats();

      expect(result.totalUsers).toBe(500);
      expect(result.activeUsers).toBe(420);
      expect(result.totalMechanics).toBe(80);
      expect(result.activeMechanics).toBe(60);
      expect(result.totalSearches).toBe(4000);
      expect(result.totalReviews).toBe(210);
      expect(result.averageRating).toBe(4.6);
    });

    it('should return zero averageRating when no reviews exist', async () => {
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.mechanic.count.mockResolvedValue(0);
      mockPrisma.searchQuery.count.mockResolvedValue(0);
      mockPrisma.review.count.mockResolvedValue(0);
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
      } as never);

      const result = await service.getOverviewStats();

      expect(result.averageRating).toBe(0);
      expect(result.totalUsers).toBe(0);
    });
  });

  // ── getTopSearchQueries ────────────────────────────────────────────────────

  describe('getTopSearchQueries', () => {
    it('should return top search queries sorted by count', async () => {
      mockPrisma.searchQuery.groupBy.mockResolvedValue([
        { query: 'check engine light', _count: { query: 120 } },
        { query: 'brake squealing', _count: { query: 89 } },
        { query: 'oil change', _count: { query: 75 } },
      ] as never);

      const result: TopSearchQuery[] = await service.getTopSearchQueries(20);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ query: 'check engine light', count: 120 });
      expect(result[1]).toEqual({ query: 'brake squealing', count: 89 });
    });

    it('should use default limit of 20 when not specified', async () => {
      mockPrisma.searchQuery.groupBy.mockResolvedValue([]);

      await service.getTopSearchQueries();

      expect(mockPrisma.searchQuery.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });

    it('should return empty array when no searches exist', async () => {
      mockPrisma.searchQuery.groupBy.mockResolvedValue([]);

      const result = await service.getTopSearchQueries();

      expect(result).toEqual([]);
    });
  });

  // ── getSearchVolume ────────────────────────────────────────────────────────

  describe('getSearchVolume', () => {
    it('should group searches by date and return volume points', async () => {
      const d1 = new Date('2026-03-01T10:00:00Z');
      const d2 = new Date('2026-03-01T14:00:00Z');
      const d3 = new Date('2026-03-02T09:00:00Z');

      mockPrisma.searchQuery.findMany.mockResolvedValue([
        { createdAt: d1 },
        { createdAt: d2 },
        { createdAt: d3 },
      ] as never);

      const result: SearchVolumePoint[] = await service.getSearchVolume(30);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2026-03-01', count: 2 });
      expect(result[1]).toEqual({ date: '2026-03-02', count: 1 });
    });

    it('should return empty array when no searches in range', async () => {
      mockPrisma.searchQuery.findMany.mockResolvedValue([]);

      const result = await service.getSearchVolume(7);

      expect(result).toEqual([]);
    });
  });

  // ── getMechanicAnalytics ───────────────────────────────────────────────────

  describe('getMechanicAnalytics', () => {
    it('should return paginated mechanic analytics', async () => {
      const mockMechanics = [
        {
          id: 'mech_1',
          name: 'Jane Wrench',
          slug: 'jane-wrench',
          subscriptionTier: 'PRO',
          subscriptionStatus: 'ACTIVE',
          profileViews: 200,
          searchAppearances: 800,
          linkClicks: 40,
          rating: 4.8,
          reviewCount: 22,
        },
      ];

      mockPrisma.mechanic.findMany.mockResolvedValue(mockMechanics as never);
      mockPrisma.mechanic.count.mockResolvedValue(1);

      const result = await service.getMechanicAnalytics({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.mechanics).toHaveLength(1);

      const m: MechanicAnalyticsSummary = result.mechanics[0];
      expect(m.name).toBe('Jane Wrench');
      expect(m.profileViews).toBe(200);
      expect(m.linkClicks).toBe(40);
    });

    it('should apply correct pagination offset', async () => {
      mockPrisma.mechanic.findMany.mockResolvedValue([]);
      mockPrisma.mechanic.count.mockResolvedValue(0);

      await service.getMechanicAnalytics({ page: 3, limit: 10 });

      expect(mockPrisma.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  // ── getSubscriptionMetrics ─────────────────────────────────────────────────

  describe('getSubscriptionMetrics', () => {
    it('should return subscription metrics with revenue', async () => {
      mockPrisma.mechanic.count
        .mockResolvedValueOnce(20) // BASIC ACTIVE
        .mockResolvedValueOnce(18) // PRO ACTIVE
        .mockResolvedValueOnce(7) // PREMIUM ACTIVE
        .mockResolvedValueOnce(10) // TRIALING
        .mockResolvedValueOnce(3); // CANCELLED this month

      const result: SubscriptionMetrics =
        await service.getSubscriptionMetrics();

      expect(result.totalSubscribers).toBe(45);
      expect(result.basicCount).toBe(20);
      expect(result.proCount).toBe(18);
      expect(result.premiumCount).toBe(7);
      expect(result.trialingCount).toBe(10);
      expect(result.churnedThisMonth).toBe(3);
      // Revenue: 20*2900 + 18*5900 + 7*9900
      expect(result.monthlyRevenueCents).toBe(20 * 2900 + 18 * 5900 + 7 * 9900);
    });

    it('should return zeros when no subscriptions exist', async () => {
      mockPrisma.mechanic.count.mockResolvedValue(0);

      const result = await service.getSubscriptionMetrics();

      expect(result.totalSubscribers).toBe(0);
      expect(result.monthlyRevenueCents).toBe(0);
    });
  });
});
