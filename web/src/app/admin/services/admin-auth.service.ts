/**
 * AdminAuthService
 *
 * Handles admin authentication, token management, and session state.
 * Implements JWT-based authentication with refresh token flow.
 *
 * @authority docs/admin/SECURITY_REQUIREMENTS.md
 * @authority docs/admin/API_CONTRACTS.md
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginResponse, RefreshResponse, AdminUser } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly API_BASE = `${environment.apiUrl}/admin/auth`;
  private readonly ACCESS_TOKEN_KEY = 'admin_access_token';
  private readonly REFRESH_TOKEN_KEY = 'admin_refresh_token';
  private readonly USER_KEY = 'admin_user';

  private currentUserSubject: BehaviorSubject<AdminUser | null>;
  public currentUser$: Observable<AdminUser | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<AdminUser | null>(
      this.loadUserFromStorage(),
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Authenticate admin user with email and password
   *
   * @param email - Admin user email
   * @param password - Admin user password
   * @returns Observable with tokens and user data
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_BASE}/login`, { email, password })
      .pipe(
        tap((response) => {
          this.storeTokens(
            response.tokens.accessToken,
            response.tokens.refreshToken,
          );
          this.storeUser(response.user);
          this.currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }

  /**
   * Logout current admin user
   * Clears tokens and user data from storage
   *
   * @returns Observable that completes on logout
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();

    return this.http
      .post<void>(`${this.API_BASE}/logout`, { refreshToken })
      .pipe(
        tap(() => {
          this.clearStorage();
          this.currentUserSubject.next(null);
        }),
      );
  }

  /**
   * Refresh access token using refresh token
   *
   * @returns Observable with new access token
   * @throws Error if no refresh token available
   */
  refresh(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post<RefreshResponse>(`${this.API_BASE}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
        }),
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }

  /**
   * Get current access token
   *
   * @returns Access token or null if not found
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get current refresh token
   *
   * @returns Refresh token or null if not found
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   *
   * @returns True if access token exists
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Get current user
   *
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Store tokens in localStorage
   *
   * @param accessToken - JWT access token
   * @param refreshToken - JWT refresh token
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Store user data in localStorage
   *
   * @param user - Admin user data
   */
  private storeUser(user: AdminUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Load user from localStorage
   *
   * @returns User data or null if not found
   */
  private loadUserFromStorage(): AdminUser | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as AdminUser;
    } catch {
      return null;
    }
  }

  /**
   * Clear all stored tokens and user data
   */
  private clearStorage(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
