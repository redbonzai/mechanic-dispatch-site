import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RepairAggregatorService } from '../../repair-apis/services/repair-aggregator.service';
import { SearchFixesDto } from '../dto/search-fixes.dto';
import { RepairGuideResult } from '../../repair-apis/interfaces/repair-data.interface';

export interface MechanicSummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  location: string;
  rating: number;
  reviewCount: number;
  subscriptionTier: string | null;
  skills: string[];
  website: string | null;
  phone: string | null;
  profileViews: number;
}

export interface SearchResult {
  query: string;
  guides: RepairGuideResult[];
  mechanics: MechanicSummary[];
  recalls: unknown[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aggregator: RepairAggregatorService,
  ) {}

  async searchFixes(
    dto: SearchFixesDto,
    userId?: string,
  ): Promise<SearchResult> {
    const [guides, mechanics] = await Promise.all([
      this.aggregator.search({
        make: dto.make,
        model: dto.model,
        year: dto.year,
        vin: dto.vin,
        symptom: dto.q,
      }),
      this.findMatchingMechanics(dto.q),
    ]);

    // Record the search query for analytics
    await this.recordSearchQuery(dto, guides.length, userId);

    // Increment search count on user if authenticated
    if (userId) {
      await this.prisma.user
        .update({
          where: { id: userId },
          data: { searchCount: { increment: 1 } },
        })
        .catch(() => null);
    }

    return {
      query: dto.q,
      guides,
      mechanics,
      recalls: [],
    };
  }

  private async findMatchingMechanics(
    query: string,
  ): Promise<MechanicSummary[]> {
    const keyword = query.toLowerCase();

    // Find skills whose name matches the query
    const matchingSkills = await this.prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { category: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true },
    });

    const skillIds = matchingSkills.map((s) => s.id);

    const mechanics = await this.prisma.mechanic.findMany({
      where: {
        isActive: true,
        subscriptionStatus: { in: ['ACTIVE', 'TRIALING'] },
        ...(skillIds.length > 0
          ? {
              skills: { some: { skillId: { in: skillIds } } },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        location: true,
        rating: true,
        reviewCount: true,
        subscriptionTier: true,
        website: true,
        phone: true,
        profileViews: true,
        skills: { include: { skill: { select: { name: true } } } },
      },
      orderBy: [
        // Premium mechanics first, then Pro, then Basic
        { subscriptionTier: 'asc' },
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: 10,
    });

    // Increment search appearances for matching mechanics
    if (mechanics.length > 0) {
      const ids = mechanics.map((m) => m.id);
      await this.prisma.mechanic
        .updateMany({
          where: { id: { in: ids } },
          data: { searchAppearances: { increment: 1 } },
        })
        .catch(() => null);
    }

    return mechanics.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      imageUrl: m.imageUrl,
      location: m.location,
      rating: m.rating,
      reviewCount: m.reviewCount,
      subscriptionTier: m.subscriptionTier,
      website: m.website,
      phone: m.phone,
      profileViews: m.profileViews,
      skills: m.skills.map((ms) => ms.skill.name),
    }));
  }

  private async recordSearchQuery(
    dto: SearchFixesDto,
    resultsCount: number,
    userId?: string,
  ) {
    await this.prisma.searchQuery
      .create({
        data: {
          query: dto.q,
          make: dto.make,
          model: dto.model,
          year: dto.year,
          userId: userId ?? null,
          sessionId: dto.sessionId ?? null,
          resultsCount,
        },
      })
      .catch(() => null);
  }

  async trackMechanicView(
    mechanicId: string,
    options: {
      userId?: string;
      sessionId?: string;
      source?: string;
      clickedLink?: boolean;
    },
  ) {
    const { userId, sessionId, source, clickedLink = false } = options;

    await this.prisma.mechanicProfileView
      .create({
        data: { mechanicId, userId, sessionId, source, clickedLink },
      })
      .catch(() => null);

    await this.prisma.mechanic
      .update({
        where: { id: mechanicId },
        data: {
          profileViews: { increment: 1 },
          ...(clickedLink ? { linkClicks: { increment: 1 } } : {}),
        },
      })
      .catch(() => null);
  }
}
