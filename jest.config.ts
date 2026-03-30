import type { Config } from 'jest';

const shared: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  // Avoid scanning compiled output / Nx cache (duplicate __mocks__ vs src/__mocks__)
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/.nx/',
    '<rootDir>/coverage/',
    '<rootDir>/web/',
  ],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        diagnostics: {
          // Ignore TS2307 "cannot find module" for packages not installed locally.
          // The moduleNameMapper below provides mock implementations at test time.
          ignoreCodes: ['TS2307'],
        },
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^nodemailer$': '<rootDir>/src/__mocks__/nodemailer.ts',
    '^@nestjs/axios$': '<rootDir>/src/__mocks__/nestjs-axios.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

const config: Config = {
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/*.spec.ts',
        '<rootDir>/test/integration/AdminAnalyticsService.spec.ts',
      ],
      // *.e2e-spec.ts hits the real DB and clears admin users; it must not run in parallel
      // with the integration project (see test/jest-e2e.json + pnpm test:e2e).
      testPathIgnorePatterns: ['/node_modules/', '/web/', '\\.e2e-spec\\.ts$'],
    },
    {
      ...shared,
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.integration.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/web/'],
      globalSetup: '<rootDir>/test/global-integration-setup.ts',
      // One worker: shared DATABASE_URL; these tests truncate and seed.
      maxWorkers: 1,
    },
  ],
};

export default config;
