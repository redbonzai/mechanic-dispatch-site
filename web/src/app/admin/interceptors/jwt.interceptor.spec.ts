/**
 * Universal JWT Interceptor Tests
 *
 * Tests the functional jwtInterceptor that handles tokens for:
 *  - Admin routes  → admin token, redirects to /admin/login on 401
 *  - User routes   → user token, no redirect
 *  - Mechanic routes → mechanic token, no redirect
 *  - Public routes → no token added
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { jwtInterceptor } from './jwt.interceptor.functional';
import { AdminAuthService } from '../services/admin-auth.service';
import { UserAuthService } from '../../services/user-auth.service';
import { MechanicAuthService } from '../../services/mechanic-auth.service';

describe('jwtInterceptor (Universal)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let adminAuth: jasmine.SpyObj<AdminAuthService>;
  let userAuth: jasmine.SpyObj<UserAuthService>;
  let mechAuth: jasmine.SpyObj<MechanicAuthService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    adminAuth = jasmine.createSpyObj('AdminAuthService', [
      'getAccessToken',
      'getRefreshToken',
      'refresh',
      'logout',
    ]);
    userAuth = jasmine.createSpyObj('UserAuthService', ['getAccessToken']);
    mechAuth = jasmine.createSpyObj('MechanicAuthService', ['getAccessToken']);

    // Default: no tokens
    adminAuth.getAccessToken.and.returnValue(null);
    adminAuth.logout.and.returnValue(of(undefined as void));
    userAuth.getAccessToken.and.returnValue(null);
    mechAuth.getAccessToken.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: AdminAuthService, useValue: adminAuth },
        { provide: UserAuthService, useValue: userAuth },
        { provide: MechanicAuthService, useValue: mechAuth },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── Admin routes ──────────────────────────────────────────────────────────

  describe('admin routes (/admin/...)', () => {
    it('should attach admin Bearer token to admin requests', () => {
      adminAuth.getAccessToken.and.returnValue('admin-jwt-token');

      http.get('/admin/dashboard').subscribe();

      const req = httpMock.expectOne('/admin/dashboard');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer admin-jwt-token',
      );
      req.flush({});
    });

    it('should not attach Authorization header when admin token is absent', () => {
      adminAuth.getAccessToken.and.returnValue(null);

      http.get('/admin/dashboard').subscribe();

      const req = httpMock.expectOne('/admin/dashboard');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('should not add token to /admin/auth/login', () => {
      adminAuth.getAccessToken.and.returnValue('admin-jwt-token');

      http.post('/admin/auth/login', {}).subscribe();

      const req = httpMock.expectOne('/admin/auth/login');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('should try to refresh and redirect to /admin/login on 401', () => {
      adminAuth.getAccessToken.and.returnValue('expired-token');
      adminAuth.refresh.and.returnValue(
        throwError(() => ({ status: 401 })),
      );
      adminAuth.logout.and.returnValue(of(undefined as void));

      http.get('/admin/dashboard').subscribe({ error: () => null });

      const req = httpMock.expectOne('/admin/dashboard');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(adminAuth.refresh).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    });

    it('should retry with new token after successful refresh', () => {
      adminAuth.getAccessToken.and.returnValue('old-token');
      adminAuth.refresh.and.returnValue(
        of({ accessToken: 'new-token' }),
      );

      http.get('/admin/dashboard').subscribe();

      const firstReq = httpMock.expectOne('/admin/dashboard');
      firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

      const retryReq = httpMock.expectOne('/admin/dashboard');
      expect(retryReq.request.headers.get('Authorization')).toBe(
        'Bearer new-token',
      );
      retryReq.flush({ data: 'ok' });
    });
  });

  // ── User routes ───────────────────────────────────────────────────────────

  describe('user protected routes', () => {
    it('should attach user Bearer token to /users/me requests', () => {
      userAuth.getAccessToken.and.returnValue('user-jwt-token');

      http.get('/users/me').subscribe();

      const req = httpMock.expectOne('/users/me');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer user-jwt-token',
      );
      req.flush({});
    });

    it('should attach user token to /users/me/vehicles', () => {
      userAuth.getAccessToken.and.returnValue('user-jwt-token');

      http.get('/users/me/vehicles').subscribe();

      const req = httpMock.expectOne('/users/me/vehicles');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer user-jwt-token',
      );
      req.flush([]);
    });

    it('should attach user token to /auth/users/resend-verification', () => {
      userAuth.getAccessToken.and.returnValue('user-jwt-token');

      http.post('/auth/users/resend-verification', {}).subscribe();

      const req = httpMock.expectOne('/auth/users/resend-verification');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer user-jwt-token',
      );
      req.flush({});
    });

    it('should NOT redirect to /admin/login on user 401', () => {
      userAuth.getAccessToken.and.returnValue('user-token');

      http.get('/users/me').subscribe({ error: () => null });

      const req = httpMock.expectOne('/users/me');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  // ── Mechanic routes ───────────────────────────────────────────────────────

  describe('mechanic protected routes', () => {
    it('should attach mechanic token to /mechanic/me requests', () => {
      mechAuth.getAccessToken.and.returnValue('mech-jwt-token');

      http.get('/mechanic/me').subscribe();

      const req = httpMock.expectOne('/mechanic/me');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer mech-jwt-token',
      );
      req.flush({});
    });

    it('should attach mechanic token to /mechanic/subscription', () => {
      mechAuth.getAccessToken.and.returnValue('mech-jwt-token');

      http.get('/mechanic/subscription').subscribe();

      const req = httpMock.expectOne('/mechanic/subscription');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer mech-jwt-token',
      );
      req.flush({});
    });
  });

  // ── Public routes ─────────────────────────────────────────────────────────

  describe('public routes (no token expected)', () => {
    it('should NOT attach any token to /search/fixes', () => {
      adminAuth.getAccessToken.and.returnValue('admin-token');
      userAuth.getAccessToken.and.returnValue('user-token');
      mechAuth.getAccessToken.and.returnValue('mech-token');

      http.get('/search/fixes?q=brakes').subscribe();

      const req = httpMock.expectOne('/search/fixes?q=brakes');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('should NOT attach any token to /mechanics (public listing)', () => {
      userAuth.getAccessToken.and.returnValue('user-token');

      http.get('/mechanics').subscribe();

      const req = httpMock.expectOne('/mechanics');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush([]);
    });

    it('should NOT attach any token to /auth/users/login', () => {
      http.post('/auth/users/login', {}).subscribe();

      const req = httpMock.expectOne('/auth/users/login');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });
});
