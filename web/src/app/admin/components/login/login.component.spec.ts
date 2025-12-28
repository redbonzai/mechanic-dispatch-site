/**
 * LoginComponent Unit Tests
 * 
 * TDD: Tests written FIRST before implementation
 * Pattern: AAA (Arrange-Act-Assert)
 * 
 * @authority docs/admin/TEST_STRATEGY.md
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AdminAuthService } from '../../services/admin-auth.service';
import { LoginResponse } from '../../models/admin-user.model';

describe('LoginComponent (Unit Tests - Frontend)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AdminAuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    // Arrange: Create spies
    const authServiceSpy = jasmine.createSpyObj('AdminAuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      snapshot: {
        queryParams: {},
      },
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AdminAuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AdminAuthService) as jasmine.SpyObj<AdminAuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      // Assert
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have email and password controls', () => {
      // Assert
      expect(component.loginForm.get('email')).toBeTruthy();
      expect(component.loginForm.get('password')).toBeTruthy();
    });

    it('should mark email as required', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');

      // Act
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      // Assert
      expect(emailControl?.hasError('required')).toBe(true);
      expect(emailControl?.valid).toBe(false);
    });

    it('should validate email format', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');

      // Act
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      // Assert
      expect(emailControl?.hasError('email')).toBe(true);
      expect(emailControl?.valid).toBe(false);
    });

    it('should accept valid email', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');

      // Act
      emailControl?.setValue('admin@test.com');

      // Assert
      expect(emailControl?.valid).toBe(true);
    });

    it('should mark password as required', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');

      // Act
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();

      // Assert
      expect(passwordControl?.hasError('required')).toBe(true);
      expect(passwordControl?.valid).toBe(false);
    });

    it('should require minimum password length', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');

      // Act
      passwordControl?.setValue('short');
      passwordControl?.markAsTouched();

      // Assert
      expect(passwordControl?.hasError('minlength')).toBe(true);
      expect(passwordControl?.valid).toBe(false);
    });

    it('should accept valid password', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');

      // Act
      passwordControl?.setValue('password123');

      // Assert
      expect(passwordControl?.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      // Arrange
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with form values', () => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(authService.login).toHaveBeenCalledWith('admin@test.com', 'password123');
    });

    it('should navigate to dashboard on successful login', (done) => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
        done();
      }, 0);
    });

    it('should navigate to returnUrl if present', (done) => {
      // Arrange
      activatedRoute.snapshot.queryParams = { returnUrl: '/admin/users' };
      component.ngOnInit();
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
        done();
      }, 0);
    });

    it('should set loading state during login', () => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert - loading should be set immediately but then cleared
      // We can only check it was set by verifying the form was disabled
      expect(component.loginForm.disabled).toBe(true);
    });

    it('should clear loading state after successful login', (done) => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should set error message on login failure', (done) => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'wrongpassword',
      });
      const errorResponse = {
        error: { message: 'Invalid credentials' },
        status: 401,
      };
      authService.login.and.returnValue(throwError(() => errorResponse));

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.error).toBe('Invalid credentials');
        done();
      }, 0);
    });

    it('should clear loading state after login failure', (done) => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'wrongpassword',
      });
      authService.login.and.returnValue(throwError(() => ({ status: 401 })));

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should set generic error message if error has no message', (done) => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      authService.login.and.returnValue(throwError(() => ({ status: 500 })));

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.error).toBe('Login failed. Please try again.');
        done();
      }, 0);
    });

    it('should disable form while loading', () => {
      // Arrange
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password123',
      });
      const mockResponse: LoginResponse = {
        tokens: {
          accessToken: 'token',
          refreshToken: 'token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act
      component.onSubmit();

      // Assert
      expect(component.loginForm.disabled).toBe(true);
    });
  });

  describe('hasError', () => {
    it('should return true for invalid and touched field', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      // Act
      const result = component.hasError('email');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for valid field', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('test@test.com');
      emailControl?.markAsTouched();

      // Act
      const result = component.hasError('email');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for untouched field', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');

      // Act
      const result = component.hasError('email');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      // Act
      const message = component.getErrorMessage('email');

      // Assert
      expect(message).toBe('Email is required');
    });

    it('should return email format error message', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();

      // Act
      const message = component.getErrorMessage('email');

      // Assert
      expect(message).toBe('Please enter a valid email address');
    });

    it('should return minlength error message', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('short');
      passwordControl?.markAsTouched();

      // Act
      const message = component.getErrorMessage('password');

      // Assert
      expect(message).toBe('Password must be at least 8 characters');
    });

    it('should return empty string for valid field', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('test@test.com');

      // Act
      const message = component.getErrorMessage('email');

      // Assert
      expect(message).toBe('');
    });

    it('should return empty string for non-existent field', () => {
      // Act
      const message = component.getErrorMessage('nonexistent');

      // Assert
      expect(message).toBe('');
    });
  });
});
