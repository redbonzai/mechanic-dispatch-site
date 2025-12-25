# L3 Layer Standards

**Entry Point**: Composition Patterns (L3) - Multi-resource design patterns

**Layer**: L3 - Composition Patterns  
**Pattern**: Composition (aggregates multiple L2 constructs)  
**Resources**: Multiple AWS resources working together

---

## Overview

L3 constructs are **composition patterns** that combine multiple L2 constructs into logical, reusable design patterns. L3 provides **opinionated patterns** for common multi-resource architectures.

---

## Quick Reference

| Aspect | L2 | L3 |
|--------|----|----|
| **Pattern** | Inheritance | **Composition** |
| **Resources** | Single AWS resource | **Multiple AWS resources** |
| **Opinion** | Minimal | **Moderate** (opinionated patterns) |
| **Flexibility** | High (extend upstream) | Moderate (opinionated) |
| **Example** | SecureVpc | NetworkServices (VPC + DNS + LB) |

---

## Decision Tree: Is This L3?

### Starting Point: How Many AWS Resources?

```text
What am I building?

├─ ONE AWS resource?
│  └─ L2 Construct Module (not L3!)
│     • Pattern: Inheritance
│     • See: ../L2/README.md
│     • Example: SecureVpc wraps ec2.Vpc
│
└─ MULTIPLE AWS resources?
   └─ L3 Composition Pattern ✅
      • READ: composition.md → constructs.md → interface.md → structure.md
      • Pattern: Composition (aggregates L2 constructs)
      • Location: src/constructs/design-patterns/{category}/
      • Files: types.ts, {Pattern}.ts, index.ts
      • Examples: NetworkServices, SecureWebsite, DataPipeline

   ⚠️ Are these resources HIGHLY opinionated (platform decisions)?
      → You might need L4 (future), use L3 for now
      → See: ../L4/README.md
```

---

## Core Pattern: Composition

L3 constructs **compose multiple L2 constructs** into higher-level patterns:

```typescript
// L3 - Composes multiple L2 constructs
export class SecureWebsite extends Construct {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;
  public readonly certificate: acm.ICertificate;
  
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    // Compose L2 constructs (3 AWS resources)
    this.bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    
    this.certificate = new acm.Certificate(this, 'Cert', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(),
    });
    
    this.distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
      },
      certificate: this.certificate,
      domainNames: [props.domainName],
    });
  }
}
```

**Key Points**:
- ✅ Composes 3 AWS resources (S3, ACM, CloudFront)
- ✅ Exposes composed resources via public readonly
- ✅ Opinionated (enforces S3 encryption, CloudFront, etc.)
- ✅ Minimal required props (just `domainName`)

---

## Standards Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[composition.md](./composition.md)** | Detailed composition patterns, funnel pattern | Creating any L3 pattern (READ FIRST) |
| **[constructs.md](./constructs.md)** | L3 construct patterns, best practices | Implementing L3 construct |
| **[interface.md](./interface.md)** | L3 interface design (minimal inputs) | Designing L3 props |
| **[structure.md](./structure.md)** | L3 module organization, fractal hierarchy | Organizing L3 modules |

---

## Workflow: Creating L3 Pattern

### Step-by-Step Process

```text
Step 1: Read Documentation (in order)
├─ composition.md → Composition pattern, funnel pattern
├─ constructs.md → L3 construct patterns
├─ interface.md → Minimal input interface design
└─ structure.md → Fractal module organization

Step 2: Design Interface
├─ Define {Pattern}Props in types.ts
├─ Minimal required inputs only
├─ Reuse canonical types (logging, tags, etc.)
└─ Design flexibility: expose composed resources

Step 3: Identify L2 Components
├─ List all AWS resources needed
├─ Identify existing L2 constructs to compose
└─ Create new L2 constructs if needed (see ../L2/)

Step 4: Create Files
├─ src/constructs/design-patterns/{category}/{pattern}/types.ts
├─ src/constructs/design-patterns/{category}/{pattern}/{Pattern}.ts
└─ src/constructs/design-patterns/{category}/{pattern}/index.ts

Step 5: Implement Composition
├─ Extend Construct (not specific resource type)
├─ Compose L2 constructs in constructor
├─ Wire resources together
├─ Expose composed resources via public readonly
└─ Apply funnel pattern for clean API surface

Step 6: Test
├─ Write unit tests (validate wiring)
├─ Write integration tests (validate composition)
└─ Write stack tests (validate AWS deployment)
```

---

## Layer Rules

### L3 Characteristics

✅ **MUST**:
- Compose multiple L2 constructs (2+ AWS resources)
- Stable interfaces (minimal required inputs)
- Expose composed resources for flexibility
- Use composition, not inheritance

❌ **MUST NOT**:
- Inherit from specific AWS resource types (use Construct base)
- Make platform-wide architectural decisions (that's L4)
- Create single AWS resource (that's L2)

---

### L3 Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Composition** | Aggregate multiple L2s | Required for all L3 |
| **Interface-First** | Minimal required inputs | Make patterns easy to use |
| **Funnel Pattern** | Clean API surface via exports | Namespace directly constructable |
| **Fractal Hierarchy** | Nested service organization | Organize complex patterns |

---

## Composition Hierarchy

L3 constructs follow a **fractal composition pattern**:

```text
L3 Category (network-services/)
├── Service (dns/)
│   ├── Component: Domain       # Composes: HostedZone + Records
│   └── Component: Profile      # Composes: Route53Profile + RamShare
│
├── Service (edge-service/)
│   ├── Component: LoadBalancer # Composes: ALB + TargetGroups + Listeners
│   └── Component: CloudFront   # Composes: Distribution + Origins + Behaviors
│
└── Service (storage/)
    └── Component: DataLake     # Composes: S3 + Glue + Athena
```

**See**: [composition.md](./composition.md) for detailed hierarchy explanation

---

## AI Agent Guidelines

### Decision Logic

**Question 1**: How many AWS resources am I creating?
- **ONE** → L2 (see `../L2/README.md`)
- **MULTIPLE** → L3 (continue)

**Question 2**: Is this highly opinionated (platform-wide decisions)?
- **YES** → Might be L4 (future), use L3 for now
- **NO** → Definitely L3

---

### Reading Order

**Always read in this order**:
1. `composition.md` - Core composition pattern (MOST IMPORTANT)
2. `constructs.md` - L3 construct patterns
3. `interface.md` - Interface design for L3
4. `structure.md` - Module organization

**Why this order?** Composition pattern is fundamental to everything in L3.

---

### Common Mistakes

#### Mistake 1: Using Inheritance Instead of Composition

```typescript
// ❌ BAD - Inheriting from specific resource type
export class NetworkServices extends ec2.Vpc {
  constructor(scope: Construct, id: string, props: NetworkServicesProps) {
    super(scope, id, { /* ... */ });
    
    // Can't easily compose other resources here
    // Locked into VPC as the base
  }
}

// ✅ GOOD - Composing multiple resources
export class NetworkServices extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly dns: route53.IHostedZone;
  public readonly loadBalancer: elbv2.IApplicationLoadBalancer;
  
  constructor(scope: Construct, id: string, props: NetworkServicesProps) {
    super(scope, id);
    
    // Compose L2 constructs
    this.vpc = new SecureVpc(this, 'Vpc', props.vpcConfig);
    this.dns = new HostedZone(this, 'Dns', props.dnsConfig);
    this.loadBalancer = new ApplicationLoadBalancer(this, 'Alb', {
      vpc: this.vpc,
      // ...
    });
  }
}
```

---

#### Mistake 2: Too Many Required Props

```typescript
// ❌ BAD - Too many required props (not minimal)
export interface NetworkServicesProps {
  readonly vpcCidr: string;                    // Required
  readonly vpcZones: number;                   // Required
  readonly dnsZoneName: string;                // Required
  readonly dnsQueryLogging: boolean;           // Required
  readonly albScheme: string;                  // Required
  readonly albListenerPort: number;            // Required
  readonly albHealthCheckPath: string;         // Required
  readonly albTargetType: string;              // Required
  // ... 10 more required props
}

// ✅ GOOD - Minimal required props
export interface NetworkServicesProps {
  readonly domainName: string;                 // Required (essential)
  
  // Optional with smart defaults
  readonly vpcConfig?: VpcConfig;
  readonly dnsConfig?: DnsConfig;
  readonly loadBalancerConfig?: LoadBalancerConfig;
}
```

---

#### Mistake 3: Not Exposing Composed Resources

```typescript
// ❌ BAD - Not exposing composed resources
export class NetworkServices extends Construct {
  private readonly vpc: ec2.IVpc;              // Private!
  private readonly dns: route53.IHostedZone;   // Private!
  
  constructor(scope: Construct, id: string, props: NetworkServicesProps) {
    super(scope, id);
    
    this.vpc = new SecureVpc(this, 'Vpc', { /* ... */ });
    this.dns = new HostedZone(this, 'Dns', { /* ... */ });
    
    // Users can't access composed resources!
  }
}

// ✅ GOOD - Exposing composed resources
export class NetworkServices extends Construct {
  public readonly vpc: ec2.IVpc;               // Public!
  public readonly dns: route53.IHostedZone;    // Public!
  
  constructor(scope: Construct, id: string, props: NetworkServicesProps) {
    super(scope, id);
    
    this.vpc = new SecureVpc(this, 'Vpc', { /* ... */ });
    this.dns = new HostedZone(this, 'Dns', { /* ... */ });
    
    // Users can access and extend composed resources
  }
}
```

---

## When to Use L3 vs L2 vs L4

### Use L2 When:

✅ Wrapping **single AWS resource**
✅ Need **maximum flexibility**
✅ Building **reusable primitives**

**Example**: SecureVpc, SecureBucket

**See**: [../L2/README.md](../L2/README.md)

---

### Use L3 When:

✅ Composing **multiple AWS resources** (2+)
✅ Implementing **design patterns**
✅ Need **moderate opinions**
✅ Building **reusable compositions**

**Example**: NetworkServices, SecureWebsite, DataPipeline

**You are here** ✅

---

### Use L4 When:

✅ Creating **complete solutions** (highly opinionated)
✅ Enforcing **platform-wide decisions**
✅ Need **batteries-included** architectures

**Status**: 🚧 Future (not yet implemented)

**For now**: Use L3

**See**: [../L4/README.md](../L4/README.md)

---

## Quick Start Example

### Example: SecureWebsite (S3 + CloudFront + ACM)

```typescript
// types.ts
export interface SecureWebsiteProps {
  readonly domainName: string;                   // Required (minimal)
  readonly indexDocument?: string;               // Optional (default: 'index.html')
  readonly errorDocument?: string;               // Optional (default: 'error.html')
  readonly certificateArn?: string;              // Optional (auto-create if missing)
}

// SecureWebsite.ts
export class SecureWebsite extends Construct {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;
  public readonly certificate: acm.ICertificate;
  
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    // Validate minimal required input
    if (!props.domainName) {
      throw new Error("SecureWebsite: 'domainName' is required.");
    }
    
    // Compose L2 constructs with smart defaults
    this.bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: props.indexDocument ?? 'index.html',
      websiteErrorDocument: props.errorDocument ?? 'error.html',
    });
    
    // Auto-create certificate if not provided
    this.certificate = props.certificateArn
      ? acm.Certificate.fromCertificateArn(this, 'Cert', props.certificateArn)
      : new acm.Certificate(this, 'Cert', {
          domainName: props.domainName,
          validation: acm.CertificateValidation.fromDns(),
        });
    
    // Wire resources together
    this.distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      certificate: this.certificate,
      domainNames: [props.domainName],
      defaultRootObject: props.indexDocument ?? 'index.html',
    });
  }
}

// index.ts
export * from './types';
export * from './SecureWebsite';
```

---

## Troubleshooting

### Issue: "Should this be L2 or L3?"

**Decision Rule**: Count AWS resources
- 1 resource = L2
- 2+ resources = L3

**Example**:
- VPC alone = L2
- VPC + DNS + Load Balancer = L3

---

### Issue: "How do I organize L3 modules?"

**Answer**: Use fractal hierarchy

```text
src/constructs/design-patterns/
└── {category}/          # network-services, storage, compute
    └── {service}/       # dns, edge-service, data-lake
        └── {component}/ # Domain, Profile, etc.
```

**See**: [structure.md](./structure.md)

---

### Issue: "What's the funnel pattern?"

**Answer**: Two-export pattern for clean API surface

```typescript
// types.ts
export { Dns as dns } from './Dns';    // Lowercase for namespace
export * from './Dns';                  // All types
```

Allows: `new networkServices.dns(...)` (directly constructable)

**See**: [composition.md](./composition.md) - Funnel Pattern section

---

### Issue: "How minimal should props be?"

**Answer**: Only require what's **essential**

- ✅ Domain name (can't default)
- ✅ Account ID (can't default)
- ❌ Port numbers (can default to 443)
- ❌ Health check paths (can default to '/')

**See**: [interface.md](./interface.md)

---

### Issue: "Should I expose composed resources?"

**Answer**: ✅ Yes, always use `public readonly`

Allows users to:
- Access composed resources
- Add additional configuration
- Extend your pattern

---

## Testing

L3 compositions require comprehensive testing:

1. **Unit tests** - Validate wiring logic
2. **Integration tests** - Test composition scenarios (MOST IMPORTANT)
3. **Stack tests** - Validate real AWS deployment

**See**: [../../testing/README.md](../../testing/README.md)

**Focus on**: Integration tests that validate cross-resource relationships

---

## Navigation

- **Up**: [constructs/](../) - All construct standards
- **Standards**: [../../](../../) - Main standards index
- **Related**:
  - [L2/](../L2/) - Primitives to compose
  - [L4/](../L4/) - Architectural solutions (future)
- **Cross-Layer**:
  - [common/](../../common/) - Common standards (all layers)
  - [testing/](../../testing/) - Testing standards

---

## See Also

- **Composition Pattern**: [composition.md](./composition.md) - Core L3 pattern (READ FIRST)
- **Construct Patterns**: [constructs.md](./constructs.md) - L3 best practices
- **Interface Design**: [interface.md](./interface.md) - Minimal input design
- **Module Structure**: [structure.md](./structure.md) - Fractal organization
- **Canonical Types**: [../../common/types.md](../../common/types.md) - Shared types
- **Testing**: [../../testing/integration.md](../../testing/integration.md) - L3 testing focus

---

## References

This README is the **entry point** for L3 standards. Read `composition.md` first for the core pattern.

**Repository Authority**: `CLAUDE.md` (root)
