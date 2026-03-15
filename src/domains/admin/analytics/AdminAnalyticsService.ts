import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PlatformOverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalMechanics: number;
  activeMechanics: number;
  mechsTrialing: number;
  mechsActive: number;
  mechsPastDue: number;
  subscriptionRevenueMonthlyCents: number;
  totalSearches: number;
  totalReviews: number;
  averageRating: number;
}

export interface TopSearchQuery {
  query: string;
  count: number;
}

export interface SearchVolumePoint {
  date: string;
  count: number;
}

export interface MechanicAnalyticsSummary {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string | null;
  subscriptionStatus: string;
  profileViews: number;
  searchAppearances: number;
  linkClicks: number;
  rating: number;
  reviewCount: number;
}

export interface SubscriptionMetrics {
  totalSubscribers: number;
  basicCount: number;
  proCount: number;
  premiumCount: number;
  trialingCount: number;
  monthlyRevenueCents: number;
  churnedThisMonth: number;
}

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewStats(): Promise<PlatformOverviewStats> {
    const [
      totalUsers,
      activeUsers,
      totalMechanics,
      activeMechanics,
      mechsTrialing,
      mechsActive,
      mechsPastDue,
      totalSearches,
      totalReviews,
      ratingAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.mechanic.count(),
      this.prisma.mechanic.count({ where: { isActive: true } }),
      this.prisma.mechanic.count({
        where: { subscriptionStatus: 'TRIALING' },
      }),
      this.prisma.mechanic.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      this.prisma.mechanic.count({
        where: { subscriptionStatus: 'PAST_DUE' },
      }),
      this.prisma.searchQuery.count(),
      this.prisma.review.count(),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    const subscriptionRevenueMonthlyCents = this.calcMonthlyRevenue(
      mechsActive,
      mechsTrialing,
    );

    return {
      totalUsers,
      activeUsers,
      totalMechanics,
      activeMechanics,
      mechsTrialing,
      mechsActive,
      mechsPastDue,
      subscriptionRevenueMonthlyCents,
      totalSearches,
      totalReviews,
      averageRating: ratingAggregate._avg.rating ?? 0,
    };
  }

  async getTopSearchQueries(limit = 20): Promise<TopSearchQuery[]> {
    const results = await this.prisma.searchQuery.groupBy({
      by: ['query'],
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });

    return results.map((r) => ({
      query: r.query,
      count: r._count.query,
    }));
  }

  async getSearchVolume(days = 30): Promise<SearchVolumePoint[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const searches = await this.prisma.searchQuery.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = new Map<string, number>();
    searches.forEach((s) => {
      const key = s.createdAt.toISOString().split('T')[0];
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

    return Array.from(grouped.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getMechanicAnalytics(params: {
    page: number;
    limit: number;
    sortBy?: string;
  }): Promise<{ mechanics: MechanicAnalyticsSummary[]; total: number }> {
    const { page, limit, sortBy = 'profileViews' } = params;
    const validSortFields = [
      'profileViews',
      'searchAppearances',
      'linkClicks',
      'rating',
    ] as const;
    const field = validSortFields.includes(sortBy as never)
      ? (sortBy as (typeof validSortFields)[number])
      : 'profileViews';

    const [mechanics, total] = await Promise.all([
      this.prisma.mechanic.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [field]: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          profileViews: true,
          searchAppearances: true,
          linkClicks: true,
          rating: true,
          reviewCount: true,
        },
      }),
      this.prisma.mechanic.count(),
    ]);

    return { mechanics, total };
  }

  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    const [basicCount, proCount, premiumCount, trialingCount, churnedSubs] =
      await Promise.all([
        this.prisma.mechanic.count({
          where: {
            subscriptionTier: 'BASIC',
            subscriptionStatus: 'ACTIVE',
          },
        }),
        this.prisma.mechanic.count({
          where: {
            subscriptionTier: 'PRO',
            subscriptionStatus: 'ACTIVE',
          },
        }),
        this.prisma.mechanic.count({
          where: {
            subscriptionTier: 'PREMIUM',
            subscriptionStatus: 'ACTIVE',
          },
        }),
        this.prisma.mechanic.count({
          where: { subscriptionStatus: 'TRIALING' },
        }),
        this.prisma.mechanic.count({
          where: {
            subscriptionStatus: 'CANCELLED',
            updatedAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ),
            },
          },
        }),
      ]);

    const totalSubscribers = basicCount + proCount + premiumCount;
    // $29 basic, $59 pro, $99 premium
    const monthlyRevenueCents =
      basicCount * 2900 + proCount * 5900 + premiumCount * 9900;

    return {
      totalSubscribers,
      basicCount,
      proCount,
      premiumCount,
      trialingCount,
      monthlyRevenueCents,
      churnedThisMonth: churnedSubs,
    };
  }

  private calcMonthlyRevenue(active: number, trialing: number): number {
    // Conservative estimate: assume 50% Basic, 35% Pro, 15% Premium for active
    const estimated =
      Math.round(active * 0.5) * 2900 +
      Math.round(active * 0.35) * 5900 +
      Math.round(active * 0.15) * 9900;
    return estimated;
  }
}
