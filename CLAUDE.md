# Mechanic Dispatch Engineering Constitution

## Purpose

This document defines the **authoritative cognitive, architectural, and operational rules**
governing how AI agents (including Claude) participate in the design, implementation,
review, and evolution of the Mechanic Dispatch application.

This file is a **constitution**, not a workflow.
It defines **what is allowed**, **what is forbidden**, and **how authority is structured**.

---

## Repository Intent

This repository implements **Mechanic Dispatch**, a fullstack TypeScript application for booking mobile mechanic services.

The application is:

- **Fullstack TypeScript** - NestJS backend, Angular frontend, shared types
- **Domain-Driven** - Clear separation of domain, application, infrastructure, and interface layers
- **Secure by Default** - JWT authentication, input validation, SQL injection prevention
- **API-First** - RESTful API with OpenAPI documentation
- **Database-Backed** - Prisma ORM with PostgreSQL
- **Payment-Integrated** - Stripe manual-capture workflow
- **Monorepo Structure** - Backend at root, frontend in `/web`

This repository prioritizes:

- Correctness over speed
- Security over convenience
- Type safety over runtime flexibility
- Explicit contracts (DTOs) over implicit data shapes
- Domain integrity over implementation convenience
- Long-term maintainability over short-term delivery

---

## Authoritative Sources & Precedence

The following sources are authoritative, in descending order of precedence:

1. This `CLAUDE.md`
2. Approved agent workflows in `AGENTS.md`
3. Standards under `docs/admin/**` (admin dashboard implementation)
4. API specifications under `docs/admin/ADMIN_API_SPECIFICATION.md`
5. Architecture documentation under `docs/admin/ADMIN_ARCHITECTURE.md`

Rules:

- If required sources are missing from context, **STOP and ask the human to provide them**
- Do NOT infer, guess, or invent requirements
- If sources conflict, higher-precedence documents win

This repository operates under a **fail-closed principle**.

---

## Architecture Layers (Hard Boundaries)

This application enforces strict architectural layering for both backend and frontend.

### Backend Architecture (NestJS)

```
Interfaces (HTTP Controllers, DTOs)
        ↓
Application (Use Cases, Services)
        ↓
Domain (Entities, Repositories, Business Logic)
        ↓
Infrastructure (Prisma, Stripe, External Services)
```

**Layer Definitions**:

- **Domain Layer** (`src/domain/`)
  - Business entities and value objects
  - Repository interfaces (contracts)
  - Domain services (pure business logic)
  - No dependencies on infrastructure
- **Application Layer** (`src/application/`)
  - Use cases and application services
  - Orchestrates domain logic
  - Defines application-specific workflows
  - May depend on domain, NOT on infrastructure directly
- **Infrastructure Layer** (`src/infrastructure/`)
  - Prisma implementations
  - Stripe service implementations
  - External API integrations
  - Implements repository interfaces from domain
- **Interface Layer** (`src/interfaces/`)
  - HTTP controllers
  - DTOs (Data Transfer Objects)
  - Request/response shapes
  - Validation pipes
  - Guards and interceptors

**Layering Rules**:

- Controllers may call application services, NOT domain directly
- Application services orchestrate domain logic
- Domain layer has NO dependencies on outer layers
- Infrastructure implements contracts defined in domain
- DTOs are separate from domain entities
- Never expose domain entities directly in API responses

Violations of layering rules must be explicitly called out.

---

### Frontend Architecture (Angular)

```
Pages (Route Components)
      ↓
Components (Presentational & Container)
      ↓
Services (State, HTTP, Business Logic)
      ↓
Models (TypeScript interfaces, API contracts)
```

**Layer Definitions**:

- **Pages** (`web/src/app/pages/` or feature roots)
  - Route components
  - Page-level layouts
  - Coordinate multiple components
- **Components** (`web/src/app/components/` or feature components)
  - Presentational components (dumb)
  - Container components (smart)
  - Standalone components preferred
  - Use Angular signals for state
- **Services** (`web/src/app/services/` or feature services)
  - HTTP communication
  - State management
  - Business logic
  - Injectable services
- **Models** (`web/src/app/models/` or feature models)
  - TypeScript interfaces
  - API DTOs
  - Enums and types

**Frontend Rules**:

- Prefer standalone components over NgModule
- Use Angular signals over RxJS BehaviorSubject where appropriate
- Keep components focused (single responsibility)
- Services handle HTTP and state, not components
- Type all API responses
- No business logic in components

---

## Testing Requirements (Non-Negotiable)

All code MUST be tested before deployment.

Testing is a **hard requirement**, not optional.

### Backend Testing Standards

- **Unit Tests** (Jest)
  - Test services, domain logic, utilities
  - Mock dependencies (repositories, external services)
  - Target: 80%+ code coverage for services
  - Location: `src/**/*.spec.ts`
- **Integration Tests** (Jest + Supertest)
  - Test API endpoints end-to-end
  - Use test database
  - Verify request/response contracts
  - Location: `test/**/*.e2e-spec.ts`
- **Repository Tests**
  - Test Prisma repository implementations
  - Use test database transactions
  - Verify CRUD operations

### Frontend Testing Standards

- **Component Tests** (Jasmine/Karma)
  - Test component behavior
  - Mock services
  - Verify template bindings
  - Location: `web/src/app/**/*.spec.ts`
- **Service Tests**
  - Test HTTP services with HttpTestingController
  - Test state management logic
  - Mock API responses

### Testing Rules

- Tests must pass before proceeding to deployment
- Never commit code with failing tests
- Write tests alongside implementation
- Mock external dependencies (Stripe, databases in unit tests)
- Use test data factories for consistency

---

## Security-by-Default (Hard Rule)

All code MUST be secure by default.

This is a **non-negotiable requirement**.

### Backend Security Principles

- **Authentication**
  - JWT tokens with short expiration (15 minutes access, 7 days refresh)
  - Refresh token rotation
  - Secure HTTP-only cookies for refresh tokens
  - bcrypt for password hashing (10 rounds minimum)
- **Authorization**
  - Role-based access control (RBAC)
  - Guards protect all admin routes
  - Least privilege principle
- **Input Validation**
  - All DTOs use class-validator decorators
  - Validate before processing
  - Sanitize user inputs
  - Reject invalid requests (400 Bad Request)
- **SQL Injection Prevention**
  - Always use Prisma (never raw SQL unless necessary)
  - Parameterized queries only
  - Validate and sanitize inputs
- **API Security**
  - CORS properly configured
  - Rate limiting on sensitive endpoints
  - Helmet middleware for security headers
  - HTTPS in production (enforced)
- **Secrets Management**
  - Environment variables for all secrets
  - Never commit secrets to git
  - Use .env.example templates
  - Validate required environment variables on startup

### Frontend Security Principles

- **XSS Prevention**
  - Angular sanitizes by default
  - Never use innerHTML with user content
  - Validate and sanitize inputs
- **CSRF Protection**
  - Use HTTP-only cookies
  - CSRF tokens for state-changing operations
- **Authentication State**
  - Store JWT in memory or HttpOnly cookie
  - Clear tokens on logout
  - Redirect to login on 401

### Security Rules

- Insecure-by-default code will be rejected
- Security issues are blocking
- All API endpoints require authentication unless explicitly public
- Audit logging for sensitive operations

---

## Quality Gates (Non-Negotiable)

Agents must STOP and not proceed if quality checks fail.

### Mandatory Quality Gates

Before proceeding to the next phase, the following MUST pass:

1. **Build Gate**
   - Backend: `pnpm build` succeeds
   - Frontend: `cd web && pnpm build` succeeds
   - Prisma: `pnpm prisma:generate` succeeds
   - No TypeScript compilation errors
2. **Linter Gate**
   - Backend: `pnpm lint` passes
   - Frontend: `cd web && pnpm lint` passes
   - No new linting errors introduced
   - Existing warnings acceptable (if pre-existing)
3. **Test Gate**
   - Backend unit tests: `pnpm test` passes
   - Backend E2E tests: `pnpm test:e2e` passes
   - Frontend tests: `cd web && pnpm test` passes
   - Coverage thresholds met (80%+ for services)
4. **Type Safety Gate**
   - No `any` types unless explicitly justified
   - All DTOs properly typed
   - API responses typed
   - Shared types between backend and frontend

### STOP Conditions

Agents MUST stop if:

- ❌ Build fails → Fix before proceeding
- ❌ Tests fail → Fix before proceeding
- ❌ Linter errors introduced → Fix before proceeding
- ❌ Type safety violations → Fix before proceeding
- ❌ Security issues identified → Fix before proceeding

### Bypass Prohibition

Agents may NOT:

- Skip quality gates
- Bypass failing checks
- Proceed with known failures
- Use workarounds to avoid gates

**Quality gates are mandatory checkpoints, not optional suggestions.**

---

## Module Structure Standards

### Backend Module Structure (NestJS)

```
src/
├── domain/
│   ├── entities/           # Domain entities
│   ├── repositories/       # Repository interfaces
│   └── services/           # Domain services
├── application/
│   └── services/           # Application services (use cases)
├── infrastructure/
│   ├── database/           # Prisma implementations
│   │   └── repositories/   # Repository implementations
│   └── stripe/             # Stripe service
├── interfaces/
│   ├── controllers/        # HTTP controllers
│   ├── dto/                # Data Transfer Objects
│   ├── guards/             # Auth guards
│   └── pipes/              # Validation pipes
└── modules/                # NestJS modules
```

**Rules**:

- One responsibility per file
- Controllers are thin (delegate to services)
- Services contain business logic
- DTOs separate from entities
- Use dependency injection
- Export through barrel files (index.ts)

### Frontend Module Structure (Angular)

```
web/src/app/
├── admin/                  # Admin feature module
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── models/
├── pages/                  # Public pages
├── components/             # Shared components
├── services/               # Shared services
├── models/                 # Shared models/interfaces
└── guards/                 # Route guards
```

**Rules**:

- Feature-based organization
- Standalone components preferred
- Shared code in root-level folders
- Services are singleton (providedIn: 'root')
- Models define API contracts

---

## API Design Standards

### REST API Principles

- **Resources**: Use nouns, not verbs (`/requests`, not `/getRequests`)
- **HTTP Methods**: GET (read), POST (create), PATCH (update), DELETE (delete)
- **Status Codes**:
  - 200 OK (success)
  - 201 Created (resource created)
  - 400 Bad Request (validation error)
  - 401 Unauthorized (not authenticated)
  - 403 Forbidden (not authorized)
  - 404 Not Found (resource doesn't exist)
  - 500 Internal Server Error (server error)
- **Versioning**: Use URL versioning (`/api/v1/`)
- **Pagination**: Use query params (`?page=1&limit=20`)
- **Filtering**: Use query params (`?status=PENDING`)
- **Sorting**: Use query params (`?sort=createdAt:desc`)

### DTO Standards

```typescript
// Request DTO
export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Response DTO
export class RequestResponseDto {
  id: string;
  firstName: string;
  email: string;
  status: RequestStatus;
  createdAt: Date;
}
```

**Rules**:

- All request DTOs use class-validator decorators
- Response DTOs explicitly typed
- Transform database entities to DTOs (never expose entities directly)
- Use `@ApiProperty()` for OpenAPI documentation
- Nested DTOs for complex objects

---

## Database Patterns (Prisma)

### Schema Design

- **Naming**: PascalCase for models, camelCase for fields
- **Relations**: Explicit foreign keys
- **Enums**: Define in schema.prisma
- **Timestamps**: `createdAt` and `updatedAt` on all models
- **Soft Deletes**: Add `deletedAt` for soft deletion

### Repository Pattern

```typescript
// Domain layer: interface
export interface IServiceRequestRepository {
  findById(id: string): Promise<ServiceRequest | null>;
  create(data: CreateServiceRequestData): Promise<ServiceRequest>;
  update(id: string, data: UpdateServiceRequestData): Promise<ServiceRequest>;
}

// Infrastructure layer: implementation
export class PrismaServiceRequestRepository implements IServiceRequestRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<ServiceRequest | null> {
    const record = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  // ... other methods
}
```

**Rules**:

- Repositories implement interfaces from domain layer
- Repositories return domain entities, not Prisma models
- Use transactions for multi-step operations
- Handle Prisma errors and convert to domain errors
- Test repositories with test database

---

## Persona Model (Authoritative Responsibility Boundaries)

Personas represent **invariant engineering responsibilities**, not job titles.

AI agents must operate within one or more personas.

### Canonical Personas (Authority-Bearing)

- **Backend Engineer**
  - Designs and implements NestJS services
  - Defines API contracts (DTOs)
  - Implements domain logic
  - Authority: Backend architecture decisions
- **Frontend Engineer**
  - Designs and implements Angular components
  - Implements UI/UX
  - Integrates with backend APIs
  - Authority: Frontend architecture decisions
- **Full-Stack Engineer**
  - Combines Backend + Frontend personas
  - Designs end-to-end features
  - Ensures frontend/backend contract alignment
  - Authority: Cross-stack decisions
- **Database Engineer**
  - Designs Prisma schema
  - Creates migrations
  - Optimizes queries
  - Authority: Database decisions
- **Security Engineer**
  - Reviews authentication/authorization
  - Identifies security vulnerabilities
  - Enforces security standards
  - Authority: Security decisions
- **DevOps Engineer**
  - Docker configuration
  - CI/CD pipelines
  - Deployment strategies
  - Authority: Infrastructure decisions

**Rules**:

- Personas may advise outside their authority
- Final decisions rest with persona authority
- Cross-persona decisions require collaboration
- Human approval for critical decisions

---

## SDLC Guardrails

AI agents participate in the SDLC as **bounded collaborators**.

### Approval Gates (Non-Optional)

Explicit human approval is required before:

- Modifying Prisma schema
- Changing API contracts (DTOs)
- Introducing breaking changes
- Modifying authentication/authorization
- Changing database migrations
- Deploying to production
- Making irreversible decisions

### Change Safety Rules

- Prefer additive changes
- Never silently break backward compatibility
- Always document breaking changes
- Explicitly call out migration requirements
- Rollback must be possible unless explicitly stated otherwise

---

## Agent Execution Model

This repository uses an explicit agent orchestration model.

Approved agent workflows are defined in **`AGENTS.md`**.

Rules:

- `CLAUDE.md` defines **what is allowed**
- `AGENTS.md` defines **how work is performed**
- If `AGENTS.md` conflicts with `CLAUDE.md`, **`CLAUDE.md` prevails**
- Agents may not exceed the authority of their assigned personas
- Agents must respect all approval gates

---

## Fail-Closed Principle (Overrides All Other Rules)

If information is missing, ambiguous, or conflicting:

- Do NOT guess
- Do NOT proceed
- Ask for clarification

This rule overrides all others.

---

## Summary

This constitution establishes:

1. **Architecture**: Domain-driven backend, component-based frontend
2. **Security**: Secure by default, authentication, validation, SQL injection prevention
3. **Testing**: Mandatory unit and E2E tests, 80%+ coverage
4. **Quality**: Build, lint, test, and type safety gates
5. **Patterns**: Repository pattern, DTO pattern, dependency injection
6. **Organization**: Clear layer boundaries, feature-based structure
7. **Authority**: Persona-based decision making, approval gates

**Remember**: This is a constitution, not a workflow. It defines boundaries and authority. Specific workflows are defined in `AGENTS.md`.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
