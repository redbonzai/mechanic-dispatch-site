// Global test setup file
// This runs before all tests

/// <reference types="jest" />

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/mechanic_test?schema=public';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

// Increase timeout for integration tests
// Ensure Jest types are available via tsconfig.jest.json
jest.setTimeout(30000);

export {};
