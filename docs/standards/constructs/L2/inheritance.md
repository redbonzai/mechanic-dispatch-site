# L2 Inheritance Pattern

**Applies to**: L2 constructs wrapping single AWS resources

---

## Overview

The inheritance pattern is the **preferred approach for L2 constructs** that wrap individual AWS resources. This document provides detailed guidance on implementing inheritance effectively.

---

## Core Pattern: Extend Upstream Construct

### Best Practice

```typescript
// ✅ CORRECT - Inheritance pattern
export class SecureBucket extends s3.Bucket {
  public readonly encryptionKey?: kms.IKey;
  
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    // Decision logic BEFORE super()
    let encryptionKey: kms.IKey | undefined;
    let encryption: BucketEncryption;
    
    if (props.encryptionKey) {
      encryptionKey = props.encryptionKey;
      encryption = BucketEncryption.KMS;
    } else if (props.createCustomKey) {
      encryptionKey = new kms.Key(scope, `${id}Key`, {
        description: props.keyDescription || `Encryption key for ${id}`,
        enableKeyRotation: true,
      });
      encryption = BucketEncryption.KMS;
    } else {
      encryption = BucketEncryption.S3_MANAGED;
    }
    
    // Call super() with enhanced defaults
    super(scope, id, {
      encryption,
      encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      ...props,  // User props override defaults (spread last)
    });
    
    // Store references
    this.encryptionKey = encryptionKey;
  }
}
```

---

## Why Inheritance for L2?

### Benefits

| Benefit | Description |
|---------|-------------|
| **Full compatibility** | Can be used anywhere upstream construct is expected |
| **Type safety** | TypeScript sees it as the upstream type (e.g., `s3.IBucket`) |
| **Automatic inheritance** | Inherits all methods and properties without proxying |
| **IntelliSense** | Full IDE support for upstream methods |
| **Grant methods** | `bucket.grantRead()` etc. work automatically |
| **Drop-in replacement** | No changes needed in consuming code |

---

### Example: Automatic Grant Methods

```typescript
// SecureBucket extends s3.Bucket, so grant methods work automatically
const bucket = new SecureBucket(this, 'Bucket');
const lambda = new lambda.Function(...);

// ✅ Works automatically (inherited from s3.Bucket)
bucket.grantRead(lambda);
bucket.grantWrite(lambda);
bucket.addToResourcePolicy(new iam.PolicyStatement(...));

// No proxying needed!
```

---

## Constructor Pattern

### Step 1: Decision Logic BEFORE super()

All decision logic, validations, and conditional resource creation must happen **before** `super()`:

```typescript
constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
  // ✅ STEP 1: Validation
  validateProps(props);
  
  // ✅ STEP 2: Decision logic
  let encryptionKey: kms.IKey | undefined;
  let encryption: BucketEncryption;
  
  if (props.encryptionKey) {
    encryptionKey = props.encryptionKey;
    encryption = BucketEncryption.KMS;
  } else if (props.createCustomKey) {
    encryptionKey = new kms.Key(scope, `${id}Key`, {
      description: props.keyDescription || `Encryption key for ${id}`,
      enableKeyRotation: true,
    });
    encryption = BucketEncryption.KMS;
  } else {
    encryption = BucketEncryption.S3_MANAGED;
  }
  
  // ✅ STEP 3: Call super() with computed values
  super(scope, id, {
    encryption,
    encryptionKey,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    ...props,
  });
  
  // ✅ STEP 4: Store references (after super())
  this.encryptionKey = encryptionKey;
}
```

---

### Step 2: Call super() with Enhanced Defaults

Pattern for calling `super()`:

```typescript
super(scope, id, {
  // Security defaults first
  encryption: BucketEncryption.S3_MANAGED,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true,
  
  // Operational defaults
  versioned: true,
  removalPolicy: RemovalPolicy.RETAIN,
  autoDeleteObjects: false,
  
  // Computed values from decision logic
  encryptionKey,
  
  // User props override defaults (spread LAST)
  ...props,
});
```

**Key Points**:

- Defaults first
- Computed values from decision logic
- User props spread **last** (allows override)

---

### Step 3: Store References (after super())

After `super()`, store any useful references:

```typescript
constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
  // ... decision logic ...
  
  super(scope, id, { ... });
  
  // ✅ Store references AFTER super()
  this.encryptionKey = encryptionKey;
  
  // ❌ Cannot store before super() (TypeScript error)
}
```

---

## Conditional Resource Creation

### Pattern: Create Resources Before super()

When creating optional resources (e.g., KMS keys), create them **before** calling `super()`:

```typescript
constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
  let encryptionKey: kms.IKey | undefined;
  
  // Create optional KMS key BEFORE super()
  if (props.createCustomKey) {
    encryptionKey = new kms.Key(scope, `${id}Key`, {
      description: props.keyDescription || `Encryption key for ${id}`,
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.RETAIN,
      pendingWindow: Duration.days(30),
    });
  }
  
  super(scope, id, {
    encryptionKey,  // Pass to parent
    encryption: encryptionKey ? BucketEncryption.KMS : BucketEncryption.S3_MANAGED,
    ...props,
  });
  
  this.encryptionKey = encryptionKey;
}
```

---

### When to Create Resources

| Scenario | Create Before super()? |
|----------|----------------------|
| Required by parent props | ✅ Yes |
| Optional resource | ✅ Yes |
| Depends on parent resource | ❌ No (create after super()) |

**Example - Depends on parent**:

```typescript
constructor(scope: Construct, id: string, props: VpcProps = {}) {
  super(scope, id, {
    cidr: props.cidr || '10.0.0.0/16',
    ...props,
  });
  
  // Flow logs depend on VPC (created by super()), so create AFTER
  if (props.enableFlowLogs) {
    new FlowLog(this, 'FlowLog', {
      resourceType: FlowLogResourceType.fromVpc(this),  // 'this' = VPC
      destination: FlowLogDestination.toCloudWatchLogs(),
    });
  }
}
```

---

## Property Exposure

### Expose Useful Properties

Make properties available to consumers for building on your construct:

```typescript
export class SecureBucket extends s3.Bucket {
  /**
   * The KMS encryption key used by this bucket (if using CMK).
   * 
   * @remarks
   * undefined if using AWS-managed S3 encryption.
   */
  public readonly encryptionKey?: kms.IKey;
  
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    // ... create encryptionKey if needed ...
    
    super(scope, id, { ... });
    
    this.encryptionKey = encryptionKey;
  }
}
```

---

### Property Guidelines

**DO expose**:

- ✅ Created AWS resources (e.g., `encryptionKey`, `logGroup`)
- ✅ Useful derived properties (e.g., `vpcId`, `bucketArn`)
- ✅ Properties consumers need for grants/references

**Mark readonly**:

- ✅ All public properties should be `readonly`

**Document each property**:

- ✅ TSDoc comment explaining purpose
- ✅ `@remarks` for additional context

---

## Default Override Pattern

### User Props Spread Last

**Critical**: User props must be spread **last** to allow override:

```typescript
// ✅ CORRECT - User props spread last (can override)
super(scope, id, {
  encryption: BucketEncryption.S3_MANAGED,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true,
  ...props,  // User can override any default
});

// ❌ WRONG - User props spread first (defaults override user)
super(scope, id, {
  ...props,
  encryption: BucketEncryption.S3_MANAGED,  // Always overrides user
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
});
```

---

### Conditional Defaults

For complex scenarios, compute defaults conditionally:

```typescript
constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
  // Compute encryption configuration
  const encryptionConfig = props.encryptionKey
    ? { encryption: BucketEncryption.KMS, encryptionKey: props.encryptionKey }
    : { encryption: BucketEncryption.S3_MANAGED };
  
  super(scope, id, {
    // Security defaults
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    enforceSSL: true,
    
    // Computed encryption
    ...encryptionConfig,
    
    // User props (can still override)
    ...props,
  });
}
```

---

## Validation

### Validate Before super()

All validation must happen **before** calling `super()`:

```typescript
constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
  // ✅ Validate BEFORE super()
  if (props.createCustomKey && props.encryptionKey) {
    throw new Error(
      'Cannot specify both createCustomKey and encryptionKey. ' +
      'Use one or the other.'
    );
  }
  
  super(scope, id, { ... });
}
```

---

### Validation Guidelines

| Rule | Reason |
|------|--------|
| **Fail-closed** | Reject invalid configurations (don't silently ignore) |
| **Early validation** | Validate before resource creation |
| **Clear errors** | Descriptive error messages with guidance |
| **Mutual exclusivity** | Check conflicting props |
| **Required dependencies** | Validate dependent props |

---

### Example Validation Function

```typescript
function validateProps(props: SecureBucketProps): void {
  // Mutual exclusivity
  if (props.createCustomKey && props.encryptionKey) {
    throw new Error(
      'Cannot specify both createCustomKey and encryptionKey. ' +
      'Use createCustomKey: true to create a new key, or ' +
      'provide encryptionKey with an existing key.'
    );
  }
  
  // Required dependencies
  if (props.keyDescription && !props.createCustomKey) {
    throw new Error(
      'keyDescription requires createCustomKey to be true.'
    );
  }
  
  // Value constraints
  if (props.minObjectSize && props.minObjectSize < 0) {
    throw new Error(
      `minObjectSize must be non-negative, got ${props.minObjectSize}`
    );
  }
}
```

---

## When NOT to Use Inheritance

Use composition (L3 pattern) instead when:

| Scenario | Pattern | Reason |
|----------|---------|--------|
| Multiple AWS resources | Composition | Can't inherit from multiple classes |
| Design pattern | Composition | Not a single resource wrapper |
| Hiding implementation | Composition | Encapsulation needed |
| Cross-service aggregation | Composition | Composing different services |
| L3/L4 constructs | Composition | Higher-level abstractions |

**See**: [L3/composition.md](../L3/composition.md) for composition patterns

---

## Complete Example

### SecureBucket with Inheritance

```typescript
/**
 * A secure S3 bucket with best-practice defaults.
 * 
 * @example
 * const bucket = new SecureBucket(this, 'Bucket', {
 *   bucketName: 'my-secure-bucket',
 *   createCustomKey: true,
 * });
 */
export class SecureBucket extends s3.Bucket {
  /**
   * The KMS key used for encryption (if using CMK).
   */
  public readonly encryptionKey?: kms.IKey;
  
  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    // Step 1: Validation
    validateProps(props);
    
    // Step 2: Decision logic and resource creation
    let encryptionKey: kms.IKey | undefined;
    let encryption: BucketEncryption;
    
    if (props.encryptionKey) {
      // User provided a key
      encryptionKey = props.encryptionKey;
      encryption = BucketEncryption.KMS;
    } else if (props.createCustomKey) {
      // Create a new CMK
      encryptionKey = new kms.Key(scope, `${id}Key`, {
        description: props.keyDescription || `Encryption key for ${id}`,
        enableKeyRotation: true,
        removalPolicy: RemovalPolicy.RETAIN,
        pendingWindow: Duration.days(30),
      });
      encryption = BucketEncryption.KMS;
    } else {
      // Default: AWS-managed encryption
      encryption = BucketEncryption.S3_MANAGED;
    }
    
    // Step 3: Call super() with enhanced defaults
    super(scope, id, {
      // Security defaults
      encryption,
      encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      
      // Operational defaults
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      
      // User props override defaults (spread last)
      ...props,
    });
    
    // Step 4: Store references
    this.encryptionKey = encryptionKey;
  }
}

function validateProps(props: SecureBucketProps): void {
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

## Checklist for Inheritance Pattern

When implementing inheritance pattern, verify:

### Constructor

- [ ] Validation before `super()`
- [ ] Decision logic before `super()`
- [ ] Optional resources created before `super()`
- [ ] Security defaults first in `super()`
- [ ] User props spread **last** in `super()`
- [ ] References stored after `super()`

### Properties

- [ ] Useful properties exposed
- [ ] All properties `readonly`
- [ ] Properties documented with TSDoc

### Validation

- [ ] Fail-closed (reject invalid)
- [ ] Clear error messages
- [ ] Check mutual exclusivity
- [ ] Validate dependencies

### Interface

- [ ] Props extends upstream interface
- [ ] Only adds new properties
- [ ] Uses canonical types

---

## Approval Gates

Human approval is required before:

- Changing constructor pattern (impacts inheritance model)
- Modifying default selection logic (impacts all users)
- Changing property exposure (impacts public API)

---

## See Also

- **L2 Constructs**: [constructs.md](./constructs.md)
- **L2 Interfaces**: [interface.md](./interface.md)
- **L3 Composition**: [../L3/composition.md](../L3/composition.md) - When to use composition instead
- **Testing**: [../common/testing.md](../common/testing.md)

---

## References

- **Source Material**:
  - `docs/standards/to-merge/CONSTRUCT-DESIGN.md`
  - `docs/standards/construct-layering.md` (L2 inheritance sections)

