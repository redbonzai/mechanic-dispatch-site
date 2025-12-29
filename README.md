## Mechanic Dispatch Monorepo

Mechanic Dispatch is an end-to-end MVP for booking a mobile mechanic. The monorepo contains:

- NestJS API (domain-driven) with Prisma/PostgreSQL persistence
- Stripe manual-capture payment integration
- Angular single-page app for creating service requests

## Project layout

```
.
├─ prisma/                     # Prisma schema, migrations & seed
│  ├─ migrations/             # Database migration files
│  ├─ schema.prisma           # Database schema definition
│  └─ seed.ts                 # Database seed script
├─ scripts/                    # Utility scripts
│  └─ setup-db.sh             # Database setup automation
├─ docs/                       # Documentation
│  └─ DATABASE_SETUP.md       # Detailed database setup guide
├─ src/
│  ├─ application/             # Application services
│  ├─ domain/                  # Domain entities & repositories
│  ├─ infrastructure/          # Database & Stripe implementations
│  ├─ interfaces/              # HTTP controllers & DTOs
│  └─ modules/                 # NestJS feature modules
└─ web/                        # Angular frontend (standalone project)
```

## Prerequisites

- Node.js 24+
- pnpm 10+
- Docker Desktop (recommended for database)
- Stripe account (test mode keys)

## Quick Start

**New to the project?** Start here: [QUICK_START.md](./docs/QUICK_START.md)

**Setting up the database?** See: [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)

**Building the admin dashboard?** See: [ADMIN_SUMMARY.md](./docs/admin/ADMIN_SUMMARY.md)

## Environment

Create a `.env` file in the project root with:

```
APP_PORT=3000
CLIENT_ORIGIN=http://localhost:4200
DATABASE_URL=postgresql://postgres:postgres@localhost:15432/mechanic?schema=public
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

> Tip: use the Stripe CLI to forward webhooks locally  
> `stripe listen --forward-to localhost:3000/webhooks/stripe`

For Docker Compose, copy this file to `.env.docker` (or let Compose read `.env`) and set:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/mechanic?schema=public
```

## Install dependencies

```bash
# Nest API dependencies
pnpm install

# Angular frontend dependencies
cd web && pnpm install
```

## Database Setup

**📖 For detailed database setup instructions, see [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)**

### Quick Start

```bash
# Start Docker Compose (if using Docker)
docker compose up -d

# Setup database (migrations + seed)
pnpm db:setup
```

That's it! The database will be migrated and seeded with test data.

### What Gets Created

- **Tables**: ServiceRequest, Mechanic, Skill, MechanicSkill, Review, MechanicWorkLog
- **Test Data**: 11 mechanics, 10 skills, 8 reviews, 27 mechanic-skill relationships

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm db:setup` | **Complete setup**: Generate client, run migrations, and seed |
| `pnpm prisma:generate` | Generate Prisma client only |
| `pnpm prisma:migrate:deploy` | Apply pending migrations only |
| `pnpm prisma:seed` | Seed database with test data only |
| `pnpm db:reset` | **Reset everything**: Drop database, re-run migrations, and seed |

### Troubleshooting

**"PrismaClient not found" error?**
```bash
pnpm prisma:generate
```

**Database connection issues?**
- Check Docker Compose: `docker compose ps`
- Verify DATABASE_URL in `.env`
- See [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) for detailed troubleshooting

## Running the stack locally

```bash
# API (root of repo)
pnpm run start:dev

# Frontend (from web/)
pnpm start
```

- API → `http://localhost:3000`
- Web → `http://localhost:4200`

## Docker Compose

You can run the API + Postgres locally without installing Postgres manually:

```bash
# Start services
docker compose up --build

# In another terminal, setup the database
pnpm db:setup
```

The compose stack provides:

- `db`: Postgres 15 (custom image defined in `docker/postgres/Dockerfile`) on port `15432`
- `api`: NestJS API container served on `http://localhost:3000`

Make sure your `.env` includes:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/mechanic?schema=public
```

This value is used by the API container to connect to the database.

## Stripe webhook handling

The API exposes `POST /webhooks/stripe`. With the Stripe CLI:
Login into Stripe, if not yet done : 
```bash
 stripe login
```

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `.env`, then restart the API.

## Request lifecycle

1. Customer submits the Angular form (contact, vehicle, location, card)
2. API persists the request (Prisma) and creates a Stripe customer + manual-capture PaymentIntent (default $60 deposit)
3. Frontend confirms the PaymentIntent and the webhook marks the request `AUTHORIZED`
4. Operators can settle the deposit via:
   - `POST /requests/:id/capture` – capture the initial authorization
   - `POST /requests/:id/cancel` – void the authorization and cancel the request
5. When actual work exceeds $60, submit `POST /requests/:id/finalize` with `finalAmountCents`
   - The service charges any remaining balance off-session using the saved payment method
   - The request status transitions to `FINALIZED` once the final invoice is paid
6. Track mechanic effort with `POST /requests/:id/work-logs` supplying `mechanicName`, `hoursWorkedMinutes`, `payoutPercentage`, and optional notes. These logs drive downstream payroll calculations.

### CLI helpers

After `POST /requests`, use the Stripe CLI to confirm the PaymentIntent (authorizes the $60 deposit):

```bash
stripe payment_intents confirm <pi_id> \
  --customer <cus_id> \
  --payment-method pm_card_visa
```

Capture the deposit when you’re ready to dispatch:

```bash
curl -X POST http://localhost:3000/requests/<requestId>/capture
```

If the final invoice is greater than the deposit, run:

```bash
curl -X POST http://localhost:3000/requests/<requestId>/finalize \
  -H "Content-Type: application/json" \
  -d '{"finalAmountCents":47500}'
```

This charges the saved card for the remaining $415 (assuming a $475 job total with a $60 deposit already captured).

## Capturing the $60 deposit and billing a higher total (entirely in our system)

Use these server endpoints—no Stripe Dashboard needed:

1) Create service request (authorizes $60 and saves the card)
```bash
curl -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Alex","lastName":"Driver","email":"alex@example.com","phone":"555-123-9876",
    "addressLine1":"123 Main St","city":"Austin","state":"TX","postalCode":"78701","country":"US",
    "vehicleMake":"Toyota","vehicleModel":"Camry","vehicleYear":2020
  }'
```
Response includes `requestId` and `clientSecret`. The frontend confirms the PaymentIntent with Stripe.js, which authorizes the $60 and stores the payment method for off‑session use.

2) Capture the $60 deposit
```bash
curl -X POST http://localhost:3000/requests/<requestId>/capture
```
Status changes to `CAPTURED`. We also cache the payment method, if not already present.

3) Bill a higher final total using the saved card (deposit credited automatically)
```bash
curl -X POST http://localhost:3000/requests/<requestId>/finalize \
  -H "Content-Type: application/json" \
  -d '{"finalAmountCents":47500}'
```
If `finalAmountCents` > 6000, the service charges the remaining balance off‑session (e.g., $475 - $60 = $415). The request moves to `FINALIZED` and stores the final PaymentIntent ID.

Notes:
- The API creates/reuses a Stripe Customer and sets `setup_future_usage` so the card is saved during the deposit authorization.
- Webhook (`POST /webhooks/stripe`) updates status to `AUTHORIZED` after confirmation; ensure the Stripe CLI listener is running and `STRIPE_WEBHOOK_SECRET` is set for local dev.

## Testing

Integration tests are disabled by default (`describe.skip` in `test/app.e2e-spec.ts`).  
Add a testing Postgres instance and Stripe test keys to re-enable end-to-end coverage.

## Admin Dashboard

A comprehensive Angular-based admin dashboard for managing the mechanic dispatch system.

### Current Implementation Status

**✅ Completed (v1.5.0):**
- ✅ JWT Authentication (login, refresh tokens, logout)
- ✅ Analytics API (overview, revenue, mechanics performance)
- ✅ Analytics Dashboard UI (6 stat cards, revenue metrics, mechanics table)
- ✅ 89% test coverage (88/88 tests passing)
- ✅ Production build successful

**⏳ Next Phase:**
- Service Request Management (GET endpoints + admin UI)
- Admin User Management
- Enhanced Mechanics/Reviews/Skills Management

### Testing the Admin API

#### Prerequisites

1. **Start the backend:**
```bash
pnpm start:dev
```

2. **Create an admin user** (if not exists):
```bash
# Use Prisma Studio
pnpm prisma:studio

# Or run seed script (if configured)
pnpm prisma:seed
```

Create an admin user with:
- Email: `admin@example.com`
- Password: (hashed with bcrypt, cost factor 12)
- Role: `SUPER_ADMIN`

#### Authentication Flow

**1. Login:**
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN"
  }
}
```

Save the `accessToken` for subsequent requests.

**2. Refresh Token:**
```bash
curl -X POST http://localhost:3000/api/admin/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

**3. Logout:**
```bash
curl -X POST http://localhost:3000/api/admin/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Analytics Endpoints

All analytics endpoints require JWT authentication.

**Get Overview Statistics:**
```bash
curl http://localhost:3000/api/admin/analytics/overview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "totalRequests": 150,
  "pendingRequests": 10,
  "finalizedRequests": 120,
  "totalRevenueCents": 1500000,
  "activeMechanics": 12,
  "totalMechanics": 15,
  "averageRating": 4.6,
  "totalReviews": 85,
  "totalWorkLogs": 250
}
```

**Get Revenue Metrics:**
```bash
curl "http://localhost:3000/api/admin/analytics/revenue?startDate=2025-01-01&endDate=2025-12-31&granularity=month" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**
- `startDate` (optional): ISO 8601 date (e.g., "2025-01-01")
- `endDate` (optional): ISO 8601 date
- `granularity` (optional): `day` | `week` | `month` (default: `day`)

**Get Mechanics Performance:**
```bash
curl "http://localhost:3000/api/admin/analytics/mechanics?isActive=true&sortBy=jobs&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**
- `isActive` (optional): Filter by active status (`true` | `false`)
- `minJobs` (optional): Minimum completed jobs
- `sortBy` (optional): `jobs` | `hours` | `earnings` | `rating` (default: `jobs`)
- `sortOrder` (optional): `asc` | `desc` (default: `desc`)

### Testing the Admin Frontend

**⚠️ Note:** Admin routes are not yet configured in the Angular router. The components and services exist but need routing setup.

**What's Implemented:**
- ✅ `LoginComponent` - JWT authentication UI
- ✅ `DashboardComponent` - Analytics dashboard with 6 stat cards, revenue section, mechanics table
- ✅ `AnalyticsService` - HttpClient wrapper for API endpoints
- ✅ `JwtInterceptor` - Automatic token injection
- ✅ `AdminAuthGuard` - Route protection

**To Test (After Routing Setup):**
1. Start frontend: `cd web && ng serve`
2. Navigate to: `http://localhost:4200/admin/login`
3. Login with admin credentials
4. Navigate to: `http://localhost:4200/admin/dashboard`

**Running Tests:**
```bash
# Backend tests
pnpm test

# Backend test coverage
pnpm test:cov

# Frontend tests
cd web && ng test

# Frontend test coverage
cd web && ng test --code-coverage
```

### Admin Dashboard Documentation

**Getting Started:**
- 📋 [Admin Summary](./docs/admin/ADMIN_SUMMARY.md) - Overview and key decisions
- 🚀 [Quick Start Guide](./docs/admin/ADMIN_QUICK_START.md) - Setup instructions

**Detailed Documentation:**
- 📖 [Implementation Plan](./docs/admin/ADMIN_DASHBOARD_PLAN.md) - Phase-by-phase roadmap
- 🔌 [API Specification](./docs/admin/ADMIN_API_SPECIFICATION.md) - Endpoint details
- 🎨 [UI/UX Specification](./docs/admin/ADMIN_UI_SPECIFICATION.md) - Design guidelines
- 🔐 [Security Requirements](./docs/admin/SECURITY_REQUIREMENTS.md) - Security implementation

**Technology Stack:**
- Frontend: Angular 19.2 with standalone components
- Backend: NestJS with Prisma ORM
- Authentication: JWT with httpOnly cookies + refresh tokens
- Testing: Jest (backend), Jasmine/Karma (frontend)
- Security: bcrypt password hashing, rate limiting, CORS

## Next steps

- Harden validation & add rate limiting (e.g., `@nestjs/throttler`)
- Implement admin dashboard (see docs above)
- Add monitoring and logging (Sentry, CloudWatch)
- Implement automated backups
- Add customer notification system (email/SMS)
