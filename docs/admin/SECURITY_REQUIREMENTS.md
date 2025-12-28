# Admin Dashboard Security Requirements
# Phase 0 Task 4: Security-by-Default
# Date: 2025-12-26
# Status: Complete - Ready for Implementation
# Authority: CLAUDE.md (Lines 183-215), docs/standards/common/security.md

---

## Purpose

This document defines **security-by-default requirements** for the admin dashboard following the constitutional principle:

> **All constructs MUST be secure by default. Security is NOT optional or additive.**

---

## Security Principles

### Constitutional Requirements (CLAUDE.md Lines 183-215)

1. **Security is non-negotiable** - Not optional or additive
2. **Secure defaults required** - Users may opt-in to less secure, not opt-out
3. **Encryption at rest** - Enabled by default
4. **Encryption in transit** - SSL/TLS enforced
5. **Public access blocked** - By default
6. **IAM least privilege** - By default
7. **Logging and monitoring** - Configured by default

**Rule**: Insecure-by-default constructs will be rejected.

---

## 1. Authentication Security

### JWT Configuration

**Requirements**:
- ✅ JWT access tokens with short expiry (15 minutes)
- ✅ JWT refresh tokens with longer expiry (7 days)
- ✅ Secure token storage (httpOnly cookies)
- ✅ CSRF protection enabled
- ✅ Account lockout after failed attempts

**JWT Configuration**:

```typescript
// JWT Secret Management
export const jwtConfig = {
  // NEVER commit secrets to version control
  secret: process.env.JWT_SECRET || throwError('JWT_SECRET required'),
  
  // Access token configuration
  accessToken: {
    expiresIn: '15m',  // 15 minutes
    issuer: 'mechanic-dispatch-api',
    audience: 'mechanic-dispatch-admin',
  },
  
  // Refresh token configuration
  refreshToken: {
    expiresIn: '7d',  // 7 days
    issuer: 'mechanic-dispatch-api',
    audience: 'mechanic-dispatch-admin',
  },
};
```

**Token Storage**:
```typescript
// Backend: Store refresh tokens in database
interface AdminRefreshToken {
  id: string;
  userId: string;
  token: string;  // Hashed
  expiresAt: Date;
  createdAt: Date;
}

// Frontend: httpOnly cookies (prevent XSS)
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,      // Cannot be accessed via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
});
```

### Password Security

**Requirements**:
- ✅ bcrypt hashing with cost factor ≥ 12
- ✅ Minimum password length: 8 characters
- ✅ Password never logged or returned in API responses
- ✅ Password reset with time-limited tokens (1 hour expiry)
- ✅ Password history (prevent reuse of last 5 passwords)

**Password Hashing**:
```typescript
import * as bcrypt from 'bcrypt';

// Hash password (cost factor: 12)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;  // Cost factor ≥ 12 (constitutional requirement)
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Password Validation**:
```typescript
export function validatePassword(password: string): boolean {
  // Minimum 8 characters (constitutional requirement)
  return password && password.length >= 8;
}

// Optional: Enhanced validation (can be added in Phase 2)
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  // Optional: Add more rules in Phase 2
  // if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
  // if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
  // if (!/[0-9]/.test(password)) errors.push('Must contain number');
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Account Lockout

**Requirements**:
- ✅ Lock account after 5 failed login attempts
- ✅ Lockout duration: 15 minutes
- ✅ Reset failed attempts counter on successful login
- ✅ Log lockout events for security auditing

**Lockout Implementation**:
```typescript
interface AccountLockout {
  failedLoginAttempts: number;
  lastFailedLoginAt: Date | null;
  lockedUntil: Date | null;
}

// Check if account is locked
export function isAccountLocked(user: AccountLockout): boolean {
  if (user.failedLoginAttempts >= 5) {
    const lockoutDuration = 15 * 60 * 1000;  // 15 minutes
    const lockedUntil = new Date(
      user.lastFailedLoginAt.getTime() + lockoutDuration
    );
    
    if (new Date() < lockedUntil) {
      return true;  // Still locked
    }
  }
  
  return false;  // Not locked or lockout expired
}

// Increment failed attempts
export async function incrementFailedAttempts(userId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: { increment: 1 },
      lastFailedLoginAt: new Date(),
    },
  });
}

// Reset failed attempts
export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
    },
  });
}
```

---

## 2. Authorization (RBAC)

### Role Hierarchy

**Three roles with descending permissions**:

```typescript
export enum AdminRole {
  SUPER_ADMIN = 'super-admin',  // Full access
  ADMIN = 'admin',              // Read/write access (no user management)
  MODERATOR = 'moderator',      // Read-only access
}
```

### Permission Matrix

| Resource | super-admin | admin | moderator |
|----------|-------------|-------|-----------|
| **Admin Users** |
| List admin users | ✅ | ✅ | ❌ |
| Create admin user | ✅ | ❌ | ❌ |
| Update admin user | ✅ | ✅ (own profile only) | ❌ |
| Delete admin user | ✅ | ❌ | ❌ |
| **Service Requests** |
| List requests | ✅ | ✅ | ✅ |
| View request detail | ✅ | ✅ | ✅ |
| Update request | ✅ | ✅ | ❌ |
| Capture payment | ✅ | ✅ | ❌ |
| Finalize request | ✅ | ✅ | ❌ |
| Cancel request | ✅ | ✅ | ❌ |
| **Mechanics** |
| List mechanics | ✅ | ✅ | ✅ |
| Create mechanic | ✅ | ✅ | ❌ |
| Update mechanic | ✅ | ✅ | ❌ |
| Delete mechanic | ✅ | ❌ | ❌ |
| **Reviews** |
| List reviews | ✅ | ✅ | ✅ |
| Create review | ✅ | ✅ | ❌ |
| Update review | ✅ | ✅ | ❌ |
| Delete review | ✅ | ❌ | ❌ |
| **Skills** |
| List skills | ✅ | ✅ | ✅ |
| Create skill | ✅ | ✅ | ❌ |
| Update skill | ✅ | ✅ | ❌ |
| Delete skill | ✅ | ❌ | ❌ |
| **Analytics** |
| View dashboard | ✅ | ✅ | ✅ |
| View revenue | ✅ | ✅ | ❌ |
| View mechanic performance | ✅ | ✅ | ✅ |

### Guard Implementation

**Role Guard**:
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;  // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;  // No user authenticated
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Roles Decorator**:
```typescript
import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '../types';

export const Roles = (...roles: AdminRole[]) => SetMetadata('roles', roles);
```

**Usage Example**:
```typescript
@Controller('admin/users')
export class AdminUsersController {
  // Only super-admin can create admin users
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  async createUser(@Body() dto: CreateAdminUserDto) {
    // Implementation
  }

  // Both super-admin and admin can view users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async getUsers() {
    // Implementation
  }
}
```

### Least Privilege Principle

**Default**: Read-only (moderator)  
**Explicit grant**: Write access (admin)  
**Explicit grant**: Full access (super-admin)

**Rule**: Never grant more permissions than necessary.

---

## 3. API Security

### Rate Limiting

**Requirements**:
- ✅ 100 requests per 15 minutes per IP address
- ✅ Stricter limits for authentication endpoints (5 attempts per 15 min)
- ✅ 429 Too Many Requests response when limit exceeded
- ✅ Retry-After header in response

**Rate Limit Configuration**:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

// Global rate limit
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 15 * 60,  // 15 minutes
      limit: 100,    // 100 requests
    }),
  ],
})
export class AppModule {}

// Stricter limit for auth endpoints
@Controller('admin/auth')
@UseGuards(ThrottlerGuard)
@Throttle(5, 15 * 60)  // 5 requests per 15 minutes
export class AdminAuthController {
  @Post('login')
  async login() {
    // Login implementation
  }
}
```

### CORS Configuration

**Requirements**:
- ✅ Whitelist allowed origins (no wildcard `*`)
- ✅ Allow credentials (httpOnly cookies)
- ✅ Restrict allowed methods
- ✅ Restrict allowed headers

**CORS Configuration**:
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:4200',           // Development
      'https://admin.mechanicdispatch.com',  // Production
    ],
    credentials: true,  // Allow httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(3000);
}
bootstrap();
```

### HTTPS Enforcement

**Requirements**:
- ✅ Redirect HTTP → HTTPS in production
- ✅ HSTS (HTTP Strict Transport Security) header
- ✅ Certificate validation
- ✅ TLS 1.2+ only

**HTTPS Configuration**:
```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security headers
  app.use(helmet({
    hsts: {
      maxAge: 31536000,  // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));
  
  // Redirect HTTP to HTTPS (production only)
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.protocol === 'http') {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
      } else {
        next();
      }
    });
  }
  
  await app.listen(3000);
}
```

### Security Headers (helmet.js)

**Requirements**:
- ✅ Content-Security-Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security
- ✅ X-XSS-Protection: 1; mode=block

**Helmet Configuration**:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Angular inline styles
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com'],  // Stripe API
    },
  },
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: 'nosniff',
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

## 4. Input Validation

### Fail-Fast Validation

**Requirements**:
- ✅ Validate ALL inputs before processing
- ✅ Reject invalid requests immediately (400 Bad Request)
- ✅ Never proceed with partial/ambiguous data
- ✅ Use class-validator for DTOs

**Validation Pipeline**:
```typescript
import { ValidationPipe } from '@nestjs/common';

// Global validation pipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Strip unknown properties
  forbidNonWhitelisted: true,  // Reject unknown properties
  transform: true,        // Auto-transform to DTO types
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

**DTO Validation Example**:
```typescript
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { AdminRole } from '../types';

export class CreateAdminUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsEnum(AdminRole, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: AdminRole;
}
```

### SQL Injection Prevention

**Requirements**:
- ✅ Use Prisma ORM (parameterized queries)
- ✅ Never concatenate user input into SQL queries
- ✅ Validate input types and ranges

**Prisma Usage** (secure by default):
```typescript
// ✅ SAFE - Prisma uses parameterized queries
const user = await prisma.adminUser.findUnique({
  where: { email: dto.email },  // Automatically escaped
});

// ❌ UNSAFE - Raw SQL (avoid unless necessary)
// const user = await prisma.$queryRaw`SELECT * FROM admin_users WHERE email = ${dto.email}`;
```

### XSS Prevention

**Requirements**:
- ✅ Angular automatic sanitization
- ✅ Content-Security-Policy header
- ✅ httpOnly cookies (prevent cookie theft)
- ✅ Never use `innerHTML` with user input

**Angular Sanitization** (built-in):
```typescript
// Angular automatically sanitizes template interpolations
<div>{{ userInput }}</div>  // ✅ Safe (auto-sanitized)

// For HTML content, use DomSanitizer
import { DomSanitizer } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

sanitizeHtml(html: string) {
  return this.sanitizer.sanitize(SecurityContext.HTML, html);
}
```

### File Upload Validation

**Requirements**:
- ✅ Validate file type (whitelist)
- ✅ Validate file size (max 10MB)
- ✅ Validate file content (magic numbers)
- ✅ Store files outside web root
- ✅ Generate random filenames (prevent path traversal)

**File Upload Validation**:
```typescript
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';

export const imageUploadConfig = {
  storage: diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
      // Generate random filename
      const randomName = crypto.randomBytes(16).toString('hex');
      const ext = extname(file.originalname);
      cb(null, `${randomName}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Whitelist allowed types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB max
  },
};
```

---

## 5. Data Security

### Password Storage

**Requirements**:
- ✅ Password NEVER logged
- ✅ Password NEVER returned in API responses
- ✅ Password hashed with bcrypt (cost 12)
- ✅ Refresh tokens hashed before storage

**Password Exclusion**:
```typescript
// Prisma schema
model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String   // Never expose this field
  role         String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// DTO response (exclude password)
export interface AdminUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: AdminRole;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  // passwordHash is NEVER included
}
```

### Sensitive Data Encryption

**Requirements**:
- ✅ Database encryption at rest (PostgreSQL encryption)
- ✅ Sensitive fields encrypted (if storing PII beyond what's needed)
- ✅ Encryption keys stored in secure vault (not in code)

**Environment Configuration**:
```typescript
// .env (NEVER commit to version control)
DATABASE_URL="postgresql://..."
JWT_SECRET="..." // Generate with: openssl rand -base64 32
ENCRYPTION_KEY="..." // For field-level encryption if needed

// Load from environment (fail if missing)
export const config = {
  database: {
    url: process.env.DATABASE_URL || throwError('DATABASE_URL required'),
  },
  jwt: {
    secret: process.env.JWT_SECRET || throwError('JWT_SECRET required'),
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || throwError('ENCRYPTION_KEY required'),
  },
};

function throwError(message: string): never {
  throw new Error(message);
}
```

### Audit Logging

**Requirements**:
- ✅ Log all admin actions (who did what when)
- ✅ Log authentication events (login, logout, failed attempts)
- ✅ Log authorization failures (forbidden access attempts)
- ✅ Log data modifications (create, update, delete)
- ✅ Include IP address and user agent
- ✅ Retain logs for compliance (90 days minimum)

**Audit Log Implementation**:
```typescript
import * as audit from '../../../core/audit';

// Audit log entry
async function logAuditEvent(
  actor: audit.AuditActor,
  action: string,
  resource: audit.AuditResource,
  req: Request
): Promise<void> {
  const auditEntry: audit.AuditLogEntry = {
    id: generateCuid(),
    timestamp: new Date().toISOString(),
    actor,
    action,
    resource,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };

  // Store in database
  await prisma.auditLog.create({
    data: auditEntry,
  });
}

// Usage example
await logAuditEvent(
  {
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
  },
  'ADMIN_USER_CREATED',
  {
    type: 'AdminUser',
    id: newUser.id,
  },
  req
);
```

### PII Handling (GDPR Compliance)

**Requirements**:
- ✅ Collect only necessary PII
- ✅ Document data retention policies
- ✅ Implement data deletion (right to be forgotten)
- ✅ Encrypt PII in transit (HTTPS)
- ✅ Encrypt PII at rest (database encryption)

**Data Retention**:
```typescript
// Retention policies
export const dataRetentionPolicies = {
  auditLogs: 90,      // 90 days
  refreshTokens: 7,   // 7 days
  deletedUsers: 30,   // 30 days (soft delete)
};

// Automated cleanup (run daily)
export async function cleanupExpiredData() {
  const now = new Date();

  // Delete expired audit logs
  await prisma.auditLog.deleteMany({
    where: {
      timestamp: {
        lt: new Date(now.getTime() - dataRetentionPolicies.auditLogs * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Delete expired refresh tokens
  await prisma.adminRefreshToken.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });
}
```

---

## 6. Session Security

### Token Management

**Requirements**:
- ✅ Token rotation on refresh (optional, can add in Phase 2)
- ✅ Token revocation on logout (delete from database)
- ✅ Session timeout (30 minutes inactivity)
- ✅ Concurrent session limits (1 active session per admin user)

**Token Revocation**:
```typescript
// Logout (revoke refresh token)
async logout(refreshToken: string): Promise<void> {
  await prisma.adminRefreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

// Revoke all sessions for a user
async revokeAllSessions(userId: string): Promise<void> {
  await prisma.adminRefreshToken.deleteMany({
    where: { userId },
  });
}
```

**Session Timeout** (frontend):
```typescript
// Angular idle detection
import { Idle } from '@ng-idle/core';

export class AppComponent {
  constructor(private idle: Idle) {
    // 30 minutes inactivity
    idle.setIdle(30 * 60);
    idle.setTimeout(1);
    
    idle.onTimeout.subscribe(() => {
      // Auto-logout
      this.authService.logout();
    });
    
    idle.watch();
  }
}
```

**Concurrent Session Limit**:
```typescript
// Allow only 1 active session per user
async createRefreshToken(userId: string, token: string): Promise<void> {
  // Delete existing tokens for this user
  await prisma.adminRefreshToken.deleteMany({
    where: { userId },
  });

  // Create new token
  await prisma.adminRefreshToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}
```

---

## 7. Security Checklist (Complete)

### Authentication ✅
- [x] JWT with refresh tokens (access: 15min, refresh: 7 days)
- [x] httpOnly cookies for token storage
- [x] bcrypt password hashing (cost ≥ 12)
- [x] Password reset with time-limited tokens (1 hour)
- [x] Account lockout after 5 failed attempts (15 min)
- [x] CSRF protection enabled

### Authorization ✅
- [x] RBAC (super-admin, admin, moderator)
- [x] Auth guards on ALL admin routes
- [x] Least privilege principle
- [x] Route-level permissions

### API Security ✅
- [x] Rate limiting (100 req/15min per IP, 5 req/15min for auth)
- [x] CORS properly configured (whitelist origins)
- [x] HTTPS enforced (redirect HTTP → HTTPS)
- [x] Security headers (helmet.js: CSP, HSTS, X-Frame-Options, etc.)

### Input Validation ✅
- [x] class-validator on ALL DTOs
- [x] Fail-fast validation (reject before processing)
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (Angular sanitization + CSP)
- [x] File upload validation (type, size, content)

### Data Security ✅
- [x] Password never logged or returned
- [x] Sensitive data encrypted at rest (database encryption)
- [x] Audit logging enabled (who did what when)
- [x] PII handling (GDPR-compliant retention)

### Session Security ✅
- [x] Token revocation on logout
- [x] Session timeout (30 min inactivity)
- [x] Concurrent session limits (1 per user)

---

## 8. Prisma Schema Updates Required

**Add to Prisma schema**:

```prisma
// Admin user table
model AdminUser {
  id                   String   @id @default(cuid())
  email                String   @unique
  name                 String
  passwordHash         String   // bcrypt hash
  role                 String   // "super-admin" | "admin" | "moderator"
  isActive             Boolean  @default(true)
  failedLoginAttempts  Int      @default(0)
  lastFailedLoginAt    DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  refreshTokens        AdminRefreshToken[]
  auditLogs            AuditLog[]
}

// Refresh token table
model AdminRefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique  // Hashed token
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
}

// Audit log table
model AuditLog {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  actorId     String
  actorEmail  String
  actorRole   String
  action      String
  resourceType String
  resourceId  String
  changes     Json?     // Before/after changes
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  
  actor       AdminUser @relation(fields: [actorId], references: [id], onDelete: Cascade)
  
  @@index([actorId])
  @@index([timestamp])
  @@index([action])
  @@index([resourceType])
}
```

---

## 9. Environment Variables Required

**Create `.env` file** (NEVER commit to git):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mechanic_dispatch?schema=public"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-secret-key-here-32-chars-minimum"

# Encryption (if needed for field-level encryption)
ENCRYPTION_KEY="your-encryption-key-here"

# CORS
ALLOWED_ORIGINS="http://localhost:4200,https://admin.mechanicdispatch.com"

# Rate Limiting
RATE_LIMIT_TTL=900  # 15 minutes
RATE_LIMIT_MAX=100  # 100 requests

# Session
SESSION_TIMEOUT_MINUTES=30
```

---

## Phase 0 Task 4 Completion Checklist

- [x] **Authentication security defined** - JWT, password hashing, account lockout
- [x] **Authorization defined** - RBAC with 3 roles, permission matrix
- [x] **API security defined** - Rate limiting, CORS, HTTPS, security headers
- [x] **Input validation defined** - Fail-fast validation, SQL injection prevention, XSS prevention
- [x] **Data security defined** - Password exclusion, encryption, audit logging, PII handling
- [x] **Session security defined** - Token revocation, session timeout, concurrent sessions
- [x] **Security checklist complete** - All requirements documented
- [x] **Prisma schema updates** - AdminUser, AdminRefreshToken, AuditLog
- [x] **Environment variables** - All required secrets documented

---

## References

- **CLAUDE.md** (Lines 183-215) - Security-by-Default
- **docs/standards/common/security.md** - Security best practices
- **docs/admin/CANONICAL_TYPE_ANALYSIS.md** - auth, audit, error canonical types
- **docs/admin/MODULE_LAYOUT_DESIGN.md** - Module structure

---

**Document Version**: 1.0  
**Date**: 2025-12-26  
**Status**: ✅ **COMPLETE - READY FOR IMPLEMENTATION**  
**Authority**: CLAUDE.md, docs/standards/common/security.md  
**Next Action**: Task 5 (Define Test Strategy)

---

## End of Security Requirements
