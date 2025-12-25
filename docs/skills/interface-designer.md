# Skill: Interface Designer

## Purpose

Design stable, reusable interfaces for platform capabilities and constructs.

This skill is **interface-first** and optimized for:

- long-term evolution
- multi-team consumption
- composition over inheritance
- canonical type reuse (no reinvention)

It also enforces a **conversational design workflow** that produces a **fully commented YAML interface contract** for handoff to an implementation agent.

---

## When to Use

Invoke this skill when:

- defining a new public interface (capability module or construct props)
- evolving an existing interface
- reviewing an interface for consistency, stability, and reusability
- translating requirements into an interface contract

---

## Preconditions

Must be known:

- the problem statement and intended consumers
- layer intent (L2/L3/L4) if designing a construct interface
- relevant standards (`docs/standards/**`)
- canonical shared types available under `src/core/**` (if any)

If missing: STOP and ask.

---

## Workflow (Hard Requirement)

### Phase 1: Conversational design

Work with the human to:

- enumerate requirements and constraints
- identify extension points and variability
- decide what is required vs optional
- call out non-goals and out-of-scope items

### Phase 2: YAML interface contract (design artifact)

Before implementation, produce a **fully commented YAML interface** that:

- is readable like Kubernetes manifests
- documents intent and constraints inline
- includes example values
- includes notes about stability and future evolution

This YAML is a **design artifact** for humans + agents (not a runtime config unless explicitly adopted later).

### Phase 3: Handoff for implementation

After the YAML contract is approved, produce a short handoff package for the implementation agent:

- the final YAML interface contract
- a mapping table: YAML fields → TypeScript types (what goes in `types.ts`)
- required canonical type imports and the correct access path (Single-Path rule)
- explicit approval gates (if any)

**Rule:** This skill does not implement behavior. It designs the contract.

---

## Core Interface Rules

### Minimal required inputs

- Keep required fields minimal.
- Prefer safe defaults and optional capability groups.

### Nested optional groups

- Group optional capabilities into nested objects (e.g., `observability`, `logging`, `advanced`).

### No provider-specific type leakage

- Public interfaces must not expose provider-specific types.
- Provider details stay inside implementations.

### Composition over inheritance

- Prefer composition. Inheritance is discouraged and must be justified.

---

## Canonical Type Reuse Rule

Cross-cutting concerns (logging, observability, tags, encryption, naming) MUST reuse canonical shared types.

Before introducing any new object type for a cross-cutting concern, the agent must:

1) Invoke the **Canonical Type Reuse** skill
2) Search for an existing canonical type under `src/core/**` (capability modules) and `docs/interfaces/**`
3) If found, reuse it directly (prefer `logs?: ReadonlyArray<LogConfig>` and similar)
4) If insufficient, extend it **additively** via composition (preferred) or optional subtype extension
5) If still insufficient, propose a new **canonical** type (not a local one-off) and request approval

Local bespoke types for cross-cutting concerns are forbidden without explicit approval.

---

## Module Boundary Rule

When introducing reusable capability modules:

- design cohesive modules with barrel exports (`index.ts`) that assemble the unit surface
- require whole-unit consumption using namespace imports (`import * as X from "…"` )
- avoid designing APIs that encourage piecemeal named imports
- preserve the **Single-Path Rule** (do not create multiple public access paths for the same symbol)

---

## Output Contract (Required)

Every invocation must output:

1) **Requirements recap** (bullets; scannable)
2) **Interface decisions**
   - required vs optional fields
   - extension points
   - non-goals/out-of-scope
3) **Fully commented YAML interface contract**
   - include at least one realistic example
4) **TypeScript mapping notes**
   - what belongs in `types.ts`
   - what belongs in `functions.ts` vs implementation
5) **Canonical reuse + access path**
   - list canonical types reused
   - specify the primary access path for consumers (Single-Path rule)
6) **Approval gates**
   - call out any changes requiring human approval

---

## Example (Illustrative Only)

```yaml
# Example: Transit interface contract (design artifact)
# - Fully commented
# - Intended for human + agent review
# - Implementation is handled by a separate agent

apiVersion: platform.cdk/v1alpha1
kind: Transit
metadata:
  # Human-friendly name used for logical naming/tagging
  name: example-transit

spec:
  # Backend selection remains stable; implementation details are hidden
  backend:
    type: cwan

  # Cross-cutting concerns should reuse canonical types
  logging:
    # Prefer plural list-of-singular objects when representing multiple configs
    logs:
      - destination: cloudwatch
        retentionDays: 30

  advanced:
    # Rare options live under advanced
    timeoutsSeconds: 300
```

---

## Constraints

- Do NOT implement behavior in this skill.
- Do NOT introduce bespoke cross-cutting types if canonical ones exist.
- Do NOT expose provider-specific types in public interfaces.

---

## Approval Gate

Human approval is required before:

- introducing a new public interface
- modifying a public interface
- introducing a new canonical shared type or changing canonical types

---

## End of Skill: Interface Designer
