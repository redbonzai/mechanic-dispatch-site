# Skill: Canonical Type Reuse

## Purpose

Prevent interface fragmentation by enforcing **one concept → one canonical type** for cross-cutting concerns.

This skill ensures teams do not reinvent objects (e.g., `VpcLogging`) when a canonical type already exists (e.g., `logging.LogConfig`).

---

## When to Use

Invoke this skill whenever:

- an interface introduces or modifies a cross-cutting concern
- a construct or capability needs logging, observability, tags, encryption, naming, etc.
- a PR introduces a new type that *smells* cross-cutting

Cross-cutting concerns include (non-exhaustive):

- logging
- observability
- tags
- encryption
- naming

---

## Preconditions

Must be known:

- the concept being modeled (e.g., “logs”, “tags”, “encryption”)
- where the new/changed type would be introduced (module + file)
- existing canonical type locations:
  - `src/core/**`
  - `docs/interfaces/**` (if present)

If missing: STOP and ask.

---

## Workflow (Hard Requirement)

1) **Classify the concern**
   - Is it cross-cutting? If unsure, treat it as cross-cutting.

2) **Search for existing canonical types**
   - Prefer canonical capability modules under `src/core/**`.
   - If documented externally, also check `docs/interfaces/**`.

3) **Choose reuse strategy (in order)**

   A) **Direct reuse (preferred)**
   - Use the existing type as-is.

   B) **Additive extension by composition (preferred when customization is needed)**
   - Wrap the canonical type rather than cloning it.

   C) **Additive extension by subtype (allowed carefully)**
   - Only if meaning is preserved and it remains a drop-in replacement.

4) **If no canonical type exists**
   - Propose a new canonical type (do NOT create a one-off local variant).
   - Request human approval before adding it.

---

## Rules (Hard)

- Do NOT create domain-specific variants for cross-cutting concerns without approval.
- Plural properties represent lists of singular objects:
  - `logs: ReadonlyArray<logging.LogConfig>`
- Preserve module-as-a-unit consumption:
  - `import * as logging from "…/core/logging"` then `logging.LogConfig`
- Preserve the Single-Path rule:
  - avoid convenience re-exports that create multiple public access paths.

---

## Output Contract (Required)

Every invocation must output:

1) **Concern classification**
   - why it is (or is not) cross-cutting

2) **Canonical type decision**
   - what canonical type is reused (module path + symbol)
   - the correct access path for consumers (namespace import)

3) **If extension is needed**
   - show the proposed extension pattern (composition preferred)

4) **Approval gates**
   - explicitly call out if a new canonical type is proposed

---

## Examples

### Direct reuse (preferred)

```ts
import * as logging from "…/core/logging";

export interface VpcProps {
  readonly logs?: ReadonlyArray<logging.LogConfig>;
}
```

### Composition wrapper (preferred extension)

```ts
import * as logging from "…/core/logging";

export interface VpcFlowLogs {
  readonly log: logging.LogConfig;
  readonly trafficType?: "ALL" | "ACCEPT" | "REJECT";
}
```

---

## Approval Gate

Human approval is required before:

- introducing a new canonical shared type
- modifying an existing canonical shared type
- migrating/deprecating canonical types

---

## References

- `docs/standards/canonical-types.md`
- `docs/standards/module-consumption.md`
- `skills/interface-designer.md`

---

## End of Skill: Canonical Type Reuse
