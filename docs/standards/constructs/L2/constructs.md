# L2 Construct Design Standard

**Applies to**: CDK constructs in src/constructs/** that wrap single AWS resources

---

## Overview

L2 constructs are **platform primitives** that wrap individual AWS resources with:

- Enhanced APIs
- Secure defaults
- TypeScript-friendly interfaces
- Reusable patterns

**Key Pattern**: **Inheritance over composition** (for single AWS resource)

---

## Core Design Pattern: Inheritance

### Best Practice: Extend Upstream CDK Constructs

**For L2** (wrapping single AWS resource), extend rather than wrap:

```typescript
// ✅ GOOD - Inheritance (L2 pattern)
export class SecureBucket extends s3.Bucket {
  public readonly encryptionKey?: kms.IKey;
  
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    super(scope, id, {
      // Enhanced defaults
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      ...props,
    });
  }
}

// ❌ AVOID - Composition/Wrapping (use for L3, not L2)
export class SecureBucket extends Construct {
  public readonly s3Bucket: s3.Bucket; // Wrapper pattern
  
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id);
    this.s3Bucket = new s3.Bucket(this, 'Bucket', props);
  }
}
```

---

### Benefits of Inheritance (L2)

| Benefit | Description |
|---------|-------------|
| **Full compatibility** | Can be used anywhere the upstream construct is expected |
| **Automatic inheritance** | Inherits all methods and properties automatically |
| **Better TypeScript** | Full IntelliSense and type checking |
| **No proxying** | No need to proxy methods and properties |
| **Drop-in replacement** | Works as `s3.IBucket` interface |

---

### When to Use Composition Instead

Use composition (L3 pattern) when:

- ❌ Aggregating multiple AWS resources into higher-level construct
- ❌ The construct represents a pattern, not a single AWS resource
- ❌ Need to hide implementation details
- ❌ Creating L3 or L4 constructs

**See**: [L3/composition.md](../L3/composition.md) for composition patterns

---

## Interface Extension Pattern

### Best Practice: Extend Upstream Props Interfaces

```typescript
// ✅ GOOD - Extends upstream interface
export interface SecureBucketProps extends s3.BucketProps {
  readonly createCustomKey?: boolean;
  readonly keyDescription?: string;
}

// ❌ AVOID - Redefining properties
export interface SecureBucketProps {
  readonly bucketName?: string;  // Already in s3.BucketProps
  readonly versioned?: boolean;  // Already in s3.BucketProps
  readonly createCustomKey?: boolean;
}
```

---

### Benefits of Interface Extension

| Benefit | Description |
|---------|-------------|
| **Automatic compatibility** | All upstream properties available |
| **No duplication** | Don't maintain duplicate property definitions |
| **User flexibility** | Users can pass any valid upstream property |
| **Type safety** | TypeScript catches breaking changes in upstream |

---

## Secure Defaults Pattern

### Best Practice: Security-First Defaults

Provide secure, cost-effective defaults that users can override:

```typescript
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    super(scope, id, {
      // Security defaults first
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      
      // Operational defaults
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      
      // User props override defaults (spread last)
      ...props,
    });
  }
}
```

---

### Default Selection Guidelines

| Category | Guideline | Example |
|----------|-----------|---------|
| **Security** | Always secure by default, require explicit opt-out | `blockPublicAccess: BLOCK_ALL` |
| **Cost** | Default to AWS-managed options | `encryption: S3_MANAGED` (not CMK) |
| **Data Safety** | RETAIN by default for stateful resources | `removalPolicy: RETAIN` |
| **Compliance** | Meet enterprise security requirements by default | `enforceSSL: true` |

**Rule**: Defaults first, user props spread last (allows override)

---

## Service-Specific Security Defaults

### S3 Bucket

```typescript
{
  // Encryption: SSE-S3 by default (cost-effective)
  encryption: BucketEncryption.S3_MANAGED,
  
  // Public Access: Blocked by default
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  
  // SSL: Enforced
  enforceSSL: true,
  
  // Versioning: Enabled (data protection)
  versioned: true,
  
  // Lifecycle: Retain by default
  removalPolicy: RemovalPolicy.RETAIN,
  autoDeleteObjects: false,
}
```

---

### KMS Key

```typescript
{
  // Key Rotation: Enabled
  enableKeyRotation: true,
  
  // Removal Policy: Retain with pending deletion window
  removalPolicy: RemovalPolicy.RETAIN,
  pendingWindow: Duration.days(30),
  
  // Description: Always provide meaningful description
  description: `Encryption key for ${id}`,
}
```

---

### Cognito UserPool

```typescript
{
  // Password Policy (exceeds Security Hub minimum of 8)
  passwordPolicy: {
    minLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: true,
    tempPasswordValidity: Duration.days(7),
  },
  
  // MFA: OPTIONAL (allows flexibility while encouraging adoption)
  mfa: Mfa.OPTIONAL,
  
  // Advanced Security Mode: ENFORCED (Security Hub requirement)
  advancedSecurityMode: AdvancedSecurityMode.ENFORCED,
  
  // Self-Signup: Disabled by default (prevent public sign-up)
  selfSignUpEnabled: false,
  
  // Account Recovery: Disabled by default (enable per use case)
  accountRecovery: AccountRecovery.NONE,
}
```

**Documentation Sources**:

- AWS Security Hub controls
- AWS service-specific best practices
- AWS Well-Architected Framework
- NIST 800-53 controls

---

## Documentation Standards

### TSDoc with @example Tags

**Best Practice**: Use TSDoc comments with `@example` tags instead of separate documentation files.

```typescript
/**
 * A secure S3 bucket construct that extends the upstream Bucket
 * and encapsulates security best practices with sensible defaults.
 * 
 * Features:
 * - SSE-S3 encryption by default
 * - Public access blocked
 * - SSL enforcement
 * - Versioning enabled
 * 
 * @example Basic usage with default settings
 * import { SecureBucket } from '@bah-te/cdk-core-constructs';
 * 
 * const bucket = new SecureBucket(this, 'MyBucket');
 * 
 * @example Custom configuration with CMK
 * const bucket = new SecureBucket(this, 'MyBucket', {
 *   bucketName: 'my-secure-bucket',
 *   createCustomKey: true,
 *   keyDescription: 'Encryption key for sensitive data',
 * });
 */
export class SecureBucket extends s3.Bucket {
  // ...
}
```

---

### JSII Requirements

**Important**: JSII has specific requirements for documentation:

| Requirement | Rule |
|-------------|------|
| **No code fences** | ❌ No ```typescript in `@example` tags |
| **Plain code** | ✅ Use plain code examples |
| **Syntactically correct** | ✅ Examples must be valid TypeScript |
| **Include imports** | ✅ Show import statements |

---

### Benefits of TSDoc

| Benefit | Description |
|---------|-------------|
| **IDE tooltips** | Shows up in IntelliSense/IDE tooltips |
| **Always in sync** | Documentation lives with code |
| **Single source** | One place to maintain |
| **API docs** | Works with TypeDoc generators |

---

## Conditional Resource Creation

**Pattern**: Create optional resources based on props configuration.

```typescript
export class SecureBucket extends s3.Bucket {
  public readonly encryptionKey?: kms.IKey;
  
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    let encryptionKey: kms.IKey | undefined;
    let encryption: BucketEncryption;
    
    // Determine encryption configuration
    if (props.encryptionKey) {
      // User provided a key
      encryptionKey = props.encryptionKey;
      encryption = BucketEncryption.KMS;
    } else if (props.createCustomKey) {
      // Create a new CMK
      encryptionKey = new kms.Key(scope, `${id}Key`, {
        description: props.keyDescription || `Encryption key for ${id}`,
        enableKeyRotation: true,
      });
      encryption = BucketEncryption.KMS;
    } else {
      // Default to AWS-managed S3 encryption
      encryption = BucketEncryption.S3_MANAGED;
    }
    
    super(scope, id, {
      encryption,
      encryptionKey,
      ...props,
    });
    
    this.encryptionKey = encryptionKey;
  }
}
```

**Pattern**: Decide before `super()`, create resources if needed, pass to parent

---

## Property Exposure

**Best Practice**: Expose useful properties for consumers to build on your construct.

```typescript
export class NetworkServices extends Construct {
  // Core AWS resources (for advanced usage)
  public readonly vpc: ec2.IVpc;
  public readonly subnets: ec2.ISubnet[];
  
  // Derived properties (for convenience)
  public readonly vpcId: string;
  public readonly vpcCidrBlock: string;
  public readonly availabilityZones: string[];
  
  // Created resources (for grants and references)
  public readonly flowLogRole?: iam.IRole;
  public readonly flowLogLogGroup?: logs.ILogGroup;
  
  constructor(scope: Construct, id: string, props: NetworkServicesProps) {
    super(scope, id);
    
    // ... resource creation ...
    
    // Expose properties
    this.vpc = vpc;
    this.vpcId = vpc.vpcId;
    this.vpcCidrBlock = vpc.vpcCidrBlock;
    this.subnets = subnets;
    this.availabilityZones = vpc.availabilityZones;
  }
}
```

---

### Property Exposure Guidelines

**DO expose**:

- ✅ Core AWS resources (e.g., `vpc`, `bucket`, `role`)
- ✅ IDs and ARNs (e.g., `vpcId`, `bucketArn`)
- ✅ Created security resources (e.g., `encryptionKey`, `role`)

**Use readonly properties**:

- ✅ All public properties should be `readonly`

**Document each property**:

- ✅ TSDoc comment explaining what it's for

---

## Import Patterns

### Standard Import Organization

```typescript
// AWS CDK imports (grouped by service)
import {
  aws_s3 as s3,
  aws_kms as kms,
  aws_iam as iam,
  RemovalPolicy,
  Stack,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Internal imports (grouped by type)
import { AccountConstants } from '../utility/account-constants';
import type { SecureBucketProps } from './types';

// Test imports (test files only)
import { Template, Match } from 'aws-cdk-lib/assertions';
```

---

### Import Guidelines

| Guideline | Example |
|-----------|---------|
| Use `aws_{service} as {service}` aliasing | `aws_s3 as s3` |
| Import core CDK classes directly | `RemovalPolicy`, `Stack`, `Duration` |
| Use `type` imports for type-only | `import type { Props }` |
| Group by category | AWS CDK → Internal → Test |
| Alphabetize within groups | `aws_iam`, `aws_kms`, `aws_s3` |

---

## Export Patterns

### Module Barrel (index.ts)

```typescript
// Export main construct and props
export { SecureBucket } from './SecureBucket';
export type { SecureBucketProps } from './types';

// Export related types if useful for consumers
export type {
  BucketEncryptionConfig,
  BucketLifecycleConfig,
} from './types';

// Do NOT export:
// - Internal helper functions
// - Validation functions
// - Constants used only internally
```

---

### Root Barrel (src/index.ts)

```typescript
// Export by service category
// S3
export {
  SecureBucket,
  type SecureBucketProps,
} from './constructs/s3';

// IAM
export {
  ServiceAccountUser,
  type ServiceAccountUserProps,
} from './constructs/iam';

// Utility modules (namespace import)
export * as cidr from './core/networking/cidr';
export * as tags from './core/tags';
```

---

## Checklist for New L2 Constructs

When creating a new L2 construct, verify:

### Design

- [ ] Extends upstream construct (if wrapping single resource)
- [ ] Props interface extends upstream props interface
- [ ] Provides secure defaults
- [ ] Defaults can be overridden by user props (spread last)

### Documentation

- [ ] TSDoc comments with `@example` tags
- [ ] Examples are syntactically correct
- [ ] No code fences (JSII requirement)
- [ ] Import statements included in examples

### Properties

- [ ] Public properties exposed for common use cases
- [ ] All properties are `readonly`
- [ ] Properties documented with TSDoc

### Organization

- [ ] Follows import/export patterns
- [ ] Types in `types.ts`
- [ ] Construct in `{Construct}.ts`
- [ ] Barrel export in `index.ts`

### Validation & Testing

- [ ] Validation before resource creation
- [ ] Unit tests with NagCompliance
- [ ] Integration test for real deployment

---

## Approval Gates

Human approval is required before:

- Creating new L2 primitive construct
- Modifying security defaults (impacts all users)
- Introducing breaking changes to construct interfaces
- Changing layer classification (L2 ↔ L3 ↔ L4)

---

## See Also

- **L2 Inheritance**: [inheritance.md](./inheritance.md) - Detailed inheritance pattern
- **L2 Interfaces**: [interface.md](./interface.md) - Interface extension pattern
- **L2 Structure**: [structure.md](./structure.md) - Module file organization
- **L3 Composition**: [../L3/composition.md](../L3/composition.md) - When to use composition
- **Testing**: [../common/testing.md](../common/testing.md)
- **Validation**: [../common/validation.md](../common/validation.md)

---

## References

- **Source Material**:
  - `docs/standards/to-merge/CONSTRUCT-DESIGN.md`
  - `docs/standards/construct-layering.md` (L2 sections)
- **AWS Resources**:
  - AWS CDK Best Practices: https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html
  - JSII Documentation: https://aws.github.io/jsii/
