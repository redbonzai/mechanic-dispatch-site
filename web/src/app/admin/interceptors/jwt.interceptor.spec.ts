/**
 * JwtInterceptor Unit Tests
 * 
 * Pattern: AAA (Arrange-Act-Assert)
 * 
 * @authority docs/admin/TEST_STRATEGY.md
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtInterceptor } from './jwt.interceptor';
import { AdminAuthService } from '../services/admin-auth.service';
import { of, throwError } from 'rxjs';

describe('JwtInterceptor (Unit Tests - Frontend)', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: jasmine.SpyObj<AdminAuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Arrange: Create spies
    const authServiceSpy = jasmine.createSpyObj('AdminAuthService', [
      'getAccessToken',
      'refresh',
      'logout',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
        { provide: AdminAuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AdminAuthService) as jasmine.SpyObj<AdminAuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token exists', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('test-token');

    // Act
    httpClient.get('/api/admin/users').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should not add Authorization header if no token', () => {
    // Arrange
    authService.getAccessToken.and.returnValue(null);

    // Act
    httpClient.get('/api/admin/users').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should handle successful request with token', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('test-token');
    const mockResponse = { data: 'test' };

    // Act
    httpClient.get('/api/admin/users').subscribe((response) => {
      // Assert
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/admin/users');
    req.flush(mockResponse);
  });

  it('should attempt token refresh on 401 error', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('expired-token');
    authService.refresh.and.returnValue(of({ accessToken: 'new-token' }));

    // Act
    httpClient.get('/api/admin/users').subscribe();

    // Assert - first request with expired token
    const req1 = httpMock.expectOne('/api/admin/users');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    // After refresh, retry the request
    const req2 = httpMock.expectOne('/api/admin/users');
    req2.flush({});

    // Verify refresh was called
    expect(authService.refresh).toHaveBeenCalled();
  });

  it('should retry request with new token after refresh', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('expired-token');
    authService.refresh.and.returnValue(of({ accessToken: 'new-token' }));
    const mockResponse = { data: 'success' };

    // Act
    httpClient.get('/api/admin/users').subscribe((response) => {
      // Assert
      expect(response).toEqual(mockResponse);
    });

    // First request fails with 401
    const req1 = httpMock.expectOne('/api/admin/users');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Second request with new token succeeds
    const req2 = httpMock.expectOne('/api/admin/users');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer new-token');
    req2.flush(mockResponse);
  });

  it('should not attempt refresh on auth endpoints', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('token');

    // Act
    httpClient.post('/api/admin/auth/login', {}).subscribe(
      () => {},
      (error) => {
        // Assert
        expect(error.message).toBe('Authentication failed');
      }
    );

    // Assert - first request fails
    const req = httpMock.expectOne('/api/admin/auth/login');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Verify refresh was NOT called
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should logout and redirect if refresh fails', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('expired-token');
    authService.refresh.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );
    authService.logout.and.returnValue(of(void 0));

    // Act
    httpClient.get('/api/admin/users').subscribe(
      () => {},
      () => {}
    );

    // Assert - first request fails with 401
    const req = httpMock.expectOne('/api/admin/users');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Verify logout and redirect
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('should pass through non-401 errors', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('token');

    // Act
    httpClient.get('/api/admin/users').subscribe(
      () => {},
      (error) => {
        // Assert
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne('/api/admin/users');
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    // Verify refresh was NOT called
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should handle multiple 401 errors', () => {
    // Arrange
    authService.getAccessToken.and.returnValue('expired-token');
    authService.refresh.and.returnValue(of({ accessToken: 'new-token' }));

    // Act - make first request
    httpClient.get('/api/admin/users').subscribe({
      error: () => {}
    });

    // Assert - first request fails with 401
    const req1 = httpMock.expectOne('/api/admin/users');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Retry after refresh
    const req1Retry = httpMock.expectOne('/api/admin/users');
    req1Retry.flush({});

    // Verify refresh was called
    expect(authService.refresh).toHaveBeenCalled();
  });
});
