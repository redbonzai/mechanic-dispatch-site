import { Client } from 'pg';

const CI_FALLBACK =
  'postgresql://postgres:postgres@localhost:5432/mechanic_test?schema=public';

/**
 * Ensures `DATABASE_URL` always includes an explicit Postgres user.
 * URLs without userinfo make libpq use the OS user — on GitHub Actions that is `root`, which
 * triggers `FATAL: role "root" does not exist` against the standard `postgres` service image.
 */
export function normalizeProcessDatabaseUrlForTests(): void {
  const raw = process.env.DATABASE_URL?.trim();

  if (!raw) {
    process.env.DATABASE_URL = CI_FALLBACK;
    syncLibpqEnvFromDatabaseUrl(CI_FALLBACK);
    return;
  }

  try {
    const forParse = raw.replace(/^postgres(ql)?:/i, 'http:');
    const u = new URL(forParse);
    const user = decodeURIComponent(u.username || '');
    if (!user || user === 'root') {
      process.env.DATABASE_URL = CI_FALLBACK;
    }
  } catch {
    process.env.DATABASE_URL = CI_FALLBACK;
  }

  syncLibpqEnvFromDatabaseUrl(process.env.DATABASE_URL ?? CI_FALLBACK);
}

function syncLibpqEnvFromDatabaseUrl(url: string): void {
  try {
    const u = new URL(url.replace(/^postgres(ql)?:/i, 'http:'));
    if (u.username) process.env.PGUSER = decodeURIComponent(u.username);
    if (u.password) process.env.PGPASSWORD = decodeURIComponent(u.password);
    if (u.hostname) process.env.PGHOST = u.hostname;
    if (u.port) process.env.PGPORT = u.port;
  } catch {
    /* ignore */
  }
}

/** Default URLs when `DATABASE_URL` is unset (see docker-compose.yml db port 15432). */
const FALLBACK_CANDIDATES = [
  'postgresql://postgres:postgres@localhost:5432/mechanic_test?schema=public',
  'postgresql://postgres:postgres@localhost:15432/mechanic_test?schema=public',
] as const;

const CONNECT_MS = 4000;

const LOCAL_PG = { user: 'postgres', password: 'postgres' } as const;

/**
 * If Postgres is up but `mechanic_test` was never created (e.g. old volume before init script),
 * connect to `postgres` and CREATE DATABASE so integration tests can run.
 */
async function ensureMechanicTestDb(host: string, port: number): Promise<string | null> {
  const testUrl = `postgresql://${LOCAL_PG.user}:${LOCAL_PG.password}@${host}:${port}/mechanic_test?schema=public`;
  if (await canConnect(testUrl)) {
    return testUrl;
  }

  const adminUrl = `postgresql://${LOCAL_PG.user}:${LOCAL_PG.password}@${host}:${port}/postgres`;
  if (!(await canConnect(adminUrl))) {
    return null;
  }

  const client = new Client({
    connectionString: adminUrl,
    connectionTimeoutMillis: CONNECT_MS,
  });
  try {
    await client.connect();
    const {
      rows: [{ exists }],
    } = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'mechanic_test') AS exists`,
    );
    if (!exists) {
      await client.query('CREATE DATABASE mechanic_test');
    }
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }

  return (await canConnect(testUrl)) ? testUrl : null;
}

function redactUrl(url: string): string {
  return url.replace(/:[^:@]+@/, ':****@');
}

async function canConnect(url: string): Promise<boolean> {
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: CONNECT_MS,
  });
  try {
    await client.connect();
    return true;
  } catch {
    return false;
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

/** Host Postgres for `mechanic_test` (docker-compose.yml → 15432; docker-compose.dev.yml → 5432). */
async function tryResolveLocalMechanicTest(): Promise<string | null> {
  for (const url of FALLBACK_CANDIDATES) {
    if (await canConnect(url)) {
      return url;
    }
  }

  for (const { host, port } of [
    { host: 'localhost', port: 5432 },
    { host: 'localhost', port: 15432 },
  ] as const) {
    const resolved = await ensureMechanicTestDb(host, port);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

/**
 * Picks a working Postgres URL for integration tests.
 * - If `DATABASE_URL` is reachable from this process, uses it.
 * - Otherwise tries localhost `mechanic_test` on 5432 then 15432 (and auto-creates the DB if needed).
 *   This covers `.env` using host `db`, which only resolves inside Docker — Jest runs on the host.
 */
export async function resolveTestDatabaseUrl(): Promise<string> {
  normalizeProcessDatabaseUrlForTests();
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit && (await canConnect(explicit))) {
    return explicit;
  }

  const local = await tryResolveLocalMechanicTest();
  if (local) {
    if (explicit) {
      // eslint-disable-next-line no-console -- intentional diagnostics for integration runs
      console.warn(
        `[jest integration] DATABASE_URL is not reachable from this host (${redactUrl(explicit)}). ` +
          `Using ${redactUrl(local)} instead (Postgres from Docker on localhost).`,
      );
    }
    return local;
  }

  if (explicit) {
    throw new Error(
      `DATABASE_URL is set but not reachable from this host (${redactUrl(explicit)}), ` +
        `and no Postgres with mechanic_test on localhost:5432 or localhost:15432. ` +
        `Inside Docker Compose, DB host is often \`db\` — that only works inside a container. ` +
        `Unset DATABASE_URL for tests, or set it to postgresql://postgres:postgres@localhost:15432/mechanic_test?schema=public ` +
        `(docker-compose.yml) or :5432 if you use docker-compose.dev.yml.`,
    );
  }

  const tried = FALLBACK_CANDIDATES.map(redactUrl).join(', ');
  throw new Error(
    `No Postgres reachable for integration tests. Tried: ${tried} (and auto-create via postgres db on ports 5432, 15432). ` +
      `Containers running? Try \`docker compose up -d db\` (host port 15432 → container 5432). ` +
      `For unit-only runs use \`pnpm test\`.`,
  );
}
