# Admin Dashboard - Quick Reference

**Last Updated**: January 12, 2026

---

## 🚀 Quick Start

### Start the Application

```bash
# Start Docker containers (automatic seeding)
docker-compose up -d

# Check logs
docker-compose logs -f api

# Wait for "🎉 Seeding completed successfully!"
```

### Access the Admin Dashboard

**URL**: http://localhost:4200/admin/login

**Credentials**:
- **Email**: `admin@mechanic.com`
- **Password**: `Admin123!`

---

## 👥 Admin User Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `admin@mechanic.com` | `Admin123!` | Full access (all features) |
| **Staff Admin** | `staff@mechanic.com` | `Staff123!` | Read/write (no user management) |
| **Moderator** | `moderator@mechanic.com` | `Moderator123!` | Read-only access |
| **Inactive** | `inactive@mechanic.com` | `Inactive123!` | ❌ Login fails (inactive account) |

---

## 📊 Seeded Test Data

### Service Requests (8 total)

| ID | Customer | Vehicle | Status | Amount |
|----|----------|---------|--------|--------|
| sr_1 | John Smith | 2018 Toyota Camry | PENDING | $150.00 |
| sr_2 | Sarah Johnson | 2020 Honda Accord | AUTHORIZED | $120.00 |
| sr_3 | Michael Brown | 2019 Ford F-150 | CAPTURED | $250.00 |
| sr_4 | Emily Davis | 2021 Tesla Model 3 | FINALIZED | $220.00 |
| sr_5 | Robert Wilson | 2017 Chevrolet Silverado | CANCELLED | $90.00 |
| sr_6 | Jennifer Martinez | 2022 BMW 3 Series | FAILED | $200.00 |
| sr_7 | David Anderson | 2019 Nissan Altima | PENDING | $140.00 |
| sr_8 | Lisa Garcia | 2020 Mercedes C-Class | FINALIZED | $350.00 |

### Mechanics (11 total)

- Rocco (26 years experience, ASE Master Technician)
- Robert (35 years experience, ASE Master + Hybrid Certified)
- Grzegorz (45 years experience)
- Mike Johnson, David Chen, James Wilson, Robert Martinez, Thomas Anderson, William Brown, Richard Taylor, Joseph White

### Skills (10 total)

- Oil Change, Brake Pads Replacement, Battery Replacement
- Pre-purchase Car Inspection
- Car is not starting Diagnostic
- Check Engine Light Diagnostic
- Towing and Roadside
- Engine Repair, Transmission Service, AC Repair

### Work Logs (3 total)

- sr_4: Rocco (3 hours, brake pads and rotors)
- sr_4: Robert (1 hour, assisted with brake job)
- sr_8: Grzegorz (5 hours, transmission service)

---

## 🔧 Common Tasks

### Reset Database (Fresh Seed)

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start containers (automatic seeding)
docker-compose up -d
```

### Manual Seeding (Without Docker)

```bash
# Run migrations and seed
pnpm db:setup

# Or seed only
pnpm prisma db seed
```

### Create Additional Admin User

```bash
# Use the create-test-admin script
pnpm tsx scripts/create-test-admin.ts
```

### Check Database Directly

```bash
# Connect to PostgreSQL
docker exec -it mechanic-dispatch-db psql -U postgres -d mechanic

# View admin users
SELECT email, name, role, "isActive" FROM "AdminUser";

# View service requests
SELECT id, "firstName", "lastName", status FROM "ServiceRequest";

# Exit
\q
```

---

## 📁 File Locations

### Backend

- **Admin Users Service**: `src/domains/admin/users/AdminUsersService.ts`
- **Admin Users Controller**: `src/domains/admin/users/AdminUsersController.ts`
- **Types**: `src/domains/admin/users/types.ts`
- **DTOs**: `src/domains/admin/users/dtos/`

### Frontend

- **Users List Component**: `web/src/app/admin/components/users/users-list.component.ts`
- **User Detail Component**: `web/src/app/admin/components/users/user-detail.component.ts`
- **User Create Component**: `web/src/app/admin/components/users/user-create.component.ts`
- **Admin Users Service**: `web/src/app/admin/services/admin-users.service.ts`
- **Models**: `web/src/app/admin/models/admin-user.model.ts`

### Database

- **Seed Script**: `prisma/seed.ts`
- **Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`

### Scripts

- **Docker Entrypoint**: `scripts/docker-entrypoint.sh` (auto migrations + seeding)
- **Create Test Admin**: `scripts/create-test-admin.ts`
- **Database Setup**: `scripts/setup-db.sh`

### Documentation

- **Seeding Guide**: `docs/DATABASE_SEEDING.md`
- **Phase 4 Status**: `docs/admin/PHASE4_FINAL_STATUS.md`
- **Admin Dashboard Plan**: `docs/admin/ADMIN_DASHBOARD_PLAN.md`

---

## 🧪 Testing

### Run Backend Tests

```bash
# All tests
pnpm test

# With coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

### Run Frontend Tests

```bash
cd web

# All tests
pnpm test

# With coverage
pnpm test -- --code-coverage
```

---

## 🐛 Troubleshooting

### Cannot Login

**Check if admin users exist:**
```bash
docker exec -it mechanic-dispatch-db psql -U postgres -d mechanic \
  -c "SELECT email, role, \"isActive\" FROM \"AdminUser\";"
```

**If no results, re-seed:**
```bash
docker exec -itmechanic-dispatch-site-api npx prisma db seed
```

### No Service Requests in Dashboard

**Check if service requests exist:**
```bash
docker exec -it mechanic-dispatch-db psql -U postgres -d mechanic \
  -c "SELECT COUNT(*) FROM \"ServiceRequest\";"
```

**Expected**: 8

**If 0, re-seed:**
```bash
docker exec -itmechanic-dispatch-site-api npx prisma db seed
```

### Seeding Fails on Startup

**Check logs:**
```bash
docker-compose logs api | grep -A 10 "Seeding"
```

**Common causes**:
1. Database not ready (wait longer)
2. Foreign key constraint (check data consistency)
3. Already seeded (this is OK, idempotent)

**Solution**:
```bash
docker-compose down -v
docker-compose up -d
```

### Entrypoint Script Permission Denied

**Rebuild Docker image:**
```bash
docker-compose build --no-cache api
docker-compose up -d
```

---

## 📚 Additional Resources

- **DATABASE_SEEDING.md** - Comprehensive seeding guide
- **PHASE4_FINAL_STATUS.md** - Complete Phase 4 report
- **ADMIN_DASHBOARD_PLAN.md** - Full dashboard implementation plan
- **CLAUDE.md** - Repository constitution and rules
- **AGENTS.md** - Agent orchestration model

---

## ✅ Phase 4 Checklist

- [x] Backend: AdminUsersService implemented
- [x] Backend: AdminUsersController implemented
- [x] Backend: 45 tests passing
- [x] Frontend: UsersListComponent implemented
- [x] Frontend: UserDetailComponent implemented
- [x] Frontend: UserCreateComponent implemented
- [x] Frontend: 54 tests created
- [x] Routing: Admin user routes configured
- [x] Security: JWT authentication, password hashing, validation
- [x] Seeding: Admin users seeded
- [x] Seeding: Service requests seeded
- [x] Seeding: Work logs seeded
- [x] Docker: Automatic seeding on startup
- [x] Documentation: Complete guides created

**Phase 4 Status**: ✅ **100% COMPLETE**

---

**Quick Links**:
- Admin Dashboard: http://localhost:4200/admin/login
- Customer Site: http://localhost:4200
- API Health: http://localhost:3000/health (if available)

---

**Need Help?** Check `docs/DATABASE_SEEDING.md` for detailed troubleshooting.
