import { Injectable, Logger } from '@nestjs/common';
import {
  IRepairDataAdapter,
  RepairGuideResult,
  VehicleQuery,
} from '../interfaces/repair-data.interface';

/**
 * CarMD API Adapter
 *
 * CarMD provides OBD-II diagnostic data, repair cost estimates, and maintenance info.
 * Developer access: https://www.carmd.com/api/
 *
 * Required environment variables:
 *   CARMD_API_KEY       - API key from CarMD developer portal
 *   CARMD_PARTNER_TOKEN - Partner token (required alongside API key)
 *   CARMD_BASE_URL      - Defaults to https://api.carmd.com/v3.0
 */
@Injectable()
export class CarMdAdapter implements IRepairDataAdapter {
  readonly providerName = 'CARMD' as const;
  private readonly logger = new Logger(CarMdAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly partnerToken: string | undefined;

  constructor() {
    this.baseUrl =
      process.env.CARMD_BASE_URL ?? 'https://api.carmd.com/v3.0';
    this.apiKey = process.env.CARMD_API_KEY;
    this.partnerToken = process.env.CARMD_PARTNER_TOKEN;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.partnerToken);
  }

  async searchRepairs(query: VehicleQuery): Promise<RepairGuideResult[]> {
    if (!this.isConfigured()) {
      this.logger.warn('CarMD credentials not configured — skipping');
      return [];
    }

    try {
      // CarMD is primarily VIN-based; fall back to make/model/year lookup
      const endpoint = query.vin
        ? `${this.baseUrl}/repair?vin=${encodeURIComponent(query.vin)}`
        : this.buildMakeModelEndpoint(query);

      if (!endpoint) return [];

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'partner-token': this.partnerToken!,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        this.logger.error(
          `CarMD API error: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = (await response.json()) as CarMdApiResponse;
      return this.mapToUniform(data, query);
    } catch (error) {
      this.logger.error('CarMD request failed', error);
      return [];
    }
  }

  private buildMakeModelEndpoint(query: VehicleQuery): string | null {
    if (!query.make || !query.model || !query.year) return null;
    const params = new URLSearchParams({
      make: query.make,
      model: query.model,
      year: String(query.year),
    });
    if (query.symptom) params.set('symptom', query.symptom);
    return `${this.baseUrl}/repair?${params.toString()}`;
  }

  private mapToUniform(
    data: CarMdApiResponse,
    query: VehicleQuery,
  ): RepairGuideResult[] {
    if (!data?.data?.length) return [];

    return data.data.map((item) => ({
      externalId: item.repair_id ? String(item.repair_id) : undefined,
      source: this.providerName,
      title: item.repair ?? query.symptom ?? 'Repair',
      symptom: item.repair ?? query.symptom ?? 'Diagnostic',
      systemCategory: item.part_category ?? 'General',
      difficulty: item.urgency === 'Critical' ? 'PROFESSIONAL' : 'INTERMEDIATE',
      diyFriendly: item.urgency !== 'Critical',
      estimatedCostMinCents: item.labor_cost_min
        ? Math.round(
            (item.labor_cost_min + (item.parts_cost_min ?? 0)) * 100,
          )
        : undefined,
      estimatedCostMaxCents: item.labor_cost_max
        ? Math.round(
            (item.labor_cost_max + (item.parts_cost_max ?? 0)) * 100,
          )
        : undefined,
      timeEstimateMinutes: undefined,
      steps: [],
      tools: [],
      parts: item.parts?.map((p) => p.part_name) ?? [],
      warnings:
        item.urgency === 'Critical'
          ? ['This repair is critical. Seek professional service immediately.']
          : [],
      relatedSkills: mapCarMdCategoryToSkills(item.part_category),
      sourceUrl: item.repair_url,
    }));
  }
}

function mapCarMdCategoryToSkills(category?: string): string[] {
  const map: Record<string, string[]> = {
    Brakes: ['Brake Repair', 'Brake Pad Replacement'],
    Engine: ['Engine Diagnostics', 'Engine Repair'],
    Electrical: ['Electrical Diagnosis'],
    Transmission: ['Transmission Repair'],
    Suspension: ['Suspension Repair'],
    'Heating & Cooling': ['AC Service', 'Climate Control'],
    Fuel: ['Fuel System'],
    Exhaust: ['Exhaust Repair'],
    'Scheduled Maintenance': ['Oil Change', 'Preventive Maintenance'],
  };
  return map[category ?? ''] ?? [];
}

// Raw API response shapes — update to match actual CarMD API contract
interface CarMdRepairItem {
  repair_id?: string | number;
  repair?: string;
  part_category?: string;
  urgency?: string;
  labor_cost_min?: number;
  labor_cost_max?: number;
  parts_cost_min?: number;
  parts_cost_max?: number;
  parts?: Array<{ part_name: string; part_number?: string }>;
  repair_url?: string;
}

interface CarMdApiResponse {
  data: CarMdRepairItem[];
}
