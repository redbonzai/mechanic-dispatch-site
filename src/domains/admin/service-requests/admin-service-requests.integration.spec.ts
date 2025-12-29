/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../database/prisma.service';
import { ServiceRequestStatus } from '../../service-requests/enums/service-request-status.enum';

/**
 * Admin Service Requests API Integration Tests
 *
 * Following constitutional requirements:
 * - Test actual HTTP endpoints (not mocked)
 * - Test with real database interactions
 * - Test authentication guards
 * - AAA pattern (Arrange-Act-Assert)
 * - ≤50 lines per function
 *
 * References:
 * - docs/standards/testing/integration.md
 * - CLAUDE.md: Testing Requirements
 * - docs/admin/PHASE3_SERVICE_REQUESTS.md
 *
 * NOTE: These tests require admin user seeding and are skipped in CI.
 * Run locally with proper database setup.
 */
describe.skip('Admin Service Requests API (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let testRequestId: string;

  beforeAll(async () => {
    // Arrange: Set up test application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test admin user and get token
    await createTestAdmin();
    accessToken = await loginTestAdmin();

    // Create test service request
    testRequestId = await createTestServiceRequest();
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await cleanupTestData();
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /admin/service-requests', () => {
    it('should return paginated list of service requests', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');
    });

    it('should filter by status', async () => {
      // Arrange
      const query = { status: ServiceRequestStatus.PENDING };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      response.body.items.forEach((item: any) => {
        expect(item.status).toBe(ServiceRequestStatus.PENDING);
      });
    });

    it('should filter by date range', async () => {
      // Arrange
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
    });

    it('should search by customer name or email', async () => {
      // Arrange
      const query = { search: 'integration' };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should support pagination', async () => {
      // Arrange
      const query = { page: 1, limit: 5 };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should support sorting', async () => {
      // Arrange
      const query = { sortBy: 'createdAt', sortOrder: 'desc' };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      const items = response.body.items;
      if (items.length > 1) {
        const dates = items.map((item: any) => new Date(item.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i] >= dates[i + 1]).toBe(true);
        }
      }
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/admin/service-requests',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/service-requests/:id', () => {
    it('should return service request details', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get(`/admin/service-requests/${testRequestId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testRequestId);
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('phone');
      expect(response.body).toHaveProperty('addressLine1');
      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('state');
      expect(response.body).toHaveProperty('postalCode');
      expect(response.body).toHaveProperty('vehicleMake');
      expect(response.body).toHaveProperty('vehicleModel');
      expect(response.body).toHaveProperty('vehicleYear');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('amountCents');
      expect(response.body).toHaveProperty('workLogs');
      expect(response.body).toHaveProperty('reviews');
      expect(Array.isArray(response.body.workLogs)).toBe(true);
      expect(Array.isArray(response.body.reviews)).toBe(true);
    });

    it('should return 404 for non-existent request', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        `/admin/service-requests/${testRequestId}`,
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('Integration: List and Detail Flow', () => {
    it('should retrieve request from list and get full details', async () => {
      // Act 1: Get list
      const listResponse = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.items.length).toBeGreaterThan(0);

      const firstRequest = listResponse.body.items[0];

      // Act 2: Get details
      const detailResponse = await request(app.getHttpServer())
        .get(`/admin/service-requests/${firstRequest.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.id).toBe(firstRequest.id);
      expect(detailResponse.body.firstName).toBe(firstRequest.firstName);
      expect(detailResponse.body.lastName).toBe(firstRequest.lastName);
      expect(detailResponse.body).toHaveProperty('addressLine1');
      expect(detailResponse.body).toHaveProperty('workLogs');
    });
  });

  describe('Integration: Filtering and Pagination', () => {
    it('should combine filters and pagination', async () => {
      // Arrange
      const query = {
        status: ServiceRequestStatus.PENDING,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      // Act
      const response = await request(app.getHttpServer())
        .get('/admin/service-requests')
        .query(query)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      response.body.items.forEach((item: any) => {
        expect(item.status).toBe(ServiceRequestStatus.PENDING);
      });
    });
  });

  // Helper functions
  async function createTestAdmin(): Promise<void> {
    // Delete existing test admin if exists
    await prisma.adminUser.deleteMany({
      where: { email: 'service-requests-test@test.com' },
    });

    // Create fresh test admin
    await prisma.adminUser.create({
      data: {
        email: 'service-requests-test@test.com',
        name: 'Service Requests Test Admin',
        passwordHash:
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyWmRJ3GKQEK', // 'password'
        role: 'admin',
        isActive: true,
      },
    });
  }

  async function loginTestAdmin(): Promise<string> {
    const loginResponse = await request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({
        email: 'service-requests-test@test.com',
        password: 'password',
      });

    return loginResponse.body.tokens.accessToken;
  }

  async function createTestServiceRequest(): Promise<string> {
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration@test.com',
        phone: '555-0100',
        addressLine1: '123 Test St',
        addressLine2: null,
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'USA',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2020,
        amountCents: 15000,
        finalAmountCents: null,
        status: ServiceRequestStatus.PENDING,
        stripePaymentIntentId: 'pi_test_123',
        finalPaymentIntentId: null,
        stripeCustomerId: 'cus_test_123',
        stripePaymentMethodId: 'pm_test_123',
      },
    });

    return serviceRequest.id;
  }

  async function cleanupTestData(): Promise<void> {
    await prisma.serviceRequest.deleteMany({
      where: { email: 'integration@test.com' },
    });
    await prisma.adminUser.deleteMany({
      where: { email: 'service-requests-test@test.com' },
    });
  }
});
