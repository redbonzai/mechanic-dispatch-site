# L2 Module Structure Standard

**Applies to**: Utility modules (src/core/**) and Construct modules (src/constructs/**)

---

## Overview

L2 layer has **two distinct module types** with different file organization requirements.

---

## Module Types

### Utility Modules (src/core/**)

**Definition**: Pure TypeScript capabilities with no AWS resource creation.

**Characteristics**:
- Types + functions only
- No CDK constructs
- No `PascalCase.ts` files
- Reusable across many constructs

**Examples**:
- `src/core/cidr/` - CIDR calculation utilities
- `src/core/tags/` - Tagging helpers
- `src/core/validation/` - Validation functions
- `src/core/naming/` - Naming strategies

---

### Construct Modules (src/constructs/**)

**Definition**: CDK constructs that create AWS resources.

**Characteristics**:
- Wraps AWS resources
- Uses inheritance pattern (L2)
- Includes `PascalCase.ts` files
- Located outside src/core/**

**Examples**:
- `src/constructs/vpc/` - VPC construct
- `src/constructs/s3/` - S3 Bucket construct
- `src/constructs/iam/` - IAM Role construct

---

## File Organization

### Utility Module Layout

**Required files**:
```
src/core/{capability}/
├── types.ts        # Public contract (interfaces/types)
├── functions.ts    # Pure utility functions  
└── index.ts        # Barrel export
```

**Optional files**:
```
├── constants.ts    # Constants (when used by 2+ files)
```

**Forbidden**:
- ❌ No `PascalCase.ts` files (no constructs in utility modules)

---

### Construct Module Layout

**Required files**:
```
src/constructs/{service}/
├── types.ts            # Public contract (interfaces/types)
├── {Construct}.ts      # Main construct (PascalCase)
├── functions.ts        # Shared helper functions (optional)
└── index.ts            # Barrel export
```

**Optional files**:
```
├── constants.ts        # Constants (when used by 2+ files)
├── {SubConstruct}.ts   # Additional constructs
└── {submodule}/        # Sub-modules (when 3+ related types)
```

---

## File Responsibilities

| File | MUST Contain | MUST NOT Contain |
|------|--------------|------------------|
| **types.ts** | Interfaces, types, enums | Classes, functions, side effects |
| **functions.ts** | Pure utility functions | AWS resource creation, CDK constructs |
| **{Construct}.ts** | Construct class + construct-specific helpers | Type definitions |
| **constants.ts** | Readonly constant values | Logic, computed values |
| **index.ts** | Re-exports only | Logic, types, classes |

---

## Separation Rationale

### Why Separate types.ts?

| Benefit | Description |
|---------|-------------|
| **Tree-shaking** | Types are erased at compile time; bundlers optimize better |
| **Circular dependencies** | Type-only imports prevent circular issues |
| **Performance** | Faster TypeScript compilation with clear boundaries |
| **Clarity** | Jump-to-definition goes directly to type definitions |
| **Consistency** | All modules follow same pattern |

---

## Optional Files Decision Criteria

### When to Include functions.ts

**MUST include** when:
- ✅ Pure utility functions (no side effects, no AWS resource creation)
- ✅ Reusable across multiple constructs in module
- ✅ Complex calculations that benefit from isolated testing

**MUST NOT include** when:
- ❌ Functions create AWS resources (keep in construct class)
- ❌ Functions are only called once (inline in constructor)
- ❌ Functions are tightly coupled to a single construct

**Examples**:

| Include? | Module | Reason |
|----------|--------|--------|
| ✅ Yes | `vpc/cidr/functions.ts` | CIDR calculations used across VPC, subnets, routes |
| ❌ No | `vpc/functions.ts` | No pure utilities; all logic is in VPC construct |
| ❌ No | `vpc/flow-log/functions.ts` | All logic is destination-specific |

---

### When to Include constants.ts

**MUST include** when:
- ✅ Magic numbers that need documentation
- ✅ Default values referenced in multiple places (2+ files)
- ✅ AWS limits or constraints

**Rule**: Constants must be used by 2+ files in module. If used by only 1 file, keep in that file.

**Examples**:
```typescript
// constants.ts
export const DEFAULT_CIDR_MASK = 24;
export const MAX_SUBNETS_PER_VPC = 200;
export const RESERVED_IP_COUNT = 5;
```

---

## Path Convention

| Module Type | Location | Rule |
|-------------|----------|------|
| **Utility modules** | `src/core/**` | Reserved for pure capabilities and canonical types |
| **Construct modules** | `src/constructs/**` | L2/L3/L4 constructs (outside src/core/**) |

**Rationale**: 
- `src/core/**` = Reusable libraries (no AWS resources)
- `src/constructs/**` = AWS infrastructure (creates resources)

---

## Utility Promotion Rule

Decision tree for where to place helper functions:

```
Is helper used by only 1 construct?
├── YES → Keep in construct file ({Construct}.ts)
└── NO → Used by 2+ constructs in same module?
    ├── YES → Promote to functions.ts
    └── NO → Used across multiple modules?
        └── YES → Promote to src/core/** (utility module)
```

**Examples**:
- Helper used only in `Vpc.ts` → Keep in `Vpc.ts`
- Helper used by `Vpc.ts` + `Subnet.ts` → Promote to `vpc/functions.ts`
- Helper used by VPC + S3 modules → Create `src/core/{capability}/`

---

## Sub-Module Guidelines

### When to Create Sub-Module

| Condition | Create Sub-Module? |
|-----------|-------------------|
| 3+ related types/interfaces | ✅ Yes |
| Separate construct class needed | ✅ Yes |
| Reusable utility functions | ✅ Yes |
| Single type/interface | ❌ No (keep in parent types.ts) |
| Tightly coupled to parent | ❌ No (keep in parent) |

---

### Sub-Module Structure

Sub-modules follow the same pattern as parent modules:

```
src/constructs/vpc/
├── types.ts
├── Vpc.ts
├── index.ts
└── cidr/                    ← Sub-module
    ├── types.ts
    ├── functions.ts
    └── index.ts
```

---

### Sub-Module Independence Rules

Sub-modules SHOULD:
- ✅ Have their own `index.ts`, `types.ts`
- ✅ Be importable independently: `import { CidrConfig } from './vpc/cidr'`
- ✅ Have clear public API

Sub-modules MUST NOT:
- ❌ Import from parent module (prevents circular deps)
- ❌ Expose internal implementation details
- ❌ Depend on parent's private state

---

## Example Structures

### Example: Utility Module (CIDR)

```
src/core/networking/cidr/
├── types.ts                 # CidrBlock, CidrConfig interfaces
├── functions.ts             # parse(), validate(), subnet()
├── constants.ts             # CIDR_REGEX, IP_VERSION constants
└── index.ts                 # export * from './types'; export * from './functions'
```

**Usage**:
```typescript
import * as cidr from '@/core/networking/cidr';

const block = cidr.parse('10.0.0.0/16');
const subnets = cidr.subnet(block, { newPrefix: 20 });
type Block = cidr.CidrBlock;
```

---

### Example: Construct Module (VPC)

```
src/constructs/vpc/
├── index.ts                 # Barrel: export * from './types'
├── types.ts                 # VpcProps, VpcConfig
├── Vpc.ts                   # class VpcConstruct extends Construct
├── README.md                # User documentation
│
├── cidr/                    # CIDR sub-module (utility)
│   ├── index.ts
│   ├── types.ts             # CidrConfig, IndexedCidr
│   ├── functions.ts         # Pure CIDR utilities
│   └── constants.ts         # CIDR validation constants
│
└── flow-log/                # Flow Log sub-module (construct)
    ├── index.ts
    ├── types.ts             # FlowLogConfig
    ├── FlowLog.ts           # class FlowLogs extends Construct
    └── destinations/        # Nested sub-module
        ├── index.ts
        ├── types.ts
        ├── LogGroup.ts
        ├── S3.ts
        └── Kinesis.ts
```

**Exports**:
```typescript
// vpc/index.ts
export * from './types';
export * from './Vpc';
export * from './cidr';
export * from './flow-log';

// vpc/cidr/index.ts
export * from './types';
export * from './functions';
export * from './constants';

// vpc/flow-log/index.ts
export * from './types';
export * from './FlowLog';
export * from './destinations';
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Directories** | kebab-case | `flow-log/`, `network-firewall/` |
| **Construct files** | PascalCase | `Vpc.ts`, `FlowLog.ts` |
| **Type files** | lowercase | `types.ts` |
| **Function files** | lowercase | `functions.ts` |
| **Constant files** | lowercase | `constants.ts` |
| **Index files** | lowercase | `index.ts` |

**Rule**: File name MUST match exported class name for construct files.

---

## Import/Export Patterns

### Correct Imports

```typescript
// ✅ CORRECT: Import from module barrel
import { VpcConstruct } from './vpc';
import { FlowLogs } from './flow-log';

// ✅ CORRECT: Type-only imports
import type { VpcProps, FlowLogConfig } from './vpc';
import type { CidrConfig } from './cidr';

// ✅ CORRECT: Utility module (namespace import)
import * as cidr from '@/core/networking/cidr';
```

---

### Incorrect Imports

```typescript
// ❌ INCORRECT: Direct file import (bypasses barrel)
import { VpcConstruct } from './vpc/Vpc';

// ❌ INCORRECT: Including file extension
import type { VpcProps } from './vpc/types.ts';

// ❌ INCORRECT: Wrong case
import { VpcConstruct } from './vpc/vpc';

// ❌ INCORRECT: Reaching into internal structure
import { privateHelper } from './vpc/Vpc';
```

---

### Export Barrel Pattern

#### index.ts Structure

```typescript
// {module}/index.ts - Export barrel

// Types first (alphabetical)
export * from './types';

// Main construct
export * from './ModuleName';

// Sub-modules (alphabetical)
export * from './submodule-a';
export * from './submodule-b';
```

#### Re-export Rules

| Rule | Reason |
|------|--------|
| Export all public types from `types.ts` | Consumers need type definitions |
| Export main construct class | Primary API |
| Export sub-module barrels | Nested functionality |
| MUST NOT export internal helpers | Encapsulation |
| MUST NOT export test utilities | Not production code |

---

## Approval Gates

Human approval is required before:
- Creating new utility module in `src/core/**`
- Changing a module's public surface (breaking changes)
- Moving types into/out of canonical scope (`src/core/**`)
- Restructuring established modules
- Changing file naming conventions

---

## See Also

- **L2 Constructs**: [constructs.md](./constructs.md)
- **L2 Interfaces**: [interface.md](./interface.md)
- **L2 Inheritance**: [inheritance.md](./inheritance.md)
- **Module Consumption**: [../common/module-consumption.md](../common/module-consumption.md)
- **Skill**: `skills/module-layout-enforcer.md`

---

## References

- **To-Merge Sources**:
  - `docs/standards/to-merge/MODULE-STRUCTURE.md`
  - `docs/standards/module-layout.md`

