import * as fs from 'node:fs';
import * as path from 'node:path';
import { Client } from 'pg';

import {
  normalizeProcessDatabaseUrlForTests,
  resolveTestDatabaseUrl,
} from './resolve-test-database-url';

/** Global-setup runs in its own Node process; normalize before any pg connection. */
normalizeProcessDatabaseUrlForTests();

async function runMigrationSql(sql: string, client: Client): Promise<void> {
  try {
    await client.query(sql);
    return;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes('cannot insert multiple commands')) {
      throw e;
    }
  }

  const statements = sql
    .split(/;\s*(?=\r?\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const st of statements) {
    await client.query(`${st};`);
  }
}

/**
 * Ensures the integration test database schema exists before *.integration.spec.ts run.
 * Uses `pg` to apply migration SQL when the DB is empty (avoids Prisma CLI on Node builds
 * that hit ERR_REQUIRE_ESM). If `Mechanic` already exists, assumes migrations were applied
 * (e.g. CI runs `pnpm prisma:migrate:deploy` before tests).
 */
export default async function globalIntegrationSetup(): Promise<void> {
  const url = await resolveTestDatabaseUrl();
  process.env.DATABASE_URL = url;

  const root = path.join(__dirname, '..');
  const migrationsDir = path.join(root, 'prisma/migrations');

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    const {
      rows: [{ exists: hasMechanic }],
    } = await client.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Mechanic'
      ) AS exists
    `);

    if (hasMechanic) {
      return;
    }

    const dirs = fs
      .readdirSync(migrationsDir)
      .filter((d) => /^\d/.test(d))
      .sort();

    for (const dir of dirs) {
      const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
      if (!fs.existsSync(sqlPath)) continue;
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await runMigrationSql(sql, client);
    }
  } finally {
    await client.end();
  }
}
