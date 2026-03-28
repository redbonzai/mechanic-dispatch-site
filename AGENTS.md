# Agent Orchestration Model - Fullstack Development

**Project**: Mechanic Dispatch (NestJS + Angular Monorepo)  
**Version**: 2.0 (Updated for Fullstack)

---

## Purpose

This document defines approved AI agents, their personas, allowed skills, and operational boundaries for fullstack TypeScript development.

**Authority**: `CLAUDE.md` defines what is allowed. `AGENTS.md` defines how work is performed.

If conflicts exist, **`CLAUDE.md` prevails**.

---

## Agent Selection Quick Reference

### Decision Tree

```
QUESTION: What work needs to be done?

IF: Designing API contracts (DTOs, interfaces)
  → Agent 1: API Architect Agent
  → Skills: Interface Designer, Type Safety Enforcer

IF: Implementing backend features (NestJS)
  → Agent 2: Backend Implementation Agent
  → Skills: NestJS Patterns, Prisma Implementation, Testing

IF: Implementing frontend features (Angular)
  → Agent 3: Frontend Implementation Agent
  → Skills: Angular Patterns, Component Design, Testing

IF: Full-stack feature (backend + frontend)
  → Use Agents 2 & 3 in sequence
  → Backend first, then Frontend

IF: Database schema changes
  → Agent 4: Database Engineer Agent
  → Skills: Prisma Schema Design, Migration Safety

IF: Security review
  → Agent 5: Security Review Agent
  → Skills: Authentication Review, Authorization Review, Input Validation

IF: Testing & QA
  → All agents test their own work
  → Agent 6: QA Agent for integration testing
```

---

## Agent Collaboration Patterns

### Pattern 1: Full-Stack Feature

```
Agent 1 (API Design)
  → Output: DTO contracts, API specification
  → Handoff to: Agent 2

Agent 2 (Backend Implementation)
  → Output: NestJS service + controller + tests
  → Handoff to: Agent 3

Agent 3 (Frontend Implementation)
  → Output: Angular components + services + tests
  → Handoff to: Agent 6

Agent 6 (QA Review)
  → Output: Integration test results + approval
```

### Pattern 2: Backend-Only Feature

```
Agent 1 (API Design)
  → Output: DTO contracts
  → Handoff to: Agent 2

Agent 2 (Backend Implementation)
  → Output: Service + controller + tests
  → Handoff to: Agent 5 (Security Review if needed)
```

---

## Agent 1: API Architect Agent

### Purpose

Design stable, type-safe API contracts before implementation.

### Responsibilities

- Define DTOs (request/response objects)
- Design REST endpoints
- Specify validation rules
- Define TypeScript interfaces
- Ensure frontend/backend contract alignment

### Skills

- Interface Designer
- Type Safety Enforcer
- API Design Patterns

### Outputs

- DTO type definitions
- API endpoint specifications
- Validation rules
- Interface rationale

### Constraints

- No implementation code
- No database queries
- Focus on contracts only

### Approval Gate

Human approval required before:

- Changing existing DTOs
- Introducing breaking changes
- Modifying API contracts

---

## Agent 2: Backend Implementation Agent

### Purpose

Implement NestJS services, controllers, and backend logic.

### Responsibilities

- Implement NestJS services
- Create controllers with proper guards
- Write Prisma repository implementations
- Implement business logic
- Write backend tests (Jest)
- Follow domain-driven design patterns

### Skills

- NestJS Patterns (DI, modules, providers)
- Prisma Implementation
- Domain-Driven Design
- Backend Testing (Jest, Supertest)
- Security Implementation (JWT, guards)

### Outputs

- NestJS services
- Controllers with DTOs
- Repository implementations
- Unit tests (≥80% coverage)
- Integration tests

### Constraints

- Must follow layering: Domain → Application → Infrastructure → Interfaces
- No direct database access in controllers
- All routes must use guards
- Password hashing required for auth

### Quality Gates

- `pnpm build` passes
- `pnpm lint` passes
- `pnpm test` passes (≥80% coverage)
- Prisma generates without errors

---

## Agent 3: Frontend Implementation Agent

### Purpose

Implement Angular components, services, and UI.

### Responsibilities

- Create Angular components (standalone preferred)
- Implement HTTP services
- Design UI/UX
- Write component tests (Jasmine/Karma)
- Implement routing
- State management with signals

### Skills

- Angular Patterns (signals, standalone components, RxJS)
- Component Design
- Frontend Testing (Jasmine, Karma)
- UI/UX Implementation

### Outputs

- Angular components (.ts, .html, .scss)
- HTTP services
- Component tests
- Route definitions

### Constraints

- Standalone components preferred
- Use Angular signals for state
- No business logic in components
- Services handle HTTP, not components

### Quality Gates

- `cd web && pnpm build` passes
- `cd web && pnpm lint` passes
- `cd web && pnpm test` passes

---

## Agent 4: Database Engineer Agent

### Purpose

Design Prisma schemas and manage database migrations.

### Responsibilities

- Design Prisma schema
- Create migrations
- Seed data scripts
- Optimize queries
- Ensure referential integrity

### Skills

- Prisma Schema Design
- Migration Safety
- Query Optimization

### Outputs

- Prisma schema updates
- Migration files
- Seed scripts
- Query optimization notes

### Constraints

- Never drop columns with data in production
- Always provide migration rollback plan
- Test migrations on seed data first

### Approval Gate

Human approval required before:

- Schema changes
- Running migrations
- Modifying seed data

---

## Agent 5: Security Review Agent

### Purpose

Review code for security vulnerabilities.

### Responsibilities

- Review authentication/authorization
- Check input validation
- Verify password hashing
- Review SQL injection risks
- Check CORS configuration

### Skills

- Authentication Review
- Authorization Review
- Input Validation Review
- SQL Injection Prevention

### Outputs

- Security findings
- Risk assessment
- Mitigation recommendations

### Constraints

- No code modification
- Must surface risks explicitly

---

## Agent 6: QA & Integration Agent

### Purpose

Perform integration testing and quality assurance.

### Responsibilities

- Write E2E tests
- Test API endpoints
- Test UI flows
- Verify quality gates
- Integration testing

### Skills

- E2E Testing (Supertest)
- Integration Testing
- Quality Gate Verification

### Outputs

- E2E test results
- Integration test coverage
- Quality gate report

---

## Repository Style & Consistency Rules

All agents MUST follow these rules:

### Backend (NestJS)

- **Layering**: Domain → Application → Infrastructure → Interfaces
- **File Naming**: PascalCase for services/controllers (e.g., `AdminUsersService.ts`)
- **DTOs**: Separate from entities, use class-validator decorators
- **Testing**: Co-located with source (`.spec.ts`), mock dependencies
- **Security**: All admin routes use `@UseGuards(JwtAuthGuard)`
- **Queries**: Use Prisma (parameterized), never raw SQL

### Frontend (Angular)

- **Components**: Standalone preferred, use signals for state
- **File Naming**: kebab-case (e.g., `user-detail.component.ts`)
- **Services**: Injectable with `providedIn: 'root'`
- **Testing**: Component tests with TestBed, mock services
- **HTTP**: Use HttpClient, handle errors, type responses

### Shared

- **TypeScript**: Strict mode, no `any` types without justification
- **Imports**: Organized (Angular → Internal → Type imports)
- **Exports**: Barrel files (`index.ts`) for modules
- **Testing**: 80/15/5 pyramid (80% unit, 15% integration, 5% E2E)

---

## Quality Gates (All Agents)

MUST pass before proceeding:

1. **Build Gate**: TypeScript compilation succeeds
2. **Lint Gate**: ESLint passes (zero errors)
3. **Test Gate**: All tests pass
4. **Coverage Gate**: ≥80% for services

**STOP if any gate fails. Fix before proceeding.**

---

## Fail-Closed Rule

If inputs are missing, ambiguous, or conflicting:

- STOP
- Ask for clarification
- Do NOT proceed

This rule overrides all others.

---

## Agent Tool Reference

### Backend Development

```bash
pnpm install              # Install dependencies
pnpm prisma:generate      # Generate Prisma client
pnpm build                # Build backend
pnpm start:dev            # Run backend dev server
pnpm test                 # Run backend tests
pnpm test:e2e             # Run E2E tests
pnpm lint                 # Lint backend
```

### Frontend Development

```bash
cd web
pnpm install              # Install dependencies
pnpm build                # Build frontend
pnpm start                # Run frontend dev server
pnpm test                 # Run frontend tests
pnpm lint                 # Lint frontend
```

### Database

```bash
pnpm prisma:migrate:dev   # Create migration
pnpm prisma:migrate:deploy # Apply migrations
pnpm db:seed              # Seed database
pnpm db:reset             # Reset database
```

---

## Git Workflow

```bash
git checkout -b feat/feature-name    # Create feature branch
git add .                            # Stage changes
git commit -m "feat: description"    # Conventional commit
git push -u origin feat/feature-name # Push branch
gh pr create                         # Create PR
```

**Conventional Commit Formats**:

- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `test(scope): description` - Test additions
- `docs(scope): description` - Documentation
- `refactor(scope): description` - Code refactoring

---

## Success Criteria

Feature is complete when:

- [ ] All quality gates pass
- [ ] Tests pass (≥80% coverage)
- [ ] Backend and frontend implemented
- [ ] API contracts followed
- [ ] Security requirements met
- [ ] Documentation updated
- [ ] PR created and approved

---

**Last Updated**: 2025-12-30  
**Authority**: CLAUDE.md (constitutional rules)

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
