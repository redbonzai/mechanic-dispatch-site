import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OverviewStats,
  SubscriptionMetrics,
  TopQueriesResponse,
  SearchVolumeResponse,
  MechanicAnalyticsResponse,
} from '../models/analytics.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly baseUrl = `${environment.apiUrl}/admin/analytics`;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${this.baseUrl}/overview`);
  }

  getSubscriptions(): Observable<SubscriptionMetrics> {
    return this.http.get<SubscriptionMetrics>(`${this.baseUrl}/subscriptions`);
  }

  getTopQueries(limit = 20): Observable<TopQueriesResponse> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<TopQueriesResponse>(`${this.baseUrl}/search/top-queries`, { params });
  }

  getSearchVolume(days = 30): Observable<SearchVolumeResponse> {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<SearchVolumeResponse>(`${this.baseUrl}/search/volume`, { params });
  }

  getMechanicAnalytics(page = 1, limit = 25): Observable<MechanicAnalyticsResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<MechanicAnalyticsResponse>(`${this.baseUrl}/mechanics`, { params });
  }
}
