/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

/**
 * Helper for creating test modules and applications
 */
export class TestModuleHelper {
  /**
   * Create a testing module with all dependencies
   */
  static async createTestingModule(overrides?: any): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [AppModule],
      ...overrides,
    }).compile();
  }

  /**
   * Create a test application with validation pipes
   */
  static async createTestApp(module: TestingModule): Promise<INestApplication> {
    const app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    return app;
  }

  /**
   * Create a full test application ready for e2e testing
   */
  static async createE2EApp(): Promise<INestApplication> {
    const module = await this.createTestingModule();
    return this.createTestApp(module);
  }

  /**
   * Helper to make authenticated requests (if auth is added later)
   */
  static authenticatedRequest(
    app: INestApplication,
    token?: string,
  ): request.SuperTest<request.Test> {
    const req = request(app.getHttpServer());
    if (token) {
      return req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }
}
