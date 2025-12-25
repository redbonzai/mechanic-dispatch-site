# L3 Module Structure Standard

**Applies to**: L3 composition patterns (src/constructs/design-patterns/**)

---

## Overview

L3 constructs follow a **fractal composition pattern** where the same structure repeats at every level: categories contain services, services contain components.

---

## Directory Hierarchy

### Complete Structure

```
src/constructs/design-patterns/
└── {category}/                    ← L3 CATEGORY (e.g., network-services)
    ├── types.ts                   # Funnels services
    ├── index.ts                   # Barrel export
    │
    └── {service}/                 ← L3 SERVICE (e.g., dns)
        ├── types.ts               # Aggregates components + service construct
        ├── index.ts               # Barrel export
        ├── {Component}.ts         ← L3 COMPONENT (e.g., Domain.ts)
        └── {Component}.ts         ← L3 COMPONENT (e.g., Profile.ts)
```

---

### Example: network-services

```
design-patterns/
└── network-services/                    ← CATEGORY
    ├── types.ts                          # Funnels: dns, edge, core services
    ├── index.ts                          # export * from './types'
    │
    ├── dns/                              ← SERVICE
    │   ├── types.ts                      # Aggregates Domain + Profile, defines Dns
    │   ├── index.ts                      # export * from './types'
    │   ├── Domain.ts                     ← COMPONENT (composes HostedZone + Records)
    │   └── Profile.ts                    ← COMPONENT (composes Route53Profile + RamShare)
    │
    ├── edge-service/                     ← SERVICE
    │   ├── types.ts
    │   ├── index.ts
    │   ├── LoadBalancer.ts               ← COMPONENT
    │   └── CloudFront.ts                 ← COMPONENT
    │
    └── core-service/                     ← SERVICE
        ├── types.ts
        ├── index.ts
        ├── VPC.ts                        ← COMPONENT
        └── Transit.ts                    ← COMPONENT
```

---

## File Responsibilities

### types.ts - The Aggregator

**Purpose**: Aggregate child exports and optionally define parent aggregate construct.

**At Component Level** (e.g., `dns/types.ts`):
```typescript
// Aggregate all component exports
export * from './Domain';
export * from './Profile';

// Define service-level aggregate (optional)
import { Construct } from 'constructs';
import type { DomainProps } from './Domain';
import type { ProfileProps } from './Profile';
import { Domain } from './Domain';
import { Profile } from './Profile';

/**
 * DNS service configuration.
 */
export interface DnsProps {
  readonly domains?: DomainProps[];
  readonly profiles?: ProfileProps[];
}

/**
 * DNS service aggregate construct.
 * 
 * @example
 * new network.dns(this, 'DNS', {
 *   domains: [{ name: 'example.com' }],
 *   profiles: [{ name: 'dns-profile' }],
 * });
 */
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

**At Category Level** (e.g., `network-services/types.ts`):
```typescript
// Funnel services using two-export pattern
export { Dns as dns } from './dns';      // Makes network.dns constructable
export * from './dns';                    // Exposes all types

export { EdgeService as edgeService } from './edge-service';
export * from './edge-service';

export { CoreService as coreService } from './core-service';
export * from './core-service';
```

---

### index.ts - The Funnel

**Purpose**: Simple re-export. Never contains logic.

```typescript
// ALWAYS just this:
export * from './types';
```

**Rule**: Every `index.ts` at every level has exactly one line.

---

### {Component}.ts - The Implementation

**Purpose**: Implement a specific component that composes L2 constructs.

```typescript
// Domain.ts
import { Construct } from 'constructs';
import {
  aws_route53 as route53,
  aws_logs as logs,
} from 'aws-cdk-lib';

/**
 * Properties for Domain component.
 */
export interface DomainProps {
  readonly name: string;
  readonly private?: boolean;
  readonly records?: DomainRecordProps[];
}

export interface DomainRecordProps {
  readonly type: 'A' | 'AAAA' | 'CNAME';
  readonly name: string;
  readonly values: string[];
  readonly ttl?: number;
}

/**
 * Domain component (L3).
 * 
 * Composes:
 * - Route53 HostedZone (L2)
 * - Route53 Records (L2)
 * - Query Logging (L2)
 * 
 * @example
 * new network.dns.Domain(this, 'Domain', {
 *   name: 'example.com',
 *   private: true,
 *   records: [
 *     { type: 'A', name: 'www', values: ['10.0.1.5'], ttl: 300 },
 *   ],
 * });
 */
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
        recordType: route53.RecordType[r.type],
        recordName: r.name,
        target: route53.RecordTarget.fromValues(...r.values),
        ttl: r.ttl ? Duration.seconds(r.ttl) : undefined,
      })
    );
  }
}
```

---

## The Fractal Pattern

**Key Insight**: The same composition pattern applies at **every layer**.

### Pattern at Every Level

```
<directory>/
├── types.ts       # The AGGREGATOR - pulls in everything from children
├── index.ts       # The FUNNEL - exports everything from types.ts
└── <child>/       # Repeat the pattern recursively
```

---

### Export Cascade (export *)

The composition architecture relies on **cascading exports** using `export *`:

```
Step 1: Domain.ts exports its API
├── export interface DomainProps { ... }
├── export interface DomainRecordProps { ... }
└── export class Domain extends Construct { ... }

Step 2: dns/types.ts aggregates
├── export * from './Domain'      ← Pulls in all Domain exports
├── export * from './Profile'     ← Pulls in all Profile exports
└── export class Dns { ... }      ← Defines service aggregate

Step 3: dns/index.ts funnels
└── export * from './types'        ← Everything from types.ts

Step 4: network-services/types.ts exposes
├── export { Dns as dns } from './dns'   ← Makes network.dns constructable
└── export * from './dns'                 ← Also exports all types

Step 5: network-services/index.ts funnels
└── export * from './types'              ← network.dns + all types
```

**Result**:
- `network.dns(...)` - Construct entire service
- `network.dns.Domain(...)` - Construct component directly
- `network.DomainProps` - Type available for import

---

## The Two-Export Pattern

**For category-level service funneling**, use two export statements:

```typescript
// network-services/types.ts

// Export #1: Aggregate class as lowercase (clean constructability)
export { Dns as dns } from './dns';

// Export #2: All types (type access)
export * from './dns';
```

### Why Two Exports?

| Export | Purpose | Result |
|--------|---------|--------|
| `export { Dns as dns }` | Clean aggregate construction | `new network.dns(...)` ✅ |
| `export * from './dns'` | Direct type access | `network.Domain`, `network.DomainProps` ✅ |

**Without two exports** (using only `export * as dns`):
```typescript
// ❌ BAD - Forces redundant syntax
export * as dns from './dns';

// Results in:
new network.dns.Dns(...);  // Redundant .dns.Dns
```

---

## Namespace-Based Organization

L3 constructs are organized into **namespaces** for clean, discoverable APIs:

### Consumer View

```typescript
import { network } from '@bah-te/cdk-core-constructs/design-patterns';

// Service-level construction (aggregate)
new network.dns(this, 'DNS', {
  domains: [{ name: 'example.com' }],
});

// Component-level construction (individual)
new network.dns.Domain(this, 'Domain', {
  name: 'example.com',
});

// Type access
const props: network.DomainProps = { name: 'example.com' };
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Directories** | kebab-case | `network-services/`, `edge-service/` |
| **Component files** | PascalCase | `Domain.ts`, `LoadBalancer.ts` |
| **Type files** | lowercase | `types.ts` |
| **Index files** | lowercase | `index.ts` |

**Rule**: Component file name MUST match exported class name.

---

## Adding New Components

### To Existing Service

**Step 1**: Create component file

```bash
# Add new component to dns service
touch dns/Fish.ts
```

**Step 2**: Implement component (compose L2 constructs)

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

**Step 3**: Export from service types.ts

```typescript
// dns/types.ts - Add ONE line
export * from './Domain';
export * from './Profile';
export * from './Fish';      // ← ADD THIS
```

**Done!** The `export *` cascade automatically makes it available:
- `network.dns.Fish` - Component
- `network.FishProps` - Type

---

### Adding New Service

**Step 1**: Create service directory

```bash
mkdir -p network-services/monitoring
```

**Step 2**: Create service structure

```
network-services/monitoring/
├── types.ts        # Aggregate components + service construct
├── index.ts        # export * from './types'
├── Dashboard.ts    # Component
└── Alarm.ts        # Component
```

**Step 3**: Funnel from category

```typescript
// network-services/types.ts - Add TWO lines

// Existing services...
export { Dns as dns } from './dns';
export * from './dns';

// NEW service - same pattern
export { Monitoring as monitoring } from './monitoring';  // ← ADD
export * from './monitoring';                              // ← ADD
```

**Done!** Now accessible as `network.monitoring(...)`

---

## JSII Constraints

### Export Everything Referenced

JSII requires all referenced types to be exported:

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
}
```

**Solution**: Use `export *` to automatically export all types:

```typescript
// types.ts
export * from './Domain';  // Exports DomainProps AND DomainRecordProps
```

---

### Avoid Mapped Types

JSII does not support TypeScript mapped types (`Omit<>`, `Pick<>`, `Partial<>`):

```typescript
// ❌ JSII ERROR
export interface DomainProps extends Omit<Route53HostedZoneProps, 'zoneName'> {
  readonly name: string;
}

// ✅ JSII HAPPY - Flatten manually
export interface DomainProps {
  readonly name: string;
  readonly comment?: string;
  readonly queryLogsLogGroupArn?: string;
  // ... explicit properties
}
```

---

## Approval Gates

Human approval is required before:
- Creating new L3 category
- Changing namespace structure
- Modifying export patterns
- Restructuring service hierarchy

---

## See Also

- **L3 Composition**: [composition.md](./composition.md) - Detailed composition pattern
- **L3 Constructs**: [constructs.md](./constructs.md) - L3 construct patterns
- **L3 Interfaces**: [interface.md](./interface.md) - Interface design for composition
- **L2 Structure**: [../L2/structure.md](../L2/structure.md) - L2 module organization

---

## References

- **Source Material**:
  - `docs/standards/to-merge/L3-COMPOSITION-PATTERN.md`
  - `docs/standards/to-merge/MODULE-STRUCTURE.md`

