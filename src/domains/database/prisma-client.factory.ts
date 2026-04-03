import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma 7+ requires a driver adapter for PostgreSQL.
 * @see prisma/lib/create-prisma-client.ts — same logic for `prisma db seed` (Docker has no src/).
 */
export function createPrismaClient(connectionString?: string): PrismaClient {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}
