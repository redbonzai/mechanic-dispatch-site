# FixGuide (mechanic-dispatch-site)

**FixGuide** is a car repair research platform and mechanic marketplace. Users search for fixes, get validated repair guidance, and can discover mechanics whose skills match their needs. Mechanics subscribe to list their services and get discovered by drivers.

## Purpose

- **Car repair research** — Users search for car fixes, get DIY solutions or hire a mechanic
- **Mechanic marketplace** — Mechanics advertise their services via subscription (Basic / Pro / Premium)
- **No transaction mediation** — Users contact mechanics directly; the platform facilitates discovery and subscriptions only

## Project layout

```
mechanic-dispatch-site/
├── prisma/                    # Database schema, migrations, seed
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/                   # Utility scripts
│   ├── docker-entrypoint.sh   # Migrations + seed before app start
│   └── setup-db.sh
├── src/                       # NestJS API (domain-driven)
│   ├── domains/
│   │   ├── admin/             # Admin dashboard (users, analytics, subscriptions)
│   │   ├── analytics/         # GA4 Measurement Protocol
│   │   ├── car-data/          # NHTSA API (VIN decode, makes/models)
│   │   ├── database/          # Prisma service
│   │   ├── mail/              # Nodemailer SMTP
│   │   ├── mechanic-auth/     # Mechanic registration, login, JWT
│   │   ├── mechanics/        # Mechanic CRUD, skills, reviews
│   │   ├── repair-apis/       # RepairPal, ALLDATA, CarMD adapters
│   │   ├── repair-guides/     # Internal repair guide DB
│   │   ├── search/            # Fix search + mechanic matching
│   │   ├── subscriptions/    # Stripe subscription billing
│   │   └── users/             # User registration, login, vehicles
│   └── core/                   # Shared auth, validation
├── test/                       # E2E and integration tests
├── web/                        # Angular 19 frontend
│   └── src/app/
│       ├── admin/             # Admin dashboard (login, users, analytics)
│       ├── pages/             # Public pages (home, search, mechanics, profile)
│       ├── services/          # Repair guide pages, HTTP services
│       └── models/
├── docker/                     # Docker configs
│   └── postgres/
├── docs/                       # Documentation
├── Dockerfile                  # API container
└── docker-compose.yml          # API + PostgreSQL
```

## Prerequisites

- Node.js 24+
- pnpm 10+
- Docker Desktop (for local database)
- Stripe account (subscription products, webhooks)

## Quick start

### 1. Install dependencies

```bash
pnpm install
cd web && pnpm install && cd ..
```

### 2. Environment

Create `.env` in the project root:

```env
APP_PORT=3000
APP_URL=http://localhost:4200
CLIENT_ORIGIN=http://localhost:4200
DATABASE_URL=postgresql://postgres:postgres@localhost:15432/mechanic?schema=public

# Stripe (subscription billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...

# Optional: GA4, SMTP
GA4_MEASUREMENT_ID=
GA4_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=FixGuide <noreply@fixguide.com>
```

For Docker Compose, use `DATABASE_URL=postgresql://postgres:postgres@db:5432/mechanic?schema=public`.

### 3. Database

**With Docker Compose:**

```bash
docker compose up -d
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm prisma:seed
```

**Without Docker:**

```bash
# Ensure PostgreSQL is running on port 15432 (or update DATABASE_URL)
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm prisma:migrate:dev  # or migrate:deploy for prod
pnpm prisma:seed
```

### 4. Run locally

```bash
# API (root)
pnpm start:dev

# Frontend (separate terminal)
cd web && pnpm start
```

- API → http://localhost:3000
- Web → http://localhost:4200

## Docker Compose

```bash
docker compose up --build
```

- **db** — PostgreSQL 15 on port 15432
- **api** — NestJS API on port 3000 (runs migrations + seed on startup)

## Testing

```bash
# Backend unit + integration tests
pnpm test

# Backend E2E tests
pnpm test:e2e

# Frontend tests
cd web && pnpm test

# All via NX
pnpm exec nx run-many --target=build,lint,test,test:e2e --all --parallel=4
```

## Key commands

| Command | Description |
|---------|-------------|
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate:deploy` | Apply migrations |
| `pnpm prisma:seed` | Seed database |
| `pnpm db:reset` | Reset DB, re-migrate, re-seed |
| `pnpm build` | Build API |
| `cd web && pnpm build` | Build frontend |
| `pnpm lint` | Lint backend |
| `cd web && pnpm lint` | Lint frontend |

## Stripe webhooks

For local development:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Copy the `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## Admin dashboard

- **URL:** http://localhost:4200/admin/login
- **Seed users:** See `prisma/seed.ts` for default admin credentials

## CI / GitHub Actions

- **Test job** — Runs on `pull_request` and `push` to `main`: lint, build, unit tests, E2E tests
- **Build Docker Images** — Runs **only on `push` to `main`** (skipped on pull requests)

The Docker build is skipped on PRs because `.github/workflows/ci.yml` has `if: github.ref == 'refs/heads/main'` on the `docker-build` job. To run Docker builds on PRs, remove that condition.

## Documentation

- [CLAUDE.md](./CLAUDE.md) — Engineering constitution
- [AGENTS.md](./AGENTS.md) — Agent workflows
- [docs/admin/](./docs/admin/) — Admin dashboard specs
- [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) — Database setup
- [docs/RAILWAY_DEPLOYMENT.md](./docs/RAILWAY_DEPLOYMENT.md) — Railway deployment and custom domain (CNAME) setup

## Technology stack

- **Backend:** NestJS 11, Prisma 6, PostgreSQL, Stripe, nodemailer, @nestjs/axios
- **Frontend:** Angular 19, standalone components, signals
- **Auth:** JWT (admin, user, mechanic) with refresh tokens
- **Payments:** Stripe subscriptions (Basic $29, Pro $59, Premium $99/mo)
