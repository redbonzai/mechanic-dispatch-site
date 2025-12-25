# L3 Composition Pattern

**The fractal pattern for building composable L3 design patterns**

---

## Overview

L3 constructs use a **fractal composition pattern** where multiple L2 constructs are composed into logical units, and those units are composed into services, and services are composed into categories.

**Key Insight**: The same pattern repeats at **every layer**.

---

## The Composition Hierarchy

### Four Layers of Composition

```
Layer 1: L2 Constructs (Foundation)
├── Individual AWS resource wrappers
├── Example: Route53HostedZone, Route53Profile, RamShare
└── Purpose: TypeScript-friendly AWS resource APIs

Layer 2: L3 Components (Logical Units)
├── Compose multiple L2 constructs
├── Example: Domain (HostedZone + Records + QueryLogs)
└── Purpose: Group related L2 constructs that always work together

Layer 3: L3 Services (Service Aggregates)
├── Compose multiple L3 components OR standalone services
├── Example: dns (Domain[] + Profile[]) OR core.ipam (standalone)
└── Purpose: Complete, deployable service configurations

Layer 4: L3 Categories (Service Categories)
├── Compose multiple L3 services
├── Example: network-services (dns + edge-service + core)
└── Purpose: Organize services by functional domain
```

### Two Service Organization Patterns

L3 supports **two distinct patterns** for organizing services, depending on your composition needs:

#### Pattern 1: Single-Service with Components
Used when a service aggregates multiple related components into one deployable unit.

**Example**: `dns` service aggregates Domain[] + Profile[]
```typescript
// Aggregate construction
new network.dns(this, 'DNS', {
  domains: [{...}],
  profiles: [{...}],
});

// Component construction
new network.dns.Domain(this, 'Domain', {...});
new network.dns.Profile(this, 'Profile', {...});
```

#### Pattern 2: Multi-Service Namespace
Used when multiple independent services share a logical namespace.

**Example**: `core` namespace contains ipam, transit, logging
```typescript
// Independent service construction
new network.core.ipam(this, 'IPAM', { config: {...} });
new network.core.transit(this, 'Transit', { config: {...} });
new network.core.logging(this, 'Logging', { config: {...} });
```

**Key Difference**:
- **Single-Service**: Components are parts of one service (aggregate construction)
- **Multi-Service**: Services are peers under a namespace (independent construction)

---

### Example: Service Composition

**Pattern 1: Single-Service (DNS)**
```typescript
// L2: Individual AWS resources
Route53HostedZone, Route53Profile, RamShare

// L3 Component: Composes L2 resources
Domain = Route53HostedZone + Route53Records + QueryLogging
Profile = Route53Profile + RamShare

// L3 Service: Composes L3 components
dns = Domain[] + Profile[]

// L3 Category: Exposes service
network-services.dns
```

**Pattern 2: Multi-Service Namespace (Core)**
```typescript
// L2: Individual AWS resources
IpamPool, TransitGateway, LogGroup

// L3 Services: Independent compositions
ipam = IpamPool + IpamScope + Allocations
transit = TransitGateway + Attachments + Routes
logging = LogGroup + Subscriptions

// L3 Namespace: Groups related services
core = { ipam, transit, logging }

// L3 Category: Exposes namespace
network-services.core.ipam
network-services.core.transit
```

---

## Core Pattern: Composition

### Basic Composition

```typescript
export class Domain extends Construct {
  public readonly hostedZone: route53.IHostedZone;
  public readonly records: route53.IRecordSet[];
  
  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);
    
    // Compose L2 constructs
    this.hostedZone = new route53.HostedZone(this, 'Zone', {
      zoneName: props.name,
    });
    
    this.records = (props.records || []).map((r, i) => 
      new route53.RecordSet(this, `Record${i}`, {
        zone: this.hostedZone,
        // ... configuration ...
      })
    );
  }
}
```

**Pattern**: Create L2 resources, wire them together, expose for flexibility.

---

### Service Aggregation

```typescript
export class Dns extends Construct {
  /** @internal */
  public readonly domains: Domain[];
  
  /** @internal */
  public readonly profiles: Profile[];
  
  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id);
    
    const { domains = [], profiles = [] } = props;
    
    // Compose L3 components
    this.domains = domains.map((p, i) => 
      new Domain(this, `Domain${i}`, p)
    );
    
    this.profiles = profiles.map((p, i) => 
      new Profile(this, `Profile${i}`, p)
    );
  }
}
```

**Pattern**: Aggregate components into service, mark properties `@internal`.

---

## The Fractal Structure

### Pattern Repeats at Every Level

```
Step 1: Child constructs implemented in sibling files
Step 2: Child exports aggregated in types.ts using export *
Step 3: Parent namespace funnels children up via export * from './types'
Step 4: Repeat at next layer up
```

### Directory Structure (Fractal)

**Pattern 1: Single-Service with Components**
```
network-services/                    ← Category
├── types.ts                          # Funnels services
├── index.ts                          # export * from './types'
│
└── dns/                              ← Single-Service
    ├── types.ts                      # Aggregates components
    ├── index.ts                      # export * from './types'
    ├── Domain.ts                     ← Component
    └── Profile.ts                    ← Component
```

**Pattern 2: Multi-Service Namespace**
```
network-services/                    ← Category
├── types.ts                          # Funnels services/namespaces
├── index.ts                          # export * from './types'
│
└── core/                             ← Multi-Service Namespace
    ├── types.ts                      # Funnels services
    ├── index.ts                      # export * from './types'
    ├── Ipam.ts                       ← Service (standalone)
    ├── Transit.ts                    ← Service (standalone)
    └── Logging.ts                    ← Service (standalone)
```

**Every level follows the same structure**.

---

## Export Cascading (export *)

### How Export * Works

```typescript
// Step 1: Domain.ts exports
export interface DomainProps { ... }
export interface DomainRecordProps { ... }
export class Domain extends Construct { ... }

// Step 2: dns/types.ts aggregates
export * from './Domain';   // Pulls in ALL Domain exports
export * from './Profile';  // Pulls in ALL Profile exports
export class Dns { ... }

// Step 3: dns/index.ts funnels
export * from './types';    // Everything from types.ts

// Step 4: network-services/types.ts exposes
export { Dns as dns } from './dns';  // Clean constructability
export * from './dns';                // Type access

// Step 5: network-services/index.ts funnels
export * from './types';    // Final export
```

---

### Benefits of export *

| Benefit | Description |
|---------|-------------|
| **Zero maintenance** | Add child export, auto-cascades |
| **Cannot forget** | All exports included automatically |
| **Type safety** | TypeScript catches conflicts |
| **JSII compatible** | All referenced types exported |

---

## The Two-Export Pattern

For **service funneling** at category level, use TWO exports:

```typescript
// network-services/types.ts

// Export #1: Aggregate class as lowercase
export { Dns as dns } from './dns';

// Export #2: All types via export *
export * from './dns';
```

### Why Two Exports?

```typescript
// With two exports:
new network.dns(this, 'DNS', {...});    // ✅ Clean (no redundancy)
network.Domain                           // ✅ Type access
network.DomainProps                      // ✅ Type access

// With only export * as dns:
new network.dns.Dns(this, 'DNS', {...}); // ❌ Redundant .dns.Dns
```

---

## Namespace-Based Organization

### Pattern 1: Single-Service Direct Construction

When a service aggregates multiple components:

```typescript
// Aggregate construction
new network.dns(this, 'DNS', {
  domains: [{ name: 'example.com' }],
  profiles: [{ name: 'dns-profile' }],
});

// Component construction
new network.dns.Domain(this, 'Domain', {
  name: 'example.com',
});

new network.dns.Profile(this, 'Profile', {
  name: 'dns-profile',
});
```

#### Implementation

```typescript
// network-services/types.ts
export { Dns as dns } from './dns';   // Makes network.dns constructable
export * from './dns';                 // Makes network.Domain available
```

**Result**:
- `network.dns` - Construct (lowercase = aggregate class)
- `network.Domain` - Type (from export *)
- `network.dns.Domain` - Construct (nested access)

---

### Pattern 2: Multi-Service Namespace Construction

When a namespace contains multiple independent services:

```typescript
// Each service constructed independently
new network.core.ipam(this, 'IPAM', {
  config: {...},
});

new network.core.transit(this, 'Transit', {
  config: {...},
});

new network.core.logging(this, 'Logging', {
  config: {...},
});
```

#### Implementation

```typescript
// core/types.ts - Funnel each service as lowercase
export { Ipam as ipam } from './Ipam';
export * from './Ipam';

export { Transit as transit } from './Transit';
export * from './Transit';

export { Logging as logging } from './Logging';
export * from './Logging';

// network-services/types.ts - Create namespace
export * as core from './core';      // Creates network.core namespace
export * from './core';                // Exposes all types
```

**Result**:
- `network.core.ipam` - Construct (service under namespace)
- `network.core.transit` - Construct (service under namespace)
- `network.IpamProps` - Type (from export *)

**Why These Patterns?**

Both avoid redundancy in consumer code:

```typescript
// ❌ BAD - Redundant with 'export * as dns'
new network.dns.Dns(this, 'DNS', {...});

// ✅ GOOD - Single-service pattern
new network.dns(this, 'DNS', {...});

// ✅ GOOD - Multi-service pattern
new network.core.ipam(this, 'IPAM', {...});
```

---

## JSII Constraints

### JSII Requirement: Export All Referenced Types

```typescript
// ❌ JSII ERROR
export interface DomainProps {
  readonly records?: DomainRecordProps[];  // References DomainRecordProps
}
// Missing: export of DomainRecordProps

// ✅ JSII HAPPY
export * from './Domain';  // Exports DomainProps AND DomainRecordProps
```

**Solution**: Use `export *` to automatically export everything.

---

### Avoiding Mapped Types

JSII does not support `Omit<>`, `Pick<>`, `Partial<>`:

```typescript
// ❌ JSII ERROR
export interface DomainProps extends Omit<Route53HostedZoneProps, 'zoneName'> {
  readonly name: string;
}

// ✅ JSII HAPPY
export interface DomainProps {
  readonly name: string;
  readonly comment?: string;
  // ... explicit properties
}
```

---

## Flexible Input Types

### Accept Primitives and Complex Types

```typescript
export interface DomainRecordProps {
  readonly type: 'A' | 'AAAA' | 'CNAME';  // String literal (no enum)
  readonly name: string;
  readonly values: string[];
  readonly ttl?: number | Duration;        // Accept both
}

// In constructor: convert primitives
const ttl = typeof props.ttl === 'number'
  ? Duration.seconds(props.ttl)
  : props.ttl || Duration.seconds(300);
```

---

### Benefits

| Benefit | Description |
|---------|-------------|
| **JSON-friendly** | Plain objects work from configs |
| **TypeScript-friendly** | Duration objects work in TS |
| **No conversion needed** | Users choose format |

---

## Property Exposure

### Expose for Flexibility

```typescript
export class Domain extends Construct {
  /**
   * The Route53 hosted zone.
   * 
   * @remarks
   * Exposed for advanced use cases (custom records, grants).
   */
  public readonly hostedZone: route53.IHostedZone;
  
  /**
   * The created DNS records.
   */
  public readonly records: route53.IRecordSet[];
  
  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);
    
    this.hostedZone = new route53.HostedZone(/* ... */);
    this.records = /* ... */;
  }
}
```

---

### Use @internal for Implementation Details

```typescript
export class Dns extends Construct {
  /**
   * The created domains.
   * @internal
   */
  public readonly domains: Domain[];
  
  /**
   * The created profiles.
   * @internal
   */
  public readonly profiles: Profile[];
}
```

**Why**: Hides from public API docs, but still accessible for debugging.

---

## Adding New Components

### To Existing Single-Service

**Step 1**: Create component file

```bash
touch dns/Fish.ts
```

**Step 2**: Implement component

```typescript
// dns/Fish.ts
export interface FishProps {
  readonly name: string;
}

export class Fish extends Construct {
  constructor(scope: Construct, id: string, props: FishProps) {
    super(scope, id);
    // Compose L2 constructs...
  }
}
```

**Step 3**: Export from types.ts (ONE line)

```typescript
// dns/types.ts
export * from './Domain';
export * from './Profile';
export * from './Fish';      // ← ADD THIS
```

**Done!** Now accessible as `network.dns.Fish`.

---

### Adding New Single-Service

**Step 1**: Create service directory

```bash
mkdir -p network-services/monitoring
```

**Step 2**: Create structure

```
network-services/monitoring/
├── types.ts        # Aggregate + service construct
├── index.ts        # export * from './types'
├── Dashboard.ts    # Component
└── Alarm.ts        # Component
```

**Step 3**: Funnel from category (TWO lines)

```typescript
// network-services/types.ts
export { Monitoring as monitoring } from './monitoring';  // ← ADD
export * from './monitoring';                              // ← ADD
```

**Done!** Now accessible as `network.monitoring(...)`.

---

### Adding Service to Multi-Service Namespace

**Step 1**: Create service file

```bash
touch core/Transit.ts
```

**Step 2**: Implement service

```typescript
// core/Transit.ts
export interface TransitProps {
  readonly config: TransitConfig;
  readonly description?: string;
}

export class Transit extends Construct {
  constructor(scope: Construct, id: string, props: TransitProps) {
    super(scope, id);
    // Compose L2 constructs...
  }
}
```

**Step 3**: Export from namespace types.ts (TWO lines)

```typescript
// core/types.ts
export { Ipam as ipam } from './Ipam';
export * from './Ipam';

export { Transit as transit } from './Transit';  // ← ADD
export * from './Transit';                        // ← ADD
```

**Done!** Now accessible as `network.core.transit(...)`.

**Key Points**:
- Each service is a standalone file (Ipam.ts, Transit.ts)
- Each exports its own Props interface and Class
- types.ts funnels each as lowercase
- No aggregate construct needed - services are independent

---

## Complete Example: DNS Service

### Component: Domain.ts

```typescript
export interface DomainProps {
  readonly name: string;
  readonly private?: boolean;
  readonly records?: DomainRecordProps[];
}

export interface DomainRecordProps {
  readonly type: 'A' | 'AAAA' | 'CNAME';
  readonly name: string;
  readonly values: string[];
  readonly ttl?: number | Duration;
}

export class Domain extends Construct {
  public readonly hostedZone: route53.IHostedZone;
  public readonly records: route53.IRecordSet[];
  
  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);
    
    this.hostedZone = new route53.HostedZone(this, 'Zone', {
      zoneName: props.name,
    });
    
    this.records = (props.records || []).map((r, i) => {
      const ttl = typeof r.ttl === 'number'
        ? Duration.seconds(r.ttl)
        : r.ttl || Duration.seconds(300);
      
      return new route53.RecordSet(this, `Record${i}`, {
        zone: this.hostedZone,
        recordType: route53.RecordType[r.type],
        recordName: r.name,
        target: route53.RecordTarget.fromValues(...r.values),
        ttl,
      });
    });
  }
}
```

---

### Service: dns/types.ts

```typescript
// Aggregate component exports
export * from './Domain';
export * from './Profile';

// Service aggregate
import { Construct } from 'constructs';
import type { DomainProps } from './Domain';
import type { ProfileProps } from './Profile';
import { Domain } from './Domain';
import { Profile } from './Profile';

export interface DnsProps {
  readonly domains?: DomainProps[];
  readonly profiles?: ProfileProps[];
}

export class Dns extends Construct {
  /** @internal */
  public readonly domains: Domain[];
  
  /** @internal */
  public readonly profiles: Profile[];
  
  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id);
    
    const { domains = [], profiles = [] } = props;
    
    this.domains = domains.map((p, i) => new Domain(this, `Domain${i}`, p));
    this.profiles = profiles.map((p, i) => new Profile(this, `Profile${i}`, p));
  }
}
```

---

### Category: network-services/types.ts

```typescript
// Funnel services using two-export pattern
export { Dns as dns } from './dns';
export * from './dns';

export { EdgeService as edgeService } from './edge-service';
export * from './edge-service';

export { CoreService as coreService } from './core-service';
export * from './core-service';
```

---

### Consumer Usage

```typescript
import { network } from '@bah-te/cdk-core-constructs/design-patterns';

// Pattern 1: Single-Service - Aggregate construction
new network.dns(this, 'DNS', {
  domains: [
    { name: 'example.com', records: [{ type: 'A', name: 'www', values: ['10.0.1.5'] }] },
  ],
  profiles: [
    { name: 'dns-profile' },
  ],
});

// Pattern 1: Single-Service - Component construction
new network.dns.Domain(this, 'Domain', { name: 'example.com' });
new network.dns.Profile(this, 'Profile', { name: 'dns-profile' });

// Pattern 2: Multi-Service - Independent service construction
new network.core.ipam(this, 'IPAM', { config: {...} });
new network.core.transit(this, 'Transit', { config: {...} });
new network.core.logging(this, 'Logging', { config: {...} });

// Type access (both patterns)
const domainProps: network.DomainProps = { name: 'example.com' };
const ipamProps: network.IpamProps = { config: {...} };
```

---

## Anti-Patterns

### ❌ DON'T: Export Directly from Index

```typescript
// dns/index.ts - WRONG
export { Domain } from './Domain';
export { Profile } from './Profile';
```

**Why**: Bypasses the types.ts control layer.

**Correct**:
```typescript
// dns/index.ts - CORRECT
export * from './types';
```

---

### ❌ DON'T: Use export * as for Single-Service Aggregates

```typescript
// network-services/types.ts - WRONG for single-service
export * as dns from './dns';

// Results in redundant syntax:
new network.dns.Dns(...);  // ❌ Redundant
```

**Correct for Single-Service**:
```typescript
// network-services/types.ts - CORRECT
export { Dns as dns } from './dns';
export * from './dns';

// Results in clean syntax:
new network.dns(...);      // ✅ Clean
```

**Note**: `export * as` IS correct for multi-service namespaces:
```typescript
// CORRECT for multi-service namespace
export * as core from './core';  // Creates namespace
export * from './core';           // Exposes types

// Results in:
new network.core.ipam(...);  // ✅ Correct for namespace
```

---

### ❌ DON'T: Manual Cherry-Picking

```typescript
// WRONG - Manual exports (maintenance burden)
export { Dns as dns, Domain, Profile, type DnsProps } from './dns';
```

**Correct**:
```typescript
// CORRECT - Automatic cascading
export { Dns as dns } from './dns';
export * from './dns';
```

---

## Checklist for Composition

When implementing composition pattern:

### Structure
- [ ] Follows fractal pattern (same at every level)
- [ ] types.ts aggregates children with `export *`
- [ ] index.ts funnels with `export * from './types'`
- [ ] Chosen appropriate pattern (Single-Service or Multi-Service)

### For Single-Service Pattern
- [ ] Components extend `Construct` base class
- [ ] Components compose L2 constructs
- [ ] Service aggregates components
- [ ] Service props accept component arrays
- [ ] Service properties marked `@internal`
- [ ] Category uses two-export pattern: `export { Class as lowercase }` + `export *`

### For Multi-Service Namespace Pattern
- [ ] Each service is standalone (extends `Construct`)
- [ ] Each service composes L2 constructs
- [ ] Services are independent (not aggregated)
- [ ] Namespace types.ts funnels: `export { Service as lowercase }` + `export *`
- [ ] Category uses `export * as namespace` + `export *`

### Exports (Both Patterns)
- [ ] Uses `export *` for cascading
- [ ] No manual cherry-picking
- [ ] JSII-compatible (all types exported)

---

## Benefits of This Pattern

| Benefit | Description |
|---------|-------------|
| **Predictable** | Same pattern at every level |
| **Two clear patterns** | Single-service and multi-service for different needs |
| **Zero maintenance** | `export *` handles propagation |
| **Type-safe** | TypeScript validates entire graph |
| **JSII compatible** | Exports cascade properly |
| **Discoverable** | Autocomplete works at every level |
| **Flexible** | Aggregate, component, or independent construction |
| **Scalable** | Add services/components with minimal changes |

---

## Approval Gates

Human approval is required before:
- Creating new L3 category
- Changing export pattern
- Modifying namespace structure
- Breaking composition hierarchy

---

## See Also

- **L3 Structure**: [structure.md](./structure.md) - Detailed file organization
- **L3 Constructs**: [constructs.md](./constructs.md) - L3 construct patterns
- **L3 Interface**: [interface.md](./interface.md) - Interface design
- **L2 Inheritance**: [../L2/inheritance.md](../L2/inheritance.md) - Contrast with L2 pattern

---

## References

- **Source Material**:
  - `docs/standards/to-merge/L3-COMPOSITION-PATTERN.md`
  - `docs/standards/construct-layering.md` (L3 sections)

