import { Injectable, Logger } from '@nestjs/common';
import {
  IRepairDataAdapter,
  RepairGuideResult,
  VehicleQuery,
} from '../interfaces/repair-data.interface';

/**
 * RepairPal API Adapter
 *
 * RepairPal provides repair cost estimates, shop ratings, and repair guides.
 * Partner API access: https://repairpal.com/partners
 *
 * Required environment variables:
 *   REPAIRPAL_API_KEY  - API key from RepairPal partner program
 *   REPAIRPAL_BASE_URL - Defaults to https://api.repairpal.com/v1
 */
@Injectable()
export class RepairPalAdapter implements IRepairDataAdapter {
  readonly providerName = 'REPAIRPAL' as const;
  private readonly logger = new Logger(RepairPalAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor() {
    this.baseUrl =
      process.env.REPAIRPAL_BASE_URL ?? 'https://api.repairpal.com/v1';
    this.apiKey = process.env.REPAIRPAL_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async searchRepairs(query: VehicleQuery): Promise<RepairGuideResult[]> {
    if (!this.isConfigured()) {
      this.logger.warn('RepairPal API key not configured — skipping');
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (query.make) params.set('make', query.make);
      if (query.model) params.set('model', query.model);
      if (query.year) params.set('year', String(query.year));
      if (query.symptom) params.set('symptom', query.symptom);

      const response = await fetch(
        `${this.baseUrl}/repairs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(8000),
        },
      );

      if (!response.ok) {
        this.logger.error(
          `RepairPal API error: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = (await response.json()) as RepairPalApiResponse;
      return this.mapToUniform(data);
    } catch (error) {
      this.logger.error('RepairPal request failed', error);
      return [];
    }
  }

  private mapToUniform(data: RepairPalApiResponse): RepairGuideResult[] {
    if (!data?.repairs?.length) return [];

    return data.repairs.map((repair) => ({
      externalId: String(repair.id),
      source: this.providerName,
      title: repair.name,
      symptom: repair.symptom ?? repair.name,
      systemCategory: repair.category ?? 'General',
      difficulty: mapRepairPalDifficulty(repair.diy_difficulty),
      diyFriendly: repair.diy_friendly ?? false,
      estimatedCostMinCents: repair.cost_estimate_min
        ? Math.round(repair.cost_estimate_min * 100)
        : undefined,
      estimatedCostMaxCents: repair.cost_estimate_max
        ? Math.round(repair.cost_estimate_max * 100)
        : undefined,
      timeEstimateMinutes: repair.time_estimate_hours
        ? Math.round(repair.time_estimate_hours * 60)
        : undefined,
      steps: (repair.steps ?? []).map((step, i) => ({
        order: i + 1,
        description: step.description,
        tip: step.tip,
      })),
      tools: repair.tools ?? [],
      parts: repair.parts ?? [],
      warnings: repair.warnings ?? [],
      relatedSkills: repair.skills ?? [],
      sourceUrl: repair.url,
    }));
  }
}

function mapRepairPalDifficulty(
  level: string | undefined,
): RepairGuideResult['difficulty'] {
  switch (level?.toLowerCase()) {
    case 'easy':
      return 'BEGINNER';
    case 'moderate':
      return 'INTERMEDIATE';
    case 'hard':
      return 'ADVANCED';
    case 'professional':
      return 'PROFESSIONAL';
    default:
      return 'INTERMEDIATE';
  }
}

// Raw API response shapes — update to match actual RepairPal API contract
interface RepairPalApiRepair {
  id: number | string;
  name: string;
  symptom?: string;
  category?: string;
  diy_difficulty?: string;
  diy_friendly?: boolean;
  cost_estimate_min?: number;
  cost_estimate_max?: number;
  time_estimate_hours?: number;
  steps?: Array<{ description: string; tip?: string }>;
  tools?: string[];
  parts?: string[];
  warnings?: string[];
  skills?: string[];
  url?: string;
}

interface RepairPalApiResponse {
  repairs: RepairPalApiRepair[];
}
