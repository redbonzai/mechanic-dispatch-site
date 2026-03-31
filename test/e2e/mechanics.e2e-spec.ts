/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/domains/database/prisma.service';
import { TestDbHelper } from '../helpers/test-db.helper';

describe('Mechanics E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbHelper: TestDbHelper;

  beforeAll(async () => {
    dbHelper = new TestDbHelper();
    await dbHelper.cleanDatabase();
    await dbHelper.seedTestData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      /* Nest Prisma pool */
    }
    try {
      await app.close();
    } catch {
      /* Nest / HTTP server */
    }
    try {
      await prisma.$disconnect();
    } catch {
      /* idempotent */
    }
    try {
      await dbHelper.cleanDatabase();
    } catch {
      /* final clean best-effort */
    }
    try {
      await dbHelper.disconnect();
    } catch {
      /* Prisma client from helper */
    }
  }, 60_000);

  describe('/mechanics (GET)', () => {
    it('should return all mechanics', () => {
      return request(app.getHttpServer())
        .get('/mechanics')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should filter by isActive=true', () => {
      return request(app.getHttpServer())
        .get('/mechanics?isActive=true')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((mechanic: any) => {
            expect(mechanic.isActive).toBe(true);
          });
        });
    });

    it('should filter by isActive=false', () => {
      return request(app.getHttpServer())
        .get('/mechanics?isActive=false')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((mechanic: any) => {
            expect(mechanic.isActive).toBe(false);
          });
        });
    });
  });

  describe('/mechanics/:id (GET)', () => {
    it('should return a mechanic by id', async () => {
      // First get all mechanics to get an ID
      const allMechanics = await request(app.getHttpServer())
        .get('/mechanics')
        .expect(200);

      const mechanicId = allMechanics.body[0].id;

      return request(app.getHttpServer())
        .get(`/mechanics/${mechanicId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', mechanicId);
          expect(res.body).toHaveProperty('name');
        });
    });

    it('should return empty object for non-existent mechanic', () => {
      return request(app.getHttpServer())
        .get('/mechanics/non-existent-id')
        .expect(200)
        .expect((res) => {
          // NestJS serializes null as empty object {}
          expect(res.body).toEqual({});
        });
    });
  });

  describe('/mechanics/slug/:slug (GET)', () => {
    it('should return a mechanic by slug', async () => {
      const allMechanics = await request(app.getHttpServer())
        .get('/mechanics')
        .expect(200);

      const slug = allMechanics.body[0].slug;

      return request(app.getHttpServer())
        .get(`/mechanics/slug/${slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('slug', slug);
        });
    });
  });

  describe('/reviews (GET)', () => {
    it('should return all reviews', () => {
      return request(app.getHttpServer())
        .get('/reviews')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter reviews by mechanicId', async () => {
      const mechanics = await request(app.getHttpServer())
        .get('/mechanics')
        .expect(200);

      const mechanicId = mechanics.body[0].id;

      return request(app.getHttpServer())
        .get(`/reviews?mechanicId=${mechanicId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((review: any) => {
            expect(review.mechanicId).toBe(mechanicId);
          });
        });
    });
  });

  describe('/reviews/stats (GET)', () => {
    it('should return review statistics', () => {
      return request(app.getHttpServer())
        .get('/reviews/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalReviews');
          expect(res.body).toHaveProperty('averageRating');
          expect(typeof res.body.totalReviews).toBe('number');
          expect(typeof res.body.averageRating).toBe('number');
        });
    });
  });
});
