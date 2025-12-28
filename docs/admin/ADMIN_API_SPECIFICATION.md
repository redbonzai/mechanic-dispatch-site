# Admin API Specification (Constitutional Compliance)

**Version**: 2.0  
**Date**: December 25, 2025  
**Status**: 🟡 **PHASE 0 DELIVERABLE** (To be completed via Interface Designer skill)  
**Authority**: CLAUDE.md, docs/skills/interface-designer.md

---

## ⚠️ Critical Notice

This document will be completed during **Phase 0** by applying the **Interface Designer skill** (docs/skills/interface-designer.md).

**Current Status**: Requirements documented  
**Phase 0 Goal**: Convert to YAML interface contracts  
**Authority**: CLAUDE.md (Lines 416-438), docs/skills/interface-designer.md

**Fail-Closed Principle**: All API contracts MUST be approved before implementation begins.

---

## Table of Contents

1. [Constitutional Framework](#constitutional-framework)
2. [Interface Design Workflow](#interface-design-workflow)
3. [API Requirements Summary](#api-requirements-summary)
4. [Authentication API Requirements](#authentication-api-requirements)
5. [Service Requests API Requirements](#service-requests-api-requirements)
6. [Mechanics API Requirements](#mechanics-api-requirements)
7. [Reviews API Requirements](#reviews-api-requirements)
8. [Skills API Requirements](#skills-api-requirements)
9. [Analytics API Requirements](#analytics-api-requirements)
10. [Admin Users API Requirements](#admin-users-api-requirements)
11. [Error Handling Requirements](#error-handling-requirements)
12. [Security Requirements](#security-requirements)
13. [Canonical Types](#canonical-types)
14. [Phase 0 Deliverables](#phase-0-deliverables)

---

## Constitutional Framework

This specification derives authority from:

### Primary Authority: docs/skills/interface-designer.md

From Interface Designer skill:
> "This skill is interface-first and optimized for:
> - long-term evolution
> - multi-team consumption
> - composition over inheritance
> - canonical type reuse (no reinvention)"

**Workflow (Hard Requirement)**:
1. **Phase 1: Conversational design** - Enumerate requirements with human
2. **Phase 2: YAML interface contract** - Produce fully commented YAML
3. **Phase 3: Handoff for implementation** - Mapping table, canonical types, approval gates

### Supporting Authority: CLAUDE.md

- **Fail-Closed Principle** (Lines 538-546): STOP when uncertain
- **Canonical Types** (Lines 268-280): Reuse cross-cutting types
- **Security-by-Default** (Lines 183-215): All defaults secure
- **Quality Gates** (Lines 217-266): Approval gates mandatory

### Supporting Authority: docs/standards/common/

- **naming.md**: Singular/plural, presence = enablement
- **types.md**: Canonical type catalog
- **security.md**: Security-by-default checklist

---

## Interface Design Workflow

**Phase 0 Workflow** (Apply Interface Designer Skill):

```
┌─────────────────────────────────────────────┐
│ Step 1: Conversational Design               │
│ - Review requirements (this document)       │
│ - Enumerate constraints per endpoint        │
│ - Identify extension points                 │
│ - Decide required vs optional fields        │
│ - Call out non-goals and out-of-scope       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Step 2: YAML Interface Contracts            │
│ - Convert to fully commented YAML           │
│ - Include example values                    │
│ - Document validation rules                 │
│ - Document error responses                  │
│ - Note stability and evolution              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Step 3: Handoff Package                     │
│ - Final YAML contracts                      │
│ - Mapping table: YAML → TypeScript          │
│ - Canonical type imports                    │
│ - Approval gates                            │
└─────────────────────────────────────────────┘
                    ↓
           ✅ HUMAN APPROVAL
           (Proceed to Phase 1: TDD)
```

**STOP Conditions**:
- ❌ Requirements ambiguous → STOP and ask
- ❌ Canonical type unclear → STOP and ask
- ❌ Security requirement missing → STOP and ask
- ❌ Human approval not obtained → STOP

---

## API Requirements Summary

### Base URL

```
Development: http://localhost:3000
Production: https://api.mechanicdispatch.com
```

### Authentication

All endpoints (except `/admin/auth/login`) require JWT authentication:

```
Authorization: Bearer <access_token>
```

**Token Expiry**:
- Access token: 15 minutes
- Refresh token: 7 days

**Security**:
- httpOnly cookies for token storage (XSS prevention)
- CSRF protection enabled
- Rate limiting: 100 requests per 15 minutes per IP

---

### API Endpoints Overview

| Category | Endpoint | Method | Status |
|----------|----------|--------|--------|
| **Authentication** | /admin/auth/login | POST | ✅ Exists (needs YAML) |
| | /admin/auth/logout | POST | ❌ New |
| | /admin/auth/refresh | POST | ❌ New |
| | /admin/auth/profile | GET | ❌ New |
| **Service Requests** | /admin/service-requests | GET | ❌ New |
| | /admin/service-requests/:id | GET | ❌ New |
| | /admin/service-requests/:id | PUT | ❌ New |
| | /admin/service-requests/:id/capture | POST | ❌ New |
| | /admin/service-requests/:id/cancel | POST | ❌ New |
| | /admin/service-requests/:id/finalize | POST | ❌ New |
| | /admin/service-requests/:id/work-logs | POST | ❌ New |
| **Mechanics** | /admin/mechanics | GET | ✅ Exists (needs YAML) |
| | /admin/mechanics/:id | GET | ✅ Exists (needs YAML) |
| | /admin/mechanics | POST | ✅ Exists (needs YAML) |
| | /admin/mechanics/:id | PUT | ✅ Exists (needs YAML) |
| | /admin/mechanics/:id | DELETE | ✅ Exists (needs YAML) |
| **Reviews** | /admin/reviews | GET | ❌ New |
| | /admin/reviews/:id | GET | ❌ New |
| | /admin/reviews | POST | ✅ Exists (needs YAML) |
| | /admin/reviews/:id | PUT | ✅ Exists (needs YAML) |
| | /admin/reviews/:id | DELETE | ✅ Exists (needs YAML) |
| **Skills** | /admin/skills | GET | ✅ Exists (needs YAML) |
| | /admin/skills | POST | ❌ New |
| | /admin/skills/:id | PUT | ❌ New |
| | /admin/skills/:id | DELETE | ❌ New |
| **Analytics** | /admin/analytics/overview | GET | ❌ New |
| | /admin/analytics/revenue | GET | ❌ New |
| | /admin/analytics/mechanics | GET | ❌ New |
| **Admin Users** | /admin/users | GET | ❌ New |
| | /admin/users/:id | GET | ❌ New |
| | /admin/users | POST | ❌ New |
| | /admin/users/:id | PUT | ❌ New |
| | /admin/users/:id | DELETE | ❌ New |

**Total Endpoints**: 31  
**Existing**: 9  
**New**: 22

---

## Authentication API Requirements

### POST /admin/auth/login

**Purpose**: Authenticate admin user and receive JWT tokens.

**Requirements**:
- Email and password authentication
- Return access token (15min) + refresh token (7 days)
- Fail-fast validation (email format, password length)
- Account lockout after 5 failed attempts (15 min lockout)
- Rate limiting (100 requests per 15 min per IP)

**Request Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 characters |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT access token (expires 15min) |
| refreshToken | string | JWT refresh token (expires 7 days) |
| user | object | Admin user profile |
| user.id | string | User ID (CUID) |
| user.email | string | User email |
| user.name | string | User name |
| user.role | enum | 'super-admin' \| 'admin' \| 'moderator' |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Email and password are required |
| 400 | BAD_REQUEST | Invalid email format |
| 400 | BAD_REQUEST | Password must be at least 8 characters |
| 401 | UNAUTHORIZED | Invalid credentials |
| 401 | UNAUTHORIZED | Account is locked due to too many failed attempts |
| 401 | UNAUTHORIZED | Account is inactive |
| 429 | TOO_MANY_REQUESTS | Too many login attempts. Please try again in 15 minutes. |

**Security Considerations**:
- [ ] bcrypt password hashing (cost factor ≥ 12)
- [ ] Generic error message (don't reveal if email exists)
- [ ] No password in response or logs
- [ ] CSRF protection enabled
- [ ] Rate limiting per IP address

**Phase 0 Deliverable**: YAML interface contract

---

### POST /admin/auth/logout

**Purpose**: Invalidate refresh token (logout).

**Requirements**:
- Invalidate refresh token in database
- No error if token already invalid (idempotent)
- Requires authentication (access token)

**Request Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| refreshToken | string | Yes | Valid JWT format |

**Response**: 
- 200 OK (no body)

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |

**Phase 0 Deliverable**: YAML interface contract

---

### POST /admin/auth/refresh

**Purpose**: Refresh access token using refresh token.

**Requirements**:
- Validate refresh token exists in database
- Check token expiration
- Generate new access token (15min)
- Do NOT generate new refresh token (token rotation disabled for simplicity)

**Request Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| refreshToken | string | Yes | Valid JWT, exists in DB, not expired |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | New JWT access token (expires 15min) |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Refresh token is required |
| 401 | UNAUTHORIZED | Invalid refresh token |
| 401 | UNAUTHORIZED | Refresh token has expired |
| 401 | UNAUTHORIZED | User not found or inactive |

**Phase 0 Deliverable**: YAML interface contract

---

### GET /admin/auth/profile

**Purpose**: Get current admin user profile.

**Requirements**:
- Requires authentication (access token)
- Return current user profile

**Request**: No body (JWT in Authorization header)

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID (CUID) |
| email | string | User email |
| name | string | User name |
| role | enum | 'super-admin' \| 'admin' \| 'moderator' |
| createdAt | string | ISO 8601 timestamp |
| lastLoginAt | string | ISO 8601 timestamp |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 401 | UNAUTHORIZED | Invalid or expired token |

**Phase 0 Deliverable**: YAML interface contract

---

## Service Requests API Requirements

### GET /admin/service-requests

**Purpose**: List all service requests with filtering, sorting, and pagination.

**Requirements**:
- Paginated list (default: 20 per page, max: 100)
- Filter by status, date range, amount range
- Search by customer name, email, phone
- Sort by created date, amount, status
- Requires authentication

**Query Parameters**:
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| page | number | No | 1 | ≥ 1 |
| limit | number | No | 20 | 1-100 |
| status | enum | No | all | PENDING \| AUTHORIZED \| CAPTURED \| CANCELLED \| FAILED \| FINALIZED |
| startDate | string | No | - | ISO 8601 date |
| endDate | string | No | - | ISO 8601 date |
| minAmount | number | No | - | ≥ 0 (in cents) |
| maxAmount | number | No | - | ≥ 0 (in cents) |
| search | string | No | - | Search customer name/email/phone |
| sortBy | enum | No | createdAt | createdAt \| amount \| status |
| sortOrder | enum | No | desc | asc \| desc |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of service requests |
| data[].id | string | Service request ID (CUID) |
| data[].createdAt | string | ISO 8601 timestamp |
| data[].firstName | string | Customer first name |
| data[].lastName | string | Customer last name |
| data[].email | string | Customer email |
| data[].phone | string | Customer phone |
| data[].vehicleMake | string | Vehicle make |
| data[].vehicleModel | string | Vehicle model |
| data[].vehicleYear | number | Vehicle year |
| data[].amountCents | number | Initial amount in cents |
| data[].finalAmountCents | number \| null | Final amount in cents (if finalized) |
| data[].status | enum | Request status |
| data[].stripePaymentIntentId | string \| null | Stripe payment intent ID |
| pagination | object | Pagination metadata |
| pagination.page | number | Current page |
| pagination.limit | number | Items per page |
| pagination.total | number | Total items |
| pagination.totalPages | number | Total pages |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 400 | BAD_REQUEST | Invalid query parameters |

**Phase 0 Deliverable**: YAML interface contract

---

### GET /admin/service-requests/:id

**Purpose**: Get single service request details.

**Requirements**:
- Include all fields from ServiceRequest model
- Include related work logs
- Include related reviews
- Requires authentication

**URL Parameters**:
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| id | string | Yes | Valid CUID |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | Service request ID |
| createdAt | string | ISO 8601 timestamp |
| updatedAt | string | ISO 8601 timestamp |
| firstName | string | Customer first name |
| lastName | string | Customer last name |
| email | string | Customer email |
| phone | string | Customer phone |
| addressLine1 | string | Address line 1 |
| addressLine2 | string \| null | Address line 2 |
| city | string | City |
| state | string | State |
| postalCode | string | Postal code |
| country | string | Country (default: US) |
| vehicleMake | string | Vehicle make |
| vehicleModel | string | Vehicle model |
| vehicleYear | number | Vehicle year |
| amountCents | number | Initial amount in cents |
| finalAmountCents | number \| null | Final amount in cents (if finalized) |
| stripePaymentIntentId | string \| null | Stripe payment intent ID |
| finalPaymentIntentId | string \| null | Stripe final payment intent ID |
| stripeCustomerId | string \| null | Stripe customer ID |
| stripePaymentMethodId | string \| null | Stripe payment method ID |
| status | enum | Request status |
| workLogs | array | Array of work logs |
| reviews | array | Array of reviews |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 404 | NOT_FOUND | Service request not found |

**Phase 0 Deliverable**: YAML interface contract

---

### POST /admin/service-requests/:id/capture

**Purpose**: Capture authorized payment (move from AUTHORIZED → CAPTURED).

**Requirements**:
- Service request must be in AUTHORIZED status
- Capture $60 deposit via Stripe
- Update status to CAPTURED
- Fail-fast validation
- Requires authentication

**URL Parameters**:
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| id | string | Yes | Valid CUID |

**Request**: No body

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | Service request ID |
| status | enum | CAPTURED |
| stripePaymentIntentId | string | Stripe payment intent ID |
| amountCents | number | Captured amount (6000 cents = $60) |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 404 | NOT_FOUND | Service request not found |
| 400 | BAD_REQUEST | Service request is not in AUTHORIZED status |
| 500 | INTERNAL_SERVER_ERROR | Stripe capture failed |

**Security Considerations**:
- [ ] Idempotency (check if already captured)
- [ ] Stripe webhook verification
- [ ] Transaction logging (audit trail)

**Phase 0 Deliverable**: YAML interface contract

---

### POST /admin/service-requests/:id/finalize

**Purpose**: Finalize service request with final amount (create additional charge if needed).

**Requirements**:
- Service request must be in CAPTURED status
- Calculate additional amount if finalAmount > initialAmount
- Create Stripe PaymentIntent for additional charge
- Update status to FINALIZED
- Requires authentication

**URL Parameters**:
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| id | string | Yes | Valid CUID |

**Request Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| finalAmountCents | number | Yes | ≥ initial amount (6000 cents) |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | Service request ID |
| status | enum | FINALIZED |
| finalAmountCents | number | Final amount in cents |
| finalPaymentIntentId | string \| null | Stripe payment intent ID (if additional charge) |
| additionalChargeCents | number | Additional charge amount (finalAmount - initialAmount) |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 404 | NOT_FOUND | Service request not found |
| 400 | BAD_REQUEST | Service request is not in CAPTURED status |
| 400 | BAD_REQUEST | Final amount must be at least initial amount |
| 500 | INTERNAL_SERVER_ERROR | Stripe charge failed |

**Phase 0 Deliverable**: YAML interface contract

---

### POST /admin/service-requests/:id/work-logs

**Purpose**: Add work log to service request.

**Requirements**:
- Record mechanic work hours and payout
- Associate with mechanic (optional)
- Requires authentication

**URL Parameters**:
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| id | string | Yes | Valid CUID |

**Request Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| mechanicId | string | No | Valid CUID (if provided) |
| mechanicName | string | Yes | Non-empty string |
| hoursWorkedMinutes | number | Yes | ≥ 0 (in minutes) |
| payoutPercentage | number | Yes | 0-100 |
| notes | string | No | Max 1000 chars |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | Work log ID (CUID) |
| createdAt | string | ISO 8601 timestamp |
| serviceRequestId | string | Service request ID |
| mechanicId | string \| null | Mechanic ID |
| mechanicName | string | Mechanic name |
| hoursWorkedMinutes | number | Hours worked in minutes |
| payoutPercentage | number | Payout percentage |
| notes | string \| null | Notes |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 404 | NOT_FOUND | Service request not found |
| 400 | BAD_REQUEST | Invalid work log data |

**Phase 0 Deliverable**: YAML interface contract

---

## Mechanics API Requirements

**Note**: Existing endpoints `/admin/mechanics` already exist. Phase 0 will convert to YAML contracts.

### Required Enhancements:
- Add pagination to GET /admin/mechanics
- Add filtering by skills, rating, location
- Add sorting by rating, jobs completed, years experience

**Phase 0 Deliverable**: YAML interface contracts for all mechanics endpoints

---

## Reviews API Requirements

**Note**: POST/PUT/DELETE endpoints exist. GET endpoints are new.

### New Endpoints:
- GET /admin/reviews (list with pagination, filters)
- GET /admin/reviews/:id (detail view)

**Phase 0 Deliverable**: YAML interface contracts for all reviews endpoints

---

## Skills API Requirements

**Note**: GET /admin/skills exists. CRUD operations are new.

### New Endpoints:
- POST /admin/skills (create skill)
- PUT /admin/skills/:id (update skill)
- DELETE /admin/skills/:id (delete skill)

**Phase 0 Deliverable**: YAML interface contracts for all skills endpoints

---

## Analytics API Requirements

### GET /admin/analytics/overview

**Purpose**: Dashboard overview statistics.

**Requirements**:
- Total service requests (all time, this month)
- Active service requests count
- Total mechanics (active/inactive)
- Revenue metrics (total, this month)
- Average rating
- Requires authentication

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| serviceRequests | object | Service request metrics |
| serviceRequests.total | number | Total all time |
| serviceRequests.thisMonth | number | Total this month |
| serviceRequests.active | number | Currently active |
| serviceRequests.byStatus | object | Count by status |
| mechanics | object | Mechanic metrics |
| mechanics.total | number | Total mechanics |
| mechanics.active | number | Active mechanics |
| mechanics.inactive | number | Inactive mechanics |
| revenue | object | Revenue metrics |
| revenue.total | number | Total revenue (cents) |
| revenue.thisMonth | number | This month revenue (cents) |
| reviews | object | Review metrics |
| reviews.total | number | Total reviews |
| reviews.averageRating | number | Average rating (1-5) |

**Phase 0 Deliverable**: YAML interface contract

---

### GET /admin/analytics/revenue

**Purpose**: Revenue trend data for charts.

**Requirements**:
- Daily/weekly/monthly revenue aggregation
- Date range filtering
- Requires authentication

**Query Parameters**:
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| startDate | string | No | 30 days ago | ISO 8601 date |
| endDate | string | No | today | ISO 8601 date |
| groupBy | enum | No | day | day \| week \| month |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of revenue data points |
| data[].date | string | Date (ISO 8601) |
| data[].revenueCents | number | Revenue in cents |
| data[].requestCount | number | Number of requests |

**Phase 0 Deliverable**: YAML interface contract

---

### GET /admin/analytics/mechanics

**Purpose**: Mechanic performance metrics.

**Requirements**:
- Jobs completed, revenue generated, average rating per mechanic
- Sortable by performance metrics
- Requires authentication

**Query Parameters**:
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| sortBy | enum | No | jobsCompleted | jobsCompleted \| revenue \| rating |
| sortOrder | enum | No | desc | asc \| desc |
| limit | number | No | 10 | 1-50 |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of mechanic performance |
| data[].mechanicId | string | Mechanic ID |
| data[].mechanicName | string | Mechanic name |
| data[].jobsCompleted | number | Jobs completed |
| data[].revenueCents | number | Revenue generated (cents) |
| data[].averageRating | number | Average rating (1-5) |
| data[].reviewCount | number | Number of reviews |

**Phase 0 Deliverable**: YAML interface contract

---

## Admin Users API Requirements

### GET /admin/users

**Purpose**: List admin users.

**Requirements**:
- Paginated list
- Filter by role, active status
- Requires authentication (super-admin only)

**Query Parameters**:
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| page | number | No | 1 | ≥ 1 |
| limit | number | No | 20 | 1-100 |
| role | enum | No | all | super-admin \| admin \| moderator |
| isActive | boolean | No | all | true \| false |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of admin users |
| data[].id | string | User ID (CUID) |
| data[].email | string | User email |
| data[].name | string | User name |
| data[].role | enum | User role |
| data[].isActive | boolean | Active status |
| data[].createdAt | string | ISO 8601 timestamp |
| data[].lastLoginAt | string | ISO 8601 timestamp |
| pagination | object | Pagination metadata |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 403 | FORBIDDEN | Super-admin access required |

**Phase 0 Deliverable**: YAML interface contract

---

### POST /admin/users

**Purpose**: Create new admin user.

**Requirements**:
- Email uniqueness validation
- Password hashing (bcrypt, cost ≥ 12)
- Email verification (optional)
- Requires authentication (super-admin only)

**Request Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email, unique |
| name | string | Yes | Non-empty |
| password | string | Yes | Min 8 chars |
| role | enum | Yes | super-admin \| admin \| moderator |

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID (CUID) |
| email | string | User email |
| name | string | User name |
| role | enum | User role |
| isActive | boolean | Active status (default: true) |
| createdAt | string | ISO 8601 timestamp |

**Error Responses**:
| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Access token required |
| 403 | FORBIDDEN | Super-admin access required |
| 400 | BAD_REQUEST | Email already exists |
| 400 | BAD_REQUEST | Invalid user data |

**Security Considerations**:
- [ ] bcrypt password hashing (cost ≥ 12)
- [ ] No password in response
- [ ] Email verification (optional Phase 2)
- [ ] Audit logging (who created whom)

**Phase 0 Deliverable**: YAML interface contract

---

## Error Handling Requirements

**Standard Error Response Format**:

```yaml
error:
  statusCode: number          # HTTP status code
  code: string                # Error code (UPPERCASE_SNAKE_CASE)
  message: string             # Human-readable message
  details: object | null      # Additional error details (optional)
  timestamp: string           # ISO 8601 timestamp
  path: string                # Request path
```

**Error Codes**:

| Code | Status | Description |
|------|--------|-------------|
| BAD_REQUEST | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., duplicate email) |
| UNPROCESSABLE_ENTITY | 422 | Validation failed |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded |
| INTERNAL_SERVER_ERROR | 500 | Server error |

**Fail-Fast Principle**:
- Validate ALL inputs before processing
- Reject invalid requests immediately (400)
- Never proceed with partial/ambiguous data

**Phase 0 Deliverable**: YAML error response contracts

---

## Security Requirements

**Security-by-Default Checklist**:

### Authentication ✅
- [ ] JWT with refresh tokens (access: 15min, refresh: 7 days)
- [ ] httpOnly cookies for token storage
- [ ] bcrypt password hashing (cost ≥ 12)
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

**Phase 0 Deliverable**: Security review checklist for each endpoint

---

## Canonical Types

**From**: docs/standards/common/types.md

**Canonical Types to Consider**:

| Concern | Canonical Type | Usage |
|---------|---------------|-------|
| Logging | `logging.LogConfig` | Admin action logs |
| Observability | `observability.MetricConfig` | API performance metrics |
| Tags | `tags.TagMap` | Resource tagging |
| Encryption | `encryption.EncryptionConfig` | Password hashing config |
| Auth | `auth.JwtConfig` | JWT configuration |

**Note**: Some canonical types may need to be **created** in `src/core/` as they don't exist yet for NestJS/Prisma/Angular projects (this project is not AWS CDK-based).

**Phase 0 Task**: Apply Canonical Type Reuse skill to identify which types to create/reuse.

**See**: Task 2 in ADMIN_DASHBOARD_PLAN.md (Phase 0)

---

## Phase 0 Deliverables

**To be completed during Phase 0** (Apply Interface Designer skill):

### Task 1: YAML Interface Contracts (2 days)

For EACH endpoint, produce:

1. **Fully Commented YAML Contract**
   ```yaml
   # Example: Admin Login API Contract
   apiVersion: admin/v1
   kind: AdminAuth
   metadata:
     name: admin-login
     description: Authenticate admin user and receive JWT tokens

   spec:
     endpoint:
       method: POST
       path: /api/admin/auth/login

     request:
       body:
         email:
           type: string
           required: true
           validation: Valid email format
           example: admin@example.com

         password:
           type: string
           required: true
           validation: Min 8 characters
           example: SecurePassword123!

     response:
       success:
         status: 200
         body:
           accessToken:
             type: string
             description: JWT access token, expires in 15 minutes
             example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

           refreshToken:
             type: string
             description: JWT refresh token, expires in 7 days
             example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

           user:
             type: object
             properties:
               id:
                 type: string
                 description: User ID (CUID)
               email:
                 type: string
                 description: User email
               name:
                 type: string
                 description: User name
               role:
                 type: enum
                 values: [super-admin, admin, moderator]
                 description: User role

       errors:
         - status: 400
           code: BAD_REQUEST
           message: Email and password are required
           
         - status: 401
           code: UNAUTHORIZED
           message: Invalid credentials
           
         - status: 401
           code: UNAUTHORIZED
           message: Account is locked due to too many failed attempts
           
         - status: 429
           code: TOO_MANY_REQUESTS
           message: Too many login attempts. Please try again in 15 minutes.

     security:
       - bcrypt password hashing (cost factor >= 12)
       - Generic error message (don't reveal if email exists)
       - No password in response or logs
       - CSRF protection enabled
       - Rate limiting per IP address

     notes:
       - Access token expires in 15 minutes
       - Refresh token expires in 7 days
       - Account locked after 5 failed attempts for 15 minutes
       - Supports RBAC (super-admin, admin, moderator)
   ```

2. **Mapping Table** (YAML → TypeScript)
   ```markdown
   | YAML Field | TypeScript Type | Location |
   |------------|----------------|----------|
   | request.body.email | string | src/domains/admin/auth/types.ts: LoginDto |
   | request.body.password | string | src/domains/admin/auth/types.ts: LoginDto |
   | response.success.body | object | src/domains/admin/auth/types.ts: LoginResponse |
   | response.success.body.accessToken | string | src/domains/admin/auth/types.ts: LoginResponse |
   | response.success.body.refreshToken | string | src/domains/admin/auth/types.ts: LoginResponse |
   | response.success.body.user | object | src/domains/admin/auth/types.ts: AdminUserResponse |
   ```

3. **Canonical Type Imports**
   ```typescript
   // src/domains/admin/auth/types.ts
   // import * as auth from '../../../core/auth';  // If auth canonical type exists
   // import * as logging from '../../../core/logging';  // If logging canonical type exists
   ```

4. **Approval Gates**
   - Human approval required before implementation
   - Security review required for auth endpoints
   - STOP if approval not obtained

**Total YAML Contracts**: 31 endpoints

---

### Task 2: TypeScript Interface Definitions (1 day)

Convert YAML contracts to TypeScript interfaces in `types.ts` files:

```typescript
// src/domains/admin/auth/types.ts

/**
 * Login request DTO.
 * 
 * @see ADMIN_API_SPECIFICATION.md: POST /admin/auth/login
 */
export interface LoginDto {
  /**
   * Admin email address.
   * 
   * @validation Valid email format
   */
  readonly email: string;

  /**
   * Admin password.
   * 
   * @validation Min 8 characters
   */
  readonly password: string;
}

/**
 * Login response.
 * 
 * @see ADMIN_API_SPECIFICATION.md: POST /admin/auth/login
 */
export interface LoginResponse {
  /**
   * JWT access token (expires 15min).
   */
  readonly accessToken: string;

  /**
   * JWT refresh token (expires 7 days).
   */
  readonly refreshToken: string;

  /**
   * Admin user profile.
   */
  readonly user: AdminUserResponse;
}

/**
 * Admin user response.
 */
export interface AdminUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'super-admin' | 'admin' | 'moderator';
}

/**
 * JWT payload.
 */
export interface JwtPayload {
  readonly sub: string;  // user ID
  readonly email: string;
  readonly role: string;
}
```

---

### Task 3: Validation Rules (DTOs with class-validator) (1 day)

Define DTOs with validation decorators:

```typescript
// src/domains/admin/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Login request DTO with validation.
 */
export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
```

---

### Task 4: Human Approval (1 day)

**Approval Checklist**:

- [ ] All YAML contracts reviewed
- [ ] All TypeScript interfaces reviewed
- [ ] All validation rules reviewed
- [ ] Canonical types identified
- [ ] Security requirements reviewed
- [ ] Human approval obtained

**STOP if**: Approval not obtained

---

### Phase 0 Completion Criteria

Before proceeding to Phase 1 (TDD):

- [ ] All 31 endpoints documented as YAML contracts
- [ ] All TypeScript interfaces defined
- [ ] All validation rules defined (DTOs)
- [ ] Canonical types identified
- [ ] Security checklist complete
- [ ] Human approval obtained

**Quality Gate: Phase 0 Complete**

**STOP if**: Any deliverable incomplete or not approved.

**Next Step**: Proceed to Phase 1 (TDD Foundation)

**Estimated Total Time**: 1 week (5 business days)

---

## Related Documents

- **CLAUDE.md** - Repository constitution
- **docs/skills/interface-designer.md** - Interface design workflow (MANDATORY)
- **docs/skills/canonical-type-reuse.md** - Canonical types
- **docs/skills/admin-dashboard-implementation.md** - Orchestrating skill
- **docs/standards/common/naming.md** - Naming conventions
- **docs/standards/common/types.md** - Canonical type catalog
- **docs/standards/common/security.md** - Security-by-default
- **docs/admin/ADMIN_DASHBOARD_PLAN.md** - Implementation plan
- **docs/admin/ADMIN_UI_SPECIFICATION.md** - UI/UX specifications
- **docs/admin/ADMIN_QUICK_START.md** - Quick start guide

---

## Constitutional Compliance Statement

This specification is **CONSTITUTIONALLY COMPLIANT** with:

- ✅ Interface Designer Skill (docs/skills/interface-designer.md)
- ✅ Fail-Closed Principle (CLAUDE.md, Lines 538-546)
- ✅ Canonical Types (CLAUDE.md, Lines 268-280)
- ✅ Security-by-Default (CLAUDE.md, Lines 183-215)
- ✅ Quality Gates (CLAUDE.md, Lines 217-266)

**This document is a Phase 0 deliverable** and will be completed by applying the Interface Designer skill during Phase 0.

---

**Document Version**: 2.0  
**Last Updated**: December 25, 2025  
**Status**: 🟡 **PHASE 0 DELIVERABLE** (To be completed)  
**Authority**: CLAUDE.md, docs/skills/interface-designer.md  
**Next Action**: Apply Interface Designer skill during Phase 0

---

## End of Admin API Specification (Requirements)
