# Prisma 7 migration (this repo)

## What changed

### 1. `prisma.config.ts` (repo root)

- Holds the **database URL** for the CLI (`migrate`, `generate`, etc.).
- Uses a **fallback URL** when `DATABASE_URL` is unset so `prisma generate` works in Docker/CI before a real DB exists (no connection is opened during generate).
- Loads `.env` via `dotenv/config`.

### 2. `prisma/schema.prisma`

- `datasource db` keeps **`provider = "postgresql"`** only — **`url` was removed** (Prisma 7 P1012 if left in the schema).

### 3. PostgreSQL driver adapter (required in Prisma 7)

Runtime `PrismaClient` must be constructed with **`@prisma/adapter-pg`** and **`pg`**:

- `src/domains/database/prisma.service.ts` — Nest `PrismaService`
- `src/domains/database/prisma-client.factory.ts` — shared helper for scripts/tests
- `prisma/seed.ts`, `scripts/create-test-admin.ts`, `test/helpers/test-db.helper.ts`

### 4. Docker

- **`Dockerfile`** copies **`prisma.config.ts`** and runs **`pnpm exec prisma generate`** (no `--schema`; config defines the schema path).

## Dependencies

- `prisma` / `@prisma/client` — 7.x
- `@prisma/adapter-pg` — same minor as `@prisma/client`
- `pg`
- `dotenv` — for `prisma.config.ts`

## Commands

Unchanged for day-to-day use:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:migrate:deploy
pnpm prisma db seed
```

## Tests (Jest)

- **`pnpm test`** runs **`pretest`** → `pnpm prisma:generate` so `node_modules/.prisma/client` exists before TypeScript checks `PrismaService` / `@prisma/client`.
- **Jest** ignores **`dist/`** and **`.nx/`** so compiled copies of `src/__mocks__` do not duplicate manual mocks.

If you run **`jest` directly**, run **`pnpm prisma:generate`** first.

## Stripe (dependabot `stripe@20`)

Use **`apiVersion: '2026-02-25.clover'`** to match the installed SDK. Subscription billing windows use **`subscription.items.data[0].current_period_*`** (not the subscription root).

## Node version

Prisma 7.x expects a **supported Node** (see [Prisma docs](https://www.prisma.io/docs/orm/reference/system-requirements)). Use **Node ≥ 20.19** (or 22.x / 24.x per Prisma engines).

## Managed Postgres (e.g. Railway) SSL

If you see TLS / access errors after upgrading, you may need to relax SSL verification for `pg` or set `NODE_EXTRA_CA_CERTS` — see the [Prisma 7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) (SSL section).
