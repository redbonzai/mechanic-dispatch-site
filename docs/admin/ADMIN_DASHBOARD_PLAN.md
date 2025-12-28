# Admin Dashboard Implementation Plan (Constitutional Compliance)

**Version**: 2.0  
**Date**: December 25, 2025  
**Status**: ✅ **CONSTITUTIONALLY ALIGNED**  
**Authority**: CLAUDE.md, docs/standards/, docs/skills/

---

## ⚠️ Critical Notice

This plan **MUST** be followed exactly as specified. Deviations require human approval.

**Fail-Closed Principle**: If any information is missing, ambiguous, or conflicting → **STOP and ask**. Do NOT guess.

---

## Table of Contents

1. [Constitutional Framework](#constitutional-framework)
2. [Current State Analysis](#current-state-analysis)
3. [Skills-Based Workflow](#skills-based-workflow)
4. [Phase 0: Constitutional Alignment](#phase-0-constitutional-alignment)
5. [Phase 1: Foundation (TDD)](#phase-1-foundation-tdd)
6. [Phase 2-N: Iterative Feature Development](#phase-2-n-iterative-feature-development)
7. [Quality Gates](#quality-gates)
8. [Security Requirements](#security-requirements)
9. [Module Architecture](#module-architecture)
10. [Success Criteria](#success-criteria)

---

## Constitutional Framework

This plan derives authority from:

### Primary Authority: CLAUDE.md

- **Fail-Closed Principle** (Lines 538-546): STOP when uncertain, never guess
- **Testing Requirements** (Lines 149-181): 80/15/5 pyramid, test-first
- **Security-by-Default** (Lines 183-215): All defaults must be secure
- **Quality Gates** (Lines 217-266): STOP conditions at each gate
- **Canonical Types** (Lines 268-280): Reuse cross-cutting types
- **Module Layout** (Lines 306-346): types.ts / functions.ts / PascalCase.ts / index.ts
- **Skills Framework** (Lines 416-438): Skills-based development required

### Supporting Standards: docs/standards/

- **naming.md**: Singular/plural, presence = enablement
- **types.md**: Canonical type catalog
- **security.md**: Security-by-default checklist
- **typescript.md**: SOLID principles, ≤50 line functions
- **anti-patterns.md**: Patterns to avoid
- **modules.md**: Module layout rules

### Supporting Skills: docs/skills/

- **admin-dashboard-implementation.md**: Orchestrating skill (THIS IS MANDATORY)
- **interface-designer.md**: API contract design
- **canonical-type-reuse.md**: Identify shared types
- **module-layout-enforcer.md**: Validate file structure
- **testing.md**: TDD with 80/15/5 pyramid
- **coding-conventions.md**: SOLID principles enforcement

---

## Current State Analysis

### What Exists ✅

**Backend (NestJS)**
- ✅ Admin module structure (`src/domains/admin/`)
- ✅ Admin controllers (mechanics, reviews, skills)
- ✅ AdminService (delegates to MechanicsService)
- ✅ Image upload (multer decorators)
- ✅ Prisma database integration
- ✅ Existing API endpoints:
  - `GET/POST/PUT/DELETE /admin/mechanics`
  - `POST/PUT/DELETE /admin/reviews`
  - `GET /admin/skills`

**Database Schema (Prisma)**
- ✅ ServiceRequest (status workflow, payments)
- ✅ Mechanic (profiles, ratings, skills)
- ✅ Skill (categorized skills)
- ✅ MechanicSkill (many-to-many)
- ✅ Review (photos, ratings)
- ✅ MechanicWorkLog (time tracking, payouts)

**Frontend (Angular 19.2)**
- ✅ Customer-facing website
- ✅ Service request creation
- ✅ Stripe payment integration
- ❌ **No admin interface** (TO BE BUILT)

### What's Missing ❌

**Backend**
- ❌ Admin authentication (JWT + refresh tokens)
- ❌ Admin authorization (role-based access control)
- ❌ Admin user model in database
- ❌ Service request management endpoints
- ❌ Analytics/dashboard endpoints
- ❌ Audit logging

**Frontend**
- ❌ Admin dashboard interface (entire module)
- ❌ Authentication UI (login, logout)
- ❌ Service request management UI
- ❌ Analytics dashboards
- ❌ Admin user management UI

**Testing**
- ❌ Admin API tests (unit, integration, E2E)
- ❌ Admin UI tests (Angular component tests)

**Security**
- ❌ JWT authentication strategy
- ❌ Auth guards for admin routes
- ❌ Rate limiting configuration
- ❌ CSRF protection
- ❌ Security headers (helmet.js)

---

## Skills-Based Workflow

**This is NOT a traditional waterfall project.** We use a **skills-based, fail-closed, iterative approach**.

### Core Principle

Every feature follows this workflow:

```
┌─────────────────────────────────────────────┐
│ Phase 0: Constitutional Alignment           │
│ - Apply Interface Designer skill            │
│ - Apply Canonical Type Reuse skill          │
│ - Apply Module Layout Enforcer skill        │
│ - Define security requirements              │
│ - Get human approval                        │
│ STOP ← Quality gate checkpoint              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Phase 1: Test-Driven Development            │
│ - Write tests FIRST (80/15/5 pyramid)      │
│ - Implement to make tests pass              │
│ - Apply Coding Conventions skill (SOLID)    │
│ - Measure coverage (≥ 85%)                  │
│ STOP ← Quality gate checkpoint              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Phase 2: Standards Compliance               │
│ - Run build gate                            │
│ - Run linter gate                           │
│ - Run test gate                             │
│ - Run standards gate                        │
│ STOP ← Quality gate checkpoint              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Phase 3: Security Review                    │
│ - Validate authentication                   │
│ - Validate authorization                    │
│ - Validate input validation                 │
│ - Validate security headers                 │
│ STOP ← Quality gate checkpoint              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Phase 4: Human Approval                     │
│ - Submit for human review                   │
│ - Address feedback                          │
│ - Get approval                              │
│ STOP ← If not approved                      │
└─────────────────────────────────────────────┘
                    ↓
           ✅ FEATURE COMPLETE
           (Proceed to next feature)
```

**Rule**: At EVERY "STOP" checkpoint, if checks fail → **STOP**. Do NOT proceed.

---

## Phase 0: Constitutional Alignment

**Goal**: Design all admin dashboard features following constitutional requirements.

**Duration**: 1 week (iterative)

**Status**: ⏳ **NOT STARTED** (awaiting this approval)

### Preconditions (Fail-Closed)

Before starting Phase 0:

- [ ] ✅ CLAUDE.md reviewed and understood
- [ ] ✅ docs/standards/ reviewed
- [ ] ✅ docs/skills/ reviewed
- [ ] ✅ Admin Dashboard Implementation skill created
- [ ] ✅ Constitutional alignment evaluation complete
- [ ] ⏳ Human approval to proceed

**STOP**: If any precondition not met → ask for clarification.

---

### Task 1: Apply Interface Designer Skill (2 days)

**Skill**: `docs/skills/interface-designer.md`

**Objective**: Design all API contracts as YAML interface contracts.

**Features to Design**:

1. **Admin Authentication**
   - POST /admin/auth/login (email, password → tokens)
   - POST /admin/auth/logout (invalidate tokens)
   - POST /admin/auth/refresh (refresh token → new access token)
   - GET /admin/auth/profile (get current admin user)

2. **Service Request Management**
   - GET /admin/service-requests (list with filters)
   - GET /admin/service-requests/:id (detail view)
   - PUT /admin/service-requests/:id (update request)
   - POST /admin/service-requests/:id/capture (capture payment)
   - POST /admin/service-requests/:id/cancel (cancel request)
   - POST /admin/service-requests/:id/finalize (finalize with final amount)
   - POST /admin/service-requests/:id/work-logs (add work log)

3. **Admin User Management**
   - GET /admin/users (list admin users)
   - GET /admin/users/:id (get admin user)
   - POST /admin/users (create admin user)
   - PUT /admin/users/:id (update admin user)
   - DELETE /admin/users/:id (delete admin user)

4. **Analytics/Dashboard**
   - GET /admin/analytics/overview (dashboard statistics)
   - GET /admin/analytics/revenue (revenue metrics)
   - GET /admin/analytics/mechanics (mechanic performance)

5. **Existing Endpoints Enhancement**
   - GET /admin/reviews (list reviews - new)
   - GET /admin/reviews/:id (get review - new)
   - POST /admin/skills (create skill - new)
   - PUT /admin/skills/:id (update skill - new)
   - DELETE /admin/skills/:id (delete skill - new)

**Workflow**:

1. **Conversational Design** (with human)
   - Enumerate requirements per endpoint
   - Identify extension points
   - Decide required vs optional fields
   - Call out non-goals and out-of-scope

2. **YAML Interface Contracts** (design artifact)
   - Produce fully commented YAML for each endpoint
   - Include example requests/responses
   - Document validation rules
   - Document error responses

3. **Handoff Package**
   - Final YAML contracts
   - Mapping table: YAML → TypeScript types
   - Canonical type imports
   - Approval gates

**Output Contract**:

- [ ] All API endpoints documented as YAML contracts
- [ ] TypeScript mapping table created
- [ ] Example requests/responses included
- [ ] Validation rules documented
- [ ] Error responses documented

**Quality Gate**:
- [ ] Interface Designer skill applied to ALL endpoints
- [ ] Human approval obtained for ALL contracts
- **STOP if**: Contracts not approved

**Estimated Time**: 2 days

**See**: `docs/admin/ADMIN_API_SPECIFICATION.md` (will be revised with YAML contracts)

---

### Task 2: Apply Canonical Type Reuse Skill (1 day)

**Skill**: `docs/skills/canonical-type-reuse.md`

**Objective**: Identify cross-cutting concerns and reuse canonical types.

**Cross-Cutting Concerns to Evaluate**:

1. **Logging**
   - Admin action logs (who did what when)
   - API request logs
   - → Use `logging.LogConfig` or equivalent

2. **Observability**
   - Performance metrics (API response times)
   - Error tracking
   - → Use `observability.MetricConfig` or equivalent

3. **Tags**
   - Resource tagging (admin users, service requests)
   - → Use `tags.TagMap` or equivalent

4. **Encryption**
   - Password hashing (bcrypt)
   - JWT secret encryption
   - → Use `encryption.EncryptionConfig` or equivalent

5. **Naming**
   - Resource naming patterns (admin users, roles)
   - → Use `naming.NamingStrategy` or equivalent

**Note**: This project uses **NestJS/Prisma/Angular**, not AWS CDK. Canonical types may need to be **created** or **adapted** from existing patterns.

**Workflow**:

1. **Search for Existing Canonical Types**
   - Search `src/` for existing shared types
   - Check `src/core/` or equivalent utility modules
   - **STOP if**: No canonical types found → propose creation

2. **Propose Canonical Type Creation** (if needed)
   - Location: `src/core/common/` or `src/core/logging/`, etc.
   - Follow structure:
     ```
     src/core/
     ├── logging/
     │   ├── types.ts       # LogConfig interface
     │   ├── functions.ts   # Log helpers
     │   └── index.ts       # Barrel exports
     ├── encryption/
     │   ├── types.ts       # EncryptionConfig interface
     │   ├── functions.ts   # Encryption helpers (bcrypt)
     │   └── index.ts       # Barrel exports
     └── auth/
         ├── types.ts       # JwtConfig, AuthTokens interfaces
         ├── functions.ts   # Auth helpers
         └── index.ts       # Barrel exports
     ```

3. **Document Canonical Type Usage**
   - List all canonical types to be used
   - Document access paths (namespace imports)
   - Document composition patterns (if extending)

**Output Contract**:

- [ ] Canonical types identified or proposed
- [ ] Access paths documented (namespace imports)
- [ ] Bespoke types eliminated (replaced with canonical)
- [ ] Composition patterns documented (if extending)

**Quality Gate**:
- [ ] Canonical Type Reuse skill applied
- [ ] Zero bespoke types for cross-cutting concerns
- [ ] Human approval obtained for new canonical types
- **STOP if**: Bespoke types found or new canonical types not approved

**Estimated Time**: 1 day

---

### Task 3: Apply Module Layout Enforcer Skill (1 day)

**Skill**: `docs/skills/module-layout-enforcer.md`

**Objective**: Design module file structure following constitutional standards.

**Required Module Layout**:

From CLAUDE.md (Lines 306-346):
> "Pure capability modules: types.ts, functions.ts, index.ts
> Construct modules: types.ts, functions.ts, PascalCase.ts, index.ts"

**Proposed Admin Module Structure**:

```
src/domains/admin/
├── types.ts                    # Public interfaces (AdminUserProps, AdminAuthConfig)
├── functions.ts                # Shared helpers (validateAdminUser, hashPassword)
├── index.ts                    # Barrel exports (MANDATORY)
│
├── auth/
│   ├── types.ts                # Auth types (LoginDto, LoginResponse, JwtPayload)
│   ├── functions.ts            # Auth helpers (comparePassword, hashPassword)
│   ├── AdminAuthService.ts     # Auth service construct
│   ├── AdminAuthController.ts  # Auth controller construct
│   ├── JwtStrategy.ts          # Passport JWT strategy
│   ├── AdminAuthGuard.ts       # Auth guard construct
│   └── index.ts                # Barrel exports
│
├── users/
│   ├── types.ts                # User types (CreateAdminUserDto, AdminUserResponse)
│   ├── functions.ts            # User helpers (validateEmail, generateUsername)
│   ├── AdminUsersService.ts    # Users service construct
│   ├── AdminUsersController.ts # Users controller construct
│   └── index.ts                # Barrel exports
│
├── service-requests/
│   ├── types.ts                # Service request types
│   ├── functions.ts            # Service request helpers
│   ├── AdminServiceRequestsService.ts
│   ├── AdminServiceRequestsController.ts
│   └── index.ts                # Barrel exports
│
├── analytics/
│   ├── types.ts                # Analytics types
│   ├── functions.ts            # Analytics helpers
│   ├── AdminAnalyticsService.ts
│   ├── AdminAnalyticsController.ts
│   └── index.ts                # Barrel exports
│
├── controllers/
│   ├── AdminMechanicsController.ts  # (existing, may need refactor)
│   ├── AdminReviewsController.ts    # (existing, may need refactor)
│   ├── AdminSkillsController.ts     # (existing, may need refactor)
│   └── index.ts                     # Barrel exports
│
└── services/
    ├── AdminService.ts          # (existing, may need refactor)
    └── index.ts                 # Barrel exports
```

**Angular Frontend Structure**:

```
web/src/app/admin/
├── models/                      # TypeScript interfaces
│   ├── admin-user.model.ts
│   ├── service-request.model.ts
│   ├── analytics.model.ts
│   └── index.ts                 # Barrel exports
│
├── services/                    # Angular services
│   ├── admin-auth.service.ts
│   ├── admin-users.service.ts
│   ├── service-requests.service.ts
│   ├── analytics.service.ts
│   └── index.ts                 # Barrel exports
│
├── guards/                      # Route guards
│   ├── admin-auth.guard.ts
│   ├── role.guard.ts
│   └── index.ts                 # Barrel exports
│
├── interceptors/                # HTTP interceptors
│   ├── jwt.interceptor.ts
│   ├── error.interceptor.ts
│   └── index.ts                 # Barrel exports
│
├── components/                  # UI components
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   ├── dashboard.component.html
│   │   ├── dashboard.component.scss
│   │   └── dashboard.component.spec.ts
│   │
│   ├── login/
│   │   └── ...
│   │
│   ├── service-requests/
│   │   ├── service-requests-list/
│   │   ├── service-request-detail/
│   │   └── ...
│   │
│   └── ...
│
├── admin-routing.module.ts      # Admin routes
├── admin.module.ts              # Admin module definition
└── index.ts                     # Barrel exports
```

**Workflow**:

1. **Validate Backend Structure**
   - Ensure types.ts / functions.ts / PascalCase.ts / index.ts pattern
   - Validate barrel exports in all modules
   - Validate namespace imports (not piecemeal)

2. **Validate Frontend Structure**
   - Ensure models/ services/ guards/ interceptors/ components/ separation
   - Validate barrel exports in all directories
   - Validate lazy-loaded module pattern

3. **Document Module Boundaries**
   - Define what goes in each module
   - Document import paths
   - Document consumption patterns

**Output Contract**:

- [ ] Module layout validated against standards
- [ ] Barrel exports (index.ts) in all modules
- [ ] Namespace import pattern documented
- [ ] Module boundaries defined

**Quality Gate**:
- [ ] Module Layout Enforcer skill applied
- [ ] All modules follow types.ts / functions.ts / PascalCase.ts / index.ts
- [ ] All modules have barrel exports
- [ ] Human approval obtained for structure
- **STOP if**: Layout non-compliant or not approved

**Estimated Time**: 1 day

---

### Task 4: Define Security Requirements (1 day)

**Reference**: `docs/standards/common/security.md`

**Objective**: Define security-by-default requirements for all admin features.

**Security-by-Default Checklist**:

#### Authentication
- [ ] ✅ JWT with refresh tokens (access: 15min, refresh: 7 days)
- [ ] ✅ httpOnly cookies for token storage (prevent XSS)
- [ ] ✅ Secure password hashing (bcrypt, cost factor ≥ 12)
- [ ] ✅ Password reset with time-limited tokens (1 hour expiry)
- [ ] ✅ Account lockout after 5 failed login attempts (15 min lockout)
- [ ] ✅ CSRF protection enabled (csurf middleware)

#### Authorization
- [ ] ✅ Role-based access control (RBAC)
  - super-admin: Full access
  - admin: Read/write access (no user management)
  - moderator: Read-only access
- [ ] ✅ Auth guards on ALL admin routes (backend + frontend)
- [ ] ✅ Least privilege principle (default: read-only)
- [ ] ✅ Route-level permissions (controller decorators)

#### API Security
- [ ] ✅ Rate limiting (100 requests per 15 minutes per IP)
- [ ] ✅ CORS properly configured (whitelist admin origins)
- [ ] ✅ HTTPS enforced (redirect HTTP → HTTPS)
- [ ] ✅ Security headers configured (helmet.js):
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security

#### Input Validation
- [ ] ✅ class-validator on ALL DTOs (backend)
- [ ] ✅ Fail-fast validation (reject before processing)
- [ ] ✅ SQL injection prevention (Prisma ORM)
- [ ] ✅ XSS prevention (Angular sanitization + CSP)
- [ ] ✅ File upload validation (type, size, content)

#### Data Security
- [ ] ✅ Password never logged or returned in API responses
- [ ] ✅ Sensitive data encrypted at rest (database encryption)
- [ ] ✅ Audit logging (who did what when)
- [ ] ✅ PII handling (GDPR-compliant data retention)

#### Session Security
- [ ] ✅ Token rotation on refresh
- [ ] ✅ Token revocation on logout
- [ ] ✅ Session timeout (30 min inactivity)
- [ ] ✅ Concurrent session limits (1 active session per admin user)

**Workflow**:

1. **Review Security Standards**
   - Read docs/standards/common/security.md
   - Identify applicable security requirements
   - Document security architecture

2. **Define Security Architecture**
   - JWT token structure (payload, expiry)
   - Refresh token flow
   - Role hierarchy
   - Permission matrix

3. **Security Implementation Plan**
   - Middleware configuration (helmet, cors, rate-limit)
   - Guard implementation (JwtStrategy, RoleGuard)
   - Interceptor implementation (JwtInterceptor, ErrorInterceptor)
   - Validation configuration (class-validator, class-transformer)

**Output Contract**:

- [ ] Security-by-default checklist complete
- [ ] Security architecture documented
- [ ] JWT token structure defined
- [ ] Role hierarchy and permissions defined
- [ ] Middleware configuration planned

**Quality Gate**:
- [ ] Security requirements defined
- [ ] All defaults are secure (opt-in to less secure)
- [ ] Human approval obtained for security architecture
- **STOP if**: Defaults not secure or not approved

**Estimated Time**: 1 day

---

### Task 5: Define Test Strategy (1 day)

**Reference**: `docs/skills/testing.md`

**Objective**: Define 80/15/5 test pyramid for admin dashboard.

**Test Pyramid** (80/15/5 Split):

```
       /\
      /E2E\       ← 5% - Expensive, slow, full stack
     /______\
    /        \
   /Integration\ ← 15% - Moderate cost, API flows
  /____________\
 /              \
/     UNIT       \ ← 80% - Fast, cheap, isolated
/__________________\
```

**80% Unit Tests** (Fast, Isolated):

Backend:
- AdminAuthService (login, logout, refresh, validateToken)
- AdminUsersService (CRUD operations)
- AdminServiceRequestsService (CRUD, capture, finalize)
- AdminAnalyticsService (metrics calculation)
- Validators (fail-fast validation)
- Functions (pure functions in functions.ts)
- Guards (AdminAuthGuard, RoleGuard)

Frontend:
- AdminAuthService (login, logout, refresh)
- AdminUsersService (HTTP calls)
- ServiceRequestsService (HTTP calls)
- AnalyticsService (HTTP calls)
- Components (dashboard, login, lists, forms)
- Guards (AdminAuthGuard, RoleGuard)
- Interceptors (JwtInterceptor, ErrorInterceptor)

**15% Integration Tests** (API Flows):

Backend:
- Admin auth flow (login → protected route)
- Service request flow (list → detail → capture)
- Admin user management flow (create → update → delete)
- Database operations (Prisma integration)
- File upload flow (mechanic images, review photos)

Frontend:
- Login flow (login → redirect to dashboard)
- Protected route access (guard checks)
- API error handling (interceptors)

**5% E2E Tests** (Critical Journeys):

Full Stack (Playwright or Cypress):
- Admin login → dashboard → view service requests
- Admin login → create mechanic → upload image
- Admin login → capture payment → finalize service request
- Admin login → create admin user → logout → login as new user

**AAA Pattern** (Mandatory):

All tests MUST follow Arrange-Act-Assert pattern:

```typescript
describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let prisma: PrismaService;

  beforeEach(() => {
    // Arrange: Setup
  });

  it('should authenticate admin with valid credentials', async () => {
    // Arrange: Prepare test data
    const loginDto = { email: 'admin@test.com', password: 'password123' };

    // Act: Execute operation
    const result = await service.login(loginDto);

    // Assert: Verify outcome
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('admin@test.com');
  });
});
```

**Coverage Requirements**:

- [ ] ≥ 85% overall coverage (hard requirement)
- [ ] ≥ 90% unit test coverage
- [ ] ≥ 70% integration test coverage
- [ ] 100% critical path coverage (E2E)

**Workflow**:

1. **Define Test Suites**
   - List all unit tests (80%)
   - List all integration tests (15%)
   - List all E2E tests (5%)

2. **Define Test Infrastructure**
   - Jest configuration (backend)
   - Jasmine/Karma configuration (frontend)
   - Test database setup (Prisma test environment)
   - Mock/stub strategy (PrismaService, HttpClient)

3. **Define Test Execution Plan**
   - Test execution order
   - Test parallelization strategy
   - Coverage measurement tools
   - CI/CD integration

**Output Contract**:

- [ ] Test pyramid defined (80/15/5 split)
- [ ] All test suites listed
- [ ] Test infrastructure configured
- [ ] Coverage requirements defined (≥ 85%)
- [ ] AAA pattern enforced

**Quality Gate**:
- [ ] Test strategy defined
- [ ] 80/15/5 split validated
- [ ] AAA pattern documented
- [ ] Coverage requirements set
- [ ] Human approval obtained
- **STOP if**: Test strategy not approved

**Estimated Time**: 1 day

---

### Phase 0 Completion Checklist

Before proceeding to Phase 1:

- [ ] Task 1: Interface Designer skill applied (all API contracts designed)
- [ ] Task 2: Canonical Type Reuse skill applied (canonical types identified)
- [ ] Task 3: Module Layout Enforcer skill applied (module structure validated)
- [ ] Task 4: Security requirements defined (security-by-default)
- [ ] Task 5: Test strategy defined (80/15/5 pyramid)
- [ ] Human approval obtained for all Phase 0 outputs

**Quality Gate: Phase 0 Complete**

**STOP if**: Any task incomplete or not approved.

**Next Step**: Proceed to Phase 1 (TDD Foundation)

**Estimated Total Time**: 1 week (5 business days)

---

## Phase 1: Foundation (TDD)

**Goal**: Establish test-first development workflow and implement core admin authentication.

**Duration**: 1 week (iterative)

**Status**: ⏳ **PENDING** (waiting for Phase 0 completion)

### Preconditions (Fail-Closed)

Before starting Phase 1:

- [ ] Phase 0 complete (all tasks approved)
- [ ] Database schema updated (AdminUser table added)
- [ ] Prisma migrations run
- [ ] Test infrastructure configured

**STOP**: If any precondition not met → complete Phase 0 first.

---

### Feature 1: Admin Authentication (Backend)

**Apply**: Admin Dashboard Implementation skill

**Workflow**:

#### Step 1: Write Tests FIRST (TDD)

```typescript
// src/domains/admin/auth/AdminAuthService.spec.ts

describe('AdminAuthService (Unit Tests - 80%)', () => {
  // Arrange: Setup
  let service: AdminAuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    // Test module setup
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange, Act, Assert
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      // Arrange, Act, Assert
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange, Act, Assert
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      // Arrange, Act, Assert
    });

    it('should throw BadRequestException for missing email (fail-fast)', async () => {
      // Arrange, Act, Assert
    });

    it('should throw BadRequestException for missing password (fail-fast)', async () => {
      // Arrange, Act, Assert
    });

    it('should increment failedLoginAttempts on failed login', async () => {
      // Arrange, Act, Assert
    });

    it('should lock account after 5 failed attempts', async () => {
      // Arrange, Act, Assert
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      // Arrange, Act, Assert
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange, Act, Assert
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      // Arrange, Act, Assert
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token', async () => {
      // Arrange, Act, Assert
    });
  });

  describe('validateUser', () => {
    it('should return user for valid JWT payload', async () => {
      // Arrange, Act, Assert
    });

    it('should return null for invalid user ID', async () => {
      // Arrange, Act, Assert
    });

    it('should return null for inactive user', async () => {
      // Arrange, Act, Assert
    });
  });
});

describe('AdminAuthController (Integration Tests - 15%)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // App setup with test database
  });

  describe('POST /admin/auth/login', () => {
    it('should return 200 and tokens for valid credentials', async () => {
      // Supertest request
    });

    it('should return 401 for invalid credentials', async () => {
      // Supertest request
    });

    it('should return 400 for missing fields', async () => {
      // Supertest request
    });

    it('should return 429 after too many failed attempts', async () => {
      // Supertest request (rate limiting)
    });
  });

  describe('POST /admin/auth/refresh', () => {
    it('should return 200 and new access token', async () => {
      // Supertest request
    });

    it('should return 401 for invalid refresh token', async () => {
      // Supertest request
    });
  });

  describe('POST /admin/auth/logout', () => {
    it('should return 200 and invalidate token', async () => {
      // Supertest request
    });
  });

  describe('GET /admin/auth/profile', () => {
    it('should return 200 and user profile with valid token', async () => {
      // Supertest request
    });

    it('should return 401 without token', async () => {
      // Supertest request
    });
  });
});
```

**Test Coverage Checkpoint**:
- [ ] All unit tests written (80%)
- [ ] All integration tests written (15%)
- [ ] AAA pattern followed
- [ ] Fail-fast validation tests included
- [ ] Error case tests included

**STOP if**: Tests not written BEFORE implementation

#### Step 2: Implement to Make Tests Pass

**Apply Coding Conventions Skill** (SOLID principles):

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
  readonly sub: string;  // user ID
  readonly email: string;
  readonly role: string;
}
```

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
  // Fail-fast validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // Fail-fast validation: min 8 chars
  return password && password.length >= 8;
}
```

```typescript
// src/domains/admin/auth/AdminAuthService.ts

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as authFunctions from './functions';
import { LoginDto, LoginResponse, JwtPayload } from './types';

/**
 * Admin authentication service.
 * 
 * Handles:
 * - Login with email/password
 * - JWT token generation (access + refresh)
 * - Token refresh
 * - Logout (token invalidation)
 * - User validation
 * 
 * Security:
 * - bcrypt password hashing (cost factor: 12)
 * - JWT with short-lived access tokens (15min)
 * - Long-lived refresh tokens (7 days)
 * - Account lockout after 5 failed attempts
 * - Fail-fast validation
 */
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {
    // Dependency Injection (SOLID D principle)
  }

  /**
   * Authenticate admin user.
   * 
   * @param loginDto - Email and password
   * @returns Access token, refresh token, and user profile
   * @throws BadRequestException - Missing or invalid fields (fail-fast)
   * @throws UnauthorizedException - Invalid credentials or inactive user
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Fail-fast validation (SOLID S principle: Single Responsibility)
    this.validateLoginDto(loginDto);

    // Find user by email
    const user = await this.prisma.adminUser.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (this.isAccountLocked(user)) {
      throw new UnauthorizedException('Account is locked due to too many failed attempts');
    }

    // Verify password
    const isPasswordValid = await authFunctions.comparePassword(
      loginDto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Reset failed login attempts on successful login
    await this.resetFailedLoginAttempts(user.id);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using refresh token.
   * 
   * @param refreshToken - Refresh token
   * @returns New access token
   * @throws UnauthorizedException - Invalid or expired refresh token
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    // Fail-fast validation
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const tokenRecord = await this.prisma.adminRefreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Validate user still exists and is active
    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new access token
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }
    );

    return { accessToken };
  }

  /**
   * Logout admin user (invalidate refresh token).
   * 
   * @param refreshToken - Refresh token to invalidate
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;  // Already logged out
    }

    // Delete refresh token from database
    await this.prisma.adminRefreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Validate user from JWT payload (for JwtStrategy).
   * 
   * @param payload - JWT payload
   * @returns User or null if invalid
   */
  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Validate login DTO (fail-fast).
   * 
   * @private
   * @param loginDto - Login DTO
   * @throws BadRequestException - Missing or invalid fields
   */
  private validateLoginDto(loginDto: LoginDto): void {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    if (!authFunctions.validateEmail(loginDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!authFunctions.validatePassword(loginDto.password)) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }

  /**
   * Generate JWT tokens (access + refresh).
   * 
   * @private
   * @param user - Admin user
   * @returns Access token and refresh token
   */
  private generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  /**
   * Save refresh token to database.
   * 
   * @private
   * @param userId - User ID
   * @param token - Refresh token
   */
  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days

    await this.prisma.adminRefreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Increment failed login attempts.
   * 
   * @private
   * @param userId - User ID
   */
  private async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLoginAt: new Date(),
      },
    });
  }

  /**
   * Reset failed login attempts.
   * 
   * @private
   * @param userId - User ID
   */
  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      },
    });
  }

  /**
   * Check if account is locked.
   * 
   * @private
   * @param user - Admin user
   * @returns True if locked, false otherwise
   */
  private isAccountLocked(user: any): boolean {
    if (user.failedLoginAttempts >= 5) {
      // Lockout for 15 minutes
      const lockoutDuration = 15 * 60 * 1000;  // 15 minutes in ms
      const lockoutEnd = new Date(user.lastFailedLoginAt.getTime() + lockoutDuration);

      if (new Date() < lockoutEnd) {
        return true;
      }
    }

    return false;
  }
}
```

**Implementation Checkpoint**:
- [ ] Functions ≤ 50 lines (SOLID S principle)
- [ ] Class ≤ 300 lines (checked)
- [ ] No `any` types (TypeScript strict mode)
- [ ] Dependency injection used (SOLID D principle)
- [ ] Fail-fast validation (validateLoginDto)
- [ ] Error handling comprehensive
- [ ] Code documented (JSDoc comments)

**STOP if**: Implementation doesn't follow SOLID principles

#### Step 3: Run Tests

```bash
# Run unit tests
pnpm test -- AdminAuthService.spec.ts

# Run integration tests
pnpm test:e2e -- admin-auth.e2e-spec.ts

# Run coverage
pnpm test:cov
```

**Test Checkpoint**:
- [ ] All unit tests pass (80%)
- [ ] All integration tests pass (15%)
- [ ] Coverage ≥ 85%

**STOP if**: Any test fails or coverage < 85%

---

### Feature 2: Admin Authentication (Frontend)

**Apply**: Admin Dashboard Implementation skill

**Workflow**:

#### Step 1: Write Tests FIRST (TDD)

```typescript
// web/src/app/admin/services/admin-auth.service.spec.ts

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminAuthService]
    });

    service = TestBed.inject(AdminAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', () => {
      // Arrange
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin' }
      };

      // Act
      service.login('admin@test.com', 'password').subscribe(response => {
        // Assert
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/admin/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle 401 error for invalid credentials', () => {
      // Arrange, Act, Assert
    });

    it('should handle 400 error for missing fields', () => {
      // Arrange, Act, Assert
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', () => {
      // Arrange, Act, Assert
    });
  });

  describe('refresh', () => {
    it('should return new access token', () => {
      // Arrange, Act, Assert
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if access token exists', () => {
      // Arrange, Act, Assert
    });

    it('should return false if no access token', () => {
      // Arrange, Act, Assert
    });
  });
});
```

#### Step 2: Implement to Make Tests Pass

```typescript
// web/src/app/admin/models/admin-user.model.ts

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'moderator';
}

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}
```

```typescript
// web/src/app/admin/services/admin-auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AdminAuthTokens, AdminUser } from '../models/admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly apiUrl = '/api/admin/auth';
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on init
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AdminAuthTokens> {
    // Fail-fast validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return this.http.post<AdminAuthTokens>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        // Store tokens and user
        this.storeTokens(response.accessToken, response.refreshToken);
        this.storeUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        // Clear tokens and user
        this.clearTokens();
        this.clearUser();
        this.currentUserSubject.next(null);
      })
    );
  }

  refresh(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        this.storeAccessToken(response.accessToken);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('admin_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('admin_refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
  }

  private storeAccessToken(accessToken: string): void {
    localStorage.setItem('admin_access_token', accessToken);
  }

  private storeUser(user: AdminUser): void {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }

  private clearTokens(): void {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
  }

  private clearUser(): void {
    localStorage.removeItem('admin_user');
  }

  private getUserFromStorage(): AdminUser | null {
    const userJson = localStorage.getItem('admin_user');
    return userJson ? JSON.parse(userJson) : null;
  }
}
```

#### Step 3: Implement Guards and Interceptors

```typescript
// web/src/app/admin/guards/admin-auth.guard.ts

import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirect to login
    this.router.navigate(['/admin/login']);
    return false;
  }
}
```

```typescript
// web/src/app/admin/interceptors/jwt.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AdminAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add JWT token to request headers
    const accessToken = this.authService.getAccessToken();

    if (accessToken && req.url.startsWith('/api/admin')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(req);
  }
}
```

#### Step 4: Implement Login Component

```typescript
// web/src/app/admin/components/login/login.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        // Redirect to dashboard
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
```

#### Step 5: Run Tests

```bash
# Run Angular tests
cd web
ng test --watch=false --code-coverage
```

**Test Checkpoint**:
- [ ] All frontend tests pass
- [ ] Coverage ≥ 85%

**STOP if**: Any test fails or coverage < 85%

---

### Phase 1 Completion Checklist

Before proceeding to Phase 2:

- [ ] Feature 1: Admin Authentication (Backend) complete
  - [ ] Tests written first (80/15/5)
  - [ ] Implementation follows SOLID
  - [ ] All tests pass
  - [ ] Coverage ≥ 85%

- [ ] Feature 2: Admin Authentication (Frontend) complete
  - [ ] Tests written first
  - [ ] Implementation complete
  - [ ] All tests pass
  - [ ] Coverage ≥ 85%

- [ ] Database migrations run
  - [ ] AdminUser table created
  - [ ] AdminRefreshToken table created
  - [ ] Seed data loaded (test admin user)

- [ ] Manual testing complete
  - [ ] Login flow works end-to-end
  - [ ] Token refresh works
  - [ ] Logout works
  - [ ] Protected routes blocked without auth

**Quality Gate: Phase 1 Complete**

**STOP if**: Any checkpoint fails.

**Next Step**: Proceed to Phase 2 (Standards Compliance)

**Estimated Total Time**: 1 week (5 business days)

---

## Phase 2-N: Iterative Feature Development

**Goal**: Implement remaining admin features iteratively using the same skills-based workflow.

**Duration**: 6-8 weeks (iterative)

**Status**: ⏳ **PENDING** (waiting for Phase 1 completion)

### Feature Roadmap

Each feature follows the **EXACT SAME WORKFLOW** as Phase 1:

```
Phase 0 (Design) → Phase 1 (TDD) → Phase 2 (Standards) → Phase 3 (Security) → Phase 4 (Approval)
```

**Feature List** (Priority Order):

1. ✅ Admin Authentication (Phase 1)
2. ⏳ Admin Dashboard/Analytics (Phase 2)
3. ⏳ Service Request Management (Phase 3)
4. ⏳ Admin User Management (Phase 4)
5. ⏳ Enhanced Mechanics Management (Phase 5)
6. ⏳ Enhanced Reviews Management (Phase 6)
7. ⏳ Enhanced Skills Management (Phase 7)
8. ⏳ Audit Logging (Phase 8)
9. ⏳ System Settings (Phase 9)

**Each feature must complete ALL phases before starting the next feature.**

---

### Phase 2: Admin Dashboard/Analytics

**Backend**: Analytics endpoints
**Frontend**: Dashboard UI with charts

**API Endpoints**:
- GET /admin/analytics/overview
- GET /admin/analytics/revenue
- GET /admin/analytics/mechanics

**UI Components**:
- Dashboard component
- Metrics cards
- Charts (line, bar, pie)
- Recent activity table

**Follow Same Workflow**:
1. Apply Interface Designer skill → design API contracts
2. Apply Canonical Type Reuse skill → identify types
3. Write tests FIRST (80/15/5)
4. Implement to make tests pass (SOLID)
5. Run quality gates (build, lint, test, standards)
6. Security review
7. Human approval

**Estimated Time**: 1 week

---

### Phase 3: Service Request Management

**Backend**: Service request endpoints
**Frontend**: Service request UI

**API Endpoints**:
- GET /admin/service-requests
- GET /admin/service-requests/:id
- PUT /admin/service-requests/:id
- POST /admin/service-requests/:id/capture
- POST /admin/service-requests/:id/cancel
- POST /admin/service-requests/:id/finalize
- POST /admin/service-requests/:id/work-logs

**UI Components**:
- Service requests list
- Service request detail
- Capture payment modal
- Finalize request modal
- Work log form

**Follow Same Workflow**: (as described above)

**Estimated Time**: 1-2 weeks

---

### Phase 4: Admin User Management

**Backend**: Admin user endpoints
**Frontend**: Admin user UI

**API Endpoints**:
- GET /admin/users
- GET /admin/users/:id
- POST /admin/users
- PUT /admin/users/:id
- DELETE /admin/users/:id

**UI Components**:
- Admin users list
- Create admin user form
- Edit admin user form
- Role management

**Follow Same Workflow**: (as described above)

**Estimated Time**: 1 week

---

### Phase 5-7: Enhanced Management (Mechanics, Reviews, Skills)

**Objective**: Enhance existing management with list views and filters.

**Estimated Time**: 2-3 weeks total

---

### Phase 8: Audit Logging

**Objective**: Log all admin actions for security auditing.

**Estimated Time**: 1 week

---

### Phase 9: System Settings

**Objective**: Configurable system settings (rates, fees, etc.).

**Estimated Time**: 1 week

---

## Quality Gates

**MANDATORY CHECKPOINTS** at every phase.

### Build Gate

```bash
# Backend
pnpm build

# Frontend
cd web && ng build --configuration production
```

**STOP if**: Build fails

---

### Linter Gate

```bash
# Backend
pnpm lint

# Frontend
cd web && ng lint
```

**STOP if**: Lint errors exist

---

### Test Gate

```bash
# Backend
pnpm test:cov

# Frontend
cd web && ng test --code-coverage
```

**Requirements**:
- [ ] All tests pass
- [ ] Coverage ≥ 85%
- [ ] 80/15/5 pyramid followed
- [ ] AAA pattern used

**STOP if**: Any test fails or coverage < 85%

---

### Standards Compliance Gate

**Checklist**:

- [ ] **Naming** (docs/standards/common/naming.md)
  - Singular for objects, plural for arrays
  - Presence implies enablement (no `enabled` flag)
  - Mutual exclusivity validated

- [ ] **Types** (docs/standards/common/types.md)
  - Canonical types reused (not bespoke)
  - Namespace imports used (`import * as`)

- [ ] **Security** (docs/standards/common/security.md)
  - Security by default
  - Fail-fast validation
  - No sensitive data in logs

- [ ] **TypeScript** (docs/standards/common/typescript.md)
  - Functions ≤ 50 lines
  - Classes ≤ 300 lines
  - No `any` types
  - SOLID principles applied

- [ ] **Anti-Patterns** (docs/standards/common/anti-patterns.md)
  - AP-002: No validation after resource creation
  - AP-008: No bespoke objects for common concepts
  - AP-016: No piecemeal imports

- [ ] **Modules** (docs/standards/common/modules.md)
  - types.ts / functions.ts / PascalCase.ts / index.ts layout
  - Barrel exports used
  - Namespace imports used

**STOP if**: Standards violations found

---

## Security Requirements

**Security-by-Default Checklist** (Applied to ALL Features):

### Authentication ✅
- [ ] JWT with refresh tokens (access: 15min, refresh: 7 days)
- [ ] httpOnly cookies for token storage
- [ ] bcrypt password hashing (cost ≥ 12)
- [ ] Password reset with time-limited tokens (1 hour)
- [ ] Account lockout after 5 failed attempts (15 min)
- [ ] CSRF protection enabled

### Authorization ✅
- [ ] RBAC (super-admin, admin, moderator)
- [ ] Auth guards on ALL admin routes
- [ ] Least privilege principle
- [ ] Route-level permissions

### API Security ✅
- [ ] Rate limiting (100 req/15min per IP)
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Security headers (helmet.js)

### Input Validation ✅
- [ ] class-validator on ALL DTOs
- [ ] Fail-fast validation
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (Angular sanitization + CSP)

### Data Security ✅
- [ ] Password never logged
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging enabled
- [ ] PII handling (GDPR-compliant)

### Session Security ✅
- [ ] Token rotation on refresh
- [ ] Token revocation on logout
- [ ] Session timeout (30 min inactivity)
- [ ] Concurrent session limits (1 per user)

**STOP if**: Any security requirement not met

---

## Module Architecture

### Backend Module Structure

```
src/
├── core/                        # Canonical types (NEW)
│   ├── auth/
│   │   ├── types.ts             # JwtConfig, AuthTokens
│   │   ├── functions.ts         # Auth helpers
│   │   └── index.ts
│   ├── encryption/
│   │   ├── types.ts             # EncryptionConfig
│   │   ├── functions.ts         # bcrypt helpers
│   │   └── index.ts
│   └── logging/
│       ├── types.ts             # LogConfig
│       ├── functions.ts         # Log helpers
│       └── index.ts
│
└── domains/
    └── admin/
        ├── types.ts             # Top-level admin types
        ├── functions.ts         # Top-level admin helpers
        ├── index.ts             # Barrel exports
        │
        ├── auth/                # Authentication module
        │   ├── types.ts
        │   ├── functions.ts
        │   ├── AdminAuthService.ts
        │   ├── AdminAuthController.ts
        │   ├── JwtStrategy.ts
        │   ├── AdminAuthGuard.ts
        │   └── index.ts
        │
        ├── users/               # User management module
        │   ├── types.ts
        │   ├── functions.ts
        │   ├── AdminUsersService.ts
        │   ├── AdminUsersController.ts
        │   └── index.ts
        │
        ├── service-requests/    # Service request management
        │   ├── types.ts
        │   ├── functions.ts
        │   ├── AdminServiceRequestsService.ts
        │   ├── AdminServiceRequestsController.ts
        │   └── index.ts
        │
        ├── analytics/           # Analytics module
        │   ├── types.ts
        │   ├── functions.ts
        │   ├── AdminAnalyticsService.ts
        │   ├── AdminAnalyticsController.ts
        │   └── index.ts
        │
        ├── controllers/         # (existing, may refactor)
        │   └── ...
        │
        └── services/            # (existing, may refactor)
            └── ...
```

### Frontend Module Structure

```
web/src/app/
└── admin/
    ├── models/                  # TypeScript interfaces
    │   ├── admin-user.model.ts
    │   ├── service-request.model.ts
    │   ├── analytics.model.ts
    │   └── index.ts
    │
    ├── services/                # Angular services
    │   ├── admin-auth.service.ts
    │   ├── admin-users.service.ts
    │   ├── service-requests.service.ts
    │   ├── analytics.service.ts
    │   └── index.ts
    │
    ├── guards/                  # Route guards
    │   ├── admin-auth.guard.ts
    │   ├── role.guard.ts
    │   └── index.ts
    │
    ├── interceptors/            # HTTP interceptors
    │   ├── jwt.interceptor.ts
    │   ├── error.interceptor.ts
    │   └── index.ts
    │
    ├── components/              # UI components
│   ├── dashboard/
    │   ├── login/
│   ├── service-requests/
    │   ├── admin-users/
│   ├── mechanics/
│   ├── reviews/
│   ├── skills/
│   └── settings/
│
    ├── admin-routing.module.ts
    ├── admin.module.ts
    └── index.ts
```

---

## Success Criteria

### Phase 0 Success Criteria

- [ ] All API contracts designed (YAML)
- [ ] All canonical types identified
- [ ] Module layout validated
- [ ] Security requirements defined
- [ ] Test strategy defined (80/15/5)
- [ ] Human approval obtained

### Phase 1 Success Criteria

- [ ] Admin authentication working (backend + frontend)
- [ ] All tests pass (≥ 85% coverage)
- [ ] Quality gates pass (build, lint, test, standards)
- [ ] Security review passed
- [ ] Human approval obtained

### Phase 2-N Success Criteria (Per Feature)

- [ ] Feature designed (API contracts)
- [ ] Tests written first (80/15/5)
- [ ] Implementation complete (SOLID)
- [ ] All tests pass (≥ 85% coverage)
- [ ] Quality gates pass
- [ ] Security review passed
- [ ] Human approval obtained

### Final Success Criteria (All Phases Complete)

- [ ] All features implemented
- [ ] All tests pass (≥ 85% coverage overall)
- [ ] Zero security vulnerabilities
- [ ] Zero anti-patterns
- [ ] Production deployment ready
- [ ] Documentation complete
- [ ] Human acceptance obtained

---

## Approval Gates

Human approval required at:

1. **Phase 0 Completion** - All design artifacts approved
2. **Phase 1 Completion** - Authentication foundation approved
3. **Each Feature Completion** - Feature approved before next feature
4. **Final Deployment** - Full system approved for production

**STOP if**: Approval not obtained

---

## Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| **Phase 0: Constitutional Alignment** | 1 week | ⏳ Pending |
| **Phase 1: Foundation (TDD)** | 1 week | ⏳ Pending |
| **Phase 2: Dashboard/Analytics** | 1 week | ⏳ Pending |
| **Phase 3: Service Requests** | 1-2 weeks | ⏳ Pending |
| **Phase 4: Admin Users** | 1 week | ⏳ Pending |
| **Phase 5-7: Enhanced Management** | 2-3 weeks | ⏳ Pending |
| **Phase 8: Audit Logging** | 1 week | ⏳ Pending |
| **Phase 9: System Settings** | 1 week | ⏳ Pending |
| **Total** | **9-12 weeks** | ⏳ Pending |

**Note**: Timeline assumes STOP conditions are met at each gate. If gates fail, add rework time.

---

## Related Documents

- **CLAUDE.md** - Repository constitution (PRIMARY AUTHORITY)
- **docs/skills/admin-dashboard-implementation.md** - Orchestrating skill (MANDATORY)
- **docs/skills/interface-designer.md** - API contract design
- **docs/skills/canonical-type-reuse.md** - Canonical types
- **docs/skills/module-layout-enforcer.md** - Module structure
- **docs/skills/testing.md** - TDD with 80/15/5 pyramid
- **docs/skills/coding-conventions.md** - SOLID principles
- **docs/standards/common/** - All standards (naming, types, security, etc.)
- **docs/admin/ADMIN_API_SPECIFICATION.md** - API contracts (to be revised)
- **docs/admin/ADMIN_UI_SPECIFICATION.md** - UI/UX specifications
- **docs/admin/ADMIN_QUICK_START.md** - Quick start guide (to be revised)

---

## Constitutional Compliance Statement

This plan is **CONSTITUTIONALLY COMPLIANT** with:

- ✅ Fail-Closed Principle (CLAUDE.md, Lines 538-546)
- ✅ Testing Requirements (CLAUDE.md, Lines 149-181)
- ✅ Security-by-Default (CLAUDE.md, Lines 183-215)
- ✅ Quality Gates (CLAUDE.md, Lines 217-266)
- ✅ Canonical Types (CLAUDE.md, Lines 268-280)
- ✅ Module Layout (CLAUDE.md, Lines 306-346)
- ✅ Skills Framework (CLAUDE.md, Lines 416-438)

**Deviations from this plan require human approval.**

---

**Document Version**: 2.0  
**Last Updated**: December 25, 2025  
**Status**: ✅ **CONSTITUTIONALLY ALIGNED**  
**Authority**: CLAUDE.md, docs/standards/, docs/skills/  
**Next Action**: Human approval to proceed with Phase 0

---

## End of Admin Dashboard Implementation Plan
