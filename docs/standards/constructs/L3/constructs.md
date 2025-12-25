# L3 Construct Design Standard

**Applies to**: L3 composition patterns (src/constructs/design-patterns/**)

---

## Overview

L3 constructs are **composition patterns** that combine multiple L2 constructs into reusable design patterns.

**Key Pattern**: **Composition over inheritance** (multiple AWS resources)

---

## Core Design Pattern: Composition

### Best Practice: Extend Construct Base Class

```typescript
// ✅ CORRECT - Composition pattern for L3
export class SecureWebsite extends Construct {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;
  public readonly certificate: acm.ICertificate;
  
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    // Compose multiple L2 constructs
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

// ❌ WRONG - Inheritance for L3 (only use for single resource)
export class SecureWebsite extends s3.Bucket {
  // Can't inherit from multiple classes!
}
```

---

### Why Composition for L3?

| Reason | Description |
|--------|-------------|
| **Multiple resources** | Can't inherit from multiple classes |
| **Encapsulation** | Hide implementation details |
| **Flexibility** | Compose any L2 constructs |
| **Opinionated patterns** | Enforce design decisions |
| **Clear intent** | Shows aggregation relationship |

---

## L2 vs L3 Pattern Decision

| Question | L2 (Inheritance) | L3 (Composition) |
|----------|------------------|------------------|
| How many AWS resources? | Single | Multiple |
| Wrapping or aggregating? | Wrapping | Aggregating |
| Should it be drop-in for upstream? | Yes | No |
| Need to hide implementation? | No | Yes |
| Opinionated pattern? | Minimal | Moderate |

**Rule**: If wrapping **one** AWS resource → L2 (inheritance). If composing **multiple** → L3 (composition).

---

## Composition Structure

### Basic Composition Pattern

```typescript
export class SecureWebsite extends Construct {
  // Expose composed resources
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;
  
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    // Step 1: Create resources in dependency order
    this.bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    
    // Step 2: Wire resources together
    this.distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),  // References bucket
      },
    });
    
    // Step 3: Grant permissions (if needed)
    this.bucket.grantRead(/* ... */);
  }
}
```

---

### Composition Steps

| Step | Action | Example |
|------|--------|---------|
| 1 | Create resources in dependency order | Bucket first, CloudFront second |
| 2 | Wire resources together | CloudFront origin → Bucket |
| 3 | Configure permissions | Grant CloudFront read access to bucket |
| 4 | Expose composed resources | `public readonly bucket`, `distribution` |

---

## Property Exposure Strategy

### Expose Composed Resources

**Best Practice**: Expose composed resources for flexibility.

```typescript
export class SecureWebsite extends Construct {
  /**
   * The S3 bucket hosting the website content.
   * 
   * @remarks
   * Exposed for advanced use cases like custom bucket policies.
   */
  public readonly bucket: s3.IBucket;
  
  /**
   * The CloudFront distribution.
   * 
   * @remarks
   * Exposed for advanced use cases like custom behaviors.
   */
  public readonly distribution: cloudfront.IDistribution;
  
  /**
   * The ACM certificate for HTTPS.
   */
  public readonly certificate: acm.ICertificate;
  
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    this.bucket = new s3.Bucket(/* ... */);
    this.certificate = new acm.Certificate(/* ... */);
    this.distribution = new cloudfront.Distribution(/* ... */);
  }
}
```

---

### Property Exposure Guidelines

**DO expose**:
- ✅ Core composed resources (bucket, distribution, certificate)
- ✅ Resources consumers might need for grants/references
- ✅ Resources for advanced customization

**Use readonly**:
- ✅ All public properties should be `readonly`

**Mark @internal** for implementation details:
- ✅ Resources that are internal wiring only

```typescript
export class Dns extends Construct {
  /** @internal */
  public readonly domains: Domain[];  // Implementation detail
  
  /** @internal */
  public readonly profiles: Profile[];  // Implementation detail
}
```

---

## Interface-First Design

**Core Principle**: Design the interface **before** implementation.

### Step 1: Define Props Interface

```typescript
/**
 * Properties for SecureWebsite.
 */
export interface SecureWebsiteProps {
  /**
   * The domain name for the website.
   * 
   * @example 'www.example.com'
   */
  readonly domainName: string;
  
  /**
   * Optional custom S3 bucket name.
   * 
   * @default - Auto-generated
   */
  readonly bucketName?: string;
  
  /**
   * Enable CloudFront access logging.
   * 
   * @default false
   */
  readonly enableLogging?: boolean;
}
```

---

### Step 2: Implement Construct

```typescript
export class SecureWebsite extends Construct {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;
  
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    
    this.distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
      },
      domainNames: [props.domainName],
      enableLogging: props.enableLogging,
    });
  }
}
```

---

## Flexible Input Types

### Accept Primitives and Complex Types

L3 interfaces should accept both primitives (for JSON configs) and complex types (for TypeScript):

```typescript
export interface DomainProps {
  readonly name: string;
  
  /**
   * TTL in seconds (number) or Duration object.
   * 
   * @default 300
   */
  readonly ttl?: number | Duration;
  
  /**
   * Record type.
   * String literal union (no enum import needed).
   */
  readonly recordType?: 'A' | 'AAAA' | 'CNAME' | 'MX';
}

// In constructor: convert primitives to complex types
constructor(scope: Construct, id: string, props: DomainProps) {
  super(scope, id);
  
  const ttl = typeof props.ttl === 'number'
    ? Duration.seconds(props.ttl)
    : props.ttl || Duration.seconds(300);
  
  // Use converted value...
}
```

---

### Benefits of Flexible Inputs

| Benefit | Description |
|---------|-------------|
| **JSON-friendly** | Plain objects work from JSON configs |
| **TypeScript-friendly** | Complex types work in TS code |
| **No conversion needed** | Users don't need to transform inputs |
| **Better DX** | Choose the right input format for context |

---

## Validation Guidelines

### Validate Before Resource Creation

```typescript
constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
  super(scope, id);
  
  // Validation first
  validateProps(props);
  
  // Then create resources
  this.bucket = new s3.Bucket(/* ... */);
  this.distribution = new cloudfront.Distribution(/* ... */);
}

function validateProps(props: SecureWebsiteProps): void {
  if (!props.domainName) {
    throw new Error('domainName is required');
  }
  
  if (props.domainName.includes('*')) {
    throw new Error('Wildcard domains are not supported');
  }
}
```

---

### Validation Rules

| Rule | Reason |
|------|--------|
| **Fail-closed** | Reject invalid configurations |
| **Early validation** | Before resource creation |
| **Clear errors** | Descriptive messages with guidance |
| **Type safety** | Use TypeScript to prevent invalid states |

---

## Opinionated Defaults

L3 constructs should be **moderately opinionated** with sensible defaults:

```typescript
export class SecureWebsite extends Construct {
  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    // Opinionated security defaults
    this.bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,  // Always encrypted
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,  // Never public
      versioned: true,  // Data protection
      removalPolicy: RemovalPolicy.RETAIN,  // Safe default
    });
    
    // Opinionated CloudFront defaults
    this.distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,  // Force HTTPS
      },
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,  // Modern TLS
      enableLogging: true,  // Audit trail
    });
  }
}
```

---

### Default Selection for L3

| Category | Guideline |
|----------|-----------|
| **Security** | Secure by default |
| **Convenience** | Common use cases work out-of-box |
| **Best practices** | Follow AWS recommendations |
| **Flexibility** | Allow override when needed |

---

## Namespace Organization

L3 constructs are organized into **namespaces** for discoverability:

### Service Namespace Pattern

```
network-services/
├── dns/
│   ├── Domain.ts    ← Component
│   └── Profile.ts   ← Component
└── edge/
    ├── LoadBalancer.ts
    └── CloudFront.ts
```

### Consumer View

```typescript
import { network } from '@bah-te/cdk-core-constructs/design-patterns';

// Service aggregate
new network.dns(this, 'DNS', {
  domains: [{ name: 'example.com' }],
});

// Individual component
new network.dns.Domain(this, 'Domain', {
  name: 'example.com',
});
```

**See**: [structure.md](./structure.md) for namespace organization details

---

## Documentation Standards

### TSDoc with Examples

```typescript
/**
 * Secure static website hosted on S3 with CloudFront CDN.
 * 
 * Features:
 * - S3 bucket with encryption and public access blocked
 * - CloudFront distribution with HTTPS enforcement
 * - ACM certificate with automatic DNS validation
 * 
 * @example Basic usage
 * new SecureWebsite(this, 'Website', {
 *   domainName: 'www.example.com',
 * });
 * 
 * @example With custom bucket
 * new SecureWebsite(this, 'Website', {
 *   domainName: 'www.example.com',
 *   bucketName: 'my-website-bucket',
 *   enableLogging: true,
 * });
 */
export class SecureWebsite extends Construct {
  // ...
}
```

---

## Complete Example

### Domain Component (L3)

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
   * @default false
   */
  readonly private?: boolean;
  
  /**
   * DNS records to create.
   * 
   * @default []
   */
  readonly records?: DomainRecordProps[];
  
  /**
   * Enable query logging.
   * 
   * @default false
   */
  readonly enableQueryLogging?: boolean;
}

export interface DomainRecordProps {
  readonly type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  readonly name: string;
  readonly values: string[];
  readonly ttl?: number | Duration;
}

/**
 * Domain component (L3).
 * 
 * Composes:
 * - Route53 HostedZone
 * - Route53 Records
 * - CloudWatch Log Group (if query logging enabled)
 * 
 * @example
 * new network.dns.Domain(this, 'Domain', {
 *   name: 'example.com',
 *   private: true,
 *   records: [
 *     { type: 'A', name: 'www', values: ['10.0.1.5'] },
 *   ],
 *   enableQueryLogging: true,
 * });
 */
export class Domain extends Construct {
  public readonly hostedZone: route53.IHostedZone;
  public readonly records: route53.IRecordSet[];
  public readonly logGroup?: logs.ILogGroup;
  
  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);
    
    // Validation
    if (!props.name) {
      throw new Error('Domain name is required');
    }
    
    // Create hosted zone
    this.hostedZone = new route53.HostedZone(this, 'Zone', {
      zoneName: props.name,
    });
    
    // Create records
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
    
    // Optional query logging
    if (props.enableQueryLogging) {
      this.logGroup = new logs.LogGroup(this, 'LogGroup', {
        logGroupName: `/aws/route53/${props.name}`,
        retention: logs.RetentionDays.ONE_MONTH,
      });
      
      new route53.QueryLoggingConfig(this, 'QueryLogging', {
        hostedZone: this.hostedZone,
        logGroup: this.logGroup,
      });
    }
  }
}
```

---

## Checklist for New L3 Constructs

### Design
- [ ] Extends `Construct` base class
- [ ] Composes multiple L2 constructs
- [ ] Interface-first design (props defined first)
- [ ] Flexible input types (primitives + complex)
- [ ] Opinionated defaults

### Implementation
- [ ] Validation before resource creation
- [ ] Resources created in dependency order
- [ ] Resources wired together correctly
- [ ] Permissions granted where needed

### Properties
- [ ] Composed resources exposed
- [ ] All properties `readonly`
- [ ] Implementation details marked `@internal`
- [ ] Properties documented with TSDoc

### Organization
- [ ] Organized into service namespace
- [ ] Follows fractal composition pattern
- [ ] Uses `export *` for type cascading

---

## Approval Gates

Human approval is required before:
- Creating new L3 pattern (impacts architecture)
- Changing default behavior (impacts all users)
- Modifying composition structure
- Breaking interface changes

---

## See Also

- **L3 Composition**: [composition.md](./composition.md) - Detailed composition guidance
- **L3 Structure**: [structure.md](./structure.md) - Module organization
- **L3 Interface**: [interface.md](./interface.md) - Interface design
- **L2 Inheritance**: [../L2/inheritance.md](../L2/inheritance.md) - When to use inheritance instead

---

## References

- **Source Material**:
  - `docs/standards/to-merge/L3-COMPOSITION-PATTERN.md`
  - `docs/standards/to-merge/CONSTRUCT-DESIGN.md` (L3 sections)
  - `docs/standards/construct-layering.md` (L3 sections)

