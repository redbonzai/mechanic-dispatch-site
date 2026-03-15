import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';
import { UserAuthService } from '../../services/user-auth.service';
import { MechanicAuthService } from '../../services/mechanic-auth.service';

/**
 * Universal JWT Interceptor
 *
 * Injects the correct Bearer token based on the request URL:
 *  - /admin/**          → admin token (redirects to /admin/login on 401)
 *  - /mechanic/me, /mechanic/subscription, /mechanic/auth/logout, /mechanic/auth/refresh
 *                       → mechanic token
 *  - /users/me, /auth/users/logout, /auth/users/resend-verification, /auth/users/refresh
 *                       → user token
 *  - everything else (public) → no token added
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const adminAuth = inject(AdminAuthService);
  const userAuth = inject(UserAuthService);
  const mechAuth = inject(MechanicAuthService);
  const router = inject(Router);

  const url = req.url;

  // ── Admin routes ───────────────────────────────────────────────────────────
  if (isAdminRoute(url)) {
    if (isAdminAuthEndpoint(url)) {
      return next(req);
    }

    const token = adminAuth.getAccessToken();
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return adminAuth.refresh().pipe(
            switchMap((res) =>
              next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${res.accessToken}` },
                }),
              ),
            ),
            catchError((refreshError) => {
              adminAuth.logout().subscribe();
              void router.navigate(['/admin/login']);
              return throwError(() => refreshError);
            }),
          );
        }
        return throwError(() => error);
      }),
    );
  }

  // ── Mechanic protected routes ──────────────────────────────────────────────
  if (isMechanicProtectedRoute(url)) {
    const token = mechAuth.getAccessToken();
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(authReq);
  }

  // ── User protected routes ──────────────────────────────────────────────────
  if (isUserProtectedRoute(url)) {
    const token = userAuth.getAccessToken();
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(authReq);
  }

  // ── Public routes — no token ───────────────────────────────────────────────
  return next(req);
};

function isAdminRoute(url: string): boolean {
  return url.includes('/admin/');
}

function isAdminAuthEndpoint(url: string): boolean {
  return (
    url.includes('/admin/auth/login') ||
    url.includes('/admin/auth/refresh') ||
    url.includes('/admin/auth/logout')
  );
}

function isMechanicProtectedRoute(url: string): boolean {
  return (
    url.includes('/mechanic/me') ||
    url.includes('/mechanic/subscription') ||
    url.includes('/mechanic/auth/logout') ||
    url.includes('/mechanic/auth/refresh')
  );
}

function isUserProtectedRoute(url: string): boolean {
  return (
    url.includes('/users/me') ||
    url.includes('/auth/users/logout') ||
    url.includes('/auth/users/resend-verification') ||
    url.includes('/auth/users/refresh')
  );
}
