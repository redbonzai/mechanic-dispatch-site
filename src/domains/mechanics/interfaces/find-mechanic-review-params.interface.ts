export interface FindMechanicReviewsParams {
  mechanicId?: string;
  rating?: number;
  serviceDescription?: string;
  vehicleMake?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'relevance';
}
