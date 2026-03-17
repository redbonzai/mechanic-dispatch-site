import { Injectable, Logger } from '@nestjs/common';
import {
  IRepairDataAdapter,
  RepairGuideResult,
  VehicleQuery,
} from '../interfaces/repair-data.interface';

/**
 * ALLDATA API Adapter
 *
 * ALLDATA provides OEM repair procedures, wiring diagrams, and TSBs.
 * Enterprise access: https://www.alldata.com/us/en/alldata-api
 *
 * Required environment variables:
 *   ALLDATA_API_KEY      - API key from ALLDATA
 *   ALLDATA_BASE_URL     - Defaults to https://api.alldata.com/v1
 *   ALLDATA_SUBSCRIBER_ID - Subscriber ID for your ALLDATA account
 */
@Injectable()
export class AllDataAdapter implements IRepairDataAdapter {
  readonly providerName = 'ALLDATA' as const;
  private readonly logger = new Logger(AllDataAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly subscriberId: string | undefined;

  constructor() {
    this.baseUrl = process.env.ALLDATA_BASE_URL ?? 'https://api.alldata.com/v1';
    this.apiKey = process.env.ALLDATA_API_KEY;
    this.subscriberId = process.env.ALLDATA_SUBSCRIBER_ID;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.subscriberId);
  }

  async searchRepairs(query: VehicleQuery): Promise<RepairGuideResult[]> {
    if (!this.isConfigured()) {
      this.logger.warn('ALLDATA credentials not configured — skipping');
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (query.make) params.set('make', query.make);
      if (query.model) params.set('model', query.model);
      if (query.year) params.set('year', String(query.year));
      if (query.symptom) params.set('symptom_description', query.symptom);
      if (query.systemCategory)
        params.set('system_category', query.systemCategory);

      const response = await fetch(
        `${this.baseUrl}/repair-procedures?${params.toString()}`,
        {
          headers: {
            'X-API-Key': this.apiKey!,
            'X-Subscriber-ID': this.subscriberId!,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!response.ok) {
        this.logger.error(
          `ALLDATA API error: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = (await response.json()) as AllDataApiResponse;
      return this.mapToUniform(data);
    } catch (error) {
      this.logger.error('ALLDATA request failed', error);
      return [];
    }
  }

  private mapToUniform(data: AllDataApiResponse): RepairGuideResult[] {
    if (!data?.procedures?.length) return [];

    return data.procedures.map((proc) => ({
      externalId: String(proc.procedure_id),
      source: this.providerName,
      title: proc.title,
      symptom: proc.symptom_description ?? proc.title,
      systemCategory: proc.system_category ?? 'General',
      difficulty: mapAllDataDifficulty(proc.skill_level),
      diyFriendly: proc.skill_level !== 'PROFESSIONAL',
      estimatedCostMinCents: proc.labor_cost_estimate_min
        ? Math.round(proc.labor_cost_estimate_min * 100)
        : undefined,
      estimatedCostMaxCents: proc.labor_cost_estimate_max
        ? Math.round(proc.labor_cost_estimate_max * 100)
        : undefined,
      timeEstimateMinutes: proc.labor_time_hours
        ? Math.round(proc.labor_time_hours * 60)
        : undefined,
      steps: (proc.steps ?? []).map((step, i) => ({
        order: step.step_number ?? i + 1,
        description: step.instruction,
        tip: step.note,
      })),
      tools: proc.special_tools ?? [],
      parts: (proc.parts ?? []).map((p) => p.description),
      warnings: proc.cautions ?? [],
      relatedSkills: mapAllDataSystemToSkills(proc.system_category),
      sourceUrl: proc.source_url,
    }));
  }
}

function mapAllDataDifficulty(
  level: string | undefined,
): RepairGuideResult['difficulty'] {
  switch (level?.toUpperCase()) {
    case 'ENTRY':
    case 'BASIC':
      return 'BEGINNER';
    case 'INTERMEDIATE':
      return 'INTERMEDIATE';
    case 'ADVANCED':
      return 'ADVANCED';
    case 'PROFESSIONAL':
      return 'PROFESSIONAL';
    default:
      return 'INTERMEDIATE';
  }
}

function mapAllDataSystemToSkills(category?: string): string[] {
  const map: Record<string, string[]> = {
    BRAKES: ['Brake Repair', 'Brake Pad Replacement'],
    ENGINE: ['Engine Diagnostics', 'Engine Repair'],
    ELECTRICAL: ['Electrical Diagnosis', 'Battery Replacement'],
    TRANSMISSION: ['Transmission Repair', 'Transmission Service'],
    SUSPENSION: ['Suspension Repair', 'Alignment'],
    HVAC: ['AC Service', 'Climate Control'],
    FUEL: ['Fuel System', 'Fuel Injection'],
    EXHAUST: ['Exhaust Repair', 'Catalytic Converter'],
    OIL: ['Oil Change', 'Lubrication Service'],
  };
  return map[category?.toUpperCase() ?? ''] ?? [];
}

// Raw API response shapes — update to match actual ALLDATA API contract
interface AllDataProcedureStep {
  step_number?: number;
  instruction: string;
  note?: string;
}

interface AllDataProcedure {
  procedure_id: string | number;
  title: string;
  symptom_description?: string;
  system_category?: string;
  skill_level?: string;
  labor_cost_estimate_min?: number;
  labor_cost_estimate_max?: number;
  labor_time_hours?: number;
  steps?: AllDataProcedureStep[];
  special_tools?: string[];
  parts?: Array<{ description: string; part_number?: string }>;
  cautions?: string[];
  source_url?: string;
}

interface AllDataApiResponse {
  procedures: AllDataProcedure[];
}
