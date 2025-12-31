# Platform Construct Engineering Constitution

## Purpose

This document defines the **authoritative cognitive, architectural, and operational rules**
governing how AI agents (including Claude) participate in the design, implementation,
review, and evolution of AWS CDK constructs in this repository.

This file is a **constitution**, not a workflow.
It defines **what is allowed**, **what is forbidden**, and **how authority is structured**.

---

## Repository Intent

This repository defines **AWS CDK constructs used to assemble full AWS platforms**.

The constructs in this repository are:

- **Generic** - Reusable across multiple use cases and teams
- **Secure** - Follow enterprise security standards with secure defaults
- **Interface-first** - Stable contracts before implementation
- **Composition-oriented** - Prefer composition over inheritance
- **Designed for multi-team consumption** - Clear boundaries and contracts
- **Opinionated toward safety, operability, and long-term evolution**

This repository prioritizes:

- Correctness over speed
- Security over convenience
- Explicit contracts over implicit assumptions
- Proactive operations over reactive fixes
- Long-term maintainability over short-term delivery

---

## Authoritative Sources & Precedence

The following sources are authoritative, in descending order of precedence:

1. This `CLAUDE.md`
2. Approved agent workflows in `AGENTS.md`
3. Standards under `docs/standards/**`
4. Interface definitions under `docs/interfaces/**`
5. Approved ADRs under `docs/adr/**`

Rules:

- If required sources are missing from context, **STOP and ask the human to provide them**
- Do NOT infer, guess, or invent requirements
- If sources conflict, higher-precedence documents win

This repository operates under a **fail-closed principle**.

---

## Documentation Organization

This repository maintains two distinct documentation systems:

### `docs/standards/` - Agent-First Documentation

**Audience**: AI agents and developers building constructs  
**Purpose**: Technical specifications, decision trees, and strict rules

**Style**:
- Decision trees and checklists
- "Must", "Should", "Must not" language
- Technical patterns and constraints
- Quick reference tables
- Fail-closed rules

**Contains**:
- `constructs/` - Layer-based standards (L2/L3/L4)
- `common/` - Cross-layer standards (naming, types, security, typescript, anti-patterns, modules)
- `testing/` - Testing standards (unit, integration, validation, stack)
- `sdlc/` - SDLC process standards (pull requests, stories)

**When agents use**: Building constructs, code reviews, automated workflows

---

### `docs/guides/` - Human-First Documentation

**Audience**: Human developers learning and using constructs  
**Purpose**: Tutorials, examples, and practical guides

**Style**:
- Conversational and friendly
- Example-driven with copy-paste code
- Use cases and scenarios
- Tips, tricks, and best practices
- Troubleshooting and migration guides

**Contains**:
- Practical guides for specific constructs
- Step-by-step tutorials
- Real-world usage examples
- Migration guides

**When humans use**: Learning constructs, looking for examples, getting started

---

### Documentation Rules for Agents

- **For construct development**: Use `docs/standards/**` (agent-first)
- **For examples and patterns**: Reference `docs/guides/**` (human-first) when helping humans
- **Never conflate the two**: Standards are authoritative; guides are educational
- **When in doubt**: Standards take precedence over guides

---

## Construct Layering Model (Hard Boundary)

This repository enforces strict construct layering:

- **L1**: AWS-generated constructs (`cdk.aws_*`)
- **L2**: Platform primitives
- **L3**: Platform compositions
- **L4**: Platform solutions and opinionated assemblies

### Layer Definitions

- **L2 (Primitives)**
  Low-level, reusable building blocks. No business logic. No environment assumptions.

- **L3 (Compositions)**
  Compose L2 constructs behind stable, reusable interfaces. Still broadly reusable.

- **L4 (Solutions)**
  Opinionated, use-case–specific assemblies that combine L3 constructs into
  complete platform capabilities or reference architectures.

### Layering Rules

- L2 exposes primitives, not opinions
- L3 composes L2 behind stable interfaces
- L4 may introduce opinions, defaults, and workflows
- L4 must NOT leak opinions downward into L3 or L2
- No provider-specific types may be exposed from L3 or L4
- Composition is required; inheritance is discouraged and must be explicitly justified
- Public interfaces are more stable than implementations

Violations of layering rules must be explicitly called out.

---

## Testing Requirements (Non-Negotiable)

All constructs MUST be tested before release.

Testing is a **hard requirement**, not optional.

### Testing Rules

- Unit tests are MANDATORY for all constructs
- Minimum coverage thresholds exist and must be met
- Tests must pass before proceeding to deployment
- Integration tests are required for deployable constructs
- Stack tests (AWS deployment validation) are required before release

### Testing Standards

Specific testing standards and thresholds are defined in:
- `docs/standards/testing/unit.md` - Unit testing requirements
- `docs/standards/testing/integration.md` - Integration testing patterns
- `docs/standards/testing/validation.md` - Constructor validation patterns
- `docs/standards/testing/stack.md` - CDK stack deployment testing

### Agent Rules

Agents must NOT proceed to deployment with failing tests.

If tests fail:
- STOP immediately
- Fix the failures
- Re-run tests
- Only proceed when all tests pass

---

## Security-by-Default (Hard Rule)

All constructs MUST be secure by default.

This is a **non-negotiable requirement**.

### Security Principles

- Security is NOT optional or additive
- Constructs must provide secure defaults:
  - Encryption at rest (enabled)
  - Encryption in transit (SSL/TLS enabled)
  - Public access (blocked by default)
  - IAM least-privilege principles
  - Logging and monitoring (configured)
- Users may opt-in to less secure configurations explicitly
- Insecure defaults are **forbidden**

### Security Standards

Specific security standards are defined in:
- `docs/standards/common/security.md` - Security best practices and rules
- Security Authority persona is responsible for security review

### Agent Rules

Agents must:
- Apply secure defaults to all constructs
- Justify any security opt-outs
- Surface security risks explicitly
- Never create insecure defaults

**Insecure-by-default constructs will be rejected.**

---

## Quality Gates (Non-Negotiable)

Agents must STOP and not proceed if quality checks fail.

### Mandatory Quality Gates

Before proceeding to the next phase, the following MUST pass:

1. **Build Gate**
   - Project must build successfully
   - No compilation errors
   - JSII compatibility verified

2. **Linter Gate**
   - Linter must pass
   - No new errors introduced
   - Existing warnings acceptable (if pre-existing)

3. **Test Gate**
   - All unit tests must pass
   - All integration tests must pass
   - Coverage thresholds must be met

4. **Standards Compliance Gate**
   - Interfaces reviewed and approved
   - Module layout correct
   - Canonical types reused
   - Anti-patterns absent

### STOP Conditions

Agents MUST stop if:
- ❌ Build fails → Fix before proceeding
- ❌ Tests fail → Fix before proceeding  
- ❌ Linter errors introduced → Fix before proceeding
- ❌ Standards violations found → Fix before proceeding
- ❌ Security issues identified → Fix before proceeding

### Bypass Prohibition

Agents may NOT:
- Skip quality gates
- Bypass failing checks
- Proceed with known failures
- Use workarounds to avoid gates

**Quality gates are mandatory checkpoints, not optional suggestions.**

---

## Canonical Types and Reuse (Hard Rule)

Cross-cutting concerns MUST use canonical shared types. Do not create new
domain-specific types for logging, observability, tags, encryption, naming, etc.

Rules:

- Prefer reuse over invention.
- If a canonical type exists, it MUST be referenced.
- Extensions must be additive and done by composition, not duplication.
- Plural properties represent lists of singular objects (e.g., `logs: LogConfig[]`).
- New types require justification: why existing canonical types are insufficient.

## Module Consumption Style (Hard Rule)

Reusable capability modules (e.g., cidr, logging, tagging, encryption) must be
consumed as whole units, not via piecemeal named imports.

Preferred:

- `import * as cidr from "…/core/networking/cidr"`
- use `cidr.parse()`, `cidr.CidrBlock`, etc.

Discouraged/Forbidden for shared modules:

- `import { parse, CidrBlock } from "…/core/networking/cidr"` (piecemeal)

Barrel exports inside a module boundary are allowed and encouraged.
The goal is a consistent "unit" interface surface.

Single-Path Rule:

- Avoid creating multiple public access paths for the same symbol via convenience re-exports.
- Primary access should be via the module unit surface (e.g., `cidr.parse`, `cidr.CidrBlock`).

## Module File Layout (Hard Rules)

Capability modules come in two kinds.

### A) Pure capability modules (no constructs)

Pure capability modules are **types + functions** only. They MUST contain:

- `types.ts`: public contract (interfaces/types)
- `functions.ts`: module-wide helpers for the capability
- `index.ts`: barrel for the module unit surface

**Rule:** Pure capability modules MUST NOT include `PascalCase.ts` files.

### B) Construct modules (contains L2/L3/L4 constructs)

Construct modules MUST contain:

- `types.ts`: public contract (interfaces/types)
- `functions.ts`: helpers shared across constructs in the module
- `PascalCase.ts`: a construct implementation (and its construct-specific helpers)
- `index.ts`: barrel for the module unit surface

Rules:

- Do not call PascalCase construct files “L1” (CDK L1 has a specific meaning).
- Helpers used by only one construct must live in that construct file.
- Promote helpers to `functions.ts` only when shared across constructs.
- Consumers should import modules as whole units (e.g., `import * as module from "…/path/to/module"`).

### Path convention

- `src/core/**` is reserved for **pure capability modules** and canonical shared types.
  - Treat these as reusable libraries (types/functions), not CDK constructs.
- CDK constructs (L2/L3/L4) should live outside `src/core/**` (e.g., under a domain folder such as `src/network/**`, `src/route53/**`, `src/constructs/**`).

## Repository Style Invariants (Applies to All Work)

- Reuse canonical shared types for cross-cutting concerns (logging, observability, tags, encryption, naming). Do not invent domain-specific variants unless explicitly approved.
- Consume shared capability modules as whole units (module namespace import), not piecemeal named imports (e.g., `import * as cidr from "…/core/networking/cidr"` then use `cidr.parse`, `cidr.CidrBlock`).
- Barrel exports inside a module boundary are allowed and encouraged; avoid convenience re-exports that create multiple public access paths for the same symbol.
- Pure capability modules must follow: `types.ts` (public contract), `functions.ts` (helpers), `index.ts` (barrel). No `PascalCase.ts`.
- Construct modules must follow: `types.ts` (public contract), `functions.ts` (shared helpers), `PascalCase.ts` (construct + construct-specific helpers), `index.ts` (barrel).
- Path convention: `src/core/**` is reserved for pure capability modules and canonical shared types; CDK constructs (L2/L3/L4) live outside `src/core/**`.
- Do not refer to PascalCase construct files as “L1” (CDK L1 has a specific meaning).
- Plural properties represent lists of singular objects (e.g., `logs: ReadonlyArray<logging.LogConfig>`).

---

## Persona Model (Authoritative Responsibility Boundaries)

Personas represent **invariant engineering responsibilities**, not job titles and not organizational structure.

AI agents must operate within one or more personas.
Each persona has a bounded authority and may not overstep it.

Personas are composable and may map many-to-one onto human roles.

### Canonical Personas (Authority-Bearing)

These personas define **decision-making authority**.

- Intent Owner
- Domain Modeler
- Interface Architect
- System Composer
- Implementation Engineer
- Operational Reliability Authority
- Security Authority
- Scalability & Performance Authority
- Observability & Operability Authority
- Change & Evolution Authority
- Cost & Resource Authority
- Compliance & Policy Authority
- Developer Experience Authority
- Release Steward
- Long-Term Steward

If a task implicates a canonical persona not explicitly invoked, the agent must call it out.

---

## Skilled Personas (Domain Expertise Lenses)

Skilled personas provide **technical depth**, not authority.
They may be invoked to inform decisions but do not override canonical personas.

Skilled personas may be combined freely.

### Common Skilled Personas

- Network Engineer
- Kubernetes Engineer
- Cloud Infrastructure Engineer
- IAM / Identity Engineer
- Security Engineer (Implementation-Focused)
- Observability Engineer
- Data Platform Engineer
- Storage Engineer
- Distributed Systems Engineer
- Performance Engineer
- Automation / CI-CD Engineer

Rules:

- Skilled personas advise; canonical personas decide
- Skilled personas must respect construct layering
- Skilled personas may surface risks, tradeoffs, and best practices
- Final authority always resides with a canonical persona

---

## Skills Model

Skills are **reusable, named reasoning processes**.

Each persona (canonical or skilled) may only invoke skills aligned with its scope.

Skills define:

- Preconditions
- Reasoning process
- Constraints
- Output contracts
- Human approval gates

Skills may be defined inline or under a dedicated `skills/` directory.

Core skills expected in this repository include:

- Interface Designer
- Module Layout Enforcer
- Canonical Type Reuse

If a task introduces or modifies a cross-cutting object (logging, observability, tags, encryption, naming), agents must invoke Canonical Type Reuse and explicitly justify any new type creation.

---

## Operational Dimensions (Shift-Left Operations)

Operations are a **design-time property**, not a downstream phase.

All constructs (L2–L4) must be evaluated across the following operational dimensions:

1. Reliability & Failure Behavior
2. Scalability & Performance
3. Security & Blast Radius
4. Operability & Observability
5. Change Safety & Evolution
6. Cost & Resource Governance

Rules:

- Agents must produce explicit findings for each dimension
- If a dimension is not applicable, state why
- Silent failure is unacceptable

---

## SDLC Guardrails

AI agents participate in the SDLC as **bounded collaborators**.

Default SDLC flow:

1. Intent & requirements
2. Domain & interface design
3. Architectural composition
4. Operational review (all dimensions)
5. Implementation
6. Validation & testing
7. Human approval
8. Release & evolution planning

### Approval Gates (Non-Optional)

Explicit human approval is required before:

- Modifying public interfaces
- Changing construct behavior
- Introducing breaking changes
- Modifying L2 or L3 constructs
- Executing destructive actions
- Making irreversible decisions

---

## Change Safety Rules

- Prefer additive changes
- Never silently break backward compatibility
- Always document behavioral changes
- Explicitly call out blast radius
- Rollback must be possible unless explicitly stated otherwise

---

## Agent Execution Model

This repository uses an explicit agent orchestration model.

Approved agent workflows are defined in **`AGENTS.md`**.

Rules:

- `CLAUDE.md` defines **what is allowed**
- `AGENTS.md` defines **how work is performed**
- If `AGENTS.md` conflicts with `CLAUDE.md`, **`CLAUDE.md` prevails**
- Agents may not exceed the authority of their assigned canonical personas
- Skilled personas may inform but not override authority
- Agents must respect all approval gates
- Agents must also comply with the Repository Style Invariants above.

---

## MCP Interaction Rules (Execution Plane)

AI agents may use MCP tools for:

- Reading files
- Writing files
- Running CDK synth
- Executing tests
- Validating interfaces

Constraints:

- No destructive actions without explicit approval
- No writes outside approved paths
- All generated files must conform to repository standards
- Side effects must be intentional and explicit

---

## Fail-Closed Principle (Overrides All Other Rules)

If information is missing, ambiguous, or conflicting:

- Do NOT guess
- Do NOT proceed
- Ask for clarification

This rule overrides all others.
