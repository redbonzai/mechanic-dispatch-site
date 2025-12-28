# Admin Dashboard Module Layout Design
# Phase 0 Task 3: Module Layout Enforcer Skill Applied
# Date: 2025-12-26
# Status: Draft - Awaiting Human Approval
# Authority: docs/skills/module-layout-enforcer.md, CLAUDE.md (Lines 306-346)

---

## Purpose

This document applies the **Module Layout Enforcer skill** to design the complete module structure for the admin dashboard following constitutional requirements:

> **Pure capability modules**: `types.ts` / `functions.ts` / `index.ts`  
> **Construct modules**: `types.ts` / `functions.ts` / `PascalCase.ts` / `index.ts`

---

## Module Classification

### Pure Capability Modules (src/core/**)

These are **types + functions only** (no NestJS constructs):

1. **auth** - JWT authentication utilities
2. **pagination** - Pagination utilities
3. **validation** - Input validation utilities
4. **error** - Error handling utilities
5. **audit** - Audit logging utilities
6. **money** - Money handling utilities

**Rule**: Pure capability modules MUST NOT contain `PascalCase.ts` files.

### Construct Modules (src/domains/admin/**)

These contain **NestJS services, controllers, guards** (construct implementations):

1. **admin/auth** - Admin authentication (service, controller, guard, strategy)
2. **admin/users** - Admin user management (service, controller)
3. **admin/service-requests** - Service request management (service, controller)
4. **admin/analytics** - Analytics (service, controller)
5. **admin/mechanics** - Mechanics management (existing - to be refactored)
6. **admin/reviews** - Reviews management (existing - to be refactored)
7. **admin/skills** - Skills management (existing - to be refactored)

**Rule**: Construct modules MUST contain `PascalCase.ts` files (one per construct).

---

## Complete Module Structure

### 1. Pure Capability Modules (src/core/**)

```
src/core/
├── auth/
│   ├── types.ts              # JwtConfig, JwtPayload, AuthTokens
│   ├── functions.ts          # generateJwt, verifyJwt, hashPassword, comparePassword
│   └── index.ts              # Barrel: export * from './types'; export * from './functions';
│
├── pagination/
│   ├── types.ts              # PaginationQuery, PaginationMeta, PaginatedResponse<T>
│   ├── functions.ts          # calculatePagination, validatePaginationQuery
│   └── index.ts              # Barrel
│
├── validation/
│   ├── types.ts              # (empty or ValidationResult if needed)
│   ├── functions.ts          # validateEmail, validatePassword, validateCuid, etc.
│   └── index.ts              # Barrel
│
├── error/
│   ├── types.ts              # ErrorResponse, ErrorCode enum
│   ├── functions.ts          # createErrorResponse, formatErrorMessage
│   └── index.ts              # Barrel
│
├── audit/
│   ├── types.ts              # AuditLogEntry, AuditActor, AuditResource
│   ├── functions.ts          # createAuditLog, formatAuditEntry
│   └── index.ts              # Barrel
│
└── money/
    ├── types.ts              # Money, MoneyRange
    ├── functions.ts          # centsToDollars, dollarsToCents, formatMoney
    └── index.ts              # Barrel
```

**Compliance Check**:
- ✅ Pure capability modules (no constructs)
- ✅ `types.ts` / `functions.ts` / `index.ts` layout
- ✅ No `PascalCase.ts` files
- ✅ Located in `src/core/**`
- ✅ Barrel exports in `index.ts`

---

### 2. Admin Module Structure (src/domains/admin/**)

```
src/domains/admin/
├── types.ts                  # Top-level admin types (AdminRole enum, etc.)
├── functions.ts              # Top-level admin helpers (shared across all submodules)
├── index.ts                  # Barrel exports for entire admin domain
│
├── auth/
│   ├── types.ts              # LoginDto, LoginResponse, RefreshTokenDto, etc.
│   ├── functions.ts          # Shared auth helpers (if any)
│   ├── AdminAuthService.ts   # NestJS service (construct)
│   ├── AdminAuthController.ts # NestJS controller (construct)
│   ├── JwtStrategy.ts        # Passport JWT strategy (construct)
│   ├── JwtAuthGuard.ts       # Auth guard (construct)
│   ├── RolesGuard.ts         # RBAC guard (construct)
│   └── index.ts              # Barrel exports
│
├── users/
│   ├── types.ts              # CreateAdminUserDto, UpdateAdminUserDto, AdminUserResponse
│   ├── functions.ts          # Shared user helpers (if any)
│   ├── AdminUsersService.ts  # NestJS service (construct)
│   ├── AdminUsersController.ts # NestJS controller (construct)
│   └── index.ts              # Barrel exports
│
├── service-requests/
│   ├── types.ts              # Service request DTOs and responses
│   ├── functions.ts          # Shared service request helpers
│   ├── AdminServiceRequestsService.ts    # NestJS service (construct)
│   ├── AdminServiceRequestsController.ts # NestJS controller (construct)
│   └── index.ts              # Barrel exports
│
├── analytics/
│   ├── types.ts              # Analytics DTOs and responses
│   ├── functions.ts          # Analytics calculation helpers
│   ├── AdminAnalyticsService.ts    # NestJS service (construct)
│   ├── AdminAnalyticsController.ts # NestJS controller (construct)
│   └── index.ts              # Barrel exports
│
├── mechanics/                # EXISTING - To be refactored
│   ├── types.ts              # (NEW) MechanicDto, MechanicResponse
│   ├── functions.ts          # (NEW) Shared mechanic helpers
│   ├── AdminMechanicsService.ts    # (REFACTOR) Extract from AdminService
│   ├── AdminMechanicsController.ts # (EXISTING) Keep as-is
│   └── index.ts              # (NEW) Barrel exports
│
├── reviews/                  # EXISTING - To be refactored
│   ├── types.ts              # (NEW) ReviewDto, ReviewResponse
│   ├── functions.ts          # (NEW) Shared review helpers
│   ├── AdminReviewsService.ts      # (REFACTOR) Extract from AdminService
│   ├── AdminReviewsController.ts   # (EXISTING) Keep as-is
│   └── index.ts              # (NEW) Barrel exports
│
├── skills/                   # EXISTING - To be refactored
│   ├── types.ts              # (NEW) SkillDto, SkillResponse
│   ├── functions.ts          # (NEW) Shared skill helpers
│   ├── AdminSkillsService.ts       # (REFACTOR) Extract from AdminService
│   ├── AdminSkillsController.ts    # (EXISTING) Keep as-is
│   └── index.ts              # (NEW) Barrel exports
│
├── services/                 # DEPRECATED (to be removed after refactor)
│   └── admin.service.ts      # Current monolithic service
│
├── controllers/              # DEPRECATED (to be removed after refactor)
│   ├── mechanics.controller.ts
│   ├── reviews.controller.ts
│   └── skills.controller.ts
│
└── admin.module.ts           # NestJS module (import all submodules)
```

**Compliance Check**:
- ✅ Construct modules (NestJS services/controllers)
- ✅ `types.ts` / `functions.ts` / `PascalCase.ts` / `index.ts` layout
- ✅ PascalCase files for each construct
- ✅ Located outside `src/core/**`
- ✅ Barrel exports in `index.ts`

---

## Detailed File Skeletons

### 1. src/core/auth/types.ts

```typescript
/**
 * Canonical authentication types.
 * 
 * @module core/auth
 * @canonical Cross-cutting authentication concern
 */

/**
 * JWT configuration.
 */
export interface JwtConfig {
  /**
   * JWT secret key for signing tokens.
   */
  readonly secret: string;

  /**
   * Access token expiry duration.
   * 
   * @default "15m"
   */
  readonly accessTokenExpiresIn: string;

  /**
   * Refresh token expiry duration.
   * 
   * @default "7d"
   */
  readonly refreshTokenExpiresIn: string;

  /**
   * JWT issuer.
   * 
   * @optional
   */
  readonly issuer?: string;

  /**
   * JWT audience.
   * 
   * @optional
   */
  readonly audience?: string;
}

/**
 * JWT payload structure.
 */
export interface JwtPayload {
  /**
   * Subject (user ID).
   */
  readonly sub: string;

  /**
   * User email.
   */
  readonly email: string;

  /**
   * User role.
   */
  readonly role: string;

  /**
   * Issued at (Unix timestamp).
   */
  readonly iat?: number;

  /**
   * Expiration (Unix timestamp).
   */
  readonly exp?: number;
}

/**
 * Authentication tokens.
 */
export interface AuthTokens {
  /**
   * JWT access token (short-lived).
   */
  readonly accessToken: string;

  /**
   * JWT refresh token (long-lived).
   */
  readonly refreshToken: string;
}
```

---

### 2. src/core/auth/functions.ts

```typescript
/**
 * Canonical authentication functions.
 * 
 * @module core/auth
 */

import * as bcrypt from 'bcrypt';

/**
 * Hash password using bcrypt.
 * 
 * @param password - Plain text password
 * @param saltRounds - Bcrypt cost factor (default: 12)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds = 12
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash.
 * 
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns true if match, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

### 3. src/core/auth/index.ts

```typescript
/**
 * Canonical authentication module.
 * 
 * @module core/auth
 * @canonical Cross-cutting authentication concern
 */

export * from './types';
export * from './functions';
```

---

### 4. src/domains/admin/types.ts

```typescript
/**
 * Top-level admin domain types.
 * 
 * @module domains/admin
 */

/**
 * Admin role enumeration.
 */
export enum AdminRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * Admin user base properties.
 */
export interface AdminUserBase {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: AdminRole;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

---

### 5. src/domains/admin/auth/types.ts

```typescript
/**
 * Admin authentication types.
 * 
 * @module domains/admin/auth
 */

import * as auth from '../../../core/auth';
import { AdminUserBase } from '../types';

/**
 * Login request DTO.
 */
export interface LoginDto {
  readonly email: string;
  readonly password: string;
}

/**
 * Login response.
 */
export interface LoginResponse {
  /**
   * Authentication tokens.
   * 
   * @canonical Reuses core/auth
   */
  readonly tokens: auth.AuthTokens;

  /**
   * Admin user profile.
   */
  readonly user: AdminUserBase;
}

/**
 * Refresh token request DTO.
 */
export interface RefreshTokenDto {
  readonly refreshToken: string;
}

/**
 * Refresh token response.
 */
export interface RefreshTokenResponse {
  readonly accessToken: string;
}
```

---

### 6. src/domains/admin/auth/AdminAuthService.ts

```typescript
/**
 * Admin authentication service.
 * 
 * @module domains/admin/auth
 * @construct NestJS Service
 */

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import * as auth from '../../../core/auth';
import * as validation from '../../../core/validation';
import { LoginDto, LoginResponse, RefreshTokenDto, RefreshTokenResponse } from './types';

/**
 * Admin authentication service.
 * 
 * Handles:
 * - Login with email/password
 * - JWT token generation
 * - Token refresh
 * - Token validation
 * 
 * Security:
 * - bcrypt password hashing (cost: 12)
 * - JWT access tokens (15min expiry)
 * - JWT refresh tokens (7 days expiry)
 * - Account lockout (5 failed attempts, 15min lockout)
 * - Fail-fast validation
 */
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  /**
   * Authenticate admin user.
   * 
   * @param loginDto - Login credentials
   * @returns Login response with tokens and user
   * @throws BadRequestException - Invalid input (fail-fast)
   * @throws UnauthorizedException - Invalid credentials or inactive account
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Fail-fast validation
    this.validateLoginDto(loginDto);

    // Implementation to be added in Phase 1
    throw new Error('Not implemented');
  }

  /**
   * Refresh access token.
   * 
   * @param refreshTokenDto - Refresh token
   * @returns New access token
   * @throws UnauthorizedException - Invalid or expired refresh token
   */
  async refresh(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    // Implementation to be added in Phase 1
    throw new Error('Not implemented');
  }

  /**
   * Logout (invalidate refresh token).
   * 
   * @param refreshToken - Refresh token to invalidate
   */
  async logout(refreshToken: string): Promise<void> {
    // Implementation to be added in Phase 1
    throw new Error('Not implemented');
  }

  /**
   * Validate JWT payload (for Passport strategy).
   * 
   * @param payload - JWT payload
   * @returns Admin user or null
   */
  async validateUser(payload: auth.JwtPayload): Promise<any> {
    // Implementation to be added in Phase 1
    throw new Error('Not implemented');
  }

  /**
   * Validate login DTO (fail-fast).
   * 
   * @private
   * @param loginDto - Login DTO
   * @throws BadRequestException - Invalid input
   */
  private validateLoginDto(loginDto: LoginDto): void {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    if (!validation.validateEmail(loginDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!validation.validatePassword(loginDto.password)) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }
}
```

---

### 7. src/domains/admin/auth/AdminAuthController.ts

```typescript
/**
 * Admin authentication controller.
 * 
 * @module domains/admin/auth
 * @construct NestJS Controller
 */

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AdminAuthService } from './AdminAuthService';
import { JwtAuthGuard } from './JwtAuthGuard';
import { LoginDto, LoginResponse, RefreshTokenDto, RefreshTokenResponse } from './types';

/**
 * Admin authentication controller.
 * 
 * Endpoints:
 * - POST /admin/auth/login
 * - POST /admin/auth/logout
 * - POST /admin/auth/refresh
 * - GET /admin/auth/profile
 */
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  /**
   * Login endpoint.
   * 
   * @route POST /admin/auth/login
   * @public No authentication required
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * Logout endpoint.
   * 
   * @route POST /admin/auth/logout
   * @auth Requires JWT access token
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() body: { refreshToken: string }): Promise<void> {
    return this.authService.logout(body.refreshToken);
  }

  /**
   * Refresh token endpoint.
   * 
   * @route POST /admin/auth/refresh
   * @public No authentication required (refresh token in body)
   */
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    return this.authService.refresh(refreshTokenDto);
  }

  /**
   * Get current user profile.
   * 
   * @route GET /admin/auth/profile
   * @auth Requires JWT access token
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(/* @CurrentUser() user: AdminUserBase */): Promise<any> {
    // Implementation to be added in Phase 1
    throw new Error('Not implemented');
  }
}
```

---

### 8. src/domains/admin/auth/index.ts

```typescript
/**
 * Admin authentication module exports.
 * 
 * @module domains/admin/auth
 */

export * from './types';
export * from './AdminAuthService';
export * from './AdminAuthController';
export * from './JwtAuthGuard';
export * from './JwtStrategy';
export * from './RolesGuard';
```

---

## Consumption Patterns

### Module-as-Unit Import (Required)

All modules MUST be consumed via namespace imports:

```typescript
// ✅ CORRECT (namespace import)
import * as auth from '../../../core/auth';
import * as pagination from '../../../core/pagination';
import * as validation from '../../../core/validation';
import * as adminAuth from '../auth';

// Usage
const tokens: auth.AuthTokens = { ... };
const query: pagination.PaginationQuery = { ... };
validation.validateEmail(email);
const loginResponse: adminAuth.LoginResponse = { ... };
```

```typescript
// ❌ WRONG (piecemeal import)
import { AuthTokens } from '../../../core/auth/types';
import { PaginationQuery } from '../../../core/pagination/types';
import { validateEmail } from '../../../core/validation/functions';
import { LoginResponse } from '../auth/types';
```

---

## Utility Promotion Rules

### Case 1: Helper Used by Only One Construct

**Rule**: Keep helper inside the construct file.

**Example**: `AdminAuthService.ts` has `validateLoginDto()` used only by `login()` method.

```typescript
// ✅ CORRECT - Keep inside AdminAuthService.ts
export class AdminAuthService {
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    this.validateLoginDto(loginDto);  // Private helper
    // ...
  }

  private validateLoginDto(loginDto: LoginDto): void {
    // Validation logic
  }
}
```

---

### Case 2: Helper Used by 2+ Constructs in Same Module

**Rule**: Move helper to `functions.ts`.

**Example**: `validateAdminRole()` used by `AdminUsersService` and `AdminAuthService`.

```typescript
// ✅ CORRECT - Move to src/domains/admin/auth/functions.ts
export function validateAdminRole(role: string): boolean {
  return ['super-admin', 'admin', 'moderator'].includes(role);
}

// Then import in both services:
import * as adminAuthFunctions from './functions';
adminAuthFunctions.validateAdminRole(role);
```

---

### Case 3: Helper Used Across Multiple Modules

**Rule**: Move helper to canonical module in `src/core/`.

**Example**: `validateEmail()` used in auth, users, service-requests modules.

```typescript
// ✅ CORRECT - Already in src/core/validation/functions.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// All modules import from core:
import * as validation from '../../../core/validation';
validation.validateEmail(email);
```

---

## Barrel Export Policy

### Internal Barrels (Allowed and Encouraged)

Each module MUST have an `index.ts` barrel:

```typescript
// src/core/auth/index.ts
export * from './types';
export * from './functions';

// src/domains/admin/auth/index.ts
export * from './types';
export * from './AdminAuthService';
export * from './AdminAuthController';
export * from './JwtAuthGuard';
export * from './JwtStrategy';
export * from './RolesGuard';
```

### Cross-Module Barrels (Avoid)

**Rule**: Do NOT create convenience re-exports that flatten module boundaries.

```typescript
// ❌ WRONG - Do NOT create src/domains/admin/index.ts that re-exports everything
export * from './auth';
export * from './users';
export * from './service-requests';
// This creates multiple access paths (violates Single-Path rule)
```

```typescript
// ✅ CORRECT - Consumers import specific modules
import * as adminAuth from '../domains/admin/auth';
import * as adminUsers from '../domains/admin/users';
```

---

## Refactoring Plan for Existing Code

### Current Structure (Non-Compliant) ❌

```
src/domains/admin/
├── controllers/
│   ├── mechanics.controller.ts
│   ├── reviews.controller.ts
│   └── skills.controller.ts
├── services/
│   └── admin.service.ts          # Monolithic service
└── admin.module.ts
```

**Problems**:
- ❌ No `types.ts` files
- ❌ No `functions.ts` files
- ❌ No `index.ts` barrels
- ❌ Monolithic `AdminService` (violates Single Responsibility)
- ❌ Controllers in separate directory (should be co-located with services)

---

### Target Structure (Compliant) ✅

```
src/domains/admin/
├── types.ts                  # NEW
├── functions.ts              # NEW
├── index.ts                  # NEW
├── auth/                     # NEW (entire module)
├── users/                    # NEW (entire module)
├── service-requests/         # NEW (entire module)
├── analytics/                # NEW (entire module)
│
├── mechanics/                # REFACTOR
│   ├── types.ts              # NEW
│   ├── functions.ts          # NEW
│   ├── AdminMechanicsService.ts    # EXTRACT from AdminService
│   ├── AdminMechanicsController.ts # MOVE from controllers/
│   └── index.ts              # NEW
│
├── reviews/                  # REFACTOR
│   ├── types.ts              # NEW
│   ├── functions.ts          # NEW
│   ├── AdminReviewsService.ts      # EXTRACT from AdminService
│   ├── AdminReviewsController.ts   # MOVE from controllers/
│   └── index.ts              # NEW
│
└── skills/                   # REFACTOR
    ├── types.ts              # NEW
    ├── functions.ts          # NEW
    ├── AdminSkillsService.ts       # EXTRACT from AdminService
    ├── AdminSkillsController.ts    # MOVE from controllers/
    └── index.ts              # NEW
```

**Improvements**:
- ✅ All modules have `types.ts` / `functions.ts` / `index.ts`
- ✅ Services and controllers co-located in same module
- ✅ Monolithic `AdminService` split into focused services
- ✅ Barrel exports enforce module boundaries

---

## Frontend Module Structure (web/src/app/admin/)

```
web/src/app/admin/
├── models/                   # TypeScript interfaces (like types.ts)
│   ├── admin-user.model.ts
│   ├── service-request.model.ts
│   ├── analytics.model.ts
│   └── index.ts              # Barrel
│
├── services/                 # Angular services (like PascalCase.ts)
│   ├── admin-auth.service.ts
│   ├── admin-users.service.ts
│   ├── service-requests.service.ts
│   ├── analytics.service.ts
│   └── index.ts              # Barrel
│
├── guards/                   # Route guards (like PascalCase.ts)
│   ├── admin-auth.guard.ts
│   ├── role.guard.ts
│   └── index.ts              # Barrel
│
├── interceptors/             # HTTP interceptors (like PascalCase.ts)
│   ├── jwt.interceptor.ts
│   ├── error.interceptor.ts
│   └── index.ts              # Barrel
│
├── components/               # UI components (like PascalCase.ts)
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   ├── dashboard.component.html
│   │   ├── dashboard.component.scss
│   │   └── dashboard.component.spec.ts
│   ├── login/
│   ├── service-requests/
│   ├── admin-users/
│   ├── mechanics/
│   ├── reviews/
│   └── skills/
│
├── admin-routing.module.ts
├── admin.module.ts
└── index.ts                  # Barrel (optional)
```

**Angular Adaptation**:
- `models/` = `types.ts` (interfaces)
- `services/` = `PascalCase.ts` (constructs)
- `guards/` = `PascalCase.ts` (constructs)
- `interceptors/` = `PascalCase.ts` (constructs)
- `components/` = `PascalCase.ts` (constructs)
- Barrel exports (`index.ts`) in each directory

---

## Compliance Checklist

### Pure Capability Modules (src/core/**)

- [x] `types.ts` exists (public contract)
- [x] `functions.ts` exists (helpers)
- [x] `index.ts` exists (barrel exports)
- [x] No `PascalCase.ts` files (pure capability)
- [x] Located in `src/core/**`
- [x] Canonical types reused (no bespoke cross-cutting types)
- [x] Module-as-unit import documented

### Construct Modules (src/domains/admin/**)

- [x] `types.ts` exists (public contract)
- [x] `functions.ts` exists (shared helpers)
- [x] `PascalCase.ts` files exist (one per construct)
- [x] `index.ts` exists (barrel exports)
- [x] Located outside `src/core/**`
- [x] Canonical types reused (imported from `src/core/**`)
- [x] Module-as-unit import documented
- [x] Utility promotion rules documented

### Layering Rules

- [x] Pure capability modules do NOT contain constructs
- [x] Construct modules do NOT leak implementation details
- [x] Canonical types in `src/core/**` reused consistently
- [x] No convenience re-exports that violate Single-Path rule

---

## Phase 0 Task 3 Completion Checklist

- [x] **Module structure designed** - Complete folder/file tree
- [x] **Pure capability modules identified** - 6 modules in `src/core/**`
- [x] **Construct modules identified** - 7 modules in `src/domains/admin/**`
- [x] **File skeletons provided** - `types.ts`, `functions.ts`, `PascalCase.ts`, `index.ts`
- [x] **Consumption patterns documented** - Namespace imports, barrel exports
- [x] **Utility promotion rules documented** - When to move helpers
- [x] **Refactoring plan provided** - Existing code → Target structure
- [x] **Frontend structure provided** - Angular module layout
- [x] **Compliance checklist complete** - All requirements verified

---

## Approval Gates

### Human Approval Required ✅

Before proceeding to Task 4 (Security Requirements):

- [ ] Approve module structure for `src/core/**` (6 pure capability modules)
- [ ] Approve module structure for `src/domains/admin/**` (7 construct modules)
- [ ] Approve refactoring plan for existing code (mechanics, reviews, skills)
- [ ] Approve frontend module structure (`web/src/app/admin/**`)
- [ ] Approve consumption patterns (namespace imports, barrel exports)

**STOP if**: Approval not obtained for module layout.

---

## Next Steps

**Task 4**: Define Security Requirements
- JWT configuration (access: 15min, refresh: 7 days)
- RBAC role hierarchy (super-admin, admin, moderator)
- Rate limiting (100 req/15min per IP)
- Password hashing (bcrypt cost 12)
- CSRF protection
- Security headers (helmet.js)
- Audit logging

**Task 5**: Define Test Strategy
- 80/15/5 test pyramid (unit/integration/E2E)
- AAA pattern (Arrange-Act-Assert)
- Coverage requirements (≥85%)
- Test infrastructure (Jest, Jasmine/Karma)

---

## References

- **CLAUDE.md** (Lines 306-346) - Module File Layout
- **docs/skills/module-layout-enforcer.md** - Module Layout Enforcer skill
- **docs/skills/canonical-type-reuse.md** - Canonical Type Reuse skill
- **docs/admin/CANONICAL_TYPE_ANALYSIS.md** - Canonical types identified (Task 2)

---

**Document Version**: 1.0  
**Date**: 2025-12-26  
**Status**: 🟡 **DRAFT - AWAITING HUMAN APPROVAL**  
**Authority**: docs/skills/module-layout-enforcer.md, CLAUDE.md  
**Next Action**: Human approval for module layout design

---

## End of Module Layout Design
