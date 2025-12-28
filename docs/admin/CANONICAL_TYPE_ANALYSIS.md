# Admin Dashboard Canonical Type Analysis
# Phase 0 Task 2: Canonical Type Reuse Skill Applied
# Date: 2025-12-26
# Status: Draft - Awaiting Human Approval
# Authority: docs/skills/canonical-type-reuse.md, CLAUDE.md (Lines 268-280)

---

## Purpose

This document applies the **Canonical Type Reuse skill** to identify cross-cutting concerns in the admin dashboard and propose canonical types following the constitutional principle:

> **One concept → One canonical type**

---

## Cross-Cutting Concerns Identified

From the YAML API contracts (`ADMIN_API_CONTRACTS.yaml`), the following cross-cutting concerns were identified:

| Concern | Occurrences | Current Approach | Canonical Solution |
|---------|-------------|------------------|-------------------|
| **Authentication** | 4 endpoints | Bespoke JWT handling | ✅ Create `auth` canonical module |
| **Pagination** | 5 endpoints | Repeated structure | ✅ Create `pagination` canonical type |
| **Validation** | 31 endpoints | Inline validation | ✅ Create `validation` canonical module |
| **Error Handling** | 31 endpoints | Repeated error structure | ✅ Create `error` canonical module |
| **Audit Logging** | 15+ operations | Not implemented | ✅ Create `audit` canonical module |
| **Date/Time** | All responses | ISO 8601 strings | ✅ Use built-in Date (no canonical needed) |
| **Money/Currency** | Payment endpoints | Integer cents | ✅ Create `money` canonical type |

---

## Concern Classification

### 1. Authentication (Cross-Cutting) ✅

**Why cross-cutting**: JWT authentication is used across ALL admin endpoints (except `/admin/auth/login`).

**Occurrences**:
- JWT access token generation (login, refresh)
- JWT refresh token generation (login)
- JWT validation (all protected routes)
- JWT payload structure (sub, email, role)

**Canonical Type Decision**: 
- ✅ **Create canonical `auth` module** at `src/core/auth/`
- ✅ **Direct reuse** in all admin endpoints

**Proposed Canonical Types**:

```typescript
// src/core/auth/types.ts

/**
 * JWT configuration for token generation.
 * 
 * Canonical type for JWT-based authentication.
 * 
 * @canonical Cross-cutting authentication concern
 */
export interface JwtConfig {
  /**
   * JWT secret key for signing tokens.
   */
  readonly secret: string;

  /**
   * Access token expiry duration.
   * 
   * @default "15m" (15 minutes)
   */
  readonly accessTokenExpiresIn: string;

  /**
   * Refresh token expiry duration.
   * 
   * @default "7d" (7 days)
   */
  readonly refreshTokenExpiresIn: string;

  /**
   * JWT issuer identifier.
   * 
   * @optional
   */
  readonly issuer?: string;

  /**
   * JWT audience identifier.
   * 
   * @optional
   */
  readonly audience?: string;
}

/**
 * JWT payload structure.
 * 
 * Canonical type for decoded JWT tokens.
 * 
 * @canonical Cross-cutting authentication concern
 */
export interface JwtPayload {
  /**
   * Subject (user ID).
   */
  readonly sub: string;

  /**
   * User email address.
   */
  readonly email: string;

  /**
   * User role.
   */
  readonly role: string;

  /**
   * Issued at timestamp (Unix time).
   * 
   * @optional (added by JWT library)
   */
  readonly iat?: number;

  /**
   * Expiration timestamp (Unix time).
   * 
   * @optional (added by JWT library)
   */
  readonly exp?: number;
}

/**
 * Authentication tokens response.
 * 
 * Canonical type for login/refresh responses.
 * 
 * @canonical Cross-cutting authentication concern
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

**Access Path**:
```typescript
// Consumer usage
import * as auth from '../../../core/auth';

interface LoginResponse {
  readonly tokens: auth.AuthTokens;
  readonly user: AdminUserResponse;
}
```

**Approval Gate**: ✅ Human approval required before creating `src/core/auth/` module.

---

### 2. Pagination (Cross-Cutting) ✅

**Why cross-cutting**: Pagination is used in 5+ list endpoints (service requests, mechanics, reviews, admin users, analytics).

**Occurrences**:
- GET /admin/service-requests (pagination)
- GET /admin/mechanics (pagination)
- GET /admin/reviews (pagination)
- GET /admin/users (pagination)
- GET /admin/skills (pagination in future)

**Canonical Type Decision**:
- ✅ **Create canonical `pagination` module** at `src/core/pagination/`
- ✅ **Direct reuse** in all list endpoints

**Proposed Canonical Types**:

```typescript
// src/core/pagination/types.ts

/**
 * Pagination query parameters.
 * 
 * Canonical type for paginated list requests.
 * 
 * @canonical Cross-cutting pagination concern
 */
export interface PaginationQuery {
  /**
   * Page number (1-indexed).
   * 
   * @default 1
   * @validation ≥ 1
   */
  readonly page: number;

  /**
   * Items per page.
   * 
   * @default 20
   * @validation 1-100
   */
  readonly limit: number;
}

/**
 * Pagination response metadata.
 * 
 * Canonical type for paginated list responses.
 * 
 * @canonical Cross-cutting pagination concern
 */
export interface PaginationMeta {
  /**
   * Current page number (1-indexed).
   */
  readonly page: number;

  /**
   * Items per page.
   */
  readonly limit: number;

  /**
   * Total number of items across all pages.
   */
  readonly total: number;

  /**
   * Total number of pages.
   * 
   * Calculated as: Math.ceil(total / limit)
   */
  readonly totalPages: number;
}

/**
 * Paginated response wrapper.
 * 
 * Canonical type for paginated list responses.
 * 
 * @canonical Cross-cutting pagination concern
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for current page.
   */
  readonly data: ReadonlyArray<T>;

  /**
   * Pagination metadata.
   */
  readonly pagination: PaginationMeta;
}
```

**Access Path**:
```typescript
// Consumer usage
import * as pagination from '../../../core/pagination';

async getMechanics(
  query: pagination.PaginationQuery
): Promise<pagination.PaginatedResponse<MechanicResponse>> {
  // Implementation
}
```

**Approval Gate**: ✅ Human approval required before creating `src/core/pagination/` module.

---

### 3. Validation (Cross-Cutting) ✅

**Why cross-cutting**: Input validation is required on ALL 31 endpoints (fail-fast principle).

**Occurrences**:
- Email validation (login, admin user creation)
- Password validation (min 8 chars)
- Number range validation (pagination, amounts)
- Enum validation (status, role, sort order)
- CUID validation (resource IDs)

**Canonical Type Decision**:
- ✅ **Create canonical `validation` module** at `src/core/validation/`
- ✅ **Direct reuse** via validation functions (not types)

**Proposed Canonical Functions**:

```typescript
// src/core/validation/functions.ts

/**
 * Validate email format.
 * 
 * Canonical validation function for email addresses.
 * 
 * @canonical Cross-cutting validation concern
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength.
 * 
 * Canonical validation function for passwords.
 * 
 * @canonical Cross-cutting validation concern
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns true if valid, false otherwise
 */
export function validatePassword(password: string, minLength = 8): boolean {
  return password && password.length >= minLength;
}

/**
 * Validate CUID format.
 * 
 * Canonical validation function for CUID identifiers.
 * 
 * @canonical Cross-cutting validation concern
 * @param id - CUID to validate
 * @returns true if valid, false otherwise
 */
export function validateCuid(id: string): boolean {
  // CUID format: c + 24 characters (lowercase alphanumeric)
  const cuidRegex = /^c[0-9a-z]{24}$/;
  return cuidRegex.test(id);
}

/**
 * Validate number range.
 * 
 * Canonical validation function for numeric ranges.
 * 
 * @canonical Cross-cutting validation concern
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if valid, false otherwise
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Validate enum value.
 * 
 * Canonical validation function for enum values.
 * 
 * @canonical Cross-cutting validation concern
 * @param value - Value to validate
 * @param allowedValues - Array of allowed enum values
 * @returns true if valid, false otherwise
 */
export function validateEnum<T>(value: T, allowedValues: ReadonlyArray<T>): boolean {
  return allowedValues.includes(value);
}
```

**Access Path**:
```typescript
// Consumer usage
import * as validation from '../../../core/validation';

// Fail-fast validation
if (!validation.validateEmail(email)) {
  throw new BadRequestException('Invalid email format');
}

if (!validation.validatePassword(password)) {
  throw new BadRequestException('Password must be at least 8 characters');
}
```

**Approval Gate**: ✅ Human approval required before creating `src/core/validation/` module.

---

### 4. Error Handling (Cross-Cutting) ✅

**Why cross-cutting**: Standardized error responses are required across ALL 31 endpoints.

**Occurrences**:
- 400 Bad Request (validation errors)
- 401 Unauthorized (authentication errors)
- 403 Forbidden (authorization errors)
- 404 Not Found (resource not found)
- 429 Too Many Requests (rate limiting)
- 500 Internal Server Error (unexpected errors)

**Canonical Type Decision**:
- ✅ **Create canonical `error` module** at `src/core/error/`
- ✅ **Direct reuse** in all error responses

**Proposed Canonical Types**:

```typescript
// src/core/error/types.ts

/**
 * Standard error response format.
 * 
 * Canonical type for API error responses.
 * 
 * @canonical Cross-cutting error handling concern
 */
export interface ErrorResponse {
  /**
   * HTTP status code.
   */
  readonly statusCode: number;

  /**
   * Error code (UPPERCASE_SNAKE_CASE).
   */
  readonly code: string;

  /**
   * Human-readable error message.
   */
  readonly message: string;

  /**
   * Additional error details (optional).
   */
  readonly details?: unknown;

  /**
   * ISO 8601 timestamp.
   */
  readonly timestamp: string;

  /**
   * Request path.
   */
  readonly path: string;
}

/**
 * Error codes enumeration.
 * 
 * Canonical enum for standardized error codes.
 * 
 * @canonical Cross-cutting error handling concern
 */
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
```

**Access Path**:
```typescript
// Consumer usage
import * as error from '../../../core/error';

// Throw standardized error
throw {
  statusCode: 400,
  code: error.ErrorCode.BAD_REQUEST,
  message: 'Invalid email format',
  timestamp: new Date().toISOString(),
  path: '/admin/auth/login',
} as error.ErrorResponse;
```

**Approval Gate**: ✅ Human approval required before creating `src/core/error/` module.

---

### 5. Audit Logging (Cross-Cutting) ✅

**Why cross-cutting**: Audit logging is required for security-sensitive operations (create/update/delete admin users, payment operations, etc.).

**Occurrences**:
- Admin user creation (who created whom)
- Admin user updates (who updated what)
- Admin user deletion (who deleted whom)
- Payment capture (who captured payment)
- Payment finalization (who finalized payment)
- Service request cancellation (who cancelled and why)

**Canonical Type Decision**:
- ✅ **Create canonical `audit` module** at `src/core/audit/`
- ✅ **Direct reuse** for all audit logging

**Proposed Canonical Types**:

```typescript
// src/core/audit/types.ts

/**
 * Audit log entry.
 * 
 * Canonical type for security audit logging.
 * 
 * @canonical Cross-cutting audit logging concern
 */
export interface AuditLogEntry {
  /**
   * Unique audit log ID.
   */
  readonly id: string;

  /**
   * Timestamp of the action.
   */
  readonly timestamp: string;

  /**
   * User who performed the action.
   */
  readonly actor: AuditActor;

  /**
   * Action performed.
   */
  readonly action: string;

  /**
   * Resource affected by the action.
   */
  readonly resource: AuditResource;

  /**
   * IP address of the actor.
   */
  readonly ipAddress?: string;

  /**
   * User agent of the actor.
   */
  readonly userAgent?: string;

  /**
   * Additional metadata (optional).
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Audit actor (user who performed action).
 * 
 * Canonical type for audit log actor.
 * 
 * @canonical Cross-cutting audit logging concern
 */
export interface AuditActor {
  /**
   * User ID.
   */
  readonly id: string;

  /**
   * User email.
   */
  readonly email: string;

  /**
   * User role.
   */
  readonly role: string;
}

/**
 * Audit resource (resource affected by action).
 * 
 * Canonical type for audit log resource.
 * 
 * @canonical Cross-cutting audit logging concern
 */
export interface AuditResource {
  /**
   * Resource type (e.g., "AdminUser", "ServiceRequest").
   */
  readonly type: string;

  /**
   * Resource ID.
   */
  readonly id: string;

  /**
   * Changed fields (before → after).
   * 
   * @optional (only for update actions)
   */
  readonly changes?: Record<string, { before: unknown; after: unknown }>;
}
```

**Access Path**:
```typescript
// Consumer usage
import * as audit from '../../../core/audit';

// Log admin user creation
const auditEntry: audit.AuditLogEntry = {
  id: generateCuid(),
  timestamp: new Date().toISOString(),
  actor: {
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
  },
  action: 'ADMIN_USER_CREATED',
  resource: {
    type: 'AdminUser',
    id: newUser.id,
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
};
```

**Approval Gate**: ✅ Human approval required before creating `src/core/audit/` module.

---

### 6. Money/Currency (Cross-Cutting) ✅

**Why cross-cutting**: Money amounts are used in payment endpoints (service requests, analytics).

**Occurrences**:
- Service request amounts (initial, final)
- Revenue analytics (total revenue, revenue per day)
- Mechanic payouts (payout amounts)

**Canonical Type Decision**:
- ✅ **Create canonical `money` module** at `src/core/money/`
- ✅ **Direct reuse** for all monetary values

**Proposed Canonical Types**:

```typescript
// src/core/money/types.ts

/**
 * Money amount in cents.
 * 
 * Canonical type for monetary values.
 * 
 * @canonical Cross-cutting money/currency concern
 */
export interface Money {
  /**
   * Amount in smallest currency unit (cents for USD).
   * 
   * @validation ≥ 0
   */
  readonly amountCents: number;

  /**
   * Currency code (ISO 4217).
   * 
   * @default "USD"
   */
  readonly currency: string;
}

/**
 * Money range (min and max amounts).
 * 
 * Canonical type for monetary ranges.
 * 
 * @canonical Cross-cutting money/currency concern
 */
export interface MoneyRange {
  /**
   * Minimum amount.
   */
  readonly min: Money;

  /**
   * Maximum amount.
   */
  readonly max: Money;
}
```

**Proposed Canonical Functions**:

```typescript
// src/core/money/functions.ts

/**
 * Convert cents to dollars.
 * 
 * Canonical function for money conversion.
 * 
 * @canonical Cross-cutting money/currency concern
 * @param cents - Amount in cents
 * @returns Amount in dollars (2 decimal places)
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents.
 * 
 * Canonical function for money conversion.
 * 
 * @canonical Cross-cutting money/currency concern
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format money amount for display.
 * 
 * Canonical function for money formatting.
 * 
 * @canonical Cross-cutting money/currency concern
 * @param money - Money amount
 * @returns Formatted string (e.g., "$60.00")
 */
export function formatMoney(money: Money): string {
  const dollars = centsToDollars(money.amountCents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
  }).format(dollars);
}
```

**Access Path**:
```typescript
// Consumer usage
import * as money from '../../../core/money';

interface ServiceRequestResponse {
  readonly amount: money.Money;
  readonly finalAmount?: money.Money;
}

// Format for display
const formatted = money.formatMoney(serviceRequest.amount);  // "$60.00"
```

**Approval Gate**: ✅ Human approval required before creating `src/core/money/` module.

---

### 7. Date/Time (NOT Cross-Cutting) ❌

**Why NOT cross-cutting**: TypeScript/JavaScript has built-in `Date` type and ISO 8601 string format is standard.

**Decision**: 
- ❌ **No canonical type needed**
- ✅ **Use built-in `Date` and ISO 8601 strings**

**Rationale**: Creating a canonical date/time type would add unnecessary abstraction. TypeScript's `Date` and ISO 8601 strings are already canonical.

---

## Proposed Canonical Module Structure

Following CLAUDE.md (Lines 306-346), all canonical modules will be created under `src/core/`:

```
src/core/
├── auth/
│   ├── types.ts              # JwtConfig, JwtPayload, AuthTokens
│   ├── functions.ts          # JWT generation/validation helpers
│   └── index.ts              # Barrel exports
│
├── pagination/
│   ├── types.ts              # PaginationQuery, PaginationMeta, PaginatedResponse
│   ├── functions.ts          # Pagination calculation helpers
│   └── index.ts              # Barrel exports
│
├── validation/
│   ├── types.ts              # ValidationResult (if needed)
│   ├── functions.ts          # validateEmail, validatePassword, etc.
│   └── index.ts              # Barrel exports
│
├── error/
│   ├── types.ts              # ErrorResponse, ErrorCode enum
│   ├── functions.ts          # Error factory functions
│   └── index.ts              # Barrel exports
│
├── audit/
│   ├── types.ts              # AuditLogEntry, AuditActor, AuditResource
│   ├── functions.ts          # Audit log creation helpers
│   └── index.ts              # Barrel exports
│
└── money/
    ├── types.ts              # Money, MoneyRange
    ├── functions.ts          # centsToDollars, dollarsToCents, formatMoney
    └── index.ts              # Barrel exports
```

**Module Layout Compliance**: ✅ Follows constitutional requirement:
> "Pure capability modules: types.ts, functions.ts, index.ts"

**Path Convention Compliance**: ✅ Follows constitutional requirement:
> "`src/core/**` is reserved for pure capability modules and canonical shared types"

---

## Consumption Patterns

### Namespace Import (Required)

All canonical modules MUST be consumed via namespace imports (not piecemeal):

```typescript
// ✅ CORRECT (namespace import)
import * as auth from '../../../core/auth';
import * as pagination from '../../../core/pagination';
import * as validation from '../../../core/validation';

// Then use:
const payload: auth.JwtPayload = { ... };
const query: pagination.PaginationQuery = { ... };
validation.validateEmail(email);
```

```typescript
// ❌ WRONG (piecemeal import)
import { JwtPayload } from '../../../core/auth/types';
import { PaginationQuery } from '../../../core/pagination/types';
import { validateEmail } from '../../../core/validation/functions';
```

### Barrel Exports (Required)

Each canonical module MUST have an `index.ts` barrel export:

```typescript
// src/core/auth/index.ts

export * from './types';
export * from './functions';
```

---

## Admin Dashboard Type Mapping

### Before (Bespoke Types) ❌

```typescript
// src/domains/admin/auth/types.ts (BEFORE - bespoke)

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUserResponse;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
```

### After (Canonical Types) ✅

```typescript
// src/domains/admin/auth/types.ts (AFTER - canonical reuse)

import * as auth from '../../../core/auth';

interface LoginResponse {
  readonly tokens: auth.AuthTokens;  // ✅ Canonical
  readonly user: AdminUserResponse;
}

// JwtPayload is now imported from core:
// use auth.JwtPayload directly (no re-export)
```

---

## Summary of Canonical Types

| Canonical Module | Types | Functions | Status |
|------------------|-------|-----------|--------|
| **auth** | JwtConfig, JwtPayload, AuthTokens | generateJwt, verifyJwt | 🟡 To be created |
| **pagination** | PaginationQuery, PaginationMeta, PaginatedResponse<T> | calculatePagination | 🟡 To be created |
| **validation** | - | validateEmail, validatePassword, validateCuid, validateNumberRange, validateEnum | 🟡 To be created |
| **error** | ErrorResponse, ErrorCode enum | createErrorResponse | 🟡 To be created |
| **audit** | AuditLogEntry, AuditActor, AuditResource | createAuditLog | 🟡 To be created |
| **money** | Money, MoneyRange | centsToDollars, dollarsToCents, formatMoney | 🟡 To be created |

**Total Canonical Modules**: 6  
**Total Canonical Types**: 16  
**Total Canonical Functions**: 15+

---

## Bespoke Types Eliminated

By introducing canonical types, the following bespoke types are eliminated:

| Bespoke Type (Before) | Canonical Type (After) | Benefit |
|----------------------|------------------------|---------|
| `LoginResponse.accessToken` | `auth.AuthTokens` | Single JWT token structure |
| `LoginResponse.refreshToken` | `auth.AuthTokens` | Single JWT token structure |
| Inline `JwtPayload` definitions | `auth.JwtPayload` | Single JWT payload structure |
| Inline pagination objects | `pagination.PaginatedResponse<T>` | Single pagination structure |
| Inline pagination query params | `pagination.PaginationQuery` | Single pagination query structure |
| Inline error objects | `error.ErrorResponse` | Single error structure |
| Inline validation functions | `validation.*` functions | Reusable validation logic |
| Inline money amounts | `money.Money` | Type-safe money handling |

**Total Bespoke Types Eliminated**: 8+

---

## Phase 0 Task 2 Completion Checklist

- [x] **Classify concerns** - 7 concerns classified (6 canonical, 1 built-in)
- [x] **Search for existing canonical types** - None found (new project)
- [x] **Propose canonical types** - 6 canonical modules proposed
- [x] **Define module structure** - `src/core/*` structure defined
- [x] **Define access paths** - Namespace imports documented
- [x] **Document consumption patterns** - Examples provided
- [x] **Identify bespoke types eliminated** - 8+ bespoke types eliminated

---

## Approval Gates

### Human Approval Required ✅

Before proceeding to Task 3 (Module Layout Enforcer):

- [ ] Approve creation of `src/core/` directory
- [ ] Approve `auth` canonical module (JwtConfig, JwtPayload, AuthTokens)
- [ ] Approve `pagination` canonical module (PaginationQuery, PaginationMeta, PaginatedResponse)
- [ ] Approve `validation` canonical module (validation functions)
- [ ] Approve `error` canonical module (ErrorResponse, ErrorCode)
- [ ] Approve `audit` canonical module (AuditLogEntry, AuditActor, AuditResource)
- [ ] Approve `money` canonical module (Money, MoneyRange, conversion functions)

**STOP if**: Approval not obtained for any canonical module.

---

## Next Steps

**Task 3**: Apply Module Layout Enforcer skill
- Design module structure for `src/domains/admin/`
- Validate types.ts / functions.ts / PascalCase.ts / index.ts pattern
- Document barrel exports
- Document namespace imports

**Task 4**: Define Security Requirements
- Complete security-by-default checklist
- JWT configuration details
- RBAC role hierarchy
- Rate limiting configuration

**Task 5**: Define Test Strategy
- 80/15/5 test pyramid
- AAA pattern enforcement
- Coverage requirements (≥85%)

---

## References

- **CLAUDE.md** (Lines 268-280) - Canonical Types and Reuse
- **CLAUDE.md** (Lines 306-346) - Module File Layout
- **docs/skills/canonical-type-reuse.md** - Canonical Type Reuse skill
- **docs/skills/interface-designer.md** - Interface Designer skill
- **docs/admin/ADMIN_API_CONTRACTS.yaml** - API contracts (source of cross-cutting concerns)

---

**Document Version**: 1.0  
**Date**: 2025-12-26  
**Status**: 🟡 **DRAFT - AWAITING HUMAN APPROVAL**  
**Authority**: docs/skills/canonical-type-reuse.md, CLAUDE.md  
**Next Action**: Human approval for canonical module creation

---

## End of Canonical Type Analysis
