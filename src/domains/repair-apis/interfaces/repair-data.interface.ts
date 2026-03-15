/**
 * Uniform repair data contract returned by all provider adapters.
 * Each adapter (RepairPal, ALLDATA, CarMD) maps its response to this shape.
 */

export type RepairDifficultyLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'PROFESSIONAL';

export interface RepairStep {
  order: number;
  description: string;
  tip?: string;
}

export interface RepairGuideResult {
  /** Unique ID from the source provider */
  externalId?: string;
  /** Source provider name */
  source: 'REPAIRPAL' | 'ALLDATA' | 'CARMD' | 'INTERNAL';
  title: string;
  symptom: string;
  systemCategory: string;
  difficulty: RepairDifficultyLevel;
  diyFriendly: boolean;
  estimatedCostMinCents?: number;
  estimatedCostMaxCents?: number;
  timeEstimateMinutes?: number;
  steps: RepairStep[];
  tools: string[];
  parts: string[];
  warnings: string[];
  /** Skill names relevant to this repair (used for mechanic matching) */
  relatedSkills: string[];
  /** Attribution or source URL */
  sourceUrl?: string;
}

export interface VehicleQuery {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  symptom?: string;
  systemCategory?: string;
}

export interface NhtsaRecall {
  recallId: string;
  reportReceivedDate: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  campaignNumber: string;
}

export interface VehicleDecodeResult {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  bodyStyle?: string;
  driveType?: string;
  fuelType?: string;
  recalls?: NhtsaRecall[];
}

/**
 * Contract all repair provider adapters must implement.
 */
export interface IRepairDataAdapter {
  readonly providerName: RepairGuideResult['source'];
  isConfigured(): boolean;
  searchRepairs(query: VehicleQuery): Promise<RepairGuideResult[]>;
}
