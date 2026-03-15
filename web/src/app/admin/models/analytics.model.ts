export interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalMechanics: number;
  activeMechanics: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  monthlyRevenueCents: number;
  totalSearchQueries: number;
  searchQueriesThisMonth: number;
  totalReviews: number;
  averageRating: number;
}

export interface SubscriptionBreakdown {
  tier: string;
  count: number;
  revenueCents: number;
}

export interface SubscriptionMetrics {
  breakdown: SubscriptionBreakdown[];
  totalRevenueCents: number;
  totalActive: number;
  totalTrialing: number;
  totalCancelled: number;
  totalPastDue: number;
}

export interface SearchQueryEntry {
  query: string;
  count: number;
  lastSearched: string;
}

export interface TopQueriesResponse {
  queries: SearchQueryEntry[];
}

export interface SearchVolumePoint {
  date: string;
  count: number;
}

export interface SearchVolumeResponse {
  dataPoints: SearchVolumePoint[];
  total: number;
}

export interface MechanicAnalyticsEntry {
  id: string;
  name: string;
  location: string;
  subscriptionTier: string | null;
  subscriptionStatus: string;
  profileViews: number;
  searchAppearances: number;
  linkClicks: number;
  rating: number;
  reviewCount: number;
}

export interface MechanicAnalyticsResponse {
  mechanics: MechanicAnalyticsEntry[];
  total: number;
}
