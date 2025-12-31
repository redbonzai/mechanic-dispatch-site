/**
 * AdminAuthService Unit Tests
 * 
 * TDD: Tests written FIRST before implementation
 * Pattern: AAA (Arrange-Act-Assert)
 * Coverage Target: 80% (unit tests)
 * 
 * @authority docs/admin/TEST_STRATEGY.md
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminAuthService } from './admin-auth.service';
import { LoginResponse, RefreshResponse, AdminUser } from '../models/admin-user.model';

describe('AdminAuthService (Unit Tests - Frontend)', () => {
  let service: AdminAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Arrange: Setup test module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminAuthService],
    });

    service = TestBed.inject(AdminAuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should return tokens and user for valid credentials', (done) => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'password123';
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
          isActive: true,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      service.login(email, password).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
        expect(response.tokens.accessToken).toBe('mock-access-token');
        expect(response.tokens.refreshToken).toBe('mock-refresh-token');
        expect(response.user.email).toBe('admin@test.com');
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('should store tokens in localStorage on successful login', (done) => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'password123';
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Test User',
          role: 'admin',
          isActive: true,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      service.login(email, password).subscribe(() => {
        // Assert
        expect(localStorage.getItem('admin_access_token')).toBe('test-access-token');
        expect(localStorage.getItem('admin_refresh_token')).toBe('test-refresh-token');
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      req.flush(mockResponse);
    });

    it('should store user in localStorage on successful login', (done) => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'password123';
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Test User',
        role: 'admin' as const,
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: mockUser,
      };

      // Act
      service.login(email, password).subscribe(() => {
        // Assert
        const storedUser = localStorage.getItem('admin_user');
        expect(storedUser).toBeTruthy();
        expect(JSON.parse(storedUser!)).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      req.flush(mockResponse);
    });

    it('should update currentUser$ BehaviorSubject on successful login', (done) => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'password123';
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Test User',
          role: 'admin',
          isActive: true,
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      service.login(email, password).subscribe(() => {
        // Assert
        service.currentUser$.subscribe((user) => {
          expect(user).toEqual(mockResponse.user);
          done();
        });
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      req.flush(mockResponse);
    });

    it('should handle 401 error for invalid credentials', (done) => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'wrongpassword';
      const errorResponse = { message: 'Invalid credentials' };

      // Act
      service.login(email, password).subscribe({
        next: () => fail('Should have failed with 401'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          expect(error.error.message).toBe('Invalid credentials');
          done();
        },
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 400 error for validation errors', (done) => {
      // Arrange
      const email = '';
      const password = 'password';
      const errorResponse = { message: 'Email and password are required' };

      // Act
      service.login(email, password).subscribe({
        next: () => fail('Should have failed with 400'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Email and password are required');
          done();
        },
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should not store tokens if login fails', (done) => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'wrongpassword';

      // Act
      service.login(email, password).subscribe({
        next: () => fail('Should have failed'),
        error: () => {
          // Assert
          expect(localStorage.getItem('admin_access_token')).toBeNull();
          expect(localStorage.getItem('admin_refresh_token')).toBeNull();
          done();
        },
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should call logout endpoint with refresh token', (done) => {
      // Arrange
      localStorage.setItem('admin_refresh_token', 'test-refresh-token');

      // Act
      service.logout().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'test-refresh-token' });
      req.flush({});
    });

    it('should clear tokens from localStorage', (done) => {
      // Arrange
      localStorage.setItem('admin_access_token', 'token');
      localStorage.setItem('admin_refresh_token', 'token');

      // Act
      service.logout().subscribe(() => {
        // Assert
        expect(localStorage.getItem('admin_access_token')).toBeNull();
        expect(localStorage.getItem('admin_refresh_token')).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/logout');
      req.flush({});
    });

    it('should clear user from localStorage', (done) => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@test.com' };
      localStorage.setItem('admin_user', JSON.stringify(mockUser));

      // Act
      service.logout().subscribe(() => {
        // Assert
        expect(localStorage.getItem('admin_user')).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/logout');
      req.flush({});
    });

    it('should set currentUser$ to null', (done) => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'test@test.com',
        name: 'Test',
        role: 'admin' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('admin_user', JSON.stringify(mockUser));

      // Act
      service.logout().subscribe(() => {
        // Assert
        service.currentUser$.subscribe((user) => {
          expect(user).toBeNull();
          done();
        });
      });

      const req = httpMock.expectOne('/api/admin/auth/logout');
      req.flush({});
    });

    it('should handle missing refresh token gracefully', (done) => {
      // Arrange - no token in localStorage

      // Act
      service.logout().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/logout');
      expect(req.request.body.refreshToken).toBeNull();
      req.flush({});
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', (done) => {
      // Arrange
      localStorage.setItem('admin_refresh_token', 'valid-refresh-token');
      const mockResponse: RefreshResponse = {
        accessToken: 'new-access-token',
      };

      // Act
      service.refresh().subscribe((response) => {
        // Assert
        expect(response.accessToken).toBe('new-access-token');
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'valid-refresh-token' });
      req.flush(mockResponse);
    });

    it('should store new access token in localStorage', (done) => {
      // Arrange
      localStorage.setItem('admin_refresh_token', 'refresh-token');
      const mockResponse: RefreshResponse = {
        accessToken: 'new-access-token',
      };

      // Act
      service.refresh().subscribe(() => {
        // Assert
        expect(localStorage.getItem('admin_access_token')).toBe('new-access-token');
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/refresh');
      req.flush(mockResponse);
    });

    it('should handle 401 error for invalid refresh token', (done) => {
      // Arrange
      localStorage.setItem('admin_refresh_token', 'invalid-token');
      const errorResponse = { message: 'Invalid refresh token' };

      // Act
      service.refresh().subscribe({
        next: () => fail('Should have failed with 401'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          expect(error.error.message).toBe('Invalid refresh token');
          done();
        },
      });

      const req = httpMock.expectOne('/api/admin/auth/refresh');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });

    it('should throw error if no refresh token available', () => {
      // Arrange - no refresh token

      // Act & Assert
      expect(() => service.refresh()).toThrowError('No refresh token available');
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      // Arrange
      localStorage.setItem('admin_access_token', 'test-token');

      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBe('test-token');
    });

    it('should return null if no access token', () => {
      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', () => {
      // Arrange
      localStorage.setItem('admin_refresh_token', 'test-refresh-token');

      // Act
      const token = service.getRefreshToken();

      // Assert
      expect(token).toBe('test-refresh-token');
    });

    it('should return null if no refresh token', () => {
      // Act
      const token = service.getRefreshToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if access token exists', () => {
      // Arrange
      localStorage.setItem('admin_access_token', 'token');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if no access token', () => {
      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from BehaviorSubject', (done) => {
      // Arrange
      const mockUser: AdminUser = {
        id: 'user123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate login to set user
      localStorage.setItem('admin_user', JSON.stringify(mockUser));
      
      // Reinitialize service to load user from localStorage
      const newService = new AdminAuthService(httpMock as any);

      // Act
      const user = newService.getCurrentUser();

      // Assert
      expect(user).toEqual(mockUser);
      done();
    });

    it('should return null if no user', () => {
      // Act
      const user = service.getCurrentUser();

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('initialization', () => {
    it('should load user from localStorage on init', () => {
      // Arrange
      const mockUser: AdminUser = {
        id: 'user123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('admin_user', JSON.stringify(mockUser));

      // Act
      const newService = new AdminAuthService(httpMock as any);

      // Assert
      expect(newService.getCurrentUser()).toEqual(mockUser);
    });

    it('should not fail if no user in localStorage on init', () => {
      // Act & Assert
      expect(() => new AdminAuthService(httpMock as any)).not.toThrow();
    });
  });
});
