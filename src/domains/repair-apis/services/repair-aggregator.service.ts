import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RepairPalAdapter } from '../adapters/repairpal.adapter';
import { AllDataAdapter } from '../adapters/alldata.adapter';
import { CarMdAdapter } from '../adapters/carmd.adapter';
import {
  RepairGuideResult,
  VehicleQuery,
} from '../interfaces/repair-data.interface';

/**
 * Aggregates repair data from all configured provider adapters plus the
 * internal RepairGuide database. Results are deduplicated and ranked by
 * data completeness (step count) and source priority.
 *
 * Source priority: INTERNAL > ALLDATA > REPAIRPAL > CARMD
 */
@Injectable()
export class RepairAggregatorService {
  private readonly logger = new Logger(RepairAggregatorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repairPal: RepairPalAdapter,
    private readonly allData: AllDataAdapter,
    private readonly carMd: CarMdAdapter,
  ) {}

  async search(query: VehicleQuery): Promise<RepairGuideResult[]> {
    const [internal, external] = await Promise.all([
      this.searchInternal(query),
      this.searchExternalProviders(query),
    ]);

    const combined = [...internal, ...external];
    return this.deduplicateAndRank(combined);
  }

  private async searchInternal(
    query: VehicleQuery,
  ): Promise<RepairGuideResult[]> {
    try {
      const where: Record<string, unknown> = { isPublished: true };

      if (query.systemCategory) {
        where.systemCategory = query.systemCategory;
      }

      const guides = await this.prisma.repairGuide.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      // Filter by symptom keyword match in memory (no full-text in schema)
      const keyword = query.symptom?.toLowerCase();
      const filtered = keyword
        ? guides.filter(
            (g) =>
              g.symptom.toLowerCase().includes(keyword) ||
              g.title.toLowerCase().includes(keyword) ||
              g.relatedSkills.some((s) => s.toLowerCase().includes(keyword)),
          )
        : guides;

      return filtered.map((g) => ({
        externalId: g.id,
        source: 'INTERNAL' as const,
        title: g.title,
        symptom: g.symptom,
        systemCategory: g.systemCategory,
        difficulty: g.difficulty as RepairGuideResult['difficulty'],
        diyFriendly: g.diyFriendly,
        estimatedCostMinCents: g.estimatedCostMinCents ?? undefined,
        estimatedCostMaxCents: g.estimatedCostMaxCents ?? undefined,
        timeEstimateMinutes: g.timeEstimateMinutes ?? undefined,
        steps: (g.steps as unknown as RepairGuideResult['steps']) ?? [],
        tools: g.tools,
        parts: g.parts,
        warnings: g.warnings,
        relatedSkills: g.relatedSkills,
      }));
    } catch (error) {
      this.logger.error('Internal repair guide search failed', error);
      return [];
    }
  }

  private async searchExternalProviders(
    query: VehicleQuery,
  ): Promise<RepairGuideResult[]> {
    const adapters = [this.repairPal, this.allData, this.carMd].filter((a) =>
      a.isConfigured(),
    );

    if (!adapters.length) {
      this.logger.debug('No external repair API providers configured');
      return [];
    }

    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchRepairs(query)),
    );

    return results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : [],
    );
  }

  private deduplicateAndRank(
    results: RepairGuideResult[],
  ): RepairGuideResult[] {
    const sourcePriority: Record<RepairGuideResult['source'], number> = {
      INTERNAL: 4,
      ALLDATA: 3,
      REPAIRPAL: 2,
      CARMD: 1,
    };

    // Deduplicate by normalised title
    const seen = new Set<string>();
    const unique = results.filter((r) => {
      const key = r.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => {
      // Sort by completeness (has steps) then source priority
      const aSteps = a.steps.length > 0 ? 1 : 0;
      const bSteps = b.steps.length > 0 ? 1 : 0;
      if (bSteps !== aSteps) return bSteps - aSteps;
      return sourcePriority[b.source] - sourcePriority[a.source];
    });
  }
}
