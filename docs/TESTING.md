# Testing Guide

This document describes the testing strategy and setup for the Mechanic Dispatch API.

## Testing Strategy

We use a three-tier testing approach:

1. **Unit Tests** - Test individual components in isolation with mocked dependencies
2. **Integration Tests** - Test components with real database interactions
3. **E2E Tests** - Test full request/response flows through the API

## Test Structure

```
test/
├── helpers/              # Test utilities and helpers
│   ├── test-db.helper.ts    # Database testing utilities
│   └── test-module.helper.ts # NestJS module testing utilities
├── integration/         # Integration tests
│   └── mechanics.integration.spec.ts
├── e2e/                 # End-to-end tests
│   └── mechanics.e2e-spec.ts
└── setup.ts             # Global test setup

src/
└── domains/
    └── **/
        └── **/*.spec.ts  # Unit tests (co-located with source)
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Unit Tests Only
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test -- test/integration
```

### E2E Tests
```bash
pnpm test:e2e
```

### Watch Mode
```bash
pnpm test:watch
```

### Coverage
```bash
pnpm test:cov
```

## Using NX

If NX is installed, you can also use:

```bash
nx test              # Run unit tests
nx test --watch      # Watch mode
nx test --codeCoverage  # With coverage
nx test:e2e          # E2E tests
nx lint              # Lint
nx build             # Build
```

## Test Database

Integration and E2E tests use a separate test database. Set the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mechanic_test?schema=public pnpm test
```

## Writing Tests

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
import { TestDbHelper } from '../helpers/test-db.helper';

describe('MyService Integration', () => {
  let dbHelper: TestDbHelper;

  beforeAll(async () => {
    dbHelper = new TestDbHelper();
    await dbHelper.cleanDatabase();
    await dbHelper.seedTestData();
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await dbHelper.disconnect();
  });

  it('should interact with database', async () => {
    // Test with real database
  });
});
```

### E2E Test Example

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('MyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);
  });
});
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for services, repositories, and controllers
- **Integration Tests**: Cover all database operations
- **E2E Tests**: Cover all public API endpoints

## CI/CD

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

See `.github/workflows/ci.yml` for details.


