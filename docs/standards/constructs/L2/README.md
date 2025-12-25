# L2 Layer Standards

**Entry Point**: Platform Primitives (L2) - Reusable building blocks

**Layer**: L2 - Platform Primitives  
**Pattern**: Inheritance (wraps single AWS resource) or Utility (no AWS resources)  
**Resources**: Single AWS resource or pure TypeScript utilities

---

## Overview

L2 primitives are **low-level, reusable constructs** that wrap individual AWS resources or provide utility capabilities. This layer has **two distinct module types**:

---

## Quick Reference

| Module Type | AWS Resources? | Pattern | Location | Example |
|-------------|----------------|---------|----------|---------|
| **Utility Module** | ❌ No | Pure TypeScript | `src/core/**` | CIDR calculator, tag helpers |
| **Construct Module** | ✅ Yes | Inheritance | `src/constructs/**` | Secure VPC, Secure Bucket |

---

## Decision Tree: What Am I Creating?

### Starting Point: Does It Create AWS Resources?

```text
What am I building?

├─ NO AWS resources (pure TypeScript utilities)?
│  └─ L2 Utility Module
│     • READ: structure.md → interface.md
│     • Pattern: Types + functions only
│     • Location: src/core/{capability}/
│     • Files: types.ts, functions.ts, index.ts
│     • Examples: CIDR calculator, tagging helpers, validation functions
│
└─ YES creates ONE AWS resource?
   └─ L2 Construct Module
      • READ: constructs.md → inheritance.md → interface.md → structure.md
      • Pattern: Inheritance (extends upstream construct)
      • Location: src/constructs/{service}/
      • Files: types.ts, {Construct}.ts, index.ts
      • Examples: SecureVpc, SecureBucket, SecureRole

⚠️ Creates MULTIPLE AWS resources?
   → You need L3 (composition), not L2
   → See: ../L3/README.md
```

---

## Module Types Explained

### 1. Utility Modules (src/core/**)

**Purpose**: Pure TypeScript utilities with **no AWS resource creation**

**Characteristics**:
- ✅ Types + functions only
- ✅ No CDK constructs
- ✅ No AWS resources
- ✅ Pure logic and calculations

**Examples**:
- CIDR calculation (`src/core/networking/cidr/`)
- Tag helpers (`src/core/tags/`)
- Validation functions (`src/core/validation/`)
- Canonical type definitions (`src/core/logging/`)

**File Structure**:
```
src/core/{capability}/
├── types.ts       # Type definitions
├── functions.ts   # Helper functions
└── index.ts       # Barrel export
```

**When to Create**: Need reusable logic without AWS resources

---

### 2. Construct Modules (src/constructs/**)

**Purpose**: CDK constructs that **create AWS resources**

**Characteristics**:
- ✅ Wraps single AWS resource
- ✅ Extends upstream CDK construct (inheritance)
- ✅ Adds secure defaults
- ✅ Provides enhanced API

**Examples**:
- Secure VPC (`src/constructs/vpc/`)
- Secure S3 Bucket (`src/constructs/s3/`)
- Secure IAM Role (`src/constructs/iam/`)

**File Structure**:
```
src/constructs/{service}/
├── types.ts           # Props interfaces
├── {Construct}.ts     # Construct implementation
└── index.ts           # Barrel export
```

**When to Create**: Need to wrap single AWS resource with secure defaults

---

## Standards Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[structure.md](./structure.md)** | Module file organization | Creating any L2 module (utility or construct) |
| **[constructs.md](./constructs.md)** | L2 construct patterns, secure defaults | Creating L2 construct module |
| **[interface.md](./interface.md)** | Interface design, canonical types | Designing props interfaces |
| **[inheritance.md](./inheritance.md)** | Inheritance pattern details | Extending upstream constructs |

---

## Workflows

### Workflow 1: Creating Utility Module

**Purpose**: Create pure TypeScript utility (no AWS resources)

```text
Step 1: Read Documentation
├─ structure.md → Utility module layout
└─ interface.md → Canonical types

Step 2: Create Files
├─ src/core/{capability}/types.ts
├─ src/core/{capability}/functions.ts
└─ src/core/{capability}/index.ts

Step 3: Implement
├─ Define types in types.ts
├─ Implement functions in functions.ts
└─ Export all from index.ts

Step 4: Test
└─ Write unit tests (no AWS credentials needed)
```

**Example**: CIDR calculator utility

---

### Workflow 2: Creating Construct Module

**Purpose**: Create CDK construct wrapping single AWS resource

```text
Step 1: Read Documentation (in order)
├─ constructs.md → L2 inheritance pattern
├─ inheritance.md → Detailed inheritance guidance
├─ interface.md → Props interface design
└─ structure.md → Module file layout

Step 2: Design Interface
├─ Define {Construct}Props in types.ts
├─ Extend upstream props interface
└─ Reuse canonical types (logging, tags, etc.)

Step 3: Create Files
├─ src/constructs/{service}/types.ts
├─ src/constructs/{service}/{Construct}.ts
└─ src/constructs/{service}/index.ts

Step 4: Implement Constructor
├─ Validate props (fail-fast)
├─ Call super() with secure defaults
├─ Create single AWS resource
└─ Expose resource via public readonly property

Step 5: Test
├─ Write unit tests (no AWS)
├─ Write integration tests (no AWS)
└─ Write stack tests (requires AWS) - optional
```

**Example**: SecureVpc construct

---

## Layer Rules

### L2 Characteristics

✅ **MUST**:
- Minimal opinions (let users configure)
- No environment assumptions (work anywhere)
- Small, composable surfaces
- Reuse canonical shared types

❌ **MUST NOT**:
- Create multiple AWS resources (that's L3)
- Make platform-wide architectural decisions (that's L4)
- Leak provider-specific types in public interfaces

---

### L2 Patterns

| Aspect | Utility Module | Construct Module |
|--------|----------------|------------------|
| **AWS Resources** | ❌ None | ✅ One |
| **Pattern** | Pure functions | Inheritance |
| **Extends** | Nothing | Upstream CDK construct |
| **File Convention** | types.ts, functions.ts, index.ts | types.ts, {Construct}.ts, index.ts |
| **Location** | `src/core/**` | `src/constructs/**` |

---

## AI Agent Guidelines

### Decision Logic

**Question 1**: Does it create AWS resources?
- **NO** → Utility module (`src/core/**`)
- **YES** → Continue to Question 2

**Question 2**: How many AWS resources?
- **ONE** → L2 Construct module (`src/constructs/**`)
- **MULTIPLE** → L3 Composition (see `../L3/README.md`)

---

### Reading Order

**For Utility Module**:
1. `structure.md` - File layout
2. `interface.md` - Type design
3. Start implementing

**For Construct Module**:
1. `constructs.md` - Inheritance pattern overview
2. `inheritance.md` - Detailed inheritance guidance
3. `interface.md` - Props interface design
4. `structure.md` - File layout
5. Start implementing

---

### Common Mistakes

#### Mistake 1: Creating Multiple Resources in L2

```typescript
// ❌ BAD - Creates multiple resources (this is L3!)
export class NetworkStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    const vpc = new ec2.Vpc(this, 'Vpc', { /* ... */ });
    const bucket = new s3.Bucket(this, 'Bucket', { /* ... */ });
    const role = new iam.Role(this, 'Role', { /* ... */ });
  }
}

// ✅ GOOD - Wraps single resource
export class SecureVpc extends ec2.Vpc {
  constructor(scope: Construct, id: string, props: SecureVpcProps) {
    super(scope, id, {
      // Secure defaults
      cidr: props.cidr,
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });
  }
}
```

---

#### Mistake 2: Utility Module Creating Resources

```typescript
// ❌ BAD - Utility creating AWS resources
export function createVpc(stack: Stack, cidr: string): ec2.Vpc {
  return new ec2.Vpc(stack, 'Vpc', { /* ... */ });
}

// ✅ GOOD - Utility doing pure calculation
export function calculateSubnetCidrs(vpcCidr: string, zones: number): string[] {
  // Pure calculation, no AWS resources
  return cidrs;
}
```

---

#### Mistake 3: Not Using Canonical Types

```typescript
// ❌ BAD - Custom logging type
export interface VpcProps {
  readonly logging: {
    readonly enabled: boolean;
    readonly destination: string;
  };
}

// ✅ GOOD - Reuse canonical type
import * as logging from '../../core/logging';

export interface VpcProps {
  readonly logs?: ReadonlyArray<logging.LogConfig>;
}
```

---

## When to Use L2 vs L3

### Use L2 When:

✅ Wrapping **single AWS resource** with secure defaults
✅ Creating **pure utility** functions (no AWS)
✅ Need **maximum flexibility** for users
✅ Building **reusable primitives**

**Example**: SecureVpc, SecureBucket, CidrCalculator

---

### Use L3 When:

✅ Composing **multiple AWS resources** together
✅ Implementing **design patterns** (e.g., Three-Tier Web App)
✅ Need **opinionated patterns**
✅ Building **reusable compositions**

**Example**: NetworkServices (VPC + DNS + LoadBalancer)

**See**: [../L3/README.md](../L3/README.md)

---

## Quick Start Examples

### Example 1: Utility Module (CIDR Calculator)

```typescript
// src/core/networking/cidr/types.ts
export interface CidrBlock {
  readonly block: string;
  readonly prefix: number;
}

// src/core/networking/cidr/functions.ts
export function parseCidr(cidr: string): CidrBlock {
  const [block, prefix] = cidr.split('/');
  return { block, prefix: parseInt(prefix) };
}

// src/core/networking/cidr/index.ts
export * from './types';
export * from './functions';
```

---

### Example 2: Construct Module (SecureVpc)

```typescript
// src/constructs/vpc/types.ts
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logging from '../../core/logging';

export interface SecureVpcProps extends ec2.VpcProps {
  readonly name: string;
  readonly logs?: ReadonlyArray<logging.LogConfig>;
}

// src/constructs/vpc/SecureVpc.ts
export class SecureVpc extends ec2.Vpc {
  constructor(scope: Construct, id: string, props: SecureVpcProps) {
    // Validate
    if (!props.name) {
      throw new Error("SecureVpc: 'name' is required.");
    }
    
    // Call super with secure defaults
    super(scope, id, {
      ...props,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: props.natGateways ?? 1,
    });
    
    // Add flow logs if configured
    if (props.logs) {
      // Create flow logs...
    }
  }
}

// src/constructs/vpc/index.ts
export * from './types';
export * from './SecureVpc';
```

---

## Troubleshooting

### Issue: "Should this be L2 or L3?"

**Decision Rule**: Count AWS resources
- 1 resource = L2
- 2+ resources = L3

---

### Issue: "Should this be utility or construct module?"

**Decision Rule**: Does it create AWS resources?
- No AWS resources = Utility module (`src/core/**`)
- Creates AWS resources = Construct module (`src/constructs/**`)

---

### Issue: "Where do canonical types go?"

**Answer**: Utility modules in `src/core/**`
- Example: `src/core/logging/types.ts`

**See**: [../../common/types.md](../../common/types.md)

---

### Issue: "How do I extend upstream construct?"

**Answer**: Use inheritance pattern

**See**: [inheritance.md](./inheritance.md)

---

## Testing

L2 constructs require comprehensive testing:

1. **Unit tests** (fast, no AWS) - See: [../../testing/unit.md](../../testing/unit.md)
2. **Integration tests** (fast, no AWS) - See: [../../testing/integration.md](../../testing/integration.md)
3. **Validation** (patterns) - See: [../../testing/validation.md](../../testing/validation.md)
4. **Stack tests** (slow, requires AWS) - See: [../../testing/stack.md](../../testing/stack.md)

---

## Navigation

- **Up**: [constructs/](../) - All construct standards
- **Standards**: [../../](../../) - Main standards index
- **Related**: 
  - [L3/](../L3/) - Composition patterns (multiple resources)
  - [L4/](../L4/) - Architectural solutions (future)
- **Cross-Layer**: 
  - [common/](../../common/) - Common standards (all layers)
  - [testing/](../../testing/) - Testing standards

---

## See Also

- **Module Structure**: [structure.md](./structure.md) - File organization
- **Construct Patterns**: [constructs.md](./constructs.md) - L2 patterns
- **Interface Design**: [interface.md](./interface.md) - Props interfaces
- **Inheritance**: [inheritance.md](./inheritance.md) - Extending upstream
- **Canonical Types**: [../../common/types.md](../../common/types.md) - Shared types
- **Module Consumption**: [../../common/modules.md](../../common/modules.md) - How to import

---

## References

This README is the **entry point** for L2 standards. Read the specific documents for detailed guidance.

**Repository Authority**: `CLAUDE.md` (root)
