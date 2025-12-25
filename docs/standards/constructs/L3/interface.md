# L3 Interface Design Standard

**Applies to**: Props interfaces for L3 composition patterns

---

## Overview

L3 interfaces should be **stable, minimal, and configuration-friendly**. Unlike L2 (which extends upstream props), L3 defines its own interfaces optimized for composition patterns.

---

## Core Principle: Minimal Required Inputs

**Best Practice**: Minimize required properties; maximize defaults.

```typescript
// ✅ GOOD - Minimal required inputs
export interface DomainProps {
  // Only ONE required property
  readonly name: string;
  
  // Everything else optional with good defaults
  readonly private?: boolean;              // default: false
  readonly records?: DomainRecordProps[];  // default: []
  readonly enableQueryLogging?: boolean;   // default: false
}

// ❌ AVOID - Too many required properties
export interface DomainProps {
  readonly name: string;
  readonly type: 'public' | 'private';     // Could default to 'public'
  readonly region: string;                 // Could default to Stack region
  readonly records: DomainRecordProps[];   // Could default to []
}
```

---

### Benefits of Minimal Inputs

| Benefit | Description |
|---------|-------------|
| **Better UX** | Users provide only what's necessary |
| **Flexibility** | Sensible defaults for common cases |
| **Future-proof** | Can add optional properties without breaking |
| **JSON-friendly** | Minimal config in YAML/JSON |

---

## Interface Structure

### Component Props Pattern

```typescript
/**
 * Properties for Domain component.
 */
export interface DomainProps {
  /**
   * The domain name.
   * 
   * @example 'example.com'
   */
  readonly name: string;
  
  /**
   * Whether this is a private hosted zone.
   * 
   * @default false (public zone)
   */
  readonly private?: boolean;
  
  /**
   * DNS records to create.
   * 
   * @default [] (no records)
   */
  readonly records?: ReadonlyArray<DomainRecordProps>;
  
  /**
   * Enable Route53 query logging.
   * 
   * @default false
   */
  readonly enableQueryLogging?: boolean;
  
  /**
   * Resource tags.
   * 
   * @default {} (no tags)
   */
  readonly tags?: Record<string, string>;
}
```

---

### Service Aggregate Props Pattern

```typescript
/**
 * Properties for DNS service.
 */
export interface DnsProps {
  /**
   * Domains to create.
   * 
   * @default [] (no domains)
   */
  readonly domains?: ReadonlyArray<DomainProps>;
  
  /**
   * Profiles to create.
   * 
   * @default [] (no profiles)
   */
  readonly profiles?: ReadonlyArray<ProfileProps>;
}
```

**Pattern**: Service aggregates accept arrays of component props.

---

## Flexible Input Types

### Accept Primitives and Complex Types

```typescript
export interface DomainRecordProps {
  /**
   * Record type (string literal union).
   * 
   * @remarks
   * No enum import needed - just use string.
   */
  readonly type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  
  /**
   * Record name.
   */
  readonly name: string;
  
  /**
   * Record values.
   */
  readonly values: string[];
  
  /**
   * TTL in seconds (number) or Duration object.
   * 
   * @default 300
   */
  readonly ttl?: number | Duration;
}
```

---

### String Literal Unions Over Enums

```typescript
// ✅ GOOD - String literal union (no import needed)
export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';

export interface DomainRecordProps {
  readonly type?: RecordType;  // Accepts plain strings
}

// Usage (no import):
const record = { type: 'A', ... };  // ✅ Works

// ❌ AVOID - Enum (requires import)
export enum RecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
}

export interface DomainRecordProps {
  readonly type?: RecordType;  // Requires: import { RecordType }
}

// Usage (must import):
import { RecordType } from '...';
const record = { type: RecordType.A, ... };  // ❌ Verbose
```

---

## Composition Interfaces

### Array-of-Objects Pattern

L3 interfaces often use **array-of-objects** for composing multiple resources:

```typescript
export interface DnsProps {
  /**
   * Domains to create.
   */
  readonly domains?: ReadonlyArray<DomainProps>;
  
  /**
   * Profiles to create.
   */
  readonly profiles?: ReadonlyArray<ProfileProps>;
}

// Usage:
new Dns(this, 'DNS', {
  domains: [
    { name: 'example.com', private: true },
    { name: 'internal.local', private: true },
  ],
  profiles: [
    { name: 'dns-profile' },
  ],
});
```

---

### Nested Configuration Pattern

For complex configurations, use nested objects:

```typescript
export interface SecureWebsiteProps {
  readonly domainName: string;
  
  /**
   * S3 bucket configuration.
   */
  readonly bucket?: {
    readonly bucketName?: string;
    readonly versioned?: boolean;
    readonly lifecycleRules?: s3.LifecycleRule[];
  };
  
  /**
   * CloudFront distribution configuration.
   */
  readonly distribution?: {
    readonly enableLogging?: boolean;
    readonly priceClass?: cloudfront.PriceClass;
    readonly geoRestriction?: cloudfront.GeoRestriction;
  };
}
```

---

## Interface Documentation

### Required Documentation

```typescript
/**
 * Properties for Domain component.
 * 
 * @remarks
 * Composes Route53 HostedZone with optional records and query logging.
 * 
 * @example Basic public domain
 * {
 *   name: 'example.com'
 * }
 * 
 * @example Private domain with records
 * {
 *   name: 'internal.local',
 *   private: true,
 *   records: [
 *     { type: 'A', name: 'app', values: ['10.0.1.5'] }
 *   ]
 * }
 */
export interface DomainProps {
  /**
   * The domain name.
   * 
   * @example 'example.com'
   */
  readonly name: string;
  
  /**
   * Whether this is a private hosted zone.
   * 
   * @remarks
   * Private zones are only accessible within associated VPCs.
   * 
   * @default false (public zone)
   */
  readonly private?: boolean;
  
  // ... more properties ...
}
```

---

### Documentation Standards

**Required**:
- ✅ TSDoc comment on interface
- ✅ `@example` tags showing usage
- ✅ Comment on each property
- ✅ `@default` tags on optional properties
- ✅ `@remarks` for additional context

**JSII Requirements**:
- ❌ No code fences in `@example` tags
- ✅ Plain code examples (syntactically correct)
- ✅ Show realistic usage

---

## Canonical Type Reuse

**L3 interfaces should reuse canonical types** from `src/core/**`:

```typescript
// ✅ GOOD - Reusing canonical types
import type * as logging from '../../../core/logging';
import type * as tags from '../../../core/tags';

export interface DomainProps {
  readonly name: string;
  readonly logs?: ReadonlyArray<logging.LogConfig>;  // Canonical
  readonly tags?: tags.TagMap;                        // Canonical
}

// ❌ AVOID - Bespoke properties
export interface DomainProps {
  readonly name: string;
  readonly enableLogging?: boolean;      // Bespoke
  readonly logDestination?: string;      // Bespoke
  readonly resourceTags?: Record<string, string>;  // Should use canonical
}
```

**See**: [../L2/interface.md](../L2/interface.md) for canonical type details

---

## Type + Config Pattern

For discriminated unions, use the **type + config pattern**:

```typescript
/**
 * Flow Log destination configuration.
 */
export type FlowLogDestination =
  | { readonly type: 'logGroup'; readonly config?: LogGroupConfig }
  | { readonly type: 's3'; readonly config?: S3Config }
  | { readonly type: 'kinesis'; readonly config?: KinesisConfig };

export interface LogGroupConfig {
  readonly name?: string;
  readonly retentionDays?: number;
}

export interface S3Config {
  readonly bucketName?: string;
  readonly prefix?: string;
  readonly fileFormat?: 'plain' | 'parquet';
}

// Usage:
readonly destination: FlowLogDestination = {
  type: 'logGroup',
  config: {
    retentionDays: 30,
  },
};
```

---

## JSII Compatibility

### No Mapped Types

JSII does not support TypeScript mapped types:

```typescript
// ❌ JSII ERROR
export interface DomainProps extends Omit<route53.HostedZoneProps, 'zoneName'> {
  readonly name: string;
}

// ✅ JSII HAPPY - Define explicitly
export interface DomainProps {
  readonly name: string;
  readonly comment?: string;
  readonly queryLogsLogGroupArn?: string;
  // ... explicit properties
}
```

---

### Export All Referenced Types

All types referenced in public interfaces must be exported:

```typescript
// ❌ JSII ERROR
export interface DomainProps {
  readonly records?: DomainRecordProps[];  // References DomainRecordProps
}
// Missing: export of DomainRecordProps

// ✅ JSII HAPPY
export interface DomainProps {
  readonly records?: DomainRecordProps[];
}
export interface DomainRecordProps {  // Exported
  readonly type: string;
  readonly name: string;
}
```

**Solution**: Use `export *` in module `types.ts`:

```typescript
// types.ts
export * from './Domain';  // Exports DomainProps AND DomainRecordProps
```

---

## Validation-Friendly Interfaces

Design interfaces to enable **fail-closed validation**:

```typescript
export interface DomainProps {
  readonly name: string;
  
  /**
   * Zone type.
   * 
   * @remarks
   * Mutually exclusive with 'vpcs'.
   */
  readonly zone?: 'public' | 'private';
  
  /**
   * VPCs to associate (for private zones).
   * 
   * @remarks
   * Mutually exclusive with zone: 'public'.
   */
  readonly vpcs?: ec2.IVpc[];
}

// Validation in constructor:
function validateProps(props: DomainProps): void {
  if (props.zone === 'public' && props.vpcs) {
    throw new Error(
      'Cannot specify vpcs for public zones. ' +
      'Use zone: "private" or omit zone.'
    );
  }
}
```

---

## Complete Example

### Domain Component Interface

```typescript
/**
 * Properties for Domain component.
 * 
 * @remarks
 * Composes Route53 HostedZone with optional records and query logging.
 * 
 * @example Basic domain
 * new network.dns.Domain(this, 'Domain', {
 *   name: 'example.com',
 * });
 * 
 * @example Private domain with records
 * new network.dns.Domain(this, 'Domain', {
 *   name: 'internal.local',
 *   private: true,
 *   records: [
 *     { type: 'A', name: 'app', values: ['10.0.1.5'], ttl: 300 },
 *   ],
 *   enableQueryLogging: true,
 * });
 */
export interface DomainProps {
  /**
   * The domain name.
   * 
   * @example 'example.com'
   */
  readonly name: string;
  
  /**
   * Whether this is a private hosted zone.
   * 
   * @remarks
   * Private zones are only accessible within associated VPCs.
   * 
   * @default false (public zone)
   */
  readonly private?: boolean;
  
  /**
   * VPCs to associate with private hosted zone.
   * 
   * @remarks
   * Only applicable when private: true.
   * 
   * @default [] (no VPC associations)
   */
  readonly vpcs?: ReadonlyArray<ec2.IVpc>;
  
  /**
   * DNS records to create.
   * 
   * @default [] (no records)
   */
  readonly records?: ReadonlyArray<DomainRecordProps>;
  
  /**
   * Enable Route53 query logging.
   * 
   * @remarks
   * Creates CloudWatch Log Group and Route53 Query Logging Config.
   * 
   * @default false
   */
  readonly enableQueryLogging?: boolean;
  
  /**
   * Resource tags.
   * 
   * @default {} (no tags)
   */
  readonly tags?: Record<string, string>;
}

/**
 * DNS record configuration.
 */
export interface DomainRecordProps {
  /**
   * Record type.
   * 
   * @remarks
   * Uses string literal union - no enum import needed.
   */
  readonly type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'CAA' | 'NS';
  
  /**
   * Record name (subdomain).
   * 
   * @example 'www' for www.example.com
   */
  readonly name: string;
  
  /**
   * Record values.
   * 
   * @example ['10.0.1.5'] for A record
   */
  readonly values: string[];
  
  /**
   * TTL in seconds (number) or Duration object.
   * 
   * @default 300
   */
  readonly ttl?: number | Duration;
}
```

---

## Checklist for New L3 Interfaces

### Design
- [ ] Minimal required properties (ideally 1)
- [ ] All optional properties have `@default` comments
- [ ] Uses string literal unions (not enums)
- [ ] Accepts primitives + complex types (number | Duration)
- [ ] Reuses canonical types from src/core/**

### Documentation
- [ ] TSDoc comment on interface with `@example`
- [ ] `@remarks` for additional context
- [ ] Comment on each property
- [ ] `@default` tags on optional properties
- [ ] Examples are syntactically correct (no code fences)

### JSII
- [ ] No mapped types (Omit, Pick, Partial)
- [ ] All referenced types exported
- [ ] Uses `export *` for automatic type export

### Validation
- [ ] Interface design enables fail-closed validation
- [ ] Mutually exclusive props documented
- [ ] Type constraints enforced

---

## Approval Gates

Human approval is required before:
- Creating new canonical type (impacts all constructs)
- Changing common interface patterns
- Breaking interface changes
- Adding required properties (breaking)

---

## See Also

- **L3 Composition**: [composition.md](./composition.md)
- **L3 Constructs**: [constructs.md](./constructs.md)
- **L2 Interfaces**: [../L2/interface.md](../L2/interface.md) - Canonical types
- **Interface Designer Skill**: `skills/interface-designer.md`

---

## References

- **Source Material**:
  - `docs/standards/to-merge/INTERFACES.md`
  - `docs/standards/to-merge/COMMON-INTERFACES.md`
  - `docs/standards/interface-design.md`

