# Naming Conventions

**Entry Point**: Naming Standards for AI Agents

**Audience**: AI Agents and Developers  
**Scope**: All TypeScript interfaces and property names  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This document defines naming conventions for TypeScript interfaces, properties, and identifiers. These rules ensure self-documenting APIs where property names reveal their data structure without examining type definitions.

**Core Philosophy**: Property names MUST reveal data structure at a glance.

---

## Quick Reference

| Pattern | Data Type | Usage | Example |
|---------|-----------|-------|---------|
| **Singular** | Object with properties | Configuration object | `zone: { count: 3 }` |
| **Plural** | Array | List of items | `zones: [{ id: 'a' }]` |
| **Primitive** | string/number/boolean | Single value | `name: 'my-vpc'` |

---

## Rule 1: Singular vs Plural

**Rule**: Property name MUST reveal its data structure without examining the type definition.

### Decision Tree

```text
What is the property's value?

├── An object with named properties?
│   └── Use SINGULAR name
│       zone: { count: 3, strategy: 'PER_AZ' }
│       route: { destination: '0.0.0.0/0', target: 'igw' }
│
├── An array of items?
│   └── Use PLURAL name
│       zones: [{ id: 'a' }, { id: 'b' }]
│       routes: [{ destination: '0.0.0.0/0', target: 'igw' }]
│
└── A primitive (string, number, boolean)?
    └── Use SINGULAR name, no wrapper
        name: 'my-vpc'
        count: 3
        enabled: true
```

### Examples

#### Correct Usage

```typescript
// ✅ CORRECT: Singular for object
interface VpcProps {
  readonly zone: ZoneConfig;        // Object with properties
}

type ZoneConfig = {
  count: number;
  strategy?: string;
};

// ✅ CORRECT: Plural for array
interface VpcProps {
  readonly zones: ZoneSpec[];       // Array of items
}

type ZoneSpec = {
  id: string;
};

// ✅ CORRECT: Primitive without wrapper
interface VpcProps {
  readonly name: string;            // Just a string
  readonly count: number;           // Just a number
  readonly enabled: boolean;        // Just a boolean
}
```

#### Incorrect Usage

```typescript
// ❌ INCORRECT: Plural for object
interface VpcProps {
  readonly zones: ZoneConfig;       // zones is plural but value is object!
}

type ZoneConfig = {
  count: number;  // This is NOT an array
};

// ❌ INCORRECT: Singular for array
interface VpcProps {
  readonly zone: ZoneSpec[];        // zone is singular but value is array!
}

// ❌ INCORRECT: Wrapped primitive
interface VpcProps {
  readonly name: {
    value: string;                  // Unnecessary wrapper
  };
}
```

---

## Rule 2: Mutual Exclusivity

**Rule**: Singular and plural forms of the same concept MUST NOT both appear in the same interface without validation.

### Problem

```typescript
// ❌ INCORRECT: Both present without validation
interface VpcProps {
  readonly zone?: ZoneConfig;       // Option 1
  readonly zones?: ZoneSpec[];      // Option 2
  // Which takes precedence? Ambiguous!
}

// Usage - conflict!
const props = {
  zone: { count: 2 },
  zones: [{ id: 'a' }, { id: 'b' }]  // Both specified - which wins?
};
```

### Solution: Validate Mutual Exclusivity

```typescript
// ✅ CORRECT: Interface allows both options
interface VpcProps {
  readonly zone?: ZoneConfig;       // Option 1
  readonly zones?: ZoneSpec[];      // Option 2
}

// ✅ CORRECT: Constructor validates mutual exclusivity
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // Validate FIRST (before any resources)
  if (props.zone && props.zones) {
    throw new Error(
      "VpcConstruct: Cannot specify both 'zone' and 'zones'. " +
      "Use 'zone' for count-based or 'zones' for explicit list."
    );
  }
  
  // Now safe to use
  const zoneCount = props.zones?.length ?? props.zone?.count ?? 3;
}
```

### Validation Template

```typescript
// Template for mutual exclusivity validation
if (props.{singular} && props.{plural}) {
  throw new Error(
    `{ConstructName}: Cannot specify both '{singular}' and '{plural}'. ` +
    `Use one or the other.`
  );
}
```

**See**: [validation.md](./validation.md) for complete validation patterns

---

## Rule 3: Abbreviations and Acronyms

**Rule**: Use well-known abbreviations to reduce repetition. MUST be industry-standard (AWS uses them in documentation).

### Approved Abbreviations

| Abbreviation | Full Name | Usage Context |
|--------------|-----------|---------------|
| **VPC** | Virtual Private Cloud | AWS networking |
| **AZ** | Availability Zone | AWS regions |
| **CIDR** | Classless Inter-Domain Routing | IP addressing |
| **DNS** | Domain Name System | Name resolution |
| **KMS** | Key Management Service | Encryption |
| **ARN** | Amazon Resource Name | Resource identifiers |
| **IGW** | Internet Gateway | VPC gateways |
| **EIGW** | Egress-only Internet Gateway | IPv6 egress |
| **NAT** | Network Address Translation | NAT Gateway |
| **VGW** | Virtual Private Gateway | VPN |
| **TGW** | Transit Gateway | Network connectivity |
| **SG** | Security Group | Network security |
| **NACL** | Network Access Control List | Subnet security |
| **ENI** | Elastic Network Interface | Network interfaces |
| **BPA** | Block Public Access | S3, networking |
| **IPAM** | IP Address Management | IP pools |
| **DHCP** | Dynamic Host Configuration Protocol | VPC settings |

### Documentation Requirements

When using abbreviations, always provide full name in JSDoc:

```typescript
// ✅ CORRECT: Full name in JSDoc
/**
 * Internet Gateway (IGW) configuration.
 * @param igw - Whether to create an Internet Gateway
 */
readonly igw?: boolean;

/**
 * Block Public Access (BPA) settings.
 * Controls public access to resources.
 */
readonly bpa?: BpaConfig;

// ✅ CORRECT: Inline comment for YAML examples
bpa:              # Block Public Access
  block:
    acls: true
    policy: true
```

### Avoiding Repetition

```yaml
# ✅ CORRECT: Clean abbreviation usage
bpa:
  block:
    acls: boolean
    policy: boolean

dns:
  hostnames: boolean
  support: boolean

# ❌ INCORRECT: Unnecessary repetition
blockPublicAccess:
  blockPublicAcls: boolean      # "block" and "Public" repeated
  blockPublicPolicy: boolean    # "block" and "Public" repeated
  
dnsSettings:
  enableDnsHostnames: boolean   # "dns" and "enable" repeated
  enableDnsSupport: boolean     # "dns" and "enable" repeated
```

---

## Rule 4: Presence Implies Enablement

**Rule**: If an optional feature object is present, the feature MUST be enabled. No redundant `enabled` flags.

### Correct Pattern

```typescript
// ✅ CORRECT: Presence = enabled
interface VpcProps {
  /**
   * Flow log configuration.
   * If present, flow logs are enabled.
   */
  readonly flowLog?: FlowLogConfig;
  
  /**
   * Encryption configuration.
   * If present, encryption is enabled.
   */
  readonly encryption?: EncryptionConfig;
}

// Usage
const props = {
  flowLog: {                    // Presence = enabled
    trafficType: 'ALL',
    destinations: [...]
  }
};
```

### Incorrect Pattern

```typescript
// ❌ INCORRECT: Redundant enabled flag
interface VpcProps {
  readonly flowLog?: FlowLogConfig;
}

interface FlowLogConfig {
  readonly enabled: boolean;    // ❌ Redundant - presence already implies this
  readonly trafficType: string;
}

// Usage - confusing!
const props = {
  flowLog: {
    enabled: true,              // ❌ Why is this needed if object is present?
    trafficType: 'ALL'
  }
};
```

### When to Use Explicit `enabled`

Use explicit `enabled` flags ONLY when:

1. **Feature has complex sub-configurations that exist independently of enablement**
2. **Feature needs explicit disable after initial configuration**
3. **Feature state is inherited and may need override**

```typescript
// ✅ ACCEPTABLE: Complex inheritance scenario
interface MonitoringConfig {
  /**
   * Explicitly enable/disable monitoring.
   * Used to override inherited config.
   */
  readonly enabled?: boolean;   // ✅ Justified - override inherited state
  
  /**
   * Monitoring interval.
   * Config exists even when disabled for when re-enabled.
   */
  readonly interval: number;
  
  /**
   * Metrics to collect.
   */
  readonly metrics: string[];
}
```

**See**: [L2/interface.md](../L2/interface.md) for interface design patterns

---

## Rule 5: Flatten Single-Property Objects

**Rule**: Objects with only ONE property SHOULD be flattened unless future extensibility is expected.

### Correct Pattern

```typescript
// ✅ CORRECT: Flattened
interface DnsConfig {
  readonly hostnames: boolean;  // Single boolean - flattened
  readonly support: boolean;    // Single boolean - flattened
}

// Usage
const dns: DnsConfig = {
  hostnames: true,
  support: true
};
```

### Incorrect Pattern

```typescript
// ❌ INCORRECT: Unnecessary nesting
interface DnsConfig {
  readonly hostnames: {
    enabled: boolean;           // ❌ Only one property - unnecessary object
  };
  readonly support: {
    enabled: boolean;           // ❌ Only one property - unnecessary object
  };
}

// Usage - verbose!
const dns: DnsConfig = {
  hostnames: { enabled: true },
  support: { enabled: true }
};
```

### Exception: Future Extensibility

If a single-property object will likely gain more properties, keep the structure:

```typescript
// ✅ ACCEPTABLE: Expected to grow
interface EncryptionConfig {
  /**
   * KMS key for encryption.
   * More properties expected (algorithm, rotation, etc.)
   */
  readonly kmsKey: kms.IKey | string;  // Will grow to include algorithm, rotation
}

interface VpcProps {
  readonly encryption?: EncryptionConfig;  // ✅ Keep object - will grow
}
```

---

## Rule 6: `count` Property Placement

**Rule**: `count` MUST appear on singular configuration objects, NEVER on array items.

### Correct Pattern

```typescript
// ✅ CORRECT: count on singular object
interface VpcProps {
  readonly zone?: ZoneConfig;
}

interface ZoneConfig {
  readonly count: number;       // ✅ How many zones to use
}

interface GatewayConfig {
  readonly type: 'nat' | 'igw';
  readonly count: number;       // ✅ How many NAT gateways
}

// Usage
const props = {
  zone: { count: 3 },
  gateway: { type: 'nat', count: 2 }
};
```

### Incorrect Pattern

```typescript
// ❌ INCORRECT: count on array item (meaningless)
interface VpcProps {
  readonly zones: ZoneSpec[];
}

interface ZoneSpec {
  readonly id: string;
  readonly count: number;       // ❌ Always 1 for array items - adds no value
}

// Usage - confusing!
const props = {
  zones: [
    { id: 'a', count: 1 },      // ❌ Always 1 - why have this?
    { id: 'b', count: 1 }
  ]
};
```

**Rationale**: Array length already indicates count. A `count` on each item is always 1.

---

## Rule 7: Group Related Properties

**Rule**: When 3+ properties share a common prefix or theme, group them into a configuration object.

### Correct Pattern

```typescript
// ✅ CORRECT: Grouped configuration
interface RouteConfig {
  readonly strategy?: string;
  readonly rules?: RouteRule[];
  readonly propagation?: boolean;
  readonly priority?: number;
}

interface NetworkSegment {
  readonly name: string;
  readonly route?: RouteConfig;          // ✅ Single configuration object
}
```

### Incorrect Pattern

```typescript
// ❌ INCORRECT: Scattered related properties
interface NetworkSegment {
  readonly name: string;
  readonly routeStrategy?: string;       // Related...
  readonly routes?: RouteRule[];         // ...properties...
  readonly routePropagation?: boolean;   // ...scattered...
  readonly routePriority?: number;       // ...across interface
}
```

**Benefits of Grouping**:
- Easier to understand related properties
- Cleaner API surface
- Easier to make entire feature optional
- Better TypeScript autocompletion

---

## Property Naming Checklist

When naming a property, verify:

- [ ] **Singular name → Object type, Plural name → Array type**
- [ ] **No conflict with existing singular/plural pair** (or add validation)
- [ ] **Uses approved abbreviation** (if applicable) with JSDoc full name
- [ ] **No redundant `enabled` flag** (presence = enablement)
- [ ] **Single-property objects are flattened** (unless future growth expected)
- [ ] **`count` on configuration objects, not array items**
- [ ] **Related properties (3+) are grouped**
- [ ] **Follows existing common attribute patterns** (see [types.md](./types.md))

---

## Common Patterns

### Pattern: Count-Based vs Explicit List

```typescript
// ✅ CORRECT: Provide both options with mutual exclusivity
interface VpcProps {
  /**
   * Count-based zone selection.
   * Mutually exclusive with zones.
   */
  readonly zone?: {
    count: number;              // Singular object
  };
  
  /**
   * Explicit zone list.
   * Mutually exclusive with zone.
   */
  readonly zones?: Array<{      // Plural array
    id: string;
  }>;
}

// Constructor validates
if (props.zone && props.zones) {
  throw new Error("Cannot specify both 'zone' and 'zones'.");
}
```

### Pattern: Feature Configuration

```typescript
// ✅ CORRECT: Feature config object
interface VpcProps {
  /**
   * Flow log configuration.
   * If present, flow logs are enabled.
   */
  readonly flowLog?: {
    trafficType: 'ALL' | 'ACCEPT' | 'REJECT';
    destinations: FlowLogDestination[];
    format?: string;
  };
}

// Usage - presence = enabled
const props = {
  flowLog: {                    // Enabled because present
    trafficType: 'ALL',
    destinations: [...]
  }
};
```

### Pattern: Grouped Related Properties

```typescript
// ✅ CORRECT: Group related DNS properties
interface DnsConfig {
  readonly hostnames: boolean;
  readonly support: boolean;
  readonly resolution: boolean;
}

interface VpcProps {
  readonly dns?: DnsConfig;     // Grouped
}

// ❌ INCORRECT: Scattered
interface VpcProps {
  readonly enableDnsHostnames?: boolean;
  readonly enableDnsSupport?: boolean;
  readonly enableDnsResolution?: boolean;
}
```

---

## Examples by Domain

### Availability Zones

```typescript
// ✅ CORRECT: Count-based (singular)
interface VpcProps {
  readonly zone?: {
    count: number;              // How many zones
  };
}

// ✅ CORRECT: Explicit list (plural)
interface VpcProps {
  readonly zones?: Array<{
    id: string;                 // Which zones
  }>;
}

// ❌ INCORRECT: Both present without validation
interface VpcProps {
  readonly zone?: { count: number };
  readonly zones?: Array<{ id: string }>;
  // MUST validate mutual exclusivity!
}
```

### CIDR Allocations

```typescript
// ✅ CORRECT: Multiple allocations (plural)
interface CidrConfig {
  readonly allocations: Array<{
    index: number;
    ipv4?: { block: string };
    ipv6?: { auto: boolean };
  }>;
}

// ✅ CORRECT: Single family selection (singular)
interface SubnetProps {
  readonly cidr: {
    ipv4?: { block: string };
    ipv6?: { auto: boolean };
  };
}
```

### Destinations

```typescript
// ✅ CORRECT: Multiple destinations (plural)
interface FlowLogProps {
  readonly destinations: Array<{
    type: 'logGroup' | 's3';
    config: DestinationConfig;
  }>;
}

// ✅ CORRECT: Single destination (singular, if only one allowed)
interface FlowLogProps {
  readonly destination: {
    type: 'logGroup' | 's3';
    config: DestinationConfig;
  };
}
```

---

## AI Agent Guidelines

### Decision Logic

**Question 1**: What type of data does this property hold?
- **Object with named properties** → Singular name
- **Array of items** → Plural name
- **Primitive value** → Singular name, no wrapper

**Question 2**: Are there both singular and plural forms?
- **YES** → Add mutual exclusivity validation in constructor
- **NO** → No validation needed

**Question 3**: Is this a feature configuration?
- **YES** → Presence = enabled (no `enabled` flag)
- **NO** → N/A

**Question 4**: Does the object have only one property?
- **YES** → Flatten unless future growth expected
- **NO** → Keep object

---

### Common Mistakes

#### Mistake 1: Using Plural for Object

```typescript
// ❌ BAD
interface VpcProps {
  readonly zones: ZoneConfig;   // Plural name but object type!
}

type ZoneConfig = {
  count: number;
};

// ✅ GOOD
interface VpcProps {
  readonly zone: ZoneConfig;    // Singular name for object type
}
```

---

#### Mistake 2: No Mutual Exclusivity Validation

```typescript
// ❌ BAD: No validation
interface VpcProps {
  readonly zone?: ZoneConfig;
  readonly zones?: ZoneSpec[];
}

constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  // Missing validation!
  const count = props.zone?.count ?? props.zones?.length ?? 3;
}

// ✅ GOOD: Validate first
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  if (props.zone && props.zones) {
    throw new Error("Cannot specify both 'zone' and 'zones'.");
  }
  
  const count = props.zone?.count ?? props.zones?.length ?? 3;
}
```

---

#### Mistake 3: Redundant `enabled` Flag

```typescript
// ❌ BAD: Redundant enabled
interface VpcProps {
  readonly flowLog?: {
    enabled: boolean;           // ❌ Redundant
    trafficType: string;
  };
}

// ✅ GOOD: Presence = enabled
interface VpcProps {
  readonly flowLog?: {
    trafficType: string;        // Presence implies enabled
  };
}
```

---

## Troubleshooting

### Issue: "Should this property be singular or plural?"

**Decision Rule**: Look at the type
- Object type? → Singular
- Array type? → Plural

```typescript
readonly zone: ZoneConfig;      // Object → Singular
readonly zones: ZoneSpec[];     // Array → Plural
```

---

### Issue: "We have both zone and zones, is that OK?"

**Answer**: Yes, BUT you MUST validate mutual exclusivity

```typescript
if (props.zone && props.zones) {
  throw new Error("Cannot specify both 'zone' and 'zones'.");
}
```

**See**: [validation.md](./validation.md) - Validation order and patterns

---

### Issue: "Should I use an abbreviation?"

**Decision Rule**: Only if AWS uses it in their documentation

**Check**: [Approved Abbreviations](#approved-abbreviations) table above

**If using**: Always provide full name in JSDoc

---

### Issue: "Should this feature have an `enabled` flag?"

**Answer**: NO (usually)

**Rule**: Presence = enabled

**Exception**: Only if you need explicit override of inherited state

---

## References

- **Validation Patterns**: [validation.md](./validation.md)
- **Interface Design**: [L2/interface.md](../L2/interface.md)
- **Canonical Types**: [types.md](./types.md)
- **Anti-Patterns**: [anti-patterns.md](./anti-patterns.md)

---

## Related Standards

- [types.md](./types.md) - Canonical shared types
- [validation.md](../testing/validation.md) - Validation patterns
- [L2/interface.md](../L2/interface.md) - Interface extension patterns
- [anti-patterns.md](./anti-patterns.md) - What NOT to do

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

