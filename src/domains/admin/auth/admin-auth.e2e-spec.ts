/**
 * AdminAuthController Integration Tests
 *
 * TDD: Tests written FIRST before implementation
 * Pattern: AAA (Arrange-Act-Assert)
 * Coverage Target: 15% (integration tests are 15% of test pyramid)
 *
 * These tests verify the full API flow including:
 * - HTTP request/response
 * - Database operations
 * - Authentication flow
 * - Validation pipeline
 *
 * @authority docs/admin/TEST_STRATEGY.md
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../database/prisma.service';
import * as validation from '../../../core/validation';

describe('AdminAuthController (Integration Tests - 15%)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Arrange: Setup test app with real database connection
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same middleware/pipes as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clear test database before running tests
    await prisma.adminRefreshToken.deleteMany();
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.adminRefreshToken.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // Clear data between tests
    await prisma.adminRefreshToken.deleteMany();
    await prisma.adminUser.deleteMany();
  });

  describe('POST /admin/auth/login', () => {
    beforeEach(async () => {
      // Arrange: Create test admin user
      const hashedPassword = await validation.hashPassword('password123');
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
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.passwordHash).toBeUndefined(); // Never exposed

      // Verify token structure (JWT format)
      expect(response.body.tokens.accessToken).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      );
      expect(response.body.tokens.refreshToken).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      );

      // Verify refresh token stored in database
      const storedToken = await prisma.adminRefreshToken.findFirst({
        where: { userId: response.body.user.id },
      });
      expect(storedToken).toBeDefined();
      expect(storedToken?.token).toBe(response.body.tokens.refreshToken);
    });

    it('should return 401 for invalid credentials (wrong email)', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 400 for missing email field', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for missing password field', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for invalid email format (fail-fast)', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid email format');
    });

    it('should return 400 for password < 8 chars (fail-fast)', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: '1234567',
        })
        .expect(400);

      expect(response.body.message).toContain(
        'Password must be at least 8 characters',
      );
    });

    it('should return 401 for inactive user', async () => {
      // Arrange: Create inactive user
      const hashedPassword = await validation.hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'inactive@test.com',
          name: 'Inactive User',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: false, // Inactive
        },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'inactive@test.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toContain('Account is inactive');
    });

    it('should return 401 after 5 failed login attempts (account lockout)', async () => {
      // Arrange: Fail 5 times
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer()).post('/admin/auth/login').send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        });
      }

      // Act & Assert: 6th attempt should be locked
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123', // Correct password, but account locked
        })
        .expect(401);

      expect(response.body.message).toContain('Account is locked');

      // Verify failedLoginAttempts incremented in database
      const user = await prisma.adminUser.findUnique({
        where: { email: 'admin@test.com' },
      });
      expect(user?.failedLoginAttempts).toBeGreaterThanOrEqual(5);
      expect(user?.lastFailedLoginAt).toBeDefined();
    });

    it('should reset failedLoginAttempts on successful login', async () => {
      // Arrange: Create user with failed attempts
      const hashedPassword = await validation.hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'locked@test.com',
          name: 'Locked User',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
          failedLoginAttempts: 3,
          lastFailedLoginAt: new Date(),
        },
      });

      // Act
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'locked@test.com',
          password: 'password123',
        })
        .expect(200);

      // Assert: Failed attempts reset
      const user = await prisma.adminUser.findUnique({
        where: { email: 'locked@test.com' },
      });
      expect(user?.failedLoginAttempts).toBe(0);
      expect(user?.lastFailedLoginAt).toBeNull();
    });
  });

  describe('POST /admin/auth/refresh', () => {
    let accessToken: string;
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      // Arrange: Login to get tokens
      const hashedPassword = await validation.hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'admin@test.com',
          name: 'Test Admin',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.tokens.accessToken;
      refreshToken = loginResponse.body.tokens.refreshToken;
      userId = loginResponse.body.user.id;
    });

    it('should return 200 and new access token for valid refresh token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Assert
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(accessToken); // New token
      expect(response.body.accessToken).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      );
    });

    it('should return 401 for invalid refresh token', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should return 400 for missing refresh token (fail-fast)', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({})
        .expect(400);
    });

    it('should return 401 if refresh token not in database (revoked)', async () => {
      // Arrange: Delete refresh token from database
      await prisma.adminRefreshToken.deleteMany({
        where: { userId },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toContain(
        'Invalid or expired refresh token',
      );
    });

    it('should return 401 if user is inactive', async () => {
      // Arrange: Deactivate user
      await prisma.adminUser.update({
        where: { id: userId },
        data: { isActive: false },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toContain('User not found or inactive');
    });
  });

  describe('POST /admin/auth/logout', () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      // Arrange: Login to get tokens
      const hashedPassword = await validation.hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'admin@test.com',
          name: 'Test Admin',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      refreshToken = loginResponse.body.tokens.refreshToken;
      userId = loginResponse.body.user.id;
    });

    it('should return 200 and invalidate refresh token', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Assert: Token should be removed from database
      const storedToken = await prisma.adminRefreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(storedToken).toBeNull();
    });

    it('should return 200 even if token does not exist', async () => {
      // Arrange: Delete token first
      await prisma.adminRefreshToken.deleteMany({
        where: { userId },
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .send({ refreshToken })
        .expect(200);
    });

    it('should not allow using refresh token after logout', async () => {
      // Arrange: Logout
      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Act & Assert: Try to refresh with logged out token
      await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('GET /admin/auth/profile', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Arrange: Login to get access token
      const hashedPassword = await validation.hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'admin@test.com',
          name: 'Test Admin',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.tokens.accessToken;
      userId = loginResponse.body.user.id;
    });

    it('should return 200 and user profile with valid token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert
      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('admin@test.com');
      expect(response.body.name).toBe('Test Admin');
      expect(response.body.role).toBe('admin');
      expect(response.body.isActive).toBe(true);
      expect(response.body.passwordHash).toBeUndefined(); // Never exposed
    });

    it('should return 401 without Authorization header', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/admin/auth/profile').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should return 401 if user is deactivated after token issued', async () => {
      // Arrange: Deactivate user
      await prisma.adminUser.update({
        where: { id: userId },
        data: { isActive: false },
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('Authentication Flow (Integration)', () => {
    it('should complete full auth flow: login → protected route → refresh → logout', async () => {
      // Arrange: Create user
      const hashedPassword = await validation.hashPassword('password123');
      await prisma.adminUser.create({
        data: {
          email: 'admin@test.com',
          name: 'Test Admin',
          passwordHash: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });

      // Act 1: Login
      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(200);

      const { accessToken, refreshToken } = loginResponse.body.tokens;

      // Act 2: Access protected route
      await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Act 3: Refresh token
      const refreshResponse = await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;
      expect(newAccessToken).not.toBe(accessToken);

      // Act 4: Access protected route with new token
      await request(app.getHttpServer())
        .get('/admin/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // Act 5: Logout
      await request(app.getHttpServer())
        .post('/admin/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Act 6: Try to refresh after logout (should fail)
      await request(app.getHttpServer())
        .post('/admin/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });
});
