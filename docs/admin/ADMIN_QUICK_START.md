# Admin Dashboard Quick Start Guide (Constitutional Compliance)

**Version**: 2.0  
**Date**: December 25, 2025  
**Status**: ✅ **CONSTITUTIONALLY ALIGNED**  
**Authority**: CLAUDE.md, docs/skills/, docs/admin/ADMIN_DASHBOARD_PLAN.md

---

## ⚠️ STOP: Read This First

**Before starting implementation:**

1. ✅ Read **CLAUDE.md** (Repository Constitution)
2. ✅ Read **docs/skills/** (All skills, especially admin-dashboard-implementation.md)
3. ✅ Read **docs/standards/** (All standards)
4. ✅ Read **docs/admin/ADMIN_DASHBOARD_PLAN.md** (Implementation plan)
5. ✅ Read **docs/admin/ADMIN_API_SPECIFICATION.md** (API requirements)

**Fail-Closed Principle**: If ANY information is missing or unclear → **STOP and ask**. Do NOT guess.

---

## Overview

This guide provides the **minimum viable steps** to get started with admin dashboard development following the constitutional framework.

**This is NOT a traditional tutorial.** You MUST follow the skills-based, fail-closed, test-first approach defined in:
- **docs/admin/ADMIN_DASHBOARD_PLAN.md** (Primary reference)
- **docs/skills/admin-dashboard-implementation.md** (Orchestrating skill)

---

## Prerequisites

### Environment Setup

- [x] Node.js 24+ installed
- [x] pnpm installed  
- [x] PostgreSQL running (Docker or local)
- [x] Project cloned: `git clone <repo>`
- [x] Dependencies installed: `pnpm install`
- [x] Database running: `./scripts/setup-db.sh`
- [x] Migrations run: `pnpm prisma migrate dev`

### Knowledge Prerequisites

- [x] **CLAUDE.md** read and understood
- [x] **docs/skills/** reviewed (all skills)
- [x] **docs/standards/** reviewed (all standards)
- [x] **TDD** (Test-Driven Development) understood
- [x] **SOLID** principles understood
- [x] **Fail-closed principle** understood

**STOP if**: Any prerequisite not met → complete prerequisites first.

---

## Constitutional Framework Summary

### Fail-Closed Principle (CLAUDE.md, Lines 538-546)

> "If information is missing, ambiguous, or conflicting:
> - Do NOT guess
> - Do NOT proceed
> - Ask for clarification
> 
> **This rule overrides all others.**"

**Enforcement**: STOP and ask when uncertain.

---

### Test-First Principle (docs/skills/testing.md)

> "Write tests BEFORE implementation, not after."

**80/15/5 Test Pyramid**:
```
       /\
      /E2E\       ← 5%
     /______\
    /Integration\ ← 15%
  /____________\
 /     UNIT       \ ← 80%
/__________________\
```

**AAA Pattern** (Mandatory):
- **Arrange**: Setup test data
- **Act**: Execute operation
- **Assert**: Verify outcome

**Coverage**: ≥ 85% (hard requirement)

---

### Security-by-Default (CLAUDE.md, Lines 183-215)

> "All constructs MUST be secure by default."

**Defaults**:
- ✅ Encryption at rest enabled
- ✅ SSL/TLS enforced
- ✅ Public access blocked
- ✅ IAM least privilege
- ✅ Logging enabled

Users may opt-in to less secure, but **defaults MUST be secure**.

---

### Quality Gates (CLAUDE.md, Lines 217-266)

**STOP at EVERY gate if checks fail**:

1. **Build Gate** → `pnpm build` must pass
2. **Linter Gate** → `pnpm lint` must pass (zero errors)
3. **Test Gate** → `pnpm test` must pass (≥ 85% coverage)
4. **Standards Gate** → Interfaces approved, canonical types reused

**Proceed only when ALL gates pass.**

---

## Workflow Overview

**Follow this workflow for EVERY feature** (See ADMIN_DASHBOARD_PLAN.md for details):

```
Phase 0: Constitutional Alignment (Design)
↓ STOP ← Quality gate checkpoint
Phase 1: Test-Driven Development (TDD)
↓ STOP ← Quality gate checkpoint
Phase 2: Standards Compliance
↓ STOP ← Quality gate checkpoint
Phase 3: Security Review
↓ STOP ← Quality gate checkpoint
Phase 4: Human Approval
↓ STOP ← If not approved
✅ FEATURE COMPLETE
```

**At EVERY "STOP" checkpoint**: If checks fail → **STOP**. Do NOT proceed.

---

## Phase 0: Constitutional Alignment (Before Implementation)

**Duration**: 1 week  
**Status**: ⏳ **PENDING APPROVAL** (You are here)

### Checklist

Before writing ANY code:

- [ ] **Task 1**: Apply Interface Designer skill (2 days)
  - Design all API contracts as YAML
  - See: docs/skills/interface-designer.md
  - See: docs/admin/ADMIN_API_SPECIFICATION.md

- [ ] **Task 2**: Apply Canonical Type Reuse skill (1 day)
  - Identify cross-cutting concerns
  - Reuse or propose canonical types
  - See: docs/skills/canonical-type-reuse.md

- [ ] **Task 3**: Apply Module Layout Enforcer skill (1 day)
  - Design file structure: types.ts / functions.ts / PascalCase.ts / index.ts
  - Validate barrel exports
  - See: docs/skills/module-layout-enforcer.md

- [ ] **Task 4**: Define Security Requirements (1 day)
  - Security-by-default checklist
  - JWT configuration
  - Role hierarchy
  - See: docs/standards/common/security.md

- [ ] **Task 5**: Define Test Strategy (1 day)
  - 80/15/5 test pyramid
  - AAA pattern
  - Coverage requirements (≥ 85%)
  - See: docs/skills/testing.md

- [ ] **Human Approval**: Get approval for all Phase 0 outputs

**STOP if**: Any task incomplete or not approved.

**Next Step**: Proceed to Phase 1 (TDD Foundation)

**See**: docs/admin/ADMIN_DASHBOARD_PLAN.md → Phase 0

---

## Phase 1: Foundation (TDD)

**Duration**: 1 week  
**Status**: ⏳ **PENDING** (waiting for Phase 0 completion)

### Feature 1: Admin Authentication (Backend)

**Workflow**:

#### Step 1: Database Schema Setup (30 min)

Add AdminUser and AdminRefreshToken tables to Prisma schema:

```prisma
// prisma/schema.prisma

model AdminUser {
  id                   String             @id @default(cuid())
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  email                String             @unique
  name                 String
  passwordHash         String
  role                 AdminRole          @default(ADMIN)
  isActive             Boolean            @default(true)
  failedLoginAttempts  Int                @default(0)
  lastFailedLoginAt    DateTime?
  lastLoginAt          DateTime?
  refreshTokens        AdminRefreshToken[]

  @@index([email])
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MODERATOR
}

model AdminRefreshToken {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}
```

**Run migration**:
```bash
pnpm prisma migrate dev --name add_admin_user
```

**Seed test admin user**:
```typescript
// prisma/seed.ts (add to existing seed)

import * as bcrypt from 'bcrypt';

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.adminUser.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Test admin user created: admin@test.com / password123');
}

// Call in main seed function
await seedAdminUser();
```

**Run seed**:
```bash
pnpm prisma db seed
```

**Verify**:
```bash
# Open Prisma Studio
npx prisma studio

# Check AdminUser table has 1 record
```

**STOP if**: Migration or seed fails.

---

#### Step 2: Write Tests FIRST (2 hours)

**Create test file** (before implementation file exists):

```bash
touch src/domains/admin/auth/AdminAuthService.spec.ts
```

**Write unit tests** (80%):

```typescript
// src/domains/admin/auth/AdminAuthService.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthService } from './AdminAuthService';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AdminAuthService (Unit Tests)', () => {
  let service: AdminAuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    adminUser: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    adminRefreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'password123';
      const mockUser = {
        id: '1',
        email,
        passwordHash: await require('bcrypt').hash(password, 12),
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        failedLoginAttempts: 0,
      };

      mockPrisma.adminUser.findUnique.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue('mock-token');
      mockPrisma.adminRefreshToken.create.mockResolvedValue({});
      mockPrisma.adminUser.update.mockResolvedValue({});

      // Act
      const result = await service.login({ email, password });

      // Assert
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe(email);
      expect(mockPrisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      // Arrange
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ email: 'wrong@test.com', password: 'password123' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        passwordHash: await require('bcrypt').hash('password123', 12),
        isActive: true,
        failedLoginAttempts: 0,
      };

      mockPrisma.adminUser.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.login({ email: 'admin@test.com', password: 'wrong-password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for missing email (fail-fast)', async () => {
      // Act & Assert
      await expect(
        service.login({ email: '', password: 'password123' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing password (fail-fast)', async () => {
      // Act & Assert
      await expect(
        service.login({ email: 'admin@test.com', password: '' })
      ).rejects.toThrow(BadRequestException);
    });

    // Add more tests: account locked, inactive user, etc.
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      // Arrange, Act, Assert
      // ... (similar pattern)
    });

    // Add more tests: invalid token, expired token, etc.
  });

  describe('logout', () => {
    it('should invalidate refresh token', async () => {
      // Arrange, Act, Assert
      // ... (similar pattern)
    });
  });
});
```

**Write integration tests** (15%):

```typescript
// test/admin-auth.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/domains/prisma/prisma.service';

describe('Admin Auth (Integration Tests)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /admin/auth/login', () => {
    it('should return 200 and tokens for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user.email).toBe('admin@test.com');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({ email: 'admin@test.com', password: 'wrong-password' })
        .expect(401);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({ email: 'admin@test.com' })
        .expect(400);
    });
  });

  // Add more integration tests for other endpoints
});
```

**Run tests** (they WILL fail because implementation doesn't exist yet - this is TDD):

```bash
pnpm test -- AdminAuthService.spec.ts
# Expected: All tests fail (implementation doesn't exist)
```

**STOP if**: Tests don't compile or have syntax errors.

**Next Step**: Implement to make tests pass.

---

#### Step 3: Implement to Make Tests Pass (4 hours)

**Create module structure** (following Module Layout Enforcer skill):

```bash
mkdir -p src/domains/admin/auth
touch src/domains/admin/auth/types.ts
touch src/domains/admin/auth/functions.ts
touch src/domains/admin/auth/AdminAuthService.ts
touch src/domains/admin/auth/AdminAuthController.ts
touch src/domains/admin/auth/JwtStrategy.ts
touch src/domains/admin/auth/AdminAuthGuard.ts
touch src/domains/admin/auth/index.ts
```

**Implement types.ts**:

```typescript
// src/domains/admin/auth/types.ts

export interface LoginDto {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AdminUserResponse;
}

export interface AdminUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'super-admin' | 'admin' | 'moderator';
}

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
}
```

**Implement functions.ts**:

```typescript
// src/domains/admin/auth/functions.ts

import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;  // Security requirement: ≥ 12
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password && password.length >= 8;
}
```

**Implement AdminAuthService.ts**:

(See full implementation in docs/admin/ADMIN_DASHBOARD_PLAN.md → Phase 1 → Feature 1 → Step 2)

**Implement AdminAuthController.ts**:

```typescript
// src/domains/admin/auth/AdminAuthController.ts

import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AdminAuthService } from './AdminAuthService';
import { LoginDto } from './types';
import { AdminAuthGuard } from './AdminAuthGuard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(AdminAuthGuard)
  async logout(@Body() body: { refreshToken: string }) {
    await this.authService.logout(body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Get('profile')
  @UseGuards(AdminAuthGuard)
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
```

**Run tests** (they should pass now):

```bash
pnpm test -- AdminAuthService.spec.ts
# Expected: All tests pass ✅

pnpm test:e2e -- admin-auth.e2e-spec.ts
# Expected: All integration tests pass ✅
```

**Measure coverage**:

```bash
pnpm test:cov
# Expected: ≥ 85% coverage
```

**STOP if**: Any test fails or coverage < 85%.

**Next Step**: Proceed to Quality Gates (Phase 2)

---

#### Step 4: Quality Gates (1 hour)

**Build Gate**:
```bash
pnpm build
# Expected: Build succeeds ✅
```

**Linter Gate**:
```bash
pnpm lint
# Expected: Zero errors ✅
```

**Test Gate**:
```bash
pnpm test
# Expected: All tests pass, coverage ≥ 85% ✅
```

**Standards Compliance Gate**:
- [ ] Naming conventions followed (docs/standards/common/naming.md)
- [ ] Canonical types reused (docs/standards/common/types.md)
- [ ] Security by default (docs/standards/common/security.md)
- [ ] SOLID principles applied (docs/standards/common/typescript.md)
- [ ] No anti-patterns (docs/standards/common/anti-patterns.md)
- [ ] Module layout compliant (docs/standards/common/modules.md)

**STOP if**: Any gate fails.

**Next Step**: Proceed to Security Review (Phase 3)

---

#### Step 5: Security Review (30 min)

**Security Checklist**:
- [ ] bcrypt password hashing (cost ≥ 12)
- [ ] JWT with refresh tokens (access: 15min, refresh: 7 days)
- [ ] Fail-fast validation (email/password required)
- [ ] Account lockout after 5 failed attempts
- [ ] No password in logs or responses
- [ ] Generic error messages (don't reveal if email exists)
- [ ] CSRF protection enabled (if applicable)
- [ ] Rate limiting configured

**STOP if**: Any security requirement not met.

**Next Step**: Proceed to Human Approval (Phase 4)

---

#### Step 6: Human Approval (Manual)

**Submit for review**:
- Present implementation
- Present test results
- Present security checklist
- Present quality gate results

**STOP if**: Approval not obtained.

**Next Step**: Proceed to next feature.

---

### Feature 2-N: Repeat for Each Feature

**Apply the SAME workflow** for:
- Feature 2: Admin Authentication (Frontend)
- Feature 3: Admin Dashboard/Analytics
- Feature 4: Service Request Management
- Feature 5: Admin User Management
- Feature 6-9: Enhanced Management (Mechanics, Reviews, Skills, Audit Logging, Settings)

**See**: docs/admin/ADMIN_DASHBOARD_PLAN.md → Phase 2-N

---

## Common Commands

### Development

```bash
# Start backend (development mode)
pnpm start:dev

# Start frontend (development mode)
cd web && ng serve

# Run tests
pnpm test                    # Run all tests
pnpm test:watch              # Run tests in watch mode
pnpm test:cov                # Run tests with coverage
pnpm test:e2e                # Run E2E tests

# Lint
pnpm lint                    # Lint backend
cd web && ng lint            # Lint frontend

# Build
pnpm build                   # Build backend
cd web && ng build           # Build frontend

# Database
pnpm prisma generate         # Generate Prisma client
pnpm prisma migrate dev      # Run migrations
pnpm prisma db seed          # Seed database
pnpm prisma studio           # Open Prisma Studio
pnpm db:reset                # Reset database (migrations + seed)
```

### Quality Gates

```bash
# Run all quality gates
pnpm build && pnpm lint && pnpm test:cov

# If all pass → proceed
# If any fail → STOP and fix
```

---

## Troubleshooting

### Tests Failing

**Problem**: Tests fail with "Cannot find module"
**Solution**: Ensure Prisma client generated: `pnpm prisma generate`

**Problem**: Tests fail with database errors
**Solution**: Ensure database running: `docker ps` or `./scripts/setup-db.sh`

**Problem**: Tests fail with "Test timeout"
**Solution**: Increase timeout in jest.config.ts: `testTimeout: 10000`

---

### Linter Errors

**Problem**: Linter errors after implementation
**Solution**: Run `pnpm lint --fix` to auto-fix, then manually fix remaining

---

### Build Errors

**Problem**: TypeScript compilation errors
**Solution**: Check types.ts for missing types, ensure all imports correct

---

### Coverage Too Low

**Problem**: Coverage < 85%
**Solution**: Add more unit tests (80% target), ensure all branches covered

---

## FAQ

### Q: Can I skip tests and implement first?

**A**: NO. Test-first is a hard requirement (CLAUDE.md, docs/skills/testing.md). Write tests BEFORE implementation.

### Q: Can I skip quality gates if I'm in a hurry?

**A**: NO. Quality gates are mandatory STOP conditions (CLAUDE.md, Lines 217-266). Do NOT proceed with failing gates.

### Q: Can I create my own interfaces instead of using canonical types?

**A**: NO. Canonical types MUST be reused for cross-cutting concerns (CLAUDE.md, Lines 268-280). Use Canonical Type Reuse skill.

### Q: Can I organize files differently than types.ts / functions.ts / PascalCase.ts / index.ts?

**A**: NO. Module layout is a hard requirement (CLAUDE.md, Lines 306-346). Use Module Layout Enforcer skill.

### Q: What if I'm not sure how to proceed?

**A**: STOP and ask (Fail-Closed Principle, CLAUDE.md, Lines 538-546). Do NOT guess.

---

## Next Steps

**Current Status**: ⏳ **Phase 0 PENDING** (awaiting approval)

**To Proceed**:

1. Complete Phase 0 (Constitutional Alignment)
   - Apply Interface Designer skill
   - Apply Canonical Type Reuse skill
   - Apply Module Layout Enforcer skill
   - Define security requirements
   - Define test strategy
   - Get human approval

2. Complete Phase 1 (TDD Foundation)
   - Feature 1: Admin Authentication (Backend)
   - Feature 2: Admin Authentication (Frontend)
   - All tests pass (≥ 85% coverage)
   - All quality gates pass

3. Complete Phase 2-N (Iterative Features)
   - Apply same workflow for each feature
   - STOP at every quality gate
   - Get approval before next feature

**See**: docs/admin/ADMIN_DASHBOARD_PLAN.md (Full implementation plan)

---

## Related Documents

- **CLAUDE.md** - Repository constitution (PRIMARY AUTHORITY)
- **docs/skills/admin-dashboard-implementation.md** - Orchestrating skill (MANDATORY)
- **docs/skills/interface-designer.md** - API contract design
- **docs/skills/canonical-type-reuse.md** - Canonical types
- **docs/skills/module-layout-enforcer.md** - Module structure
- **docs/skills/testing.md** - TDD with 80/15/5 pyramid
- **docs/skills/coding-conventions.md** - SOLID principles
- **docs/standards/common/** - All standards
- **docs/admin/ADMIN_DASHBOARD_PLAN.md** - Implementation plan (FULL DETAILS)
- **docs/admin/ADMIN_API_SPECIFICATION.md** - API requirements
- **docs/admin/ADMIN_UI_SPECIFICATION.md** - UI/UX specifications

---

## Constitutional Compliance Statement

This quick start guide is **CONSTITUTIONALLY COMPLIANT** with:

- ✅ Fail-Closed Principle (CLAUDE.md, Lines 538-546)
- ✅ Testing Requirements (CLAUDE.md, Lines 149-181)
- ✅ Security-by-Default (CLAUDE.md, Lines 183-215)
- ✅ Quality Gates (CLAUDE.md, Lines 217-266)
- ✅ Canonical Types (CLAUDE.md, Lines 268-280)
- ✅ Module Layout (CLAUDE.md, Lines 306-346)
- ✅ Skills Framework (CLAUDE.md, Lines 416-438)

**This guide references the full implementation plan** (docs/admin/ADMIN_DASHBOARD_PLAN.md) which contains all details.

---

**Document Version**: 2.0  
**Last Updated**: December 25, 2025  
**Status**: ✅ **CONSTITUTIONALLY ALIGNED**  
**Authority**: CLAUDE.md, docs/skills/, docs/admin/ADMIN_DASHBOARD_PLAN.md  
**Next Action**: Complete Phase 0 (Constitutional Alignment)

---

## End of Admin Dashboard Quick Start Guide
