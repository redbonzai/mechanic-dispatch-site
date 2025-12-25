# Skill: Module Layout Enforcer

## Purpose

Enforce a consistent module structure across the repository to ensure:

- reusable capability modules are consumed as whole units
- interfaces remain consistent across constructs
- utilities do not become unbounded “utils soup”
- construct-specific helpers stay near their construct
- exports/imports reinforce module boundaries

---

## When to Use

Invoke this skill when:

- creating a new capability module
- adding a new construct file to an existing module
- refactoring module exports
- reviewing a PR for module consistency
- scaffolding new constructs for teams

---

## Preconditions

Must be known:

- target module name and path
- module kind: pure capability (types/functions only) OR construct module (contains L2/L3/L4 constructs)
- construct name(s) (PascalCase) (required only for construct modules)
- target construct layer (L2/L3/L4) (required only for construct modules)
- relevant standards (CLAUDE.md + docs/standards/**)

If missing: STOP and ask.

---

## Canonical Module Layout (Hard Requirements)

Capability modules come in two kinds:

### A) Pure capability modules (no constructs)

Pure capability modules are **types + functions** only. They MUST contain:

- `types.ts`
  - public contract (interfaces/types)
  - stable, minimal, reusable types
  - must reuse canonical cross-cutting types (logging, tagging, encryption, etc.)

- `functions.ts`
  - module-wide helpers for this capability
  - prefer pure functions

- `index.ts`
  - barrel that assembles the module’s unit surface

**Rule:** Pure capability modules MUST NOT include `PascalCase.ts` files.

### B) Construct modules (contains L2/L3/L4 constructs)

Construct modules MUST contain:

- `types.ts`
  - public contract (interfaces/types)
  - stable, minimal, reusable types
  - must reuse canonical cross-cutting types (logging, tagging, encryption, etc.)

- `functions.ts`
  - module-wide helpers shared by multiple constructs in this module
  - pure helpers preferred
  - must not become a dumping ground

- `PascalCase.ts` (one per construct)
  - construct implementation and construct-specific helpers
  - helpers used only by this construct MUST live here

- `index.ts`
  - barrel that assembles the module’s unit surface

### Naming Rule

Do NOT refer to PascalCase construct files as “L1”.
(CDK L1 has a specific meaning; these are construct implementations.)

---

## Path Convention

- `src/core/**` is reserved for **pure capability modules** and canonical shared types.
  - Treat these as reusable libraries (types/functions), not CDK constructs.
- CDK constructs (L2/L3/L4) should live outside `src/core/**` (e.g., under a domain folder such as `src/network/**`, `src/route53/**`, `src/constructs/**`).

---

## Utility Promotion Rule

- If a helper is used by only one construct: keep it inside that construct file.
- If a helper is used by 2+ constructs in the same module: move it to `functions.ts`.
- If a helper is used across multiple modules: move it to the canonical shared type/capability library (e.g., `src/core/<capability>`).

---

## Export/Import Policy

### Barrels

- Barrels are allowed inside `index.ts` (and encouraged).

### Consumption Style (Whole-Unit Import)

Capability modules MUST be consumed as whole units (module namespace import):

- :white_check_mark: `import * as cidr from "../core/networking/cidr"`
- :x: `import { parse, CidrBlock } from "../core/networking/cidr"`

### Internal Imports (Within a Module)

Inside a capability module, internal files may import locally using relative paths.
This does not change the public consumption rule: external consumers should import the module as a whole unit.

### Single-Path Rule

- Avoid “convenience re-exports” that create multiple public access paths for the same symbol.
- Primary access should be via the module unit (or domain unit), not via flattened exports.

---

## Design-Time Layering Check

When scaffolding a construct:

- include a header comment indicating L2/L3/L4 intent
- ensure the construct’s public surface matches the assigned layer rules
- ensure provider-specific types do not leak into public interfaces

---

## Output Contract (Required)

Every invocation must output:

1) Proposed folder/file tree  
2) `types.ts` skeleton (public contract)  
3) `functions.ts` skeleton (helpers)  
4) `index.ts` barrel  
5) Construct file skeleton(s): `PascalCase.ts` (only for construct modules)  
6) A short checklist verifying compliance with:  
   - module layout rules  
   - utility promotion rule  
   - whole-unit import policy  
   - layering rules

---

## Constraints

- Do NOT invent bespoke types for cross-cutting concerns if canonical types exist.
- Do NOT implement full behavior unless requested; scaffolding is preferred.
- Do NOT introduce `export * from ...` outside module boundaries unless explicitly approved.

---

## Approval Gate

Human approval is required before:

- Changing a module’s public surface in a way that introduces breaking changes
- Introducing a new canonical shared type or moving a type into/out of canonical scope
- Adding convenience re-exports that create multiple public access paths

---

## End of Skill: Module Layout Enforcer
