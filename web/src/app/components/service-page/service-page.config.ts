export interface PricingRow {
  car: string;
  listingPrice: string;
  yourPrice: string;
}

export interface ServicePageConfig {
  title: string;
  subtitle: string;
  ctaButtonText?: string;
  pricingTable: PricingRow[];
  includedItems: string[];
  description: {
    title: string;
    content: string[];
    sections?: Array<{
      title: string;
      content: string;
    }>;
  };
  reviews?: {
    overallRating: number;
    totalReviews: number;
    ratingDistribution?: { stars: number; count: number }[];
  };
  articles?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
}

















