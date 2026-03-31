import type { PrismaClient } from '@prisma/client';

const DEFAULT_SLEEP_MS = 1000;
const DEFAULT_ATTEMPTS = 45;

/** PrismaService extends PrismaClient; TestDbHelper uses a bare `PrismaClient`. */
type PrismaQueryable = Pick<PrismaClient, '$queryRaw'>;

/**
 * Retry until Prisma can run a trivial query (Postgres ready + schema reachable).
 * Avoids racing the service container / migrations in CI.
 */
export async function waitForPrismaDb(
  prisma: PrismaQueryable,
  options?: { attempts?: number; sleepMs?: number },
): Promise<void> {
  const attempts = options?.attempts ?? DEFAULT_ATTEMPTS;
  const sleepMs = options?.sleepMs ?? DEFAULT_SLEEP_MS;
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, sleepMs));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('waitForPrismaDb: failed after retries');
}
