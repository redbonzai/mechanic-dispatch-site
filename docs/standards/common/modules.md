# Module Consumption Standard

**Applies to**: All layers (L2, L3, L4) - Utility modules and Construct modules

---

## Overview

This repository optimizes for **module-as-a-unit reuse**.

**Core Principle**: Consume modules as complete units, preserving their boundaries.

Barrels (`index.ts`) are allowed and encouraged. What we avoid is **piecemeal consumption** that reconstructs a module boundary at the call site.

---

## Module-as-Unit Rule (Hard)

**All modules** (utility modules in `src/core/**` and construct modules) MUST be consumed as whole units using namespace imports:

### ✅ Correct: Namespace Import

**Utility module example**:
```typescript
// ✅ GOOD - Import as namespace
import * as cidr from '../core/networking/cidr';

const block = cidr.parse('10.0.0.0/16');
const subnets = cidr.subnet(block, { newPrefix: 20 });
type Block = cidr.CidrBlock;
```

**Construct module example**:
```typescript
// ✅ GOOD - Import as namespace
import * as vpc from '../constructs/vpc';

const myVpc = new vpc.VpcConstruct(this, 'VPC', {
  name: 'my-vpc',
  cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
});
type VpcConfig = vpc.VpcProps;
```

---

### ❌ Incorrect: Piecemeal Import

```typescript
// ❌ BAD - Piecemeal named imports
import { parse, subnet, CidrBlock } from '../core/networking/cidr';
import { VpcConstruct, VpcProps } from '../constructs/vpc';
```

**Why this is bad**:
- Reconstructs module boundary at call site
- Loses namespace context
- Makes refactoring harder
- Increases coupling

---

## Barrel Exports (index.ts)

### Allowed: Inside Module Boundary

Barrels (`index.ts`) **inside a module boundary** are allowed and encouraged:

```typescript
// src/constructs/vpc/index.ts
// ✅ GOOD - Barrel aggregates module exports
export * from './types';
export * from './Vpc';
export * from './cidr';
export * from './flow-log';
```

**Purpose**: Create clean public API surface for the module.

---

### Forbidden: Cross-Module Convenience Re-exports

Avoid convenience re-exports that flatten boundaries **across modules**:

```typescript
// src/constructs/index.ts
// ❌ BAD - Flattens module boundaries
export { VpcConstruct } from './vpc';      // Don't do this
export { parse, subnet } from './core/networking/cidr';  // Don't do this
```

**Why forbidden**:
- Breaks module-as-unit principle
- Creates multiple access paths for same symbol
- Violates Single-Path rule

---

## Single-Path Rule

**Rule**: Avoid creating multiple public access paths for the same symbol.

Primary access should be via the module unit surface.

### ✅ Correct: Single Access Path

```typescript
// Only one way to access:
import * as cidr from '../core/networking/cidr';
cidr.parse('10.0.0.0/16');  // ✅ Single path
```

### ❌ Incorrect: Multiple Access Paths

```typescript
// ❌ BAD - Symbol accessible from multiple paths
import * as cidr from '../core/networking/cidr';
import * as utils from '../utils';  // Re-exports cidr.parse

cidr.parse('10.0.0.0/16');   // Path 1
utils.parse('10.0.0.0/16');  // Path 2 - creates ambiguity
```

**Why single-path**:
- Eliminates ambiguity
- Makes imports predictable
- Easier to refactor
- Clear ownership

---

## Internal Imports (Within Module)

**Rule**: Inside a module, internal files may import locally using relative paths.

This does **not** change the public consumption rule.

### Example: Internal Module Imports

```typescript
// src/constructs/vpc/Vpc.ts
// ✅ Internal imports can be direct
import { VpcProps } from './types';
import { calculateSubnets } from './functions';
import { FlowLog } from './flow-log';  // Sub-module

// ❌ External imports must be namespace
import * as cidr from '../../core/networking/cidr';  // ✅ Namespace
```

**Why different rules**:
- **Internal**: Files are part of same module boundary
- **External**: Files are in different modules (must respect boundaries)

---

## Type Imports

**Rule**: Use `import type` for type-only imports (optimization, not required for module-as-unit).

```typescript
// ✅ GOOD - Type-only imports
import type * as vpc from '../constructs/vpc';
import type { VpcProps } from '../constructs/vpc';  // Exception: types can be direct

// Regular imports for values
import * as cidr from '../core/networking/cidr';
```

**Why type imports**:
- Compile-time only (erased in JavaScript)
- Helps TypeScript compiler optimize
- Makes intent clear

---

## Examples by Layer

### L2 Utility Module Consumption

```typescript
// Consuming utility module from src/core/**
import * as cidr from '../../core/networking/cidr';
import * as tags from '../../core/tags';
import * as logging from '../../core/logging';

const block = cidr.parse('10.0.0.0/16');
const tagMap = tags.merge(parentTags, localTags);
const logConfig: logging.LogConfig = { destination: 'cloudwatch' };
```

---

### L2 Construct Module Consumption

```typescript
// Consuming L2 construct module
import * as vpc from '../constructs/vpc';
import * as s3 from '../constructs/s3';

const myVpc = new vpc.VpcConstruct(this, 'VPC', {
  name: 'my-vpc',
  cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
});

const bucket = new s3.SecureBucket(this, 'Bucket', {
  bucketName: 'my-bucket',
});
```

---

### L3 Composition Pattern Consumption

```typescript
// Consuming L3 composition pattern
import { network } from '@bah-te/cdk-core-constructs/design-patterns';

// Service-level construction
new network.dns(this, 'DNS', {
  domains: [{ name: 'example.com' }],
  profiles: [{ name: 'dns-profile' }],
});

// Component-level construction
new network.dns.Domain(this, 'Domain', {
  name: 'example.com',
});
```

---

## Common Mistakes

### Mistake 1: Destructuring Module Imports

```typescript
// ❌ BAD - Destructuring loses namespace
const { parse, subnet } = require('../core/networking/cidr');

// ✅ GOOD - Preserve namespace
import * as cidr from '../core/networking/cidr';
```

---

### Mistake 2: Re-exporting from Multiple Modules

```typescript
// ❌ BAD - Creates multiple access paths
// src/utils/index.ts
export { parse } from '../core/networking/cidr';
export { VpcConstruct } from '../constructs/vpc';

// ✅ GOOD - Each module exports itself only
// src/core/networking/cidr/index.ts
export * from './types';
export * from './functions';
```

---

### Mistake 3: Deep Imports (Bypassing Barrel)

```typescript
// ❌ BAD - Bypasses module barrel
import { parse } from '../core/networking/cidr/functions';

// ✅ GOOD - Use module barrel
import * as cidr from '../core/networking/cidr';
cidr.parse('10.0.0.0/16');
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Clear boundaries** | Module namespace makes boundaries explicit |
| **Easy refactoring** | Internal changes don't affect consumers |
| **Predictable imports** | Always know where to find symbols |
| **No ambiguity** | Single access path per symbol |
| **Better IntelliSense** | IDE autocomplete works better with namespaces |

---

## Approval Gates

Human approval is required before:

- Adding convenience re-exports that introduce additional public access paths
- Introducing a new public entrypoint that encourages deep/piecemeal imports
- Changing module boundaries (splitting or merging modules)
- Creating new barrel files at non-module boundaries

---

## See Also

- **L2 Structure**: [L2/structure.md](../L2/structure.md) - Module file organization
- **L3 Structure**: [L3/structure.md](../L3/structure.md) - Composition module structure
- **AGENTS.md**: Repository Style & Consistency Rules
- **CLAUDE.md**: Constitutional authority

---

## References

This standard enforces the **module-as-unit** principle across all layers and aligns with:
- Repository Style & Consistency Rules in `AGENTS.md`
- Module layout standards in `L2/structure.md`
- Export patterns in `L3/structure.md`

