/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/domains/database/prisma.service';

/**
 * Admin Analytics API Integration Tests (15% of test pyramid)
 *
 * Following constitutional requirements:
 * - Test actual HTTP endpoints
 * - Test with real database (test environment)
 * - Test authentication guards
 * - AAA pattern (Arrange-Act-Assert)
 *
 * References:
 * - docs/standards/testing/integration.md
 * - CLAUDE.md: Testing Requirements
 */
describe.skip('Admin Analytics API (Integration Tests - 15%)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    // Arrange: Set up test application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test admin user and get token
    const testAdmin = await prisma.adminUser.create({
      data: {
        email: 'analytics-test@test.com',
        name: 'Analytics Test Admin',
        passwordHash:
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyWmRJ3GKQEK', // 'password'
        role: 'admin',
        isActive: true,
      },
    });

    // Get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({ email: 'analytics-test@test.com', password: 'password' });

    accessToken = loginResponse.body.tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await prisma.adminUser.deleteMany({
      where: { email: 'analytics-test@test.com' },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /admin/analytics/overview', () => {
    it('should return 200 with overview statistics', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/overview')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRequests');
      expect(response.body).toHaveProperty('pendingRequests');
      expect(response.body).toHaveProperty('authorizedRequests');
      expect(response.body).toHaveProperty('capturedRequests');
      expect(response.body).toHaveProperty('finalizedRequests');
      expect(response.body).toHaveProperty('cancelledRequests');
      expect(response.body).toHaveProperty('totalRevenueCents');
      expect(response.body).toHaveProperty('activeMechanics');
      expect(response.body).toHaveProperty('totalMechanics');
      expect(response.body).toHaveProperty('totalReviews');
      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('totalWorkLogs');
      expect(typeof response.body.totalRequests).toBe('number');
      expect(typeof response.body.totalRevenueCents).toBe('number');
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/admin/analytics/overview',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/analytics/revenue', () => {
    it('should return 200 with revenue metrics for date range', async () => {
      // Arrange
      const query = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'day',
      };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/revenue')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dataPoints');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.dataPoints)).toBe(true);
      expect(response.body.summary).toHaveProperty('totalRevenueCents');
      expect(response.body.summary).toHaveProperty('totalFinalizedCount');
      expect(response.body.summary).toHaveProperty('averageRevenueCents');
      expect(response.body.summary).toHaveProperty('peakRevenueCents');
      expect(response.body.summary).toHaveProperty('peakRevenueDate');
    });

    it('should use default granularity when not specified', async () => {
      // Arrange
      const query = {
        startDate: '2025-01-01',
        endDate: '2025-01-07',
      };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/revenue')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dataPoints');
      expect(response.body).toHaveProperty('summary');
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/admin/analytics/revenue',
      );

      // Assert
      expect(response.status).toBe(401);
    });

    it('should handle invalid date format', async () => {
      // Arrange
      const query = {
        startDate: 'invalid-date',
        endDate: '2025-01-31',
      };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/revenue')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('GET /admin/analytics/mechanics', () => {
    it('should return 200 with mechanics performance data', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/mechanics')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mechanics');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.mechanics)).toBe(true);
      expect(response.body.summary).toHaveProperty('totalMechanics');
      expect(response.body.summary).toHaveProperty('activeMechanics');
      expect(response.body.summary).toHaveProperty('totalCompletedJobs');
      expect(response.body.summary).toHaveProperty('totalHoursWorked');
      expect(response.body.summary).toHaveProperty('averageRating');
    });

    it('should filter by active status', async () => {
      // Arrange
      const query = { isActive: true };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/mechanics')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(
        response.body.mechanics.every((m: any) => m.isActive === true),
      ).toBe(true);
    });

    it('should filter by minimum jobs', async () => {
      // Arrange
      const query = { minJobs: 5 };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/mechanics')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(
        response.body.mechanics.every((m: any) => m.completedJobs >= 5),
      ).toBe(true);
    });

    it('should sort by specified field', async () => {
      // Arrange
      const query = { sortBy: 'rating', sortOrder: 'desc' };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/mechanics')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      // Verify descending order
      const ratings = response.body.mechanics.map((m: any) => m.averageRating);
      const sortedRatings = [...ratings].sort((a, b) => b - a);
      expect(ratings).toEqual(sortedRatings);
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/admin/analytics/mechanics',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
