import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/domains/database/prisma.service';
import * as validation from '../../src/core/validation';
import { waitForPrismaDb } from '../helpers/wait-for-db';

/**
 * Admin Analytics API integration tests — real HTTP + database (see test/setup.ts DATABASE_URL).
 */
describe('Admin Analytics API (Integration Tests)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await waitForPrismaDb(prisma);

    await prisma.adminUser.deleteMany({
      where: { email: 'analytics-test@test.com' },
    });

    const passwordHash = await validation.hashPassword('password');
    await prisma.adminUser.create({
      data: {
        email: 'analytics-test@test.com',
        name: 'Analytics Test Admin',
        passwordHash,
        role: 'admin',
        isActive: true,
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({ email: 'analytics-test@test.com', password: 'password' });

    expect(loginResponse.status).toBe(200);
    accessToken = loginResponse.body.tokens.accessToken as string;
    expect(accessToken).toBeDefined();
  });

  afterAll(async () => {
    try {
      await prisma.adminUser.deleteMany({
        where: { email: 'analytics-test@test.com' },
      });
    } catch {
      /* ignore teardown errors */
    }
    if (app) {
      try {
        await app.close();
      } catch {
        /* Nest / HTTP */
      }
    }
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch {
        /* pool / adapter */
      }
    }
  }, 60_000);

  describe('GET /admin/analytics/overview', () => {
    it('should return 200 with overview statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/overview')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalUsers: expect.any(Number),
        activeUsers: expect.any(Number),
        totalMechanics: expect.any(Number),
        activeMechanics: expect.any(Number),
        mechsTrialing: expect.any(Number),
        mechsActive: expect.any(Number),
        mechsPastDue: expect.any(Number),
        subscriptionRevenueMonthlyCents: expect.any(Number),
        totalSearches: expect.any(Number),
        totalReviews: expect.any(Number),
        averageRating: expect.any(Number),
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/admin/analytics/overview',
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/analytics/subscriptions', () => {
    it('should return 200 with subscription metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalSubscribers: expect.any(Number),
        basicCount: expect.any(Number),
        proCount: expect.any(Number),
        premiumCount: expect.any(Number),
        trialingCount: expect.any(Number),
        monthlyRevenueCents: expect.any(Number),
        churnedThisMonth: expect.any(Number),
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/admin/analytics/subscriptions',
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/analytics/mechanics', () => {
    it('should return 200 with mechanics analytics and total count', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/mechanics')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mechanics');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.mechanics)).toBe(true);
      expect(typeof response.body.total).toBe('number');

      if (response.body.mechanics.length > 0) {
        const m = response.body.mechanics[0] as Record<string, unknown>;
        expect(m).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.any(String),
          profileViews: expect.any(Number),
          searchAppearances: expect.any(Number),
          linkClicks: expect.any(Number),
          rating: expect.any(Number),
          reviewCount: expect.any(Number),
        });
      }
    });

    it('should sort by rating descending when sortBy=rating', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/mechanics')
        .query({ sortBy: 'rating', limit: 50 })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      const mechanics = response.body.mechanics as { rating: number }[];
      const ratings = mechanics.map((row) => row.rating);
      const sorted = [...ratings].sort((a, b) => b - a);
      expect(ratings).toEqual(sorted);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/admin/analytics/mechanics',
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/analytics/search/volume', () => {
    it('should return 200 with volume points for default window', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/search/volume')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid days query', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/analytics/search/volume')
        .query({ days: 'not-a-number' })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });
});
