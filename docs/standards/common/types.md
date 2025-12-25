# Canonical Shared Types Standard

**Applies to**: All layers (L2, L3, L4) - Cross-cutting concerns

---

## Overview

A consistent user interface across constructs requires that **cross-cutting concerns reuse canonical shared types**.

**Core Principle**: **One concept → one canonical type**

If you need logging on VPC, you add `vpc.logs: ReadonlyArray<logging.LogConfig>`, you do **not** invent `VpcLogging`.

---

## Why Canonical Types?

| Benefit | Description |
|---------|-------------|
| **Consistency** | Same interface across all constructs |
| **Predictability** | Developers learn once, use everywhere |
| **Maintainability** | Update once, applies everywhere |
| **Type safety** | TypeScript enforces correct usage |
| **Reduced duplication** | No reinventing common patterns |

**Example problem without canonical types**:
- VPC uses `VpcLogging` interface
- S3 uses `BucketLogConfig` interface  
- Lambda uses `FunctionLogs` interface
- ❌ Developer must learn 3 different logging patterns

**Solution with canonical types**:
- All use `logging.LogConfig` interface
- ✅ Developer learns once, applies everywhere

---

## Cross-Cutting Concerns

**Definition**: A concern is "cross-cutting" if it applies to **multiple construct types** across different services.

### Mandatory Canonical Types

These concerns **MUST** use canonical shared types:

| Concern | Canonical Type | Location | Used By |
|---------|---------------|----------|---------|
| **Logging** | `logging.LogConfig` | `src/core/logging` | VPC, S3, CloudFront, Lambda, etc. |
| **Observability** | `observability.*` | `src/core/observability` | All monitored resources |
| **Tags** | `tags.TagMap` | `src/core/tags` | All taggable resources |
| **Encryption** | `encryption.EncryptionConfig` | `src/core/encryption` | S3, EBS, RDS, DynamoDB, etc. |
| **Naming** | `naming.NamingStrategy` | `src/core/naming` | All named resources |

### Decision: Is This Cross-Cutting?

```
Does this concern apply to 3+ construct types across different services?
├── YES → Use canonical shared type (required)
│         Examples: logging, tags, encryption
│
└── NO → Construct-specific type allowed
          Examples: VPC CIDR (network-specific),
                    DynamoDB GSI (DynamoDB-specific)
```

**Default stance**: Treat unknowns as cross-cutting by default (fail-safe).

---

## Canonical Type Locations

Canonical shared types **MUST** live in utility modules under `src/core/**`:

```
src/core/
├── logging/              # Logging canonical types
│   ├── types.ts          # LogConfig, LogDestination, etc.
│   ├── functions.ts      # Log utilities
│   └── index.ts          # export *
│
├── tags/                 # Tagging canonical types
│   ├── types.ts          # TagMap, TagStrategy, etc.
│   ├── functions.ts      # Tag utilities (merge, validate)
│   └── index.ts          # export *
│
├── encryption/           # Encryption canonical types
│   ├── types.ts          # EncryptionConfig, KeyConfig, etc.
│   ├── functions.ts      # Encryption utilities
│   └── index.ts          # export *
│
├── naming/               # Naming canonical types
│   ├── types.ts          # NamingStrategy, NamePattern, etc.
│   ├── functions.ts      # Naming utilities
│   └── index.ts          # export *
│
└── observability/        # Observability canonical types
    ├── types.ts          # MetricConfig, AlarmConfig, etc.
    ├── functions.ts      # Observability utilities
    └── index.ts          # export *
```

**Path convention**: `src/core/{concern}/` is reserved for canonical types.

---

## Rules (Hard)

### Rule 1: Reuse, Don't Reinvent

**Rule**: Reuse canonical types; do **not** create domain-specific variants.

```typescript
// ❌ BAD - Creating domain-specific variant
export interface VpcLoggingConfig {
  readonly enabled: boolean;
  readonly destination: string;
  readonly retentionDays: number;
}

// ✅ GOOD - Reusing canonical type
import * as logging from '../../core/logging';

export interface VpcProps {
  readonly logs?: ReadonlyArray<logging.LogConfig>;
}
```

---

### Rule 2: Extensions Must Be Additive

**Rule**: If you need to extend a canonical type, prefer composition wrappers.

**Preferred: Composition wrapper**
```typescript
import * as logging from '../../core/logging';

// ✅ BEST - Composition wrapper
export interface VpcFlowLogs {
  readonly log: logging.LogConfig;           // Canonical type
  readonly trafficType?: 'ALL' | 'ACCEPT' | 'REJECT';  // VPC-specific
  readonly format?: 'default' | 'custom';    // VPC-specific
}

export interface VpcProps {
  readonly flowLogs?: ReadonlyArray<VpcFlowLogs>;
}
```

**Allowed: Additive extension** (use sparingly)
```typescript
import * as logging from '../../core/logging';

// ⚠️ ALLOWED - But composition preferred
export interface VpcFlowLogs extends logging.LogConfig {
  readonly trafficType?: 'ALL' | 'ACCEPT' | 'REJECT';  // Adds fields only
}
```

**Forbidden: Modifications**
```typescript
// ❌ FORBIDDEN - Changing meaning of canonical fields
export interface VpcFlowLogs extends logging.LogConfig {
  readonly destination: VpcSpecificDestination;  // ❌ Changes type
}
```

---

### Rule 3: Plural Properties for Lists

**Rule**: Plural properties represent lists of singular objects.

```typescript
import * as logging from '../../core/logging';

// ✅ CORRECT - Plural property with array of singular
export interface VpcProps {
  readonly logs?: ReadonlyArray<logging.LogConfig>;  // Plural: logs
}

// ❌ INCORRECT - Singular property with array
export interface VpcProps {
  readonly log?: ReadonlyArray<logging.LogConfig>;   // Wrong: singular name
}
```

**Rationale**: Name reveals structure at a glance.

---

### Rule 4: Module-as-Unit Consumption

**Rule**: Preserve module-as-unit consumption via namespace imports.

```typescript
// ✅ CORRECT - Namespace import
import * as logging from '../../core/logging';
import * as tags from '../../core/tags';

export interface VpcProps {
  readonly logs?: ReadonlyArray<logging.LogConfig>;
  readonly tags?: tags.TagMap;
}

// ❌ INCORRECT - Piecemeal import
import { LogConfig } from '../../core/logging';
import { TagMap } from '../../core/tags';
```

**See**: [modules.md](./modules.md) for module consumption rules.

---

## Usage Examples by Layer

### L2 Utility Module (Defining Canonical Type)

```typescript
// src/core/logging/types.ts
/**
 * Canonical logging configuration.
 * Used across all constructs that support logging.
 */
export interface LogConfig {
  /**
   * Log destination type.
   */
  readonly destination: 'cloudwatch' | 's3' | 'kinesis';
  
  /**
   * Log retention in days.
   * @default 30
   */
  readonly retentionDays?: number;
  
  /**
   * Log format.
   * @default 'json'
   */
  readonly format?: 'json' | 'text' | 'custom';
}
```

---

### L2 Construct Module (Using Canonical Type)

```typescript
// src/constructs/vpc/types.ts
import * as logging from '../../core/logging';
import * as tags from '../../core/tags';

/**
 * VPC construct properties.
 */
export interface VpcProps {
  readonly name: string;
  
  /**
   * Logging configuration.
   * Reuses canonical logging type.
   */
  readonly logs?: ReadonlyArray<logging.LogConfig>;
  
  /**
   * Resource tags.
   * Reuses canonical tag type.
   */
  readonly tags?: tags.TagMap;
}
```

---

### L3 Composition Pattern (Using Canonical Type)

```typescript
// src/constructs/design-patterns/network-services/dns/types.ts
import * as logging from '../../../../core/logging';
import * as tags from '../../../../core/tags';

/**
 * DNS Domain component properties.
 */
export interface DomainProps {
  readonly name: string;
  
  /**
   * Query logging configuration.
   * Reuses canonical logging type.
   */
  readonly logs?: ReadonlyArray<logging.LogConfig>;
  
  /**
   * Resource tags.
   * Reuses canonical tag type.
   */
  readonly tags?: tags.TagMap;
}
```

---

## Canonical Type Catalog

### Logging (src/core/logging)

**Primary Types**:
```typescript
export interface LogConfig {
  readonly destination: 'cloudwatch' | 's3' | 'kinesis';
  readonly retentionDays?: number;
  readonly format?: 'json' | 'text' | 'custom';
}

export interface LogDestination {
  readonly type: 'cloudwatch' | 's3' | 'kinesis';
  readonly config?: CloudWatchConfig | S3Config | KinesisConfig;
}
```

**Used by**: VPC Flow Logs, S3 Access Logs, CloudFront Logs, Lambda Logs, etc.

---

### Tags (src/core/tags)

**Primary Types**:
```typescript
export type TagMap = Record<string, string>;

export interface TagStrategy {
  readonly inherit?: boolean;
  readonly override?: TagMap;
}
```

**Used by**: All taggable AWS resources

---

### Encryption (src/core/encryption)

**Primary Types**:
```typescript
export interface EncryptionConfig {
  readonly enabled: boolean;
  readonly kmsKey?: kms.IKey | string;
  readonly algorithm?: 'AES256' | 'aws:kms';
}

export interface KeyConfig {
  readonly keyId: string;
  readonly keyArn?: string;
  readonly rotation?: boolean;
}
```

**Used by**: S3, EBS, RDS, DynamoDB, SNS, SQS, etc.

---

### Naming (src/core/naming)

**Primary Types**:
```typescript
export interface NamingStrategy {
  readonly prefix?: string;
  readonly suffix?: string;
  readonly delimiter?: string;
  readonly maxLength?: number;
}

export interface NamePattern {
  readonly pattern: string;
  readonly variables?: Record<string, string>;
}
```

**Used by**: All named resources

---

### Observability (src/core/observability)

**Primary Types**:
```typescript
export interface MetricConfig {
  readonly namespace: string;
  readonly metricName: string;
  readonly dimensions?: Record<string, string>;
}

export interface AlarmConfig {
  readonly metric: MetricConfig;
  readonly threshold: number;
  readonly evaluationPeriods: number;
}
```

**Used by**: All monitored resources

---

## Common Mistakes

### Mistake 1: Creating Domain-Specific Variants

```typescript
// ❌ BAD - VPC-specific logging type
export interface VpcLoggingConfig {
  readonly destination: string;
  readonly retentionDays: number;
}

// ✅ GOOD - Reuse canonical
import * as logging from '../../core/logging';
readonly logs?: ReadonlyArray<logging.LogConfig>;
```

---

### Mistake 2: Modifying Canonical Type Meaning

```typescript
// ❌ BAD - Changes meaning of canonical field
export interface VpcFlowLogs extends logging.LogConfig {
  readonly destination: VpcLogDestination;  // Breaks canonical contract
}

// ✅ GOOD - Composition wrapper preserves meaning
export interface VpcFlowLogs {
  readonly log: logging.LogConfig;           // Preserves canonical
  readonly trafficType?: 'ALL' | 'ACCEPT' | 'REJECT';
}
```

---

### Mistake 3: Singular Name with Array

```typescript
// ❌ BAD - Singular name, array value
readonly log?: ReadonlyArray<logging.LogConfig>;

// ✅ GOOD - Plural name, array value
readonly logs?: ReadonlyArray<logging.LogConfig>;
```

---

### Mistake 4: Piecemeal Imports

```typescript
// ❌ BAD - Piecemeal import
import { LogConfig, TagMap } from '../../core/logging';

// ✅ GOOD - Namespace import
import * as logging from '../../core/logging';
import * as tags from '../../core/tags';
```

---

## Benefits in Practice

### Consistency Across Constructs

```typescript
// All constructs use same logging interface
const vpcLogs: logging.LogConfig = { destination: 'cloudwatch' };
const s3Logs: logging.LogConfig = { destination: 's3' };
const lambdaLogs: logging.LogConfig = { destination: 'cloudwatch' };

// Developer learns once, applies everywhere
```

---

### Easy Refactoring

```typescript
// Update canonical type once
// src/core/logging/types.ts
export interface LogConfig {
  readonly destination: 'cloudwatch' | 's3' | 'kinesis' | 'firehose';  // Add firehose
  // ...
}

// All constructs automatically get new option
// No changes needed in 50+ construct files
```

---

### Type Safety

```typescript
import * as logging from '../../core/logging';

// ✅ TypeScript catches mistakes
const logs: logging.LogConfig = {
  destination: 'invalid',  // ❌ Type error: not a valid destination
};
```

---

## Creating New Canonical Types

### When to Create

Create a new canonical type when:
1. ✅ Concept applies to **3+ construct types** across different services
2. ✅ Interface is **stable** (won't change frequently)
3. ✅ Pattern is **repeating** (seeing duplication)

### Process

1. **Propose**: Create proposal document with rationale
2. **Review**: Team reviews for cross-cutting applicability
3. **Implement**: Create in `src/core/{concern}/`
4. **Document**: Add to this catalog
5. **Migrate**: Update existing constructs to use it
6. **Approve**: Human approval required (approval gate)

### Template

```typescript
// src/core/{concern}/types.ts

/**
 * Canonical {concern} configuration.
 * Used across all constructs that support {concern}.
 */
export interface {Concern}Config {
  /**
   * {Property description}
   * 
   * @remarks
   * {Additional context}
   * 
   * @default {default value}
   */
  readonly property: string;
}
```

---

## Approval Gates

Human approval is required before:

- **Introducing** a new canonical shared type
- **Modifying** an existing canonical shared type (breaking change)
- **Migrating/deprecating** an existing type
- **Changing** the location of canonical types

**Rationale**: Canonical types impact all constructs - changes must be intentional.

---

## See Also

- **L2 Interface**: [L2/interface.md](../L2/interface.md) - Interface extension pattern
- **L3 Interface**: [L3/interface.md](../L3/interface.md) - Composition interface design
- **Module Consumption**: [modules.md](./modules.md) - Module-as-unit rules
- **Canonical Type Reuse Skill**: `skills/canonical-type-reuse.md`

---

## References

This standard enforces **consistent cross-cutting concerns** and aligns with:
- Repository Style & Consistency Rules in `AGENTS.md`
- Interface reuse patterns in `L2/interface.md`
- Composition patterns in `L3/interface.md`
