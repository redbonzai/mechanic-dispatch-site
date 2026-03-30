// Global test setup file
// This runs before all tests

/// <reference types="jest" />

import { normalizeProcessDatabaseUrlForTests } from './resolve-test-database-url';

// Set test environment variables
process.env.NODE_ENV = 'test';
// Default matches CI (5432). Docker Compose uses 15432 — global-integration-setup resolves that when unset.
normalizeProcessDatabaseUrlForTests();
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

// Increase timeout for integration tests
// Ensure Jest types are available via tsconfig.jest.json
jest.setTimeout(30000);

export {};
