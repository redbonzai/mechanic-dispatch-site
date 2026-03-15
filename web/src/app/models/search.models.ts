export interface RepairStep {
  order: number;
  description: string;
  tip?: string;
}

export interface RepairGuideResult {
  externalId?: string;
  source: 'REPAIRPAL' | 'ALLDATA' | 'CARMD' | 'INTERNAL';
  title: string;
  symptom: string;
  systemCategory: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  diyFriendly: boolean;
  estimatedCostMinCents?: number;
  estimatedCostMaxCents?: number;
  timeEstimateMinutes?: number;
  steps: RepairStep[];
  tools: string[];
  parts: string[];
  warnings: string[];
  relatedSkills: string[];
  sourceUrl?: string;
}

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
