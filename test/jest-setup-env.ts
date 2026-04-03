/**
 * Runs before test files are loaded (see `setupFiles` in Jest config).
 * Keeps DATABASE_URL normalized before AppModule/Prisma read process.env at import time.
 */
import { normalizeProcessDatabaseUrlForTests } from './resolve-test-database-url';

process.env.NODE_ENV = 'test';
normalizeProcessDatabaseUrlForTests();
