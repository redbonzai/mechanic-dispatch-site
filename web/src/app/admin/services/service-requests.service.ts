import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServiceRequestListQuery,
  ServiceRequestListResponse,
  AdminServiceRequestDetail,
} from '../models/service-request.model';

/**
 * Service Requests Service
 *
 * Provides access to admin service request management API endpoints.
 * All endpoints require JWT authentication via interceptor.
 */
@Injectable({
  providedIn: 'root',
})
export class ServiceRequestsService {
  private readonly baseUrl = '/api/admin/service-requests';

  constructor(private http: HttpClient) {}

  /**
   * List service requests with optional filtering and pagination.
   */
  list(query?: ServiceRequestListQuery): Observable<ServiceRequestListResponse> {
    const params = this.buildParams(query);
    return this.http.get<ServiceRequestListResponse>(this.baseUrl, { params });
  }

  /**
   * Get service request detail by ID.
   */
  getById(id: string): Observable<AdminServiceRequestDetail> {
    return this.http.get<AdminServiceRequestDetail>(`${this.baseUrl}/${id}`);
  }

  /**
   * Capture payment for service request.
   */
  capture(id: string): Observable<void> {
    return this.http.post<void>(`/api/requests/${id}/capture`, {});
  }

  /**
   * Cancel service request.
   */
  cancel(id: string): Observable<void> {
    return this.http.post<void>(`/api/requests/${id}/cancel`, {});
  }

  /**
   * Finalize service request with final amount.
   */
  finalize(id: string, finalAmountCents: number): Observable<void> {
    return this.http.post<void>(`/api/requests/${id}/finalize`, {
      finalAmountCents,
    });
  }

  private buildParams(query?: ServiceRequestListQuery): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
