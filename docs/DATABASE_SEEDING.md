# Database Seeding Guide

**Version**: 1.0  
**Last Updated**: January 12, 2026  
**Status**: ✅ Active

---

## Overview

This guide explains the database seeding system for the Mechanic Dispatch application. Seeding provides test data for development, testing, and demo purposes.

---

## What Gets Seeded

The seed script (`prisma/seed.ts`) populates the database with comprehensive test data:

### 1. Admin Users (4 users)
- **Super Admin** (full access to all features)
- **Staff Admin** (read/write access, no user management)
- **Moderator** (read-only access)
- **Inactive Admin** (for testing login failures)

### 2. Skills (10 skills)
- Oil Change, Brake Pads Replacement, Battery Replacement
- Pre-purchase Car Inspection, Diagnostics, Towing
- Engine Repair, Transmission Service, AC Repair

### 3. Mechanics (11 mechanics)
- Includes experienced mechanics like Rocco, Robert, Grzegorz
- Each with profiles, certifications, ratings, and reviews

### 4. Mechanic-Skill Links
- Links mechanics to their respective skills

### 5. Reviews (8 reviews)
- 5-star reviews for various mechanics
- Includes customer testimonials and service descriptions

### 6. Service Requests (8 requests)
- Service requests in all possible statuses:
  - **PENDING**: New requests awaiting authorization
  - **AUTHORIZED**: Payment authorized, ready for work
  - **CAPTURED**: Payment captured, work in progress
  - **FINALIZED**: Work completed, final payment processed
  - **CANCELLED**: Cancelled requests
  - **FAILED**: Failed payment attempts

### 7. Work Logs (3 logs)
- Mechanic work logs for finalized service requests
- Includes hours worked, payout percentages, and notes

---

## Admin Login Credentials

After seeding, use these credentials to access the admin dashboard:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `admin@mechanic.com` | `Admin123!` | Full access (all features) |
| **Staff Admin** | `staff@mechanic.com` | `Staff123!` | Read/write (no user management) |
| **Moderator** | `moderator@mechanic.com` | `Moderator123!` | Read-only access |
| **Inactive** | `inactive@mechanic.com` | `Inactive123!` | ❌ Login will fail (account inactive) |

**Admin Dashboard URL**: http://localhost:4200/admin/login

---

## Running Seeds

### Method 1: Manual Seeding (Recommended for Local Development)

```bash
# Run migrations and seeding
pnpm db:setup

# Or run seeding only (requires existing database)
pnpm prisma db seed
```

### Method 2: Reset and Seed (Clean Slate)

```bash
# WARNING: This deletes all data and re-seeds
pnpm db:reset
```

### Method 3: Docker Container (Automatic)

When you start the Docker containers, seeding happens automatically:

```bash
docker-compose up -d
```

The `docker-entrypoint.sh` script runs:
1. Database health check (waits for PostgreSQL)
2. Prisma migrations (`prisma migrate deploy`)
3. Prisma seeding (`prisma db seed`)
4. Application startup

**Note**: If the database already has data, seeding may fail gracefully (this is expected behavior).

---

## Seeding Workflow

### Development Workflow

1. **First Time Setup**:
   ```bash
   # Start Docker containers (database + API)
   docker-compose up -d
   
   # Seeding runs automatically on first startup
   # Check logs: docker-compose logs api
   ```

2. **Subsequent Runs**:
   ```bash
   # Start containers (seeding is idempotent via upsert)
   docker-compose up -d
   ```

3. **Reset Database** (if needed):
   ```bash
   # Stop containers
   docker-compose down -v  # -v removes volumes (deletes data)
   
   # Start again (fresh seed)
   docker-compose up -d
   ```

### Testing Workflow

1. **Run E2E Tests with Fresh Data**:
   ```bash
   # Reset database before tests
   pnpm db:reset
   
   # Run E2E tests
   pnpm test:e2e
   ```

2. **Create Additional Test Data**:
   ```bash
   # Use the create-test-admin script for additional admin users
   pnpm tsx scripts/create-test-admin.ts
   ```

---

## Seed Script Structure

### File: `prisma/seed.ts`

```typescript
// Imports
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Seed order (important for foreign key constraints)
1. Admin Users (no dependencies)
2. Skills (no dependencies)
3. Mechanics (no dependencies)
4. Mechanic-Skill Links (depends on Mechanics + Skills)
5. Reviews (depends on Mechanics)
6. Service Requests (no dependencies)
7. Work Logs (depends on Service Requests + Mechanics)
```

### Idempotency

The seed script uses **upsert** (update or insert) for most records:

```typescript
await prisma.adminUser.upsert({
  where: { email: 'admin@mechanic.com' },
  update: {},  // If exists, do nothing
  create: {    // If doesn't exist, create
    email: 'admin@mechanic.com',
    // ... other fields
  },
});
```

This means:
- ✅ Running the seed multiple times is safe
- ✅ Won't create duplicates
- ✅ Won't fail if data already exists

**Exception**: Service Requests and Work Logs use `deleteMany` then `create` to ensure fresh test data.

---

## Testing the Seed Data

### 1. Verify Admin Login

```bash
# Visit admin dashboard
open http://localhost:4200/admin/login

# Login with:
# Email: admin@mechanic.com
# Password: Admin123!
```

### 2. Verify Service Requests

```bash
# Check database directly
docker exec -it mechanic-dispatch-db psql -U postgres -d mechanic

# SQL query
SELECT id, "firstName", "lastName", status FROM "ServiceRequest";
```

Expected output:
```
     id      | firstName | lastName  |   status
-------------+-----------+-----------+------------
 sr_1        | John      | Smith     | PENDING
 sr_2        | Sarah     | Johnson   | AUTHORIZED
 sr_3        | Michael   | Brown     | CAPTURED
 sr_4        | Emily     | Davis     | FINALIZED
 sr_5        | Robert    | Wilson    | CANCELLED
 sr_6        | Jennifer  | Martinez  | FAILED
 sr_7        | David     | Anderson  | PENDING
 sr_8        | Lisa      | Garcia    | FINALIZED
```

### 3. Verify Admin Users

```bash
# SQL query
SELECT email, name, role, "isActive" FROM "AdminUser";
```

Expected output:
```
          email           |      name      |     role      | isActive
--------------------------+----------------+---------------+----------
 admin@mechanic.com       | Super Admin    | super-admin   | t
 moderator@mechanic.com   | Moderator User | moderator     | t
 staff@mechanic.com       | Staff Admin    | admin         | t
 inactive@mechanic.com    | Inactive Admin | admin         | f
```

---

## Troubleshooting

### Issue: Seeding Fails on Startup

**Symptoms**:
```
⚠️  Seeding failed or already seeded
```

**Causes**:
1. Database already has data (this is OK, seed script is idempotent)
2. Foreign key constraint violation
3. Unique constraint violation

**Solutions**:
```bash
# Check API logs
docker-compose logs api

# If you need fresh data, reset the database
docker-compose down -v
docker-compose up -d
```

### Issue: Cannot Login with Admin Credentials

**Symptoms**:
```
401 Unauthorized
```

**Diagnosis**:
```bash
# Check if admin users exist
docker exec -it mechanic-dispatch-db psql -U postgres -d mechanic \
  -c "SELECT email, role, \"isActive\" FROM \"AdminUser\";"

# If no results, seed failed
```

**Solution**:
```bash
# Manually run seed
docker exec -it mechanic-dispatch-site-api npx prisma db seed

# Or recreate containers
docker-compose down -v
docker-compose up -d
```

### Issue: Service Requests Not Visible in Dashboard

**Diagnosis**:
```bash
# Check if service requests exist
docker exec -it mechanic-dispatch-db psql -U postgres -d mechanic \
  -c "SELECT COUNT(*) FROM \"ServiceRequest\";"

# Expected: 8
```

**Solution**:
```bash
# Manually run seed
docker exec -it mechanic-dispatch-site-api npx prisma db seed
```

### Issue: Docker Entrypoint Script Fails

**Symptoms**:
```
/app/scripts/docker-entrypoint.sh: Permission denied
```

**Solution**:
```bash
# Rebuild Docker image (scripts marked executable in Dockerfile)
docker-compose build --no-cache api
docker-compose up -d
```

---

## Customizing Seed Data

### Adding More Admin Users

Edit `prisma/seed.ts`:

```typescript
prisma.adminUser.upsert({
  where: { email: 'newadmin@mechanic.com' },
  update: {},
  create: {
    id: 'admin_5',
    email: 'newadmin@mechanic.com',
    name: 'New Admin',
    passwordHash: await bcrypt.hash('NewPassword123!', 12),
    role: 'admin',
    isActive: true,
  },
})
```

### Adding More Service Requests

Edit `prisma/seed.ts` and add to the `serviceRequests` array:

```typescript
{
  id: 'sr_9',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+1-555-0199',
  // ... other fields
  status: 'PENDING',
}
```

### Running Custom Seeds

Run the seed script after making changes:

```bash
pnpm prisma db seed
```

---

## Production Considerations

### ⚠️ IMPORTANT: Do NOT Seed Production

The seed script is **ONLY for development/testing**. Never run it in production:

```bash
# Production deployment ONLY runs migrations
NODE_ENV=production npx prisma migrate deploy

# NO SEEDING IN PRODUCTION
```

### Environment Detection

Add to `docker-entrypoint.sh` if you want to skip seeding in production:

```bash
if [ "$NODE_ENV" != "production" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seeding skipped"
else
  echo "⏭️  Skipping seed (production mode)"
fi
```

---

## Related Documents

- **prisma/seed.ts** - Seed script implementation
- **scripts/docker-entrypoint.sh** - Docker startup script
- **scripts/create-test-admin.ts** - Manual admin user creation
- **scripts/setup-db.sh** - Database setup script (local development)
- **docs/DATABASE_SETUP.md** - Database configuration guide

---

## Summary

✅ **Seeding is automatic** when starting Docker containers  
✅ **Idempotent** - safe to run multiple times  
✅ **Comprehensive** - includes all data types for testing  
✅ **Credentials provided** - ready-to-use admin accounts  
✅ **Easy to customize** - edit `prisma/seed.ts`  

**Quick Start**:
```bash
docker-compose up -d
# Wait for startup...
# Visit http://localhost:4200/admin/login
# Login: admin@mechanic.com / Admin123!
```

---

**Last Updated**: January 12, 2026  
**Maintainer**: Development Team  
**Status**: ✅ Active
