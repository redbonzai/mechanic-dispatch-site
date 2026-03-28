/**
 * Prisma ORM 7+ — connection URLs for Migrate / Generate live here, not in schema.prisma.
 * @see https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
 */
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/** Allows `prisma generate` in CI/Docker when DATABASE_URL is unset (no TCP connect for generate). */
const datasourceUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Node-only (no pnpm) so `prisma db seed` works in the production Docker image
    seed: 'node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
});
