import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';

/**
 * JWT Interceptor (Functional Style)
 *
 * Automatically adds JWT token to outgoing requests.
 * Handles token refresh on 401 responses.
 *
 * @authority docs/admin/SECURITY_REQUIREMENTS.md
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  // Skip interceptor for auth endpoints
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Add token if available
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Handle request
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        // Try to refresh token
        return authService.refresh().pipe(
          switchMap((response) => {
            // Retry request with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed - logout and redirect
            authService.logout().subscribe();
            router.navigate(['/admin/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

/**
 * Check if request is to auth endpoint
 */
function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/admin/auth/login') ||
    url.includes('/admin/auth/refresh') ||
    url.includes('/admin/auth/logout')
  );
}
