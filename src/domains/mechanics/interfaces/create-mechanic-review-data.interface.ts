export interface CreateMechanicReviewData {
  rating: number;
  reviewerName: string;
  reviewerLocation: string;
  reviewText: string;
  carModel: string;
  carYear: number;
  serviceDescription: string;
  mechanicId: string;
  serviceRequestId?: string | null;
  photoUrls?: string[];
}