# Skills Analysis: Canonical Type Reuse, Interface Designer, Module Layout Enforcer

**Date**: December 22, 2025  
**Purpose**: Evaluate existing skills for consistency, completeness, and alignment with constitutional framework  
**Skills Analyzed**: 3 of 3 defined skills

---

## Executive Summary

The three defined skills (`canonical-type-reuse.md`, `interface-designer.md`, `module-layout-enforcer.md`) represent **well-structured, reusable reasoning processes** that enforce architectural invariants and design standards. They are:

- **Constitutional in nature**: Enforce hard rules from CLAUDE2.md
- **Persona-agnostic**: Can be invoked by multiple agents/personas
- **Artifact-producing**: Generate explicit outputs for handoff
- **Approval-aware**: Include explicit human approval gates

However, gaps exist in:
- Coverage of additional skills referenced in CLAUDE2.md and AGENTS.md
- Cross-referencing between skills and constitutional documents
- Operational dimension skills (security, reliability, cost)
- Testing and validation skills

---

## Skill-by-Skill Analysis

### Skill 1: Canonical Type Reuse

**File**: `skills/canonical-type-reuse.md` (144 lines)

#### Purpose & Scope

Prevents interface fragmentation by enforcing "one concept → one canonical type" for cross-cutting concerns (logging, observability, tags, encryption, naming).

#### Strengths

1. **Clear Decision Tree**: 
   - Direct reuse (preferred)
   - Additive extension by composition (preferred when customization needed)
   - Additive extension by subtype (careful)
   - Propose new canonical type (approval required)

2. **Hard Rules**:
   - No domain-specific variants without approval
   - Plural properties = lists of singular objects
   - Module-as-a-unit consumption
   - Single-Path rule enforcement

3. **Concrete Examples**:
   - Direct reuse pattern
   - Composition wrapper pattern

4. **Output Contract**: Required outputs clearly specified

5. **Approval Gate**: Explicit for new/modified canonical types

#### Weaknesses & Gaps

1. **Cross-Cutting Concept List**: Non-exhaustive, could be more comprehensive
   - Missing: naming, observability specifics, encryption patterns
   - Recommendation: Reference canonical list in `docs/standards/canonical-types.md`

2. **Search Methodology**: "Search for existing canonical types" is vague
   - How to search? Grep? File naming convention?
   - Recommendation: Add search procedure or reference tool

3. **Conflict Resolution**: Doesn't address what to do if multiple similar canonical types exist
   - Example: What if both `logging.LogConfig` and `observability.LogConfig` exist?
   - Recommendation: Add conflict resolution procedure

4. **Version Evolution**: Doesn't address how to evolve canonical types over time
   - What if existing type is insufficient for new use case?
   - Recommendation: Add evolution pattern (additive changes only)

5. **Cross-Reference**: References `docs/standards/canonical-types.md` but doesn't verify it exists
   - Recommendation: Update to reference actual documentation structure

#### Alignment with Constitutional Framework

- ✅ Enforces CLAUDE2.md § Canonical Types and Reuse
- ✅ Supports fail-closed principle (STOP and ask if missing info)
- ✅ Explicit approval gates
- ✅ Artifact-producing (outputs classification, decision, extension pattern)
- ⚠️ References `docs/interfaces/**` which doesn't exist in current structure

#### Persona Alignment

**From AGENTS.md**:
- Agent 1 (Interface Architect): ✅ Listed as allowed skill
- Agent 3 (Construct Implementation): ✅ Listed as allowed skill

**Should also be available to**:
- Operational Review Agent (for validating canonical type usage)

---

### Skill 2: Interface Designer

**File**: `skills/interface-designer.md` (200 lines)

#### Purpose & Scope

Design stable, reusable interfaces for platform capabilities and constructs. Interface-first approach optimized for long-term evolution, multi-team consumption, composition over inheritance.

Unique approach: **Conversational design workflow producing YAML interface contracts**.

#### Strengths

1. **Three-Phase Workflow**:
   - Phase 1: Conversational design (requirements, constraints, extension points)
   - Phase 2: YAML interface contract (design artifact)
   - Phase 3: Handoff for implementation (mapping to TypeScript)

2. **YAML as Design Artifact**: 
   - Innovative approach using Kubernetes-style manifests
   - Human-readable, agent-parsable
   - Inline documentation
   - Example values included

3. **Core Interface Rules**:
   - Minimal required inputs
   - Nested optional groups
   - No provider-specific type leakage
   - Composition over inheritance

4. **Canonical Type Reuse Integration**: Explicitly invokes Canonical Type Reuse skill

5. **Module Boundary Rule**: Enforces whole-unit consumption and Single-Path rule

6. **Comprehensive Output Contract**: 
   - Requirements recap
   - Interface decisions
   - YAML contract
   - TypeScript mapping notes
   - Canonical reuse + access path
   - Approval gates

#### Weaknesses & Gaps

1. **YAML Format Not Standardized**: 
   - Example shows `apiVersion: platform.cdk/v1alpha1` and `kind:` fields
   - Is this format mandatory? What schema?
   - Recommendation: Provide YAML schema or template

2. **Handoff Artifact Not Formalized**:
   - "Short handoff package" mentioned but format unclear
   - Who receives handoff? (Presumably Construct Implementation Agent)
   - Recommendation: Formalize handoff artifact structure

3. **Interface Evolution Not Addressed**:
   - How to modify existing interfaces?
   - Backward compatibility rules?
   - Recommendation: Add interface versioning guidance

4. **Layer-Specific Rules Incomplete**:
   - Mentions L2/L3/L4 but doesn't provide layer-specific interface patterns
   - What makes an L2 interface different from L3?
   - Recommendation: Add layer-specific interface guidance

5. **No Validation Skill Reference**:
   - Interfaces need validation logic
   - Should reference or invoke validation design skill
   - Recommendation: Add validation design section

6. **Extension Point Design Underspecified**:
   - Mentions "identify extension points" but no guidance on how
   - What patterns for extensibility? (plugin, strategy, observer?)
   - Recommendation: Add extensibility pattern guidance

7. **Cross-Reference Issues**:
   - References `src/core/**` ✅
   - References `docs/interfaces/**` ⚠️ (doesn't exist)
   - References `docs/standards/**` ⚠️ (exists but conflicts with docs/constructs/)

#### Alignment with Constitutional Framework

- ✅ Enforces CLAUDE2.md § Canonical Types and Reuse
- ✅ Enforces CLAUDE2.md § Module Consumption Style
- ✅ Enforces layering rules (L2/L3/L4)
- ✅ Supports fail-closed principle
- ✅ Explicit approval gates for interface changes
- ✅ No implementation behavior (design only)
- ⚠️ YAML approach not mentioned in CLAUDE2.md (not a conflict, just novel)

#### Persona Alignment

**From AGENTS.md**:
- Agent 1 (Interface Architect): ✅ Listed as allowed skill

**Should also be available to**:
- Operational Review Agent (for reviewing interface designs)

#### Novel Contribution

The **YAML interface contract** approach is innovative and valuable:
- Separates design from implementation language
- Human-readable design artifacts
- Enables non-TypeScript stakeholders to review
- Could be adopted as formal design practice

**Recommendation**: Formalize YAML schema and tooling

---

### Skill 3: Module Layout Enforcer

**File**: `skills/module-layout-enforcer.md` (178 lines)

#### Purpose & Scope

Enforce consistent module structure across repository to ensure:
- Reusable capability modules consumed as whole units
- Interfaces remain consistent
- Utilities don't become "utils soup"
- Construct-specific helpers stay near constructs
- Exports/imports reinforce module boundaries

#### Strengths

1. **Two Module Kinds Clearly Defined**:
   - A) Pure capability modules (types + functions only)
   - B) Construct modules (adds PascalCase.ts files)

2. **Explicit File Structure Requirements**:
   - `types.ts`: public contract
   - `functions.ts`: shared helpers
   - `PascalCase.ts`: construct + construct-specific helpers (construct modules only)
   - `index.ts`: barrel

3. **Path Convention**:
   - `src/core/**` for pure capabilities
   - Domain folders for constructs

4. **Utility Promotion Rule**: Clear decision tree
   - 1 construct → keep in construct file
   - 2+ constructs in module → move to functions.ts
   - Multiple modules → move to canonical capability

5. **Whole-Unit Import Policy**: Enforces module-as-unit consumption

6. **Single-Path Rule**: Prevents multiple access paths

7. **Naming Clarification**: "Do NOT refer to PascalCase construct files as 'L1'"

8. **Comprehensive Output Contract**: Tree, skeletons, checklist

#### Weaknesses & Gaps

1. **Constants File Not Addressed**:
   - CLAUDE.md mentions `constants.ts` as optional
   - When is it appropriate?
   - Recommendation: Add guidance on constants.ts usage

2. **Test File Location Not Specified**:
   - Where do test files live relative to module?
   - `test/` directory parallel to `src/`? Or co-located?
   - Recommendation: Add testing file layout guidance

3. **Integration Test File Location Not Specified**:
   - Where do `integ.*.ts` files live?
   - Recommendation: Reference integration testing docs

4. **Circular Dependency Prevention**:
   - How to prevent circular imports?
   - Recommendation: Add dependency direction rules

5. **Module Size Guidance**:
   - When to split a module?
   - How many constructs per module?
   - Recommendation: Add module cohesion guidance

6. **Barrel Export Patterns**:
   - What should/shouldn't be exported from index.ts?
   - Internal vs external APIs?
   - Recommendation: Add barrel export guidelines

7. **Breaking Change Detection**:
   - How to detect if module layout change breaks consumers?
   - Recommendation: Reference versioning/compatibility docs

8. **Cross-Module Dependencies**:
   - How should modules depend on each other?
   - Can pure capability modules depend on other capabilities?
   - Recommendation: Add dependency hierarchy rules

#### Alignment with Constitutional Framework

- ✅ Enforces CLAUDE2.md § Module File Layout
- ✅ Enforces CLAUDE2.md § Path Convention
- ✅ Enforces CLAUDE2.md § Module Consumption Style
- ✅ Enforces CLAUDE2.md § Canonical Types (references in types.ts)
- ✅ Supports fail-closed principle
- ✅ Explicit approval gates for breaking changes
- ✅ No behavior implementation (scaffolding only)

#### Persona Alignment

**From AGENTS.md**:
- Agent 1 (Interface Architect): ✅ Listed as allowed skill
- Agent 3 (Construct Implementation): ✅ Listed as allowed skill

**Should also be available to**:
- All agents for self-verification

---

## Cross-Skill Analysis

### Skill Interdependencies

```
Interface Designer
    ↓ invokes
Canonical Type Reuse
    ↓ outputs
(Canonical type decision)
    ↓ consumed by
Module Layout Enforcer
    ↓ outputs
(Module structure)
    ↓ consumed by
(Implementation Agent)
```

**Observations**:
- Clear dependency chain
- Well-defined handoff points
- Artifact-based collaboration

**Gap**: No reverse feedback loop (implementation findings → interface refinement)

---

### Consistency Analysis

#### Terminology Consistency ✅

All three skills use consistent terminology:
- "Canonical types"
- "Cross-cutting concerns"
- "Module-as-a-unit consumption"
- "Single-Path rule"
- "Barrel exports"
- "Whole-unit import"
- "PascalCase.ts" (not "L1")

#### Structure Consistency ✅

All three skills follow same structure:
1. Purpose
2. When to Use
3. Preconditions
4. Workflow/Rules
5. Output Contract
6. Constraints
7. Approval Gate
8. References (optional)

#### Cross-Reference Consistency ⚠️

Documentation paths referenced:
- ✅ `src/core/**` (consistent)
- ⚠️ `docs/standards/**` (exists but conflicts with CLAUDE.md's `docs/constructs/**`)
- ⚠️ `docs/interfaces/**` (doesn't exist)

**Recommendation**: Update all skills to reference actual documentation structure

---

### Gap Analysis: Missing Skills

**From CLAUDE2.md § Skills Model**: "Core skills expected in this repository include..."

**From AGENTS.md**:

#### Agent 1 (Interface Architect) - Missing Skills:
- ✅ Interface Designer (exists)
- ❌ Standards Interpreter (missing)
- ❌ L2 Interface Review (missing)
- ❌ L3 Construct Design (missing)
- ❌ Domain Boundary Analysis (missing)
- ✅ Module Layout Enforcer (exists)
- ✅ Canonical Type Reuse (exists)

#### Agent 2 (Operational Review) - Missing Skills:
- ❌ Failure Mode Analysis (missing)
- ❌ Scalability & Limit Review (missing)
- ❌ Threat Modeling (missing)
- ❌ Observability Design Review (missing)
- ❌ Cost Model Analysis (missing)
- ❌ Change Safety Review (missing)

#### Agent 3 (Construct Implementation) - Missing Skills:
- ❌ CDK Construct Implementation (missing - could be formalized)
- ❌ Safe Refactor (No Behavior Change) (missing)
- ❌ Idiomatic TypeScript (missing - could reference TYPESCRIPT.md)
- ❌ Composition Validation (missing)
- ✅ Module Layout Enforcer (exists)
- ✅ Canonical Type Reuse (exists)

#### Additional Skills Referenced but Not Defined:
- Testing skill (unit, integration, coverage)
- Validation design skill
- Error message design skill
- Documentation generation skill

---

## Recommendations

### Priority 1: Fix Cross-References ⚠️ CRITICAL

**Issue**: Skills reference non-existent or conflicting documentation paths

**Action**:
```markdown
# Update all skills to reference actual structure:

From:
- docs/standards/canonical-types.md
- docs/standards/module-consumption.md
- docs/interfaces/** (doesn't exist)

To:
- docs/constructs/CONSTRUCT-DESIGN.md
- docs/constructs/COMMON-INTERFACES.md
- docs/constructs/MODULE-STRUCTURE.md
- docs/standards/** (if this actually exists alongside docs/constructs/)
```

**Files to Update**:
- `skills/canonical-type-reuse.md` - References section
- `skills/interface-designer.md` - Preconditions, Workflow
- `skills/module-layout-enforcer.md` - Preconditions

---

### Priority 1: Create Skills Index ⚠️ CRITICAL

**Issue**: No single source of truth listing all skills

**Action**: Create `skills/README.md`

**Content**:
```markdown
# Skills Catalog

## Purpose

Skills are reusable, named reasoning processes that enforce architectural
invariants and design standards. Skills are invoked by agents to perform
specific types of analysis or design work.

## Skill Structure

All skills follow this structure:
1. Purpose - What problem does this skill solve?
2. When to Use - Invocation triggers
3. Preconditions - Required information (fail-closed if missing)
4. Workflow/Rules - Step-by-step process with hard rules
5. Output Contract - Required artifacts produced
6. Constraints - What this skill may NOT do
7. Approval Gate - Human approval requirements
8. References - Related documents

## Available Skills

### Design & Architecture Skills
- [Interface Designer](./interface-designer.md) - Design stable, reusable interfaces
- [Canonical Type Reuse](./canonical-type-reuse.md) - Enforce canonical type usage
- [Module Layout Enforcer](./module-layout-enforcer.md) - Enforce module structure

### Operational Skills (TBD)
- Standards Interpreter - TBD
- L2 Interface Review - TBD
- L3 Construct Design - TBD
- Domain Boundary Analysis - TBD

### Review Skills (TBD)
- Failure Mode Analysis - TBD
- Scalability & Limit Review - TBD
- Threat Modeling - TBD
- Observability Design Review - TBD
- Cost Model Analysis - TBD
- Change Safety Review - TBD

### Implementation Skills (TBD)
- CDK Construct Implementation - TBD
- Safe Refactor (No Behavior Change) - TBD
- Idiomatic TypeScript - TBD
- Composition Validation - TBD

## Skill Invocation

Skills are invoked by agents when needed. From AGENTS.md:
- Agent 1 (Interface Architect): Interface Designer, Canonical Type Reuse, Module Layout Enforcer, ...
- Agent 2 (Operational Review): Failure Mode Analysis, Scalability & Limit Review, ...
- Agent 3 (Construct Implementation): Module Layout Enforcer, Canonical Type Reuse, ...

## Creating New Skills

To propose a new skill:
1. Identify recurring reasoning pattern
2. Document as skill following structure above
3. Assign to appropriate agent(s) in AGENTS.md
4. Request human approval
5. Add to this catalog
```

---

### Priority 2: Enhance Existing Skills

#### Canonical Type Reuse Enhancements

1. **Add Search Procedure**:
```markdown
## Search Methodology

To find existing canonical types:

1. Search `src/core/**` for capability modules:
   ```bash
   # Search for cross-cutting concept
   grep -r "export interface.*Config" src/core/
   grep -r "export type" src/core/
   ```

2. Check documentation:
   - `docs/constructs/COMMON-INTERFACES.md`
   - `docs/constructs/INTERFACES.md`

3. If uncertain, ask human to confirm canonical type location
```

2. **Add Conflict Resolution**:
```markdown
## Conflict Resolution

If multiple similar canonical types exist:
1. Prefer types in `src/core/**` over domain-specific modules
2. Prefer more general types over specialized variants
3. If both are equally canonical, STOP and ask human to clarify
```

3. **Add Evolution Guidance**:
```markdown
## Canonical Type Evolution

When existing canonical type is insufficient:

1. **Additive Extension** (preferred):
   - Add optional properties
   - Extend with composition
   - Preserve backward compatibility

2. **Breaking Changes** (requires approval):
   - Rename type to `*V2`
   - Deprecate old type
   - Provide migration guide
```

#### Interface Designer Enhancements

1. **Add YAML Schema**:
```markdown
## YAML Interface Contract Schema

All YAML interface contracts MUST follow this structure:

```yaml
apiVersion: platform.cdk/v1alpha1  # Fixed
kind: <ConstructName>                # PascalCase construct name
metadata:
  name: <example-name>               # kebab-case example
  description: |                     # Optional, multiline
    Human-readable description

spec:
  # Required fields (minimal)
  requiredField: <type>

  # Optional capability groups (nested)
  logging:
    logs: []                         # Plural = array of objects

  observability:
    metrics: []

  advanced:
    # Rare/advanced options
```

2. **Add Layer-Specific Guidance**:
```markdown
## Layer-Specific Interface Patterns

### L2 Interfaces (Primitives)
- Extend upstream AWS CDK props
- No business logic
- Security defaults
- Example: `SecureBucketProps extends s3.BucketProps`

### L3 Interfaces (Compositions)
- Compose L2 interfaces
- Hide provider details
- Capability groups
- Example: `ApplicationStackProps` with `vpc`, `cluster`

### L4 Interfaces (Solutions)
- Opinionated defaults
- Use-case specific
- May reference domain concepts
- Example: `DataPipelineProps` with `source`, `transform`, `destination`
```

3. **Formalize Handoff Artifact**:
```markdown
## Handoff Artifact Format

After YAML interface approval, produce:

### 1. Interface Contract (YAML)
- Final approved YAML

### 2. TypeScript Mapping Table
| YAML Path | TypeScript Type | File | Notes |
|-----------|----------------|------|-------|
| spec.logging.logs | ReadonlyArray<logging.LogConfig> | types.ts | Canonical reuse |
| spec.advanced.timeoutSeconds | number | types.ts | Optional |

### 3. Canonical Type Imports
```typescript
// Required imports for types.ts
import * as logging from '@/core/logging';
import * as tags from '@/core/tags';
```

### 4. Approval Gates
- [ ] Human approval for interface shape
- [ ] Human approval for new canonical types (if any)
```

#### Module Layout Enforcer Enhancements

1. **Add Test File Guidance**:
```markdown
## Test File Layout

### Unit Tests
Location: `test/<module-path>/<construct-name>.test.ts`

Example:
```
src/constructs/vpc/Vpc.ts
test/constructs/vpc/Vpc.test.ts
```

### Integration Tests
Location: `src/integration/<module>/<construct-name>.integration.test.ts`

CDK Integration:
Location: `src/integration/<module>/integ.<construct-name>.ts`
```

2. **Add Constants Guidance**:
```markdown
## Constants File (Optional)

Add `constants.ts` when:
- Module has magic numbers used across multiple files
- Module has configuration defaults
- Module has lookup tables

**Rule**: Constants must be used by 2+ files in module.
If used by only 1 file, keep in that file.
```

3. **Add Dependency Direction Rules**:
```markdown
## Module Dependency Hierarchy

Allowed dependencies:
```
Domain Constructs (src/constructs/**)
    ↓ can depend on
Pure Capabilities (src/core/**)
    ↓ cannot depend on
Domain Constructs (would be circular)
```

**Rules**:
- Pure capability modules cannot depend on construct modules
- Construct modules can depend on pure capabilities
- Cross-domain construct dependencies require justification
```

---

### Priority 3: Create Missing Skills (High Value)

#### Skill: Standards Interpreter

**Purpose**: Read and apply repository standards to specific design/implementation decisions

**Invoked by**: Interface Architect Agent, Construct Implementation Agent

**Output**: Standard interpretation, applicability to current task, compliance checklist

#### Skill: L3 Construct Design

**Purpose**: Design L3 construct compositions from L2 primitives

**Invoked by**: Interface Architect Agent

**Output**: Composition diagram, interface dependencies, security boundary analysis

#### Skill: CDK Construct Implementation

**Purpose**: Implement CDK constructs following approved interfaces and standards

**Invoked by**: Construct Implementation Agent

**Output**: TypeScript implementation, TSDoc, validation logic

#### Skill: Failure Mode Analysis

**Purpose**: Identify failure modes and mitigations for constructs

**Invoked by**: Operational Review Agent

**Output**: FMEA table, risk ratings, required mitigations

**Key Elements**:
- What can fail?
- What causes failure?
- What are consequences?
- How to detect?
- How to mitigate?

#### Skill: Observability Design Review

**Purpose**: Ensure constructs have appropriate logging, metrics, tracing

**Invoked by**: Operational Review Agent

**Output**: Observability assessment, instrumentation recommendations

**Key Elements**:
- Logs: What events to log? What level?
- Metrics: What to measure? What dimensions?
- Traces: What to trace? What context?
- Alarms: What thresholds? What actions?

#### Skill: Composition Validation

**Purpose**: Validate L3 constructs properly compose L2 primitives

**Invoked by**: Construct Implementation Agent

**Output**: Composition checklist, dependency graph, security boundary verification

---

### Priority 3: Create Missing Skills (Medium Value)

#### Skill: Safe Refactor (No Behavior Change)

**Purpose**: Refactor code without changing observable behavior

**Output**: Refactored code, test proof of equivalence

#### Skill: Idiomatic TypeScript

**Purpose**: Apply TypeScript best practices and SOLID principles

**References**: TYPESCRIPT.md

**Output**: Code review findings, refactoring suggestions

#### Skill: Domain Boundary Analysis

**Purpose**: Identify domain boundaries for module organization

**Output**: Domain model, module boundaries, interface contracts

---

### Priority 4: Skill Documentation Improvements

#### Add Skill Metrics Section

For each skill, add:
```markdown
## Skill Metrics (Optional)

How to measure skill effectiveness:
- Input: X
- Process: Y steps
- Output: Z artifacts
- Success criteria: ...
- Failure modes: ...
```

#### Add Skill Evolution Section

For each skill, add:
```markdown
## Skill Evolution

This skill may evolve through:
- Additive enhancements (examples, procedures)
- Constraint clarifications
- Approval gate refinements

Breaking changes to skill workflow require human approval.
```

#### Add Related Skills Section

For each skill, explicitly link related skills:
```markdown
## Related Skills

- **Invokes**: Canonical Type Reuse
- **Invoked by**: Interface Designer
- **Complements**: Module Layout Enforcer
```

---

## Skill Quality Assessment

### Evaluation Criteria

1. **Clarity**: Are preconditions, workflow, and outputs clear?
2. **Completeness**: Are all decision points covered?
3. **Actionability**: Can an AI agent execute this skill?
4. **Fail-Closed**: Does it stop when information is missing?
5. **Approval Gates**: Are human approvals explicit?
6. **Artifact-Producing**: Does it generate handoff artifacts?
7. **Constitutional Alignment**: Does it enforce CLAUDE2.md rules?

### Scores (1-5, 5=excellent)

| Skill | Clarity | Completeness | Actionability | Fail-Closed | Approval Gates | Artifacts | Constitutional | Overall |
|-------|---------|--------------|---------------|-------------|----------------|-----------|----------------|---------|
| Canonical Type Reuse | 5 | 4 | 4 | 5 | 5 | 5 | 5 | 4.7 |
| Interface Designer | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 4.9 |
| Module Layout Enforcer | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 4.9 |

**Average**: 4.8 / 5.0

**Assessment**: Existing skills are **high quality** and well-structured. Minor completeness gaps exist (search procedures, test layout, evolution guidance) but overall design is excellent.

---

## Strategic Recommendations

### Recommendation 1: Formalize Skill Lifecycle

Create `docs/process/SKILL-LIFECYCLE.md`:

```markdown
# Skill Lifecycle

## Skill States
- **Proposed**: Identified need, not yet documented
- **Draft**: Documented, under review
- **Active**: Approved, in use by agents
- **Deprecated**: Being replaced, still available
- **Archived**: No longer used

## Skill Creation Process
1. Identify recurring reasoning pattern
2. Document using skill template
3. Review against constitutional requirements
4. Assign to agent(s) in AGENTS.md
5. Human approval
6. Add to skills/README.md
7. Mark as Active

## Skill Evolution Process
1. Identify improvement need
2. Propose enhancement (additive preferred)
3. Review impact on existing agents
4. Human approval
5. Update skill document
6. Update version/date

## Skill Retirement Process
1. Identify obsolete or problematic skill
2. Identify replacement (if any)
3. Update AGENTS.md to remove skill
4. Mark skill as Deprecated
5. After deprecation period, mark as Archived
```

### Recommendation 2: Skill Testing Framework

Create mechanism to validate skills work as intended:

```markdown
# Skill Testing (Concept)

## Skill Test Structure
For each skill, create example scenarios:
- Input: <preconditions>
- Expected Output: <artifacts>
- Success Criteria: <checklist>

## Example: Canonical Type Reuse
Scenario 1: Direct Reuse
- Input: Need logging in VpcProps
- Expected: Identify logging.LogConfig, propose ReadonlyArray<logging.LogConfig>
- Success: No new type created, correct import path

Scenario 2: Extension Needed
- Input: Need VPC-specific logging with traffic type
- Expected: Propose composition wrapper around logging.LogConfig
- Success: Canonical type reused, extension is additive
```

### Recommendation 3: Skill Coverage Analysis

Regularly audit:
1. Which agents need which skills? (compare AGENTS.md to skills/)
2. Which skills are actually used? (track invocations)
3. Which operational dimensions lack skills? (compare to CLAUDE2.md § Operational Dimensions)

### Recommendation 4: Skill Discoverability

Improve how agents discover and invoke skills:

**Option A**: Skill Registry
```typescript
// skills/registry.ts (concept)
export const SKILL_REGISTRY = {
  'interface-designer': {
    path: './interface-designer.md',
    agents: ['Interface Architect'],
    triggers: ['new interface', 'interface modification'],
    preconditions: ['problem statement', 'layer intent', 'standards'],
  },
  // ...
};
```

**Option B**: Skill Tags/Metadata
```yaml
# skills/canonical-type-reuse.md (front matter)
---
skill: canonical-type-reuse
version: 1.0
agents: [Interface Architect, Construct Implementation]
triggers: [cross-cutting-concern, new-type, interface-design]
requires: [Canonical Type Reuse skill]
produces: [type-classification, reuse-decision]
---
```

---

## Conclusion

### What's Working Well

1. **Skill Structure**: Consistent, clear, actionable
2. **Constitutional Alignment**: Skills enforce CLAUDE2.md invariants
3. **Fail-Closed Principle**: All skills stop when info is missing
4. **Approval Gates**: Explicit human approval requirements
5. **Artifact-Producing**: Clear output contracts for handoffs
6. **Interdependency**: Skills compose well (Interface Designer → Canonical Type Reuse)

### What Needs Improvement

1. **Coverage**: Only 3 of ~20 referenced skills defined
2. **Cross-References**: Some reference non-existent docs
3. **Completeness**: Minor gaps (search procedures, test layout, evolution)
4. **Discoverability**: No skills catalog or registry
5. **Testing**: No validation that skills work as intended

### Critical Next Steps

1. **P0**: Fix cross-references to actual documentation structure
2. **P0**: Create `skills/README.md` catalog
3. **P1**: Enhance existing skills (search procedures, test guidance, evolution)
4. **P1**: Create high-value missing skills (Failure Mode Analysis, Observability Design Review)
5. **P2**: Create remaining Agent 1 & 3 skills
6. **P2**: Create remaining Agent 2 skills (operational review)
7. **P3**: Formalize skill lifecycle and testing

### Strategic Assessment

The **skill-based approach is architecturally sound** and represents a **mature, reusable reasoning model** for AI agents. The three existing skills are **high quality** (4.8/5.0) and provide a **strong foundation**.

The main challenge is **coverage**: many skills referenced in AGENTS.md don't yet exist. Prioritize creating operational review skills (Failure Mode Analysis, Observability Design Review) as these represent **shift-left operations** that are core to the repository's mission.

**Recommendation**: Follow phased approach outlined in Priority 1-4 above.

---

**Next Steps**: Review this analysis, prioritize skill creation, begin P0 fixes to cross-references.

