# Skills Catalog

**Purpose**: Skills are reusable, named reasoning processes that enforce architectural invariants and design standards.

**Authority**: Skills enforce rules defined in `CLAUDE.md` and `AGENTS.md`.

---

## What is a Skill?

A skill is a **structured reasoning process** that:

- Has explicit preconditions (fail-closed if missing)
- Follows a defined workflow with hard rules
- Produces explicit artifacts for handoff
- Includes human approval gates
- Enforces constitutional principles from CLAUDE.md

Skills are **persona-agnostic** and can be invoked by multiple agents.

---

## Skill Structure

All skills follow this standard structure:

1. **Purpose** - What problem does this skill solve?
2. **When to Use** - Invocation triggers
3. **Preconditions** - Required information (fail-closed if missing)
4. **Workflow/Rules** - Step-by-step process with hard rules
5. **Output Contract** - Required artifacts produced
6. **Constraints** - What this skill may NOT do
7. **Approval Gate** - Human approval requirements
8. **References** - Related documents (optional)

---

## Available Skills

### Design & Architecture Skills

#### [Interface Designer](./interface-designer.md)

**Purpose**: Design stable, reusable interfaces for platform capabilities and constructs

**Used by**: Interface Architect Agent

**Produces**:

- Requirements recap
- Interface decisions
- YAML interface contract (design artifact)
- TypeScript mapping notes
- Canonical type reuse documentation

**When to use**:

- Defining a new public interface
- Evolving an existing interface
- Reviewing interface for consistency and stability
- Translating requirements into interface contract

---

#### [Canonical Type Reuse](./canonical-type-reuse.md)

**Purpose**: Prevent interface fragmentation by enforcing "one concept → one canonical type"

**Used by**: Interface Architect Agent, Construct Implementation Agent

**Produces**:

- Concern classification (cross-cutting or not)
- Canonical type decision (reuse, extend, or propose new)
- Access path for consumers (namespace import)
- Approval gates (if new type needed)

**When to use**:

- Interface introduces/modifies cross-cutting concern
- Construct needs logging, observability, tags, encryption, naming
- PR introduces new type that "smells" cross-cutting

---

#### [Module Layout Enforcer](./module-layout-enforcer.md)

**Purpose**: Enforce consistent module structure across repository

**Used by**: Interface Architect Agent, Construct Implementation Agent

**Produces**:

- Proposed folder/file tree
- `types.ts` skeleton (public contract)
- `functions.ts` skeleton (helpers)
- `PascalCase.ts` skeleton (construct + construct-specific helpers)
- `index.ts` barrel
- Compliance checklist

**When to use**:

- Creating a new capability module
- Adding a new construct file to existing module
- Refactoring module exports
- Reviewing PR for module consistency
- Scaffolding new constructs

---

## Planned Skills (Not Yet Implemented)

### Design & Architecture (Agent 1)

- **Standards Interpreter** - Read and apply repository standards to design decisions
- **L2 Interface Review** - Review L2 primitive interfaces for completeness
- **L3 Construct Design** - Design L3 construct compositions from L2 primitives
- **Domain Boundary Analysis** - Identify domain boundaries for module organization

### Operational Review (Agent 2)

- **Failure Mode Analysis** - Identify failure modes and mitigations
- **Scalability & Limit Review** - Assess scalability and AWS service limits
- **Threat Modeling** - Security threat analysis and mitigations
- **Observability Design Review** - Ensure appropriate logging, metrics, tracing
- **Cost Model Analysis** - Analyze cost implications of design decisions
- **Change Safety Review** - Assess blast radius and rollback capability

### Implementation (Agent 3)

- **CDK Construct Implementation** - Implement CDK constructs following approved interfaces
- **Safe Refactor (No Behavior Change)** - Refactor code without changing behavior
- **Idiomatic TypeScript** - Apply TypeScript best practices and SOLID principles
- **Composition Validation** - Validate L3 constructs properly compose L2 primitives

### Testing & Validation

- **Unit Test Design** - Design comprehensive unit tests (85%+ coverage)
- **Integration Test Design** - Design integration tests (Jest and CDK)
- **Validation Logic Design** - Design props validation before resource creation

---

## Skill Invocation by Agent

### Agent 1: Interface Architect Agent

**Allowed Skills** (from `AGENTS.md`):

- ✅ **Interface Designer** (implemented)
- ✅ **Canonical Type Reuse** (implemented)
- ✅ **Module Layout Enforcer** (implemented)
- ⏳ Standards Interpreter (planned)
- ⏳ L2 Interface Review (planned)
- ⏳ L3 Construct Design (planned)
- ⏳ Domain Boundary Analysis (planned)

---

### Agent 2: Operational Review Agent

**Allowed Skills** (from `AGENTS.md`):

- ⏳ Failure Mode Analysis (planned)
- ⏳ Scalability & Limit Review (planned)
- ⏳ Threat Modeling (planned)
- ⏳ Observability Design Review (planned)
- ⏳ Cost Model Analysis (planned)
- ⏳ Change Safety Review (planned)

---

### Agent 3: Construct Implementation Agent

**Allowed Skills** (from `AGENTS.md`):

- ✅ **Canonical Type Reuse** (implemented)
- ✅ **Module Layout Enforcer** (implemented)
- ⏳ CDK Construct Implementation (planned)
- ⏳ Safe Refactor (No Behavior Change) (planned)
- ⏳ Idiomatic TypeScript (planned)
- ⏳ Composition Validation (planned)

---

## Using Skills

### For AI Agents

To invoke a skill:

1. Check preconditions (fail-closed if missing)
2. Follow workflow step-by-step
3. Produce all required outputs
4. Honor approval gates
5. Hand off artifacts to next agent/human

### For Human Reviewers

When reviewing skill outputs:

1. Verify all preconditions were met
2. Check output contract is complete
3. Validate approval gates are honored
4. Confirm constitutional compliance

---

## Creating New Skills

To propose a new skill:

1. **Identify Pattern**: Recognize recurring reasoning pattern across work
2. **Document**: Create skill document following standard structure
3. **Review**: Check against constitutional requirements (CLAUDE.md)
4. **Assign**: Add to appropriate agent(s) in AGENTS.md
5. **Approve**: Request human approval
6. **Catalog**: Add to this README.md

**Template**: Copy structure from existing skills (Interface Designer, Canonical Type Reuse, Module Layout Enforcer)

---

## Skill Evolution

Skills evolve through:

### Additive Changes (Lower Barrier)

- Adding examples
- Adding procedures or checklists
- Clarifying ambiguous sections
- Adding fail-closed scenarios

### Breaking Changes (Higher Barrier)

- Modifying workflow steps
- Changing output contract
- Modifying approval gates
- Changing constraints

**All changes require**: Human approval and update to this catalog

---

## Skill Quality Standards

All skills must:

- ✅ Enforce constitutional principles from CLAUDE.md
- ✅ Include explicit preconditions (fail-closed if missing)
- ✅ Define clear workflow or decision tree
- ✅ Specify required outputs (artifact contract)
- ✅ Include explicit approval gates
- ✅ State constraints (what skill may NOT do)
- ✅ Be actionable by AI agents
- ✅ Be reviewable by humans

---

## References

- `CLAUDE.md` - Constitutional authority and architectural invariants
- `AGENTS.md` - Agent orchestration and skill assignments
- `docs/constructs/**` - Technical standards enforced by skills
- `docs/analysis/skills.md` - Comprehensive skills analysis

---

## Status Summary

**Skills Implemented**: 3 / ~20+ planned  
**Coverage**: Design & Architecture (3), Operational Review (0), Implementation (0), Testing (0)  
**Quality Score**: 4.8 / 5.0 (high quality foundation)

**Next Priority**: Operational Review skills (Failure Mode Analysis, Observability Design Review)

---

*Last Updated*: December 22, 2025  
*Maintained By*: Repository Stewards
