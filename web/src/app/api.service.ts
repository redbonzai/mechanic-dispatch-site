import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  getReviews(params?: {
    mechanicId?: string;
    rating?: number;
    service?: string;
    vehicleMake?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'relevance';
  }): Observable<Review[]> {
    const queryParams = new URLSearchParams();
    if (params?.mechanicId) queryParams.append('mechanicId', params.mechanicId);
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.service) queryParams.append('service', params.service);
    if (params?.vehicleMake) queryParams.append('vehicleMake', params.vehicleMake);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    return this.http.get<Review[]>(`${this.baseUrl}/reviews?${queryParams.toString()}`);
  }

  getReviewStats(mechanicId?: string): Observable<{ totalReviews: number; averageRating: number }> {
    const queryParams = mechanicId ? `?mechanicId=${mechanicId}` : '';
    return this.http.get<{ totalReviews: number; averageRating: number }>(
      `${this.baseUrl}/reviews/stats${queryParams}`,
    );
  }

  getMechanic(id: string): Observable<Mechanic> {
    return this.http.get<Mechanic>(`${this.baseUrl}/mechanics/${id}`);
  }

  getMechanicBySlug(slug: string): Observable<Mechanic> {
    return this.http.get<Mechanic>(`${this.baseUrl}/mechanics/slug/${slug}`);
  }
}

export interface Review {
  id: string;
  rating: number;
  reviewerName: string;
  reviewerLocation: string;
  reviewText: string;
  carModel: string;
  carYear: number;
  serviceDescription: string;
  mechanicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mechanic {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  location: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  sinceYear: number;
  certifications: string[];
  badges: string[];
  isActive: boolean;
  subscriptionTier?: string | null;
  createdAt: string;
  updatedAt: string;
}
