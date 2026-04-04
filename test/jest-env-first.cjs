'use strict';

/**
 * Runs as the first Jest setupFile (before any TS that imports `pg`).
 * libpq defaults to the OS username when the URL has no user — on GitHub Actions that is `root`
 * → FATAL: role "root" does not exist.
 */
const CI_FALLBACK =
  'postgresql://postgres:postgres@localhost:5432/mechanic_test?schema=public';
const LOCAL_DOCKER_FALLBACK =
  'postgresql://postgres:postgres@localhost:15432/mechanic_test?schema=public';

function urlMissingPostgresUser(url) {
  const u = (url || '').trim();
  if (!u) return true;
  if (!/^postgres(ql)?:\/\//i.test(u)) return true;
  const rest = u.replace(/^postgres(ql)?:\/\//i, '');
  const at = rest.indexOf('@');
  if (at === -1) return true;
  const userinfo = rest.slice(0, at);
  if (!userinfo) return true;
  const user = decodeURIComponent(userinfo.split(':')[0] || '');
  if (!user || user === 'root') return true;
  return false;
}

function syncLibpqFromUrl(url) {
  try {
    const forParse = url.replace(/^postgres(ql)?:/i, 'http:');
    const parsed = new URL(forParse);
    if (parsed.username) {
      process.env.PGUSER = decodeURIComponent(parsed.username);
    }
    if (parsed.password) {
      process.env.PGPASSWORD = decodeURIComponent(parsed.password);
    }
    if (parsed.hostname) {
      process.env.PGHOST = parsed.hostname;
    }
    if (parsed.port) {
      process.env.PGPORT = parsed.port;
    }
  } catch {
    /* ignore */
  }
}

/**
 * Returns true when the URL points to a non-localhost host (e.g. Railway, RDS).
 * Tests should never run against remote/production databases.
 */
function isRemoteUrl(url) {
  try {
    const forParse = url.replace(/^postgres(ql)?:/i, 'http:');
    const parsed = new URL(forParse);
    const host = parsed.hostname.toLowerCase();
    return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
  } catch {
    return false;
  }
}

function apply() {
  let url = (process.env.DATABASE_URL || '').trim();

  const onGithub = process.env.GITHUB_ACTIONS === 'true';
  const isCI = onGithub || process.env.CI === 'true';

  if (urlMissingPostgresUser(url) || (!isCI && isRemoteUrl(url))) {
    // In CI use port 5432 (service container); locally use 15432 (docker-compose.yml).
    const fallback = isCI ? CI_FALLBACK : LOCAL_DOCKER_FALLBACK;
    process.env.DATABASE_URL = fallback;
    url = fallback;
  }
  syncLibpqFromUrl(process.env.DATABASE_URL || CI_FALLBACK);

  // GitHub sets CI=true; Jest treats that as `--ci` unless jest-e2e sets ci:false.
  if (isCI) {
    // On Actions, always pin libpq env so nothing falls back to runner user `root`.
    if (onGithub) {
      process.env.PGUSER = 'postgres';
      process.env.PGPASSWORD = 'postgres';
      process.env.PGHOST = process.env.PGHOST || 'localhost';
      process.env.PGPORT = String(process.env.PGPORT || '5432');
    } else {
      process.env.PGUSER = process.env.PGUSER || 'postgres';
      process.env.PGPASSWORD = process.env.PGPASSWORD || 'postgres';
      process.env.PGHOST = process.env.PGHOST || 'localhost';
      process.env.PGPORT = String(process.env.PGPORT || '5432');
    }
  }
  process.env.NODE_ENV = 'test';
}

apply();
