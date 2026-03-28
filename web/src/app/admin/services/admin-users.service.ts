import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminUser,
  AdminUserListResponse,
  AdminUserQueryParams,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '../models/admin-user.model';
import { environment } from '../../../environments/environment';

/**
 * Admin Users Service
 *
 * Provides access to admin user management API endpoints.
 * All endpoints require JWT authentication via interceptor.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  /**
   * List admin users with optional filtering and pagination.
   */
  getUsers(params?: AdminUserQueryParams): Observable<AdminUserListResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<AdminUserListResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Get admin user detail by ID.
   */
  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new admin user.
   */
  createUser(data: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.baseUrl, data);
  }

  /**
   * Update an admin user.
   */
  updateUser(id: string, data: UpdateAdminUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete an admin user.
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private buildParams(params?: AdminUserQueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
