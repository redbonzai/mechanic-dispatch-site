'use strict';

/**
 * Runs as the first Jest setupFile (before any TS that imports `pg`).
 * libpq defaults to the OS username when the URL has no user — on GitHub Actions that is `root`
 * → FATAL: role "root" does not exist.
 */
const CI_FALLBACK =
  'postgresql://postgres:postgres@localhost:5432/mechanic_test?schema=public';

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

function apply() {
  let url = (process.env.DATABASE_URL || '').trim();
  if (urlMissingPostgresUser(url)) {
    process.env.DATABASE_URL = CI_FALLBACK;
    url = CI_FALLBACK;
  }
  syncLibpqFromUrl(process.env.DATABASE_URL || CI_FALLBACK);
  // GitHub sets CI on hosted runners; also handle GITHUB_ACTIONS-only contexts.
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    process.env.PGUSER = process.env.PGUSER || 'postgres';
    process.env.PGPASSWORD = process.env.PGPASSWORD || 'postgres';
    process.env.PGHOST = process.env.PGHOST || 'localhost';
    process.env.PGPORT = String(process.env.PGPORT || '5432');
  }
  process.env.NODE_ENV = 'test';
}

apply();
