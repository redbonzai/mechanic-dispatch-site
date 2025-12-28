# Admin Dashboard Test Strategy
# Phase 0 Task 5: Test-Driven Development (TDD) Strategy
# Date: 2025-12-26
# Status: Complete - Ready for Implementation
# Authority: CLAUDE.md (Lines 149-181), docs/skills/testing.md

---

## Purpose

This document defines the **test-driven development (TDD) strategy** for the admin dashboard following the constitutional principle:

> **All constructs MUST be tested before release. Testing is a hard requirement, not optional.**

---

## Testing Principles

### Constitutional Requirements (CLAUDE.md Lines 149-181)

1. **Testing is mandatory** - Not optional
2. **Tests must pass** - Before proceeding to deployment
3. **Minimum coverage** - Thresholds must be met
4. **Integration tests required** - For deployable constructs
5. **Tests written FIRST** - TDD approach (write tests before implementation)

**Rule**: Agents must NOT proceed to deployment with failing tests.

---

## 80/15/5 Test Pyramid

```
       /\
      /E2E\       ← 5% - Expensive, slow, full stack
     /______\         (Critical user journeys only)
    /        \
   /Integration\ ← 15% - Moderate cost, API flows
  /____________\     (Database operations, auth flows)
 /              \
/     UNIT       \ ← 80% - Fast, cheap, isolated
/__________________\   (Services, validators, pure functions)
```

### Rationale

**Why 80/15/5?**
- **Unit tests (80%)**: Fast feedback, easy to debug, high coverage per test
- **Integration tests (15%)**: Verify components work together
- **E2E tests (5%)**: Expensive but validate critical business flows

**Anti-pattern**: Inverted pyramid (more E2E than unit) → slow test suite, hard to debug

---

## 1. Unit Tests (80%)

### What to Test

**Backend (NestJS)**:
- ✅ Services (business logic)
- ✅ Validators (fail-fast validation)
- ✅ Pure functions (helpers in functions.ts)
- ✅ Guards (auth, role checks)
- ✅ Pipes (transformation logic)
- ✅ Interceptors (request/response modification)

**Frontend (Angular)**:
- ✅ Services (HTTP calls, state management)
- ✅ Components (UI logic, event handlers)
- ✅ Guards (route protection)
- ✅ Interceptors (JWT token injection)
- ✅ Pipes (data transformation)
- ✅ Validators (form validation)

### Backend Unit Tests

**AdminAuthService** (80% coverage target):
```typescript
// src/domains/admin/auth/AdminAuthService.spec.ts

describe('AdminAuthService (Unit Tests)', () => {
  let service: AdminAuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    // Arrange: Setup test module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: PrismaService,
          useValue: {
            adminUser: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            adminRefreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const hashedPassword = await hashPassword('password123');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user.email).toBe('admin@test.com');
      expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      // Arrange
      const loginDto = { email: 'invalid@test.com', password: 'password123' };
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'wrongpassword' };
      const hashedPassword = await hashPassword('correctpassword');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        // ... other fields
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw BadRequestException for missing email (fail-fast)', async () => {
      // Arrange
      const loginDto = { email: '', password: 'password123' };

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw UnauthorizedException for locked account', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'password123' };
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        failedLoginAttempts: 5,
        lastFailedLoginAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        // ... other fields
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(prisma.adminUser.findUnique).toHaveBeenCalled();
    });

    it('should increment failedLoginAttempts on failed login', async () => {
      // Arrange
      const loginDto = { email: 'admin@test.com', password: 'wrongpassword' };
      const hashedPassword = await hashPassword('correctpassword');
      const mockUser = {
        id: 'user123',
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        failedLoginAttempts: 2,
        // ... other fields
      };

      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.adminUser, 'update').mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 3,
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: {
          failedLoginAttempts: { increment: 1 },
          lastFailedLoginAt: expect.any(Date),
        },
      });
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      // Arrange, Act, Assert
      // ... test implementation
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange, Act, Assert
      // ... test implementation
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token', async () => {
      // Arrange, Act, Assert
      // ... test implementation
    });
  });
});
```

**Validation Functions** (core/validation):
```typescript
// src/core/validation/functions.spec.ts

describe('Validation Functions (Unit Tests)', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      // Arrange
      const validEmail = 'test@example.com';

      // Act
      const result = validateEmail(validEmail);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for invalid email', () => {
      // Arrange
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test @example.com',
        '',
      ];

      // Act & Assert
      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for password >= 8 chars', () => {
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('longerpassword')).toBe(true);
    });

    it('should return false for password < 8 chars', () => {
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateCuid', () => {
    it('should return true for valid CUID', () => {
      const validCuid = 'cm1a2b3c4d5e6f7g8h9i0j1k';
      expect(validateCuid(validCuid)).toBe(true);
    });

    it('should return false for invalid CUID', () => {
      const invalidCuids = [
        'invalid',
        'CM1a2b3c4d5e6f7g8h9i0j1k', // uppercase C
        'c123', // too short
        '',
      ];

      invalidCuids.forEach((cuid) => {
        expect(validateCuid(cuid)).toBe(false);
      });
    });
  });
});
```

### Frontend Unit Tests

**AdminAuthService** (Angular):
```typescript
// web/src/app/admin/services/admin-auth.service.spec.ts

describe('AdminAuthService', () => {
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
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  describe('login', () => {
    it('should return tokens and store in localStorage', (done) => {
      // Arrange
      const mockResponse = {
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        user: {
          id: 'user123',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
        },
      };

      // Act
      service.login('admin@test.com', 'password').subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('access_token')).toBe('access-token');
        expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'admin@test.com',
        password: 'password',
      });
      req.flush(mockResponse);
    });

    it('should handle 401 error for invalid credentials', (done) => {
      // Arrange
      const errorResponse = { message: 'Invalid credentials' };

      // Act
      service.login('admin@test.com', 'wrongpassword').subscribe({
        next: () => fail('Should have failed'),
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
  });

  describe('logout', () => {
    it('should clear tokens from localStorage', (done) => {
      // Arrange
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'token');

      // Act
      service.logout().subscribe(() => {
        // Assert
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/admin/auth/logout');
      req.flush({});
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if access token exists', () => {
      // Arrange
      localStorage.setItem('access_token', 'token');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if no access token', () => {
      // Arrange
      localStorage.removeItem('access_token');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });
});
```

### Unit Test Coverage Target

**Minimum coverage per module**:
- Services: **≥ 90%**
- Validators/Functions: **≥ 95%** (pure functions should be 100%)
- Guards/Pipes: **≥ 85%**
- Components: **≥ 80%**

**Overall unit test coverage**: **≥ 85%**

---

## 2. Integration Tests (15%)

### What to Test

**Backend (NestJS)**:
- ✅ API endpoint flows (login → protected route)
- ✅ Database operations (Prisma integration)
- ✅ Authentication flows (JWT generation/validation)
- ✅ Authorization flows (RBAC guard checks)
- ✅ File upload flows (image upload)

**Frontend (Angular)**:
- ✅ Login flow (login → redirect to dashboard)
- ✅ Protected route access (guard checks)
- ✅ API error handling (interceptors)

### Backend Integration Tests

**AdminAuthController** (E2E style):
```typescript
// src/domains/admin/auth/admin-auth.e2e-spec.ts

describe('AdminAuthController (Integration Tests)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Arrange: Setup test app with test database
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same middleware as main app
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    
    // Clear test database
    await prisma.adminUser.deleteMany();
    await prisma.adminRefreshToken.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /admin/auth/login', () => {
    beforeEach(async () => {
      // Create test admin user
      const hashedPassword = await hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'admin@test.com',
          name: 'Test Admin',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });
    });

    afterEach(async () => {
      // Cleanup
      await prisma.adminUser.deleteMany();
    });

    it('should return 200 and tokens for valid credentials', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(200);

      // Assert
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.passwordHash).toBeUndefined(); // Never exposed
    });

    it('should return 401 for invalid credentials', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 400 for missing fields', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          // password missing
        })
        .expect(400);
    });

    it('should return 429 after too many failed attempts', async () => {
      // Arrange: Fail 5 times
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/admin/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'wrongpassword',
          });
      }

      // Act & Assert: 6th attempt should be rate limited
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(429);
    });
  });

  describe('POST /admin/auth/refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      // Arrange: Login first to get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const refreshToken = loginResponse.body.tokens.refreshToken;

      // Act
      const response = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Assert
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(
        loginResponse.body.tokens.accessToken
      );
    });

    it('should return 401 for invalid refresh token', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('GET /admin/auth/profile', () => {
    it('should return 200 and user profile with valid token', async () => {
      // Arrange: Login to get access token
      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const accessToken = loginResponse.body.tokens.accessToken;

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert
      expect(response.body.email).toBe('admin@test.com');
    });

    it('should return 401 without token', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .expect(401);
    });
  });
});
```

### Integration Test Coverage Target

**Minimum coverage per area**:
- API flows: **≥ 70%** (critical paths)
- Database operations: **≥ 80%** (CRUD operations)
- Authentication/authorization: **≥ 90%** (security-critical)

**Overall integration test coverage**: **≥ 15% of total test suite**

---

## 3. E2E Tests (5%)

### What to Test

**Critical user journeys only** (expensive tests):
- ✅ Admin login → dashboard → view service requests
- ✅ Admin login → create mechanic → upload image
- ✅ Admin login → capture payment → finalize service request
- ✅ Admin login → create admin user → logout → login as new user

### E2E Test Setup (Playwright or Cypress)

**Playwright Configuration**:
```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,  // E2E tests run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // Single worker for E2E
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

**E2E Test Example**:
```typescript
// e2e/admin-login-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow (E2E)', () => {
  test('should login → view dashboard → view service requests', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/Admin Login/);

    // 2. Fill login form
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Wait for redirect to dashboard
    await page.waitForURL('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');

    // 5. Verify dashboard loads
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('.metric-card')).toHaveCount(4);

    // 6. Navigate to service requests
    await page.click('text=Service Requests');
    await page.waitForURL('/admin/service-requests');

    // 7. Verify service requests list loads
    await expect(page.locator('h1')).toContainText('Service Requests');
    await expect(page.locator('table')).toBeVisible();

    // 8. Verify table has data
    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/admin/login');

    // 2. Fill with invalid credentials
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Verify error message
    await expect(page.locator('.error-message')).toContainText(
      'Invalid credentials'
    );

    // 5. Verify still on login page
    await expect(page).toHaveURL('/admin/login');
  });
});

test.describe('Admin CRUD Flow (E2E)', () => {
  test('should login → create mechanic → verify mechanic appears', async ({ page }) => {
    // 1. Login
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // 2. Navigate to mechanics
    await page.click('text=Mechanics');
    await page.waitForURL('/admin/mechanics');

    // 3. Click create button
    await page.click('button:has-text("Create Mechanic")');

    // 4. Fill mechanic form
    await page.fill('input[name="name"]', 'Test Mechanic');
    await page.fill('input[name="location"]', 'San Francisco, CA');
    await page.fill('input[name="yearsExperience"]', '10');
    await page.fill('input[name="sinceYear"]', '2015');

    // 5. Submit form
    await page.click('button[type="submit"]');

    // 6. Verify redirect to mechanics list
    await page.waitForURL('/admin/mechanics');

    // 7. Verify new mechanic appears in list
    await expect(page.locator('text=Test Mechanic')).toBeVisible();
  });
});
```

### E2E Test Coverage Target

**Critical paths only**: **≥ 5% of total test suite**

**Rule**: E2E tests should focus on **business-critical flows only**. Do NOT test every feature with E2E tests.

---

## 4. AAA Pattern (Mandatory)

All tests MUST follow the **Arrange-Act-Assert** pattern:

```typescript
it('should return tokens for valid credentials', async () => {
  // Arrange: Setup test data and mocks
  const loginDto = { email: 'admin@test.com', password: 'password123' };
  const mockUser = { /* ... */ };
  jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);

  // Act: Execute the operation being tested
  const result = await service.login(loginDto);

  // Assert: Verify the outcome
  expect(result.tokens.accessToken).toBeDefined();
  expect(result.tokens.refreshToken).toBeDefined();
  expect(result.user.email).toBe('admin@test.com');
});
```

**Rule**: Tests without AAA pattern will be rejected.

---

## 5. Test Infrastructure

### Backend (NestJS + Jest)

**Jest Configuration**:
```json
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThresholds: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

**Test Database Setup**:
```typescript
// test/setup.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST,
    },
  },
});

beforeAll(async () => {
  // Run migrations on test database
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE');
  await prisma.$executeRawUnsafe('CREATE SCHEMA public');
  // Run: npx prisma migrate deploy
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Frontend (Angular + Jasmine/Karma)

**Karma Configuration**:
```typescript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false,  // Consistent test order
      },
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' },
      ],
      check: {
        global: {
          statements: 85,
          branches: 85,
          functions: 85,
          lines: 85,
        },
      },
    },
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
```

---

## 6. Coverage Requirements

### Minimum Coverage Thresholds

**Overall Project**:
- Statements: **≥ 85%**
- Branches: **≥ 85%**
- Functions: **≥ 85%**
- Lines: **≥ 85%**

**Per Module**:
- Services: **≥ 90%**
- Validators/Functions: **≥ 95%**
- Guards/Pipes: **≥ 85%**
- Components: **≥ 80%**
- Controllers: **≥ 70%** (covered by integration tests)

**Quality Gate**: **STOP if coverage < 85%**

### Coverage Exclusions

**Do NOT count toward coverage**:
- `*.spec.ts` files
- `*.e2e-spec.ts` files
- `main.ts` (bootstrap file)
- `index.ts` (barrel exports)
- Migration files
- Mock data files

---

## 7. Test Execution Workflow

### Phase 1: TDD Workflow (Test-First)

```
1. Write tests FIRST (RED)
   ↓
2. Run tests (should FAIL)
   ↓
3. Implement minimum code to pass (GREEN)
   ↓
4. Run tests (should PASS)
   ↓
5. Refactor (if needed)
   ↓
6. Run tests again (should still PASS)
   ↓
7. Measure coverage (≥ 85%)
   ↓
8. STOP if coverage < 85%
```

**Rule**: Implementation BEFORE tests = REJECTED

### Test Execution Commands

**Backend**:
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- AdminAuthService.spec.ts
```

**Frontend**:
```bash
# Run all tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in headless mode (CI)
ng test --watch=false --browsers=ChromeHeadless

# Run specific test file
ng test --include='**/admin-auth.service.spec.ts'
```

---

## 8. Test Data Management

### Test Database

**Approach**: Isolated test database (not production)

**Setup**:
```bash
# .env.test
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/mechanic_dispatch_test?schema=public"
```

**Cleanup Strategy**:
```typescript
beforeEach(async () => {
  // Clear all tables before each test
  await prisma.adminUser.deleteMany();
  await prisma.adminRefreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
});
```

### Test Fixtures

**Factory Pattern**:
```typescript
// test/factories/admin-user.factory.ts

export class AdminUserFactory {
  static async create(overrides?: Partial<AdminUser>): Promise<AdminUser> {
    const defaultData = {
      email: 'admin@test.com',
      name: 'Test Admin',
      passwordHash: await hashPassword('password123'),
      role: 'admin',
      isActive: true,
    };

    return prisma.adminUser.create({
      data: { ...defaultData, ...overrides },
    });
  }

  static async createMany(count: number): Promise<AdminUser[]> {
    return Promise.all(
      Array.from({ length: count }, (_, i) =>
        this.create({ email: `admin${i}@test.com` })
      )
    );
  }
}
```

---

## 9. Test Organization

### File Structure

**Backend**:
```
src/domains/admin/auth/
├── AdminAuthService.ts
├── AdminAuthService.spec.ts       # Unit tests (co-located)
├── AdminAuthController.ts
├── AdminAuthController.spec.ts    # Unit tests (co-located)
└── admin-auth.e2e-spec.ts         # Integration tests (co-located)
```

**Frontend**:
```
web/src/app/admin/services/
├── admin-auth.service.ts
└── admin-auth.service.spec.ts     # Unit tests (co-located)
```

**E2E Tests** (separate directory):
```
e2e/
├── admin-login-flow.spec.ts
├── admin-crud-flow.spec.ts
└── admin-payment-flow.spec.ts
```

---

## 10. Continuous Integration

### CI Pipeline

**GitHub Actions** (or similar):
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test:cov
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 85%"
            exit 1
          fi

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: ng test --watch=false --code-coverage --browsers=ChromeHeadless

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## Phase 0 Task 5 Completion Checklist

- [x] **Test pyramid defined** - 80/15/5 split documented
- [x] **Unit tests defined** - Backend and frontend unit test examples
- [x] **Integration tests defined** - API flow and database integration examples
- [x] **E2E tests defined** - Critical user journey examples
- [x] **AAA pattern enforced** - All test examples follow Arrange-Act-Assert
- [x] **Test infrastructure configured** - Jest (backend), Jasmine/Karma (frontend), Playwright (E2E)
- [x] **Coverage requirements defined** - ≥85% overall, per-module thresholds
- [x] **TDD workflow defined** - Write tests FIRST, then implement
- [x] **Test data management** - Test database, factories, cleanup strategies
- [x] **CI integration** - GitHub Actions pipeline example

---

## References

- **CLAUDE.md** (Lines 149-181) - Testing Requirements
- **docs/skills/testing.md** - Testing skill
- **docs/admin/MODULE_LAYOUT_DESIGN.md** - Module structure (test co-location)
- **docs/admin/SECURITY_REQUIREMENTS.md** - Security requirements to test

---

**Document Version**: 1.0  
**Date**: 2025-12-26  
**Status**: ✅ **COMPLETE - READY FOR IMPLEMENTATION**  
**Authority**: CLAUDE.md, docs/skills/testing.md  
**Next Action**: Phase 0 Complete - Proceed to Phase 1 (TDD Implementation)

---

## End of Test Strategy
