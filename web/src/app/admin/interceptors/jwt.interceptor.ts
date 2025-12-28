/**
 * JwtInterceptor
 * 
 * HTTP interceptor that adds JWT access token to outgoing requests.
 * Handles token refresh on 401 responses.
 * 
 * @authority docs/admin/SECURITY_REQUIREMENTS.md
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );

  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  /**
   * Intercept HTTP requests and add JWT token
   * 
   * @param request - HTTP request
   * @param next - HTTP handler
   * @returns Observable of HTTP event
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add token to request if available
    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Add JWT token to request headers
   * 
   * @param request - HTTP request
   * @param token - JWT access token
   * @returns Cloned request with Authorization header
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Handle 401 Unauthorized error by refreshing token
   * 
   * @param request - Original HTTP request
   * @param next - HTTP handler
   * @returns Observable of HTTP event
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't refresh if already refreshing or on auth endpoints
    if (this.isRefreshing || this.isAuthEndpoint(request.url)) {
      return throwError(() => new Error('Authentication failed'));
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refresh().pipe(
      switchMap((response) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.accessToken);
        return next.handle(this.addToken(request, response.accessToken));
      }),
      catchError((error) => {
        this.isRefreshing = false;
        // Refresh failed - logout and redirect to login
        this.authService.logout().subscribe();
        this.router.navigate(['/admin/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if request is to auth endpoint
   * 
   * @param url - Request URL
   * @returns True if auth endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/admin/auth/login') || 
           url.includes('/admin/auth/refresh') || 
           url.includes('/admin/auth/logout');
  }
}
