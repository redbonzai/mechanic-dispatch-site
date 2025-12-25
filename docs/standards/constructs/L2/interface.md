# L2 Interface Design Standard

**Applies to**: Props interfaces for L2 constructs (utility and construct modules)

---

## Overview

L2 interfaces define the contract between users and constructs. This standard covers:

- Extension pattern (extending upstream props)
- Canonical type reuse
- Common attribute patterns
- Interface location and organization

---

## Core Pattern: Extension Over Redefinition

### Best Practice: Extend Upstream Props Interface

```typescript
// ✅ GOOD - Extends upstream interface
export interface SecureBucketProps extends s3.BucketProps {
  // Only add new properties specific to SecureBucket
  readonly createCustomKey?: boolean;
  readonly keyDescription?: string;
}

// ❌ AVOID - Redefinition (duplicates upstream properties)
export interface SecureBucketProps {
  readonly bucketName?: string;  // Already in s3.BucketProps
  readonly versioned?: boolean;  // Already in s3.BucketProps
  readonly createCustomKey?: boolean;
}
```

---

### Benefits of Extension Pattern

| Benefit | Description |
|---------|-------------|
| **Automatic compatibility** | All upstream properties available to users |
| **No duplication** | Don't maintain duplicate property definitions |
| **User flexibility** | Users can pass any valid upstream property |
| **Type safety** | TypeScript catches breaking changes in upstream |
| **Future-proof** | New upstream properties available automatically |

---

## Canonical Type Reuse

**Core Principle**: Reuse canonical shared types rather than creating bespoke properties.

### Canonical Types (src/core/**)

Canonical types are defined once in `src/core/**` and reused across all constructs:

| Canonical Type | Location | Purpose | Used By |
|----------------|----------|---------|---------|
| **Tags** | `core/tags` | Resource tagging | All taggable resources |
| **Logging** | `core/logging` | Centralized logging | VPC, S3, CloudFront |
| **Encryption** | `core/encryption` | KMS encryption configuration | S3, DynamoDB, SNS |
| **Naming** | `core/naming` | Naming strategies | All constructs |
| **Observability** | `core/observability` | Monitoring/tracing | CloudWatch-enabled resources |

---

### Reuse Pattern

```typescript
// ✅ GOOD - Reusing canonical types
import * as logging from '../../core/logging';
import * as tags from '../../core/tags';

export interface VpcProps extends ec2.VpcProps {
  readonly logs?: ReadonlyArray<logging.LogConfig>;  // Canonical logging
  readonly tags?: tags.TagMap;                        // Canonical tags
}

// ❌ AVOID - Creating bespoke properties
export interface VpcProps extends ec2.VpcProps {
  readonly enableLogging?: boolean;          // Bespoke
  readonly logDestination?: string;          // Bespoke
  readonly logRetention?: number;            // Bespoke
  readonly resourceTags?: Record<string, string>;  // Bespoke (should use canonical)
}
```

---

### Benefits of Canonical Type Reuse

| Benefit | Description |
|---------|-------------|
| **Consistency** | Same interface across all constructs |
| **Single source of truth** | Changes propagate automatically |
| **Reduced maintenance** | Update once, applies everywhere |
| **Better DX** | Developers learn once, use everywhere |
| **Type safety** | TypeScript enforces consistency |

---

## Composition Over Inline Properties

**Pattern**: Compose interfaces from shared types rather than inline properties.

```typescript
// ✅ GOOD - Composition with shared types
export interface VpcFlowLogs {
  readonly log: logging.LogConfig;             // Canonical type
  readonly trafficType?: 'ALL' | 'ACCEPT' | 'REJECT';
  readonly format?: 'default' | 'custom';
}

export interface VpcProps extends ec2.VpcProps {
  readonly flowLogs?: ReadonlyArray<VpcFlowLogs>;
}

// ❌ AVOID - Inline properties
export interface VpcProps extends ec2.VpcProps {
  readonly flowLogsEnabled?: boolean;
  readonly flowLogsDestination?: string;
  readonly flowLogsFormat?: string;
  readonly flowLogsRetention?: number;
  readonly flowLogsTrafficType?: string;
}
```

---

### When to Create Sub-Interfaces

| Condition | Create Sub-Interface? |
|-----------|----------------------|
| 3+ related properties | ✅ Yes |
| Reused across constructs | ✅ Yes |
| Complex validation | ✅ Yes |
| Future extensibility likely | ✅ Yes |
| Single property | ❌ No |
| Only used once | ❌ No |

---

## Common Attribute Names

**Standard attribute names** with consistent meanings across all constructs:

### Core Attributes

| Attribute | Type | Purpose |
|-----------|------|---------|
| `tags` | `Record<string, string>` | Resource tags |
| `name` | `string` | Resource name |
| `description` | `string` | Resource description |

### Encryption

| Attribute | Type | Purpose |
|-----------|------|---------|
| `kmsKey` | `kms.IKey \| string` | Single KMS key |
| `kmsKeyDefault` | `boolean` | Create default managed key |
| `kmsKeys` | `Array<{kmsKey: kms.IKey \| string}>` | Multiple KMS keys |

### Zones

| Attribute | Type | Purpose |
|-----------|------|---------|
| `zone` | `ZoneConfig` | Count-based zone selection |
| `zones` | `ZoneSpec[]` | Explicit zone list |

**Rule**: Use `zone` OR `zones`, NEVER both (mutually exclusive)

### Sharing

| Attribute | Type | Purpose |
|-----------|------|---------|
| `share` | `RamShareProps` | AWS RAM resource sharing |

### Logging

| Attribute | Type | Purpose |
|-----------|------|---------|
| `logs` | `ReadonlyArray<logging.LogConfig>` | Centralized logging configuration |
| `logGroup` | `logs.ILogGroup` | CloudWatch Log Group |

---

## Interface Organization

### types.ts Structure

```typescript
// types.ts

// AWS CDK imports
import {
  aws_s3 as s3,
  aws_kms as kms,
} from 'aws-cdk-lib';

// Internal canonical types (alphabetical)
import type * as encryption from '../../core/encryption';
import type * as logging from '../../core/logging';
import type * as tags from '../../core/tags';

/**
 * Properties for SecureBucket construct.
 * 
 * @example
 * const bucket = new SecureBucket(this, 'Bucket', {
 *   bucketName: 'my-secure-bucket',
 *   createCustomKey: true,
 * });
 */
export interface SecureBucketProps extends s3.BucketProps {
  /**
   * Create a custom KMS key for bucket encryption.
   * 
   * @default false (uses AWS-managed S3 encryption)
   */
  readonly createCustomKey?: boolean;

  /**
   * Description for the custom KMS key.
   * 
   * @default 'Encryption key for {bucketName}'
   */
  readonly keyDescription?: string;

  /**
   * Centralized logging configuration.
   * 
   * @see {@link logging.LogConfig}
   */
  readonly logs?: ReadonlyArray<logging.LogConfig>;

  /**
   * Resource tags.
   * 
   * @see {@link tags.TagMap}
   */
  readonly tags?: tags.TagMap;
}
```

---

### Interface Documentation Standards

**Required documentation**:

- TSDoc comment on interface
- `@example` tag with usage
- Comment on each property
- `@default` tag on optional properties
- `@see` tags for canonical types

**JSII Requirements**:

- ❌ No code fences in `@example` tags
- ✅ Plain code examples (syntactically correct)
- ✅ Include import statements

---

## Type + Config Pattern

**For discriminated unions** (collections of configurable objects):

```typescript
/**
 * Configurable object with type discriminator.
 */
export interface ConfigurableObject<T extends string, C = unknown> {
  /**
   * Object type identifier.
   * Determines available config properties.
   */
  readonly type: T;

  /**
   * Type-specific configuration.
   */
  readonly config?: C;

  /**
   * Resource tags.
   */
  readonly tags?: Record<string, string>;
}

// Example usage: VPC Flow Log destinations
export type FlowLogDestinationType = 'logGroup' | 's3' | 'kinesis';

export interface LogGroupDestinationConfig {
  readonly name?: string;
  readonly retentionDays?: number;
}

export interface S3DestinationConfig {
  readonly bucketName?: string;
  readonly prefix?: string;
  readonly fileFormat?: 'plain' | 'parquet';
}

export type FlowLogDestination =
  | ConfigurableObject<'logGroup', LogGroupDestinationConfig>
  | ConfigurableObject<'s3', S3DestinationConfig>
  | ConfigurableObject<'kinesis', KinesisDestinationConfig>;
```

---

## Object Export Pattern

**Principle**: Export complete, cohesive objects rather than scattered properties.

```typescript
// ✅ GOOD - Grouped configuration object
export interface RouteConfig {
  readonly strategy?: RouteTableStrategy;
  readonly rules?: RouteRule[];
  readonly propagation?: RoutePropagation;
}

export interface NetworkSegment {
  readonly name: string;
  readonly cidr: CidrFamily;
  readonly route?: RouteConfig;  // Complete object
}

// ❌ AVOID - Scattered properties
export interface NetworkSegment {
  readonly name: string;
  readonly cidr: CidrFamily;
  readonly routeStrategy?: string;      // Scattered
  readonly routes?: RouteRule[];        // Scattered
  readonly routePropagation?: boolean;  // Scattered
}
```

---

## Validation Guidelines

### Constructor Validation

**Pattern**: Validate interfaces in construct constructor before resource creation.

```typescript
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    // Validation BEFORE super()
    validateProps(props);
    
    super(scope, id, {
      // ... configuration ...
    });
  }
}

function validateProps(props: SecureBucketProps): void {
  // Fail-closed: Reject invalid configurations
  if (props.createCustomKey && props.encryptionKey) {
    throw new Error(
      'Cannot specify both createCustomKey and encryptionKey. ' +
      'Use one or the other.'
    );
  }
  
  if (props.keyDescription && !props.createCustomKey) {
    throw new Error(
      'keyDescription requires createCustomKey to be true.'
    );
  }
}
```

---

### Validation Rules

| Rule | Reason |
|------|--------|
| **Fail-closed** | Reject invalid configurations (don't silently ignore) |
| **Early validation** | Validate before resource creation |
| **Clear errors** | Descriptive error messages with guidance |
| **Type safety** | Use TypeScript types to prevent invalid states |

---

## Interface Location Rules

### Rule 1: Interface Lives in types.ts

```text
src/constructs/s3/
├── types.ts              # SecureBucketProps defined here
├── SecureBucket.ts       # Construct implementation imports from types.ts
└── index.ts              # Exports SecureBucketProps
```

---

### Rule 2: Owner Construct Maintains Interface

```text
src/
├── core/
│   ├── encryption/
│   │   ├── types.ts      # EncryptionConfig defined here (canonical)
│   │   └── index.ts      # Exports EncryptionConfig
│   └── ...
│
└── constructs/
    └── s3/
        ├── types.ts      # Imports EncryptionConfig from '../../core/encryption'
        └── ...
```

**Pattern**:

- Canonical types live in `src/core/**`
- Construct-specific props live in construct's `types.ts`
- Constructs import canonical types from core

---

## Import Rules

### Rule 1: Always Import from index.ts

```typescript
// ✅ GOOD - Import from barrel file
import type { RamShareProps } from '../ram';
import type * as logging from '../../core/logging';

// ❌ BAD - Direct file imports
import type { RamShareProps } from '../ram/types';
import type { LogConfig } from '../../core/logging/types';
```

---

### Rule 2: Use Type Imports for Types

```typescript
// ✅ GOOD - Type-only imports
import type { SecureBucketProps } from './types';
import type * as encryption from '../../core/encryption';

// Construct imports (values)
import { SecureBucket } from './SecureBucket';

// ❌ BAD - Importing types as values
import { SecureBucketProps, SecureBucket } from './types';
```

---

## Checklist for New L2 Interfaces

When creating a new L2 interface, verify:

### Design

- [ ] Extends upstream props interface (if wrapping AWS resource)
- [ ] Reuses canonical types from `src/core/**`
- [ ] Uses standard attribute names (tags, kmsKey, logs, etc.)
- [ ] Composes from shared types (not inline properties)

### Documentation

- [ ] TSDoc comment on interface
- [ ] `@example` tag with usage (no code fences)
- [ ] Comment on each property
- [ ] `@default` tags on optional properties
- [ ] `@see` tags for canonical types

### Organization

- [ ] Interface in `types.ts`
- [ ] Type-only imports (`import type`)
- [ ] Imports from `index.ts` (not direct files)
- [ ] Exported from module barrel

### Validation

- [ ] Validation in constructor (fail-closed)
- [ ] Clear error messages
- [ ] Type safety prevents invalid states

---

## Approval Gates

Human approval is required before:

- Creating new canonical type (impacts all constructs)
- Changing canonical type interface (breaking change)
- Adding new common attribute name
- Changing standard attribute semantics

---

## See Also

- **L2 Constructs**: [constructs.md](./constructs.md)
- **L2 Structure**: [structure.md](./structure.md)
- **Canonical Type Reuse Skill**: `skills/canonical-type-reuse.md`
- **Interface Designer Skill**: `skills/interface-designer.md`
- **Common Interfaces**: [../common/canonical-types.md](../common/canonical-types.md)

---

## References

- **Source Material**:
  - `docs/standards/to-merge/INTERFACES.md`
  - `docs/standards/to-merge/COMMON-INTERFACES.md`
  - `docs/standards/interface-design.md`
  - `docs/standards/canonical-types.md`
