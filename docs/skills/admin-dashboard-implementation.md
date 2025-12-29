# Skill: Admin Dashboard Implementation

## Purpose

Implement NestJS/Angular admin dashboard following repository constitutional requirements (CLAUDE.md), standards (docs/standards/), and skills-based development methodology.

This skill is **constitution-first** and optimized for:

- test-driven development (TDD)
- security-by-default
- fail-closed operation
- canonical type reuse
- SOLID principles enforcement
- quality gate compliance

It enforces a **skills-based workflow** that produces **production-ready, standards-compliant admin dashboard** through iterative, test-first development with mandatory approval gates.

---

## When to Use

Invoke this skill when:

- implementing admin dashboard features (backend or frontend)
- adding new admin API endpoints
- creating admin UI components
- evolving admin authentication/authorization
- integrating admin functionality with existing domain services

---

## Preconditions (Fail-Closed)

Must be known:

- CLAUDE.md reviewed and understood
- docs/standards/ reviewed (naming, types, security, TypeScript, anti-patterns, modules)
- docs/skills/ reviewed (Interface Designer, Canonical Type Reuse, Module Layout Enforcer, Testing, Coding Conventions)
- Database schema approved (Prisma schema for admin tables)
- Security requirements defined (JWT, refresh tokens, role-based access)
- API contracts approved (via Interface Designer skill)

If missing: **STOP and ask**. Do NOT guess.

---

## Workflow (Hard Requirement)

### Phase 0: Constitutional Alignment

Work with the human to ensure:

1. **Interface Design** (Apply Interface Designer skill)
   - Design all API contracts as TypeScript interfaces
   - Follow docs/standards/common/naming.md conventions
   - Get human approval before proceeding

2. **Canonical Type Identification** (Apply Canonical Type Reuse skill)
   - Identify cross-cutting concerns (logging, tags, encryption, observability)
   - Reuse canonical types from src/core/** or equivalent
   - Document which canonical types are used
   - STOP if bespoke types created for common concepts

3. **Module Layout Design** (Apply Module Layout Enforcer skill)
   - Design file structure: types.ts / functions.ts / PascalCase.ts / index.ts
   - Validate against docs/standards/common/modules.md
   - Use barrel exports (index.ts) for all modules
   - STOP if layout non-compliant

4. **Security-by-Default Design**
   - All defaults must be secure (reference: docs/standards/common/security.md)
   - Encryption at rest enabled by default
   - SSL/TLS enforced by default
   - Public access blocked by default
   - IAM least privilege by default
   - STOP if defaults not secure

5. **Test Strategy Definition** (Reference Testing skill)
   - Define 80/15/5 test pyramid split:
     - 80% unit tests (services, validators, pure functions)
     - 15% integration tests (API flows, database operations)
     - 5% E2E tests (critical user journeys)
   - All tests follow AAA pattern (Arrange-Act-Assert)
   - Fail-fast validation in all constructors/validators
   - STOP if test strategy not defined

**Quality Gate: Phase 0 Complete**
- [ ] Interface Designer skill applied to all API endpoints
- [ ] Canonical types identified and documented
- [ ] Module layout validated by Module Layout Enforcer
- [ ] Security-by-default checklist complete
- [ ] Test strategy defined (80/15/5 pyramid)
- [ ] Human approval obtained

**STOP if any checkpoint fails**

---

### Phase 1: Test-Driven Development (TDD) Foundation

For EACH feature:

1. **Write Tests FIRST** (Never implement before tests)
   - Start with unit tests (80% of total)
   - Follow AAA pattern (Arrange-Act-Assert)
   - Test validation logic (fail-fast principle)
   - Test error handling (negative cases)
   - Test edge cases (boundary conditions)

2. **Implement to Make Tests Pass**
   - Apply Coding Conventions skill (SOLID principles)
   - Functions ≤ 50 lines
   - Classes ≤ 300 lines
   - No `any` types
   - Dependency injection (not hardcoded dependencies)
   - Validation BEFORE resource creation (fail-fast)

3. **Write Integration Tests** (15% of total)
   - API endpoint flows (login → protected route)
   - Database operations (CRUD with Prisma)
   - Authentication flows (JWT + refresh token)

4. **Write E2E Tests** (5% of total)
   - Critical user journeys only
   - Admin login → dashboard → CRUD operation
   - Payment workflows (authorize → capture → finalize)

5. **Measure Coverage**
   - Run coverage report
   - Ensure ≥ 85% total coverage
   - STOP if coverage < 85%

**Quality Gate: TDD Complete**
- [ ] All tests written BEFORE implementation
- [ ] AAA pattern used in all tests
- [ ] Test coverage ≥ 85%
- [ ] All tests pass
- [ ] Zero `any` types
- [ ] Functions ≤ 50 lines
- [ ] Classes ≤ 300 lines

**STOP if any checkpoint fails**

---

### Phase 2: Standards Compliance Validation

1. **Build Gate**
   - Run `pnpm build` (backend) and `ng build` (frontend)
   - STOP if build fails

2. **Linter Gate**
   - Run `pnpm lint` (backend) and `ng lint` (frontend)
   - Fix all lint errors
   - STOP if lint errors remain

3. **Test Gate**
   - Run all tests: `pnpm test` (backend) and `ng test` (frontend)
   - Check coverage: ≥ 85%
   - STOP if any test fails or coverage < 85%

4. **Standards Compliance Gate**
   - Validate naming conventions (docs/standards/common/naming.md)
   - Validate canonical type usage (docs/standards/common/types.md)
   - Validate security defaults (docs/standards/common/security.md)
   - Validate TypeScript standards (docs/standards/common/typescript.md)
   - Check for anti-patterns (docs/standards/common/anti-patterns.md)
   - Validate module layout (docs/standards/common/modules.md)
   - STOP if standards violations found

**Quality Gate: Standards Compliant**
- [ ] Build succeeds (zero errors)
- [ ] Lint passes (zero warnings/errors)
- [ ] All tests pass
- [ ] Test coverage ≥ 85%
- [ ] Naming conventions followed
- [ ] Canonical types reused
- [ ] Security by default
- [ ] No anti-patterns
- [ ] Module layout compliant

**STOP if any checkpoint fails**

---

### Phase 3: Security Review

1. **Authentication**
   - JWT with refresh tokens implemented
   - Token expiration configured (access: 15min, refresh: 7 days)
   - Secure token storage (httpOnly cookies)
   - CSRF protection enabled

2. **Authorization**
   - Role-based access control (RBAC) implemented
   - Guards protect all admin routes
   - Least privilege principle enforced

3. **Data Validation**
   - Input validation on all endpoints (class-validator)
   - Fail-fast validation (reject invalid before processing)
   - SQL injection prevention (Prisma ORM)
   - XSS prevention (Angular sanitization)

4. **API Security**
   - Rate limiting configured (100 requests/15min)
   - CORS properly configured
   - HTTPS enforced (redirect HTTP → HTTPS)
   - Security headers configured (helmet.js)

5. **Password Security**
   - bcrypt with cost factor ≥ 12
   - No password storage in logs
   - Password reset with time-limited tokens

**Quality Gate: Security Approved**
- [ ] JWT authentication with refresh tokens
- [ ] RBAC authorization on all admin routes
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Password hashing secure (bcrypt ≥ 12)
- [ ] No security anti-patterns

**STOP if any checkpoint fails**

---

### Phase 4: Human Review and Approval

1. **Code Review**
   - Submit for human review
   - Address feedback
   - Re-run quality gates after changes

2. **Approval Gate**
   - Human approval obtained
   - STOP if not approved

---

## Core Implementation Rules

### Fail-Closed Principle

From CLAUDE.md (Lines 538-546):
> "If information is missing, ambiguous, or conflicting:
> - Do NOT guess
> - Do NOT proceed
> - Ask for clarification
> 
> **This rule overrides all others.**"

**Enforcement**: STOP and ask when:
- API contract unclear
- Security requirement ambiguous
- Module boundary undefined
- Test coverage target uncertain
- Canonical type availability unknown

---

### Test-First Principle

From docs/skills/testing.md:
> "Write tests BEFORE implementation, not after."

**Enforcement**:
- ❌ Implement → Test (FORBIDDEN)
- ✅ Test → Implement (REQUIRED)

**Test Pyramid** (80/15/5):
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

**AAA Pattern** (Mandatory):
```typescript
describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let prisma: PrismaService;
  
  beforeEach(() => {
    // Arrange: Setup
  });
  
  it('should authenticate admin with valid credentials', async () => {
    // Arrange: Prepare test data
    const loginDto = { email: 'admin@test.com', password: 'password' };
    
    // Act: Execute operation
    const result = await service.login(loginDto);
    
    // Assert: Verify outcome
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('admin@test.com');
  });
});
```

---

### Security-by-Default Principle

From CLAUDE.md (Lines 183-215):
> "All constructs MUST be secure by default.
> This is a **non-negotiable requirement**."

**Enforcement**:
- ✅ Encryption at rest (enabled by default)
- ✅ SSL/TLS (enforced by default)
- ✅ Public access (blocked by default)
- ✅ IAM least privilege (default roles)
- ✅ Logging and monitoring (enabled by default)

Users may opt-in to less secure, but **defaults MUST be secure**.

---

### Canonical Type Reuse Principle

From docs/standards/common/types.md:
> "One concept → one canonical type"

**Mandatory Canonical Types**:

| Concern | Canonical Type | Usage |
|---------|---------------|-------|
| Logging | `logging.LogConfig` | All logging needs |
| Tags | `tags.TagMap` | All resource tagging |
| Encryption | `encryption.EncryptionConfig` | All encryption needs |
| Observability | `observability.*` | All monitoring needs |
| Naming | `naming.NamingStrategy` | All naming patterns |

**Enforcement**:
- ❌ Create bespoke types (e.g., `AdminUserLogging`) → FORBIDDEN
- ✅ Reuse canonical types (e.g., `logs?: ReadonlyArray<logging.LogConfig>`) → REQUIRED

**Before introducing any new type for cross-cutting concerns**:
1. Apply Canonical Type Reuse skill
2. Search for existing canonical type
3. If found, reuse it
4. If insufficient, extend via composition
5. If still insufficient, propose new canonical type (requires approval)

---

### Module Layout Principle

From CLAUDE.md (Lines 306-346):
> "Pure capability modules: types.ts, functions.ts, index.ts
> Construct modules: types.ts, functions.ts, PascalCase.ts, index.ts"

**Admin Dashboard Module Layout**:
```
src/domains/admin/
├── types.ts              # Public interfaces (AdminUserProps, AdminAuthConfig)
├── functions.ts          # Shared helpers (validateAdminUser, hashPassword)
├── AdminAuthService.ts   # Auth construct + helpers
├── AdminService.ts       # Admin service construct + helpers
├── index.ts              # Barrel exports (MANDATORY)
│
├── auth/
│   ├── types.ts          # Auth-specific types
│   ├── functions.ts      # Auth helpers
│   ├── AuthGuard.ts      # Auth guard construct
│   └── index.ts          # Barrel exports
│
└── controllers/
    ├── types.ts          # Controller types
    ├── functions.ts      # Controller helpers
    ├── AdminMechanicsController.ts
    ├── AdminReviewsController.ts
    └── index.ts          # Barrel exports
```

**Rules**:
- ✅ `types.ts` contains public interfaces
- ✅ `functions.ts` contains pure functions
- ✅ `PascalCase.ts` contains constructs (classes)
- ✅ `index.ts` contains barrel exports
- ✅ Import via namespace: `import * as admin from './domains/admin';`
- ❌ No piecemeal imports: `import { AdminAuthService } from './domains/admin/AdminAuthService';`

---

### SOLID Principles

From docs/skills/coding-conventions.md:

**S - Single Responsibility Principle**
- Each class has ONE reason to change
- AdminAuthService handles ONLY authentication
- AdminService handles ONLY admin operations (delegates to domain services)

**O - Open/Closed Principle**
- Open for extension, closed for modification
- Use interfaces and dependency injection

**L - Liskov Substitution Principle**
- Subtypes must be substitutable for base types
- Use interfaces over inheritance

**I - Interface Segregation Principle**
- Many small interfaces > one large interface
- AdminAuthService interface ≠ AdminService interface

**D - Dependency Inversion Principle**
- Depend on abstractions, not concretions
- Inject PrismaService, ConfigService, etc.

**Enforcement**:
- Functions ≤ 50 lines
- Classes ≤ 300 lines
- No `any` types
- Dependency injection required
- Validation before resource creation (fail-fast)

---

## Module Boundary Rules

### Backend Module Structure

```typescript
// src/domains/admin/types.ts
export interface AdminUserProps {
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly role: 'super-admin' | 'admin' | 'moderator';
  readonly isActive?: boolean;
}

export interface AdminAuthConfig {
  readonly jwtSecret: string;
  readonly accessTokenTTL: string;   // "15m"
  readonly refreshTokenTTL: string;  // "7d"
}
```

```typescript
// src/domains/admin/functions.ts
import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;  // Security requirement
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```typescript
// src/domains/admin/AdminAuthService.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as adminTypes from './types';
import * as adminFunctions from './functions';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {
    // Dependency injection (SOLID D principle)
  }

  async login(email: string, password: string) {
    // Fail-fast validation
    if (!email || !password) {
      throw new Error('Email and password required');
    }

    // Implementation...
  }
}
```

```typescript
// src/domains/admin/index.ts
export * from './types';
export * from './functions';
export { AdminAuthService } from './AdminAuthService';
export { AdminService } from './AdminService';
```

---

### Frontend Module Structure

```typescript
// web/src/app/admin/models/admin-user.model.ts
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: Date;
}

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
}
```

```typescript
// web/src/app/admin/services/admin-auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, AdminAuthTokens } from '../models/admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly apiUrl = '/api/admin/auth';

  constructor(private http: HttpClient) {
    // Dependency injection (SOLID D principle)
  }

  login(email: string, password: string): Observable<AdminAuthTokens> {
    // Fail-fast validation
    if (!email || !password) {
      throw new Error('Email and password required');
    }

    return this.http.post<AdminAuthTokens>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }
}
```

---

## Output Contract (Required)

Every feature implementation must output:

1. **Test Suite**
   - Unit tests (80%)
   - Integration tests (15%)
   - E2E tests (5%)
   - Coverage report (≥ 85%)

2. **Implementation**
   - Module following layout standards
   - Barrel exports (index.ts)
   - TypeScript interfaces in types.ts
   - Pure functions in functions.ts
   - Constructs in PascalCase.ts

3. **Documentation**
   - API endpoint documentation
   - Security considerations
   - Usage examples

4. **Quality Gate Results**
   - Build: ✅ Pass
   - Lint: ✅ Pass
   - Test: ✅ Pass (≥ 85% coverage)
   - Standards: ✅ Pass

5. **Security Review**
   - Authentication verified
   - Authorization verified
   - Input validation verified
   - Security headers verified

---

## Constraints (What MUST NOT Be Done)

- ❌ Do NOT implement before writing tests
- ❌ Do NOT create bespoke types for cross-cutting concerns
- ❌ Do NOT skip quality gates
- ❌ Do NOT guess when information is missing (fail-closed)
- ❌ Do NOT validate after resource creation (fail-fast required)
- ❌ Do NOT use `any` types
- ❌ Do NOT hardcode dependencies (use DI)
- ❌ Do NOT create functions > 50 lines
- ❌ Do NOT create classes > 300 lines
- ❌ Do NOT proceed with failing tests
- ❌ Do NOT proceed with coverage < 85%
- ❌ Do NOT proceed with security vulnerabilities

---

## Approval Gates

Human approval is required before:

- Starting implementation (after Phase 0 design)
- Introducing new API endpoints (Interface Designer skill output)
- Introducing new canonical types (Canonical Type Reuse skill output)
- Modifying database schema (Prisma migrations)
- Changing security configuration (JWT config, CORS, etc.)
- Proceeding with failing quality gates (exception required)

---

## Example Feature Implementation

### Feature: Admin Login

#### Step 1: Design (Phase 0)

**Apply Interface Designer Skill**:

```yaml
# Admin Login API Contract (Design Artifact)
apiVersion: admin/v1
kind: AdminAuth
metadata:
  name: admin-login

spec:
  endpoint:
    method: POST
    path: /api/admin/auth/login
    
  request:
    body:
      email: string              # Required, valid email format
      password: string           # Required, min 8 chars
      
  response:
    success:
      status: 200
      body:
        accessToken: string      # JWT, expires 15min
        refreshToken: string     # JWT, expires 7 days
        user:
          id: string
          email: string
          name: string
          role: string
    
    errors:
      - status: 401
        message: "Invalid credentials"
      - status: 429
        message: "Too many requests"
```

**Apply Canonical Type Reuse Skill**:
- No cross-cutting concerns identified (login is domain-specific)
- Future: Consider `logging.LogConfig` for admin action logs

**Apply Module Layout Enforcer Skill**:
- Backend: `src/domains/admin/auth/`
  - `types.ts` - LoginDto, LoginResponse interfaces
  - `functions.ts` - validateLoginDto helper
  - `AdminAuthService.ts` - Auth service class
  - `AdminAuthController.ts` - Auth controller class
  - `index.ts` - Barrel exports

**Approval Gate**: Human approves design ✅

---

#### Step 2: TDD Implementation (Phase 1)

**Write Tests FIRST**:

```typescript
// src/domains/admin/auth/AdminAuthService.spec.ts
describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    // Arrange: Setup test module
    const module = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'password123';
      const mockUser = {
        id: '1',
        email,
        passwordHash: await hashPassword(password),
        name: 'Admin User',
        role: 'admin',
      };
      
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      // Act
      const result = await service.login(email, password);

      // Assert
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe(email);
    });

    it('should throw for invalid credentials', async () => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'wrong-password';
      
      jest.spyOn(prisma.adminUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw for missing email (fail-fast)', async () => {
      // Arrange
      const email = '';
      const password = 'password123';

      // Act & Assert
      await expect(service.login(email, password)).rejects.toThrow(
        'Email and password required'
      );
    });
  });
});
```

**Implement to Make Tests Pass**:

```typescript
// src/domains/admin/auth/AdminAuthService.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as authFunctions from './functions';
import { LoginResponse } from './types';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    // Fail-fast validation (≤ 50 lines function)
    if (!email || !password) {
      throw new UnauthorizedException('Email and password required');
    }

    // Find user
    const user = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await authFunctions.comparePassword(
      password,
      user.passwordHash
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
```

**Run Tests**: `pnpm test -- AdminAuthService.spec.ts`
- ✅ All tests pass
- ✅ Coverage ≥ 85%

---

#### Step 3: Quality Gates (Phase 2)

1. **Build Gate**: `pnpm build` → ✅ Pass
2. **Linter Gate**: `pnpm lint` → ✅ Pass
3. **Test Gate**: `pnpm test` → ✅ Pass (92% coverage)
4. **Standards Gate**: Review against docs/standards/ → ✅ Pass

---

#### Step 4: Security Review (Phase 3)

- ✅ Fail-fast validation (email/password required)
- ✅ Password comparison secure (bcrypt)
- ✅ JWT tokens with proper expiration
- ✅ No password in logs
- ✅ UnauthorizedException for invalid credentials

---

#### Step 5: Human Approval (Phase 4)

- Human reviews code → ✅ Approved
- Proceed to next feature

---

## Related Skills

This skill orchestrates other skills:

1. **Interface Designer** - Design API contracts
2. **Canonical Type Reuse** - Identify shared types
3. **Module Layout Enforcer** - Validate file structure
4. **Testing** - TDD with 80/15/5 pyramid
5. **Coding Conventions** - SOLID principles enforcement

---

## Related Standards

This skill enforces standards:

1. **docs/standards/common/naming.md** - Naming conventions
2. **docs/standards/common/types.md** - Canonical types
3. **docs/standards/common/security.md** - Security by default
4. **docs/standards/common/typescript.md** - TypeScript rules
5. **docs/standards/common/anti-patterns.md** - Patterns to avoid
6. **docs/standards/common/modules.md** - Module layout

---

## Authority

This skill derives authority from:

- **CLAUDE.md** (Repository Constitution) - Lines 1-547
- **docs/standards/** (Coding Standards) - All standards
- **docs/skills/** (Skills Catalog) - All skills

---

## End of Skill: Admin Dashboard Implementation



