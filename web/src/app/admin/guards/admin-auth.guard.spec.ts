/**
 * AdminAuthGuard Unit Tests
 * 
 * Pattern: AAA (Arrange-Act-Assert)
 * 
 * @authority docs/admin/TEST_STRATEGY.md
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminAuthService } from '../services/admin-auth.service';

describe('AdminAuthGuard (Unit Tests - Frontend)', () => {
  let guard: AdminAuthGuard;
  let authService: jasmine.SpyObj<AdminAuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Arrange: Create spies
    const authServiceSpy = jasmine.createSpyObj('AdminAuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminAuthGuard,
        { provide: AdminAuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AdminAuthGuard);
    authService = TestBed.inject(AdminAuthService) as jasmine.SpyObj<AdminAuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true if user is authenticated', () => {
      // Arrange
      authService.isAuthenticated.and.returnValue(true);
      const route = {} as any;
      const state = { url: '/admin/dashboard' } as any;

      // Act
      const result = guard.canActivate(route, state);

      // Assert
      expect(result).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false if user is not authenticated', () => {
      // Arrange
      authService.isAuthenticated.and.returnValue(false);
      const route = {} as any;
      const state = { url: '/admin/dashboard' } as any;

      // Act
      const result = guard.canActivate(route, state);

      // Assert
      expect(result).toBe(false);
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should redirect to login page if not authenticated', () => {
      // Arrange
      authService.isAuthenticated.and.returnValue(false);
      const route = {} as any;
      const state = { url: '/admin/dashboard' } as any;

      // Act
      guard.canActivate(route, state);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/admin/login'], {
        queryParams: { returnUrl: '/admin/dashboard' },
      });
    });

    it('should preserve return URL in query params', () => {
      // Arrange
      authService.isAuthenticated.and.returnValue(false);
      const route = {} as any;
      const state = { url: '/admin/users/123/edit' } as any;

      // Act
      guard.canActivate(route, state);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/admin/login'], {
        queryParams: { returnUrl: '/admin/users/123/edit' },
      });
    });
  });
});
