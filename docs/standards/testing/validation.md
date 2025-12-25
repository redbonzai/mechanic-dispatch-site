# Validation Standard

**Applies to**: All layers (L2, L3, L4)
**Test Type**: Actions requiring AWS credentials or explicit AWS profile
**Location**: Constructor validation in `src/constructs/**`

---

## Overview

Validation ensures **configuration errors are caught at synthesis time, not deploy time**. All validation **MUST** occur in construct constructors before any AWS resources are created.

**Key Principle**: **Fail fast** - catch errors early in the development cycle, not after deployment starts.

**Important**: This document covers validation **patterns and implementation**. The validation is executed during synthesis (no AWS credentials needed), but testing deployed resources requires AWS credentials (see [stack.md](./stack.md)).

---

## Core Principle

### Catch Errors at Synthesis Time

```typescript
// ✅ GOOD - Error caught during cdk synth (< 1 second)
constructor(scope: Construct, id: string, props: MyProps) {
  super(scope, id);
  
  // Validation FIRST
  if (!props.name) {
    throw new Error("MyConstruct: 'name' is required.");
  }
  
  // Create resources AFTER validation passes
  this.createResources(props);
}

// ❌ BAD - Error caught during cdk deploy (minutes + AWS costs)
constructor(scope: Construct, id: string, props: MyProps) {
  super(scope, id);
  
  // Create resources without validation
  this.resource = new SomeResource(this, 'Resource', {
    name: props.name, // AWS will fail if missing
  });
}
```

---

## Validation Order

Constructors **MUST** validate in this order:

```typescript
constructor(scope: Construct, id: string, props: MyProps) {
  super(scope, id);

  // 1. Required fields (fail fast)
  this.validateRequired(props);

  // 2. Mutual exclusivity
  this.validateMutualExclusivity(props);

  // 3. Ranges and constraints
  this.validateRanges(props);

  // 4. Complex business rules
  this.validateBusinessRules(props);

  // 5. Create resources (only after all validation passes)
  this.createResources(props);
}
```

**Rationale**: Fail as early as possible with the clearest error message.

---

## Error Message Templates

**Rule**: All error messages **MUST** follow these exact patterns for consistency.

| Error Type | Template | Example |
|------------|----------|---------|
| Missing required | `{Construct}: '{property}' is required.` | `VpcConstruct: 'name' is required.` |
| Mutual exclusivity | `{Construct}: Cannot specify both '{prop1}' and '{prop2}'.` | `VpcConstruct: Cannot specify both 'zone' and 'zones'.` |
| Range violation | `{Construct}: '{property}' must be {min}-{max}, got {value}.` | `VpcConstruct: 'zone.count' must be 1-4, got 5.` |
| Invalid enum | `{Construct}: '{property}' must be one of [{values}], got '{value}'.` | `FlowLog: 'type' must be one of [logGroup, s3, kinesis], got 'invalid'.` |
| Missing primary | `{Construct}: Primary {resource} (index 0) is required.` | `VpcConstruct: Primary CIDR allocation (index 0) is required.` |
| Duplicate index | `{Construct}: Duplicate {resource} indices: {indices}.` | `VpcConstruct: Duplicate CIDR indices: 1, 2.` |
| Invalid format | `{Construct}: '{property}' format invalid. Expected {format}, got '{value}'.` | `CidrBase: 'block' format invalid. Expected CIDR with /prefix, got '10.0.0.0'.` |

**Benefits**:
- Consistent error messages across all constructs
- Easy to test (exact string matching)
- Clear guidance for users
- AI agents can parse patterns

---

## Validation Functions

### 1. Required Properties

```typescript
/**
 * Validates that required properties are present.
 * @param props - Properties object to validate
 * @param required - Array of required property names
 * @param constructName - Name of construct for error messages
 */
function validateRequired<T extends object>(
  props: T,
  required: Array<keyof T>,
  constructName: string
): void {
  for (const prop of required) {
    if (props[prop] === undefined || props[prop] === null) {
      throw new Error(`${constructName}: '${String(prop)}' is required.`);
    }
  }
}

// Usage
validateRequired(props, ['name', 'cidr'], 'VpcConstruct');
```

**Example in Constructor**:

```typescript
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // Validate required fields
  if (!props.name) {
    throw new Error("VpcConstruct: 'name' is required.");
  }
  if (!props.cidr) {
    throw new Error("VpcConstruct: 'cidr' is required.");
  }
  
  // ... continue with resource creation
}
```

---

### 2. Mutual Exclusivity

```typescript
/**
 * Validates that mutually exclusive properties are not both specified.
 * @param props - Properties object to validate
 * @param pairs - Array of mutually exclusive property pairs
 * @param constructName - Name of construct for error messages
 */
function validateMutualExclusivity<T extends object>(
  props: T,
  pairs: Array<[keyof T, keyof T]>,
  constructName: string
): void {
  for (const [prop1, prop2] of pairs) {
    if (props[prop1] !== undefined && props[prop2] !== undefined) {
      throw new Error(
        `${constructName}: Cannot specify both '${String(prop1)}' and '${String(prop2)}'.`
      );
    }
  }
}

// Usage
validateMutualExclusivity(props, [['zone', 'zones']], 'VpcConstruct');
```

**Example in Constructor**:

```typescript
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // Validate mutual exclusivity
  if (props.zone !== undefined && props.zones !== undefined) {
    throw new Error("VpcConstruct: Cannot specify both 'zone' and 'zones'.");
  }
  
  // ... continue
}
```

---

### 3. Range Validation

```typescript
/**
 * Validates that a numeric property is within a range.
 * @param value - Value to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param propertyPath - Property path for error messages
 * @param constructName - Name of construct for error messages
 */
function validateRange(
  value: number,
  min: number,
  max: number,
  propertyPath: string,
  constructName: string
): void {
  if (value < min || value > max) {
    throw new Error(
      `${constructName}: '${propertyPath}' must be ${min}-${max}, got ${value}.`
    );
  }
}

// Usage
if (props.zone?.count !== undefined) {
  validateRange(props.zone.count, 1, 4, 'zone.count', 'VpcConstruct');
}
```

**Example in Constructor**:

```typescript
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // Validate range
  if (props.zone?.count !== undefined) {
    if (props.zone.count < 1 || props.zone.count > 4) {
      throw new Error(
        `VpcConstruct: 'zone.count' must be 1-4, got ${props.zone.count}.`
      );
    }
  }
  
  // ... continue
}
```

---

### 4. Enum Validation

```typescript
/**
 * Validates that a value is one of the allowed enum values.
 * @param value - Value to validate
 * @param allowed - Array of allowed values
 * @param propertyPath - Property path for error messages
 * @param constructName - Name of construct for error messages
 */
function validateEnum<T extends string>(
  value: T,
  allowed: readonly T[],
  propertyPath: string,
  constructName: string
): void {
  if (!allowed.includes(value)) {
    throw new Error(
      `${constructName}: '${propertyPath}' must be one of [${allowed.join(', ')}], got '${value}'.`
    );
  }
}

// Usage
validateEnum(
  props.destination.type,
  ['logGroup', 's3', 'kinesis'] as const,
  'destination.type',
  'FlowLog'
);
```

**Example in Constructor**:

```typescript
constructor(scope: Construct, id: string, props: FlowLogProps) {
  super(scope, id);
  
  // Validate enum
  const validTypes = ['logGroup', 's3', 'kinesis'] as const;
  if (!validTypes.includes(props.destination.type)) {
    throw new Error(
      `FlowLog: 'destination.type' must be one of [${validTypes.join(', ')}], got '${props.destination.type}'.`
    );
  }
  
  // ... continue
}
```

---

### 5. Array Index Validation

```typescript
/**
 * Validates array items have unique indices and required primary index.
 * @param items - Array of indexed items
 * @param indexProperty - Property name containing the index
 * @param resourceName - Resource name for error messages
 * @param constructName - Name of construct for error messages
 * @param requirePrimary - Whether index 0 is required
 */
function validateIndexedArray<T extends object>(
  items: T[],
  indexProperty: keyof T,
  resourceName: string,
  constructName: string,
  requirePrimary: boolean = true
): void {
  if (items.length === 0) {
    throw new Error(`${constructName}: At least one ${resourceName} is required.`);
  }

  const indices = items.map(item => item[indexProperty] as number);

  // Check for primary
  if (requirePrimary && !indices.includes(0)) {
    throw new Error(
      `${constructName}: Primary ${resourceName} (index 0) is required.`
    );
  }

  // Check for duplicates
  const duplicates = indices.filter((idx, i) => indices.indexOf(idx) !== i);
  if (duplicates.length > 0) {
    throw new Error(
      `${constructName}: Duplicate ${resourceName} indices: ${[...new Set(duplicates)].join(', ')}.`
    );
  }
}

// Usage
validateIndexedArray(
  props.cidr.allocations,
  'index',
  'CIDR allocation',
  'VpcConstruct'
);
```

**Example in Constructor**:

```typescript
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // Validate indexed array
  if (props.cidr.allocations.length === 0) {
    throw new Error("VpcConstruct: At least one CIDR allocation is required.");
  }
  
  const indices = props.cidr.allocations.map(a => a.index);
  if (!indices.includes(0)) {
    throw new Error("VpcConstruct: Primary CIDR allocation (index 0) is required.");
  }
  
  const duplicates = indices.filter((idx, i) => indices.indexOf(idx) !== i);
  if (duplicates.length > 0) {
    throw new Error(
      `VpcConstruct: Duplicate CIDR indices: ${[...new Set(duplicates)].join(', ')}.`
    );
  }
  
  // ... continue
}
```

---

### 6. CIDR Format Validation

```typescript
/**
 * Validates CIDR block format.
 * @param cidr - CIDR string to validate
 * @param propertyPath - Property path for error messages
 * @param constructName - Name of construct for error messages
 */
function validateCidrFormat(
  cidr: string,
  propertyPath: string,
  constructName: string
): void {
  // Check for prefix
  if (!cidr.includes('/')) {
    throw new Error(
      `${constructName}: '${propertyPath}' format invalid. Expected CIDR with /prefix, got '${cidr}'.`
    );
  }

  // Validate IPv4 CIDR pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  // Validate IPv6 CIDR pattern
  const ipv6Pattern = /^([0-9a-fA-F:]+)\/\d{1,3}$/;

  if (!ipv4Pattern.test(cidr) && !ipv6Pattern.test(cidr)) {
    throw new Error(
      `${constructName}: '${propertyPath}' format invalid. Expected valid IPv4 or IPv6 CIDR, got '${cidr}'.`
    );
  }
}

// Usage
if (cidr.block) {
  validateCidrFormat(cidr.block, 'cidr.allocations[0].ipv4.block', 'VpcConstruct');
}
```

---

## Type Guards

### Purpose

Type guards enable TypeScript to narrow union types at runtime, ensuring type-safe code paths.

### CidrBase Type Guards

```typescript
/**
 * Type guard for static block CIDR.
 */
function isBlockCidr(cidr: CidrBase): cidr is { block: string } {
  return 'block' in cidr && cidr.block !== undefined;
}

/**
 * Type guard for IPAM allocation.
 */
function isIpamCidr(cidr: CidrBase): cidr is { ipam: IpamAllocation } {
  return 'ipam' in cidr && cidr.ipam !== undefined;
}

/**
 * Type guard for reference CIDR.
 */
function isRefCidr(cidr: CidrBase): cidr is { ref: CidrRef } {
  return 'ref' in cidr && cidr.ref !== undefined;
}

/**
 * Type guard for single address.
 */
function isAddressCidr(cidr: CidrBase): cidr is { address: string } {
  return 'address' in cidr && cidr.address !== undefined;
}

/**
 * Type guard for auto-assign IPv6.
 */
function isAutoCidr(cidr: CidrBase): cidr is { auto: boolean } {
  return 'auto' in cidr && cidr.auto !== undefined;
}
```

### Usage in Construct

```typescript
private processCidr(cidr: CidrBase): void {
  if (isBlockCidr(cidr)) {
    // TypeScript knows cidr.block is string
    validateCidrFormat(cidr.block, 'cidr.block', 'VpcConstruct');
    this.createStaticCidr(cidr.block);
  } else if (isIpamCidr(cidr)) {
    // TypeScript knows cidr.ipam is IpamAllocation
    this.createIpamCidr(cidr.ipam);
  } else if (isRefCidr(cidr)) {
    // TypeScript knows cidr.ref is CidrRef
    this.createRefCidr(cidr.ref);
  } else {
    throw new Error("VpcConstruct: Invalid CIDR configuration.");
  }
}
```

---

## Type-Safe Accessors

### Purpose

Provide typed helper methods for accessing construct properties safely.

### Example: CIDR Accessors

```typescript
export class VpcConstruct extends Construct {
  private readonly cidrConfig: CidrConfig;

  /**
   * Get CIDR allocation by index.
   * @param index - Zero-based allocation index
   * @returns IndexedCidr or undefined if not found
   */
  public getCidr(index: number): IndexedCidr | undefined {
    return this.cidrConfig.allocations.find(c => c.index === index);
  }

  /**
   * Get CIDR allocation by name.
   * @param name - Allocation name
   * @returns IndexedCidr or undefined if not found
   */
  public getCidrByName(name: string): IndexedCidr | undefined {
    return this.cidrConfig.allocations.find(c => c.name === name);
  }

  /**
   * Get primary CIDR allocation.
   * @returns Primary IndexedCidr (index 0)
   * @throws If primary CIDR not found (should not happen if validation passed)
   */
  public getPrimaryCidr(): IndexedCidr {
    const primary = this.getCidr(0);
    if (!primary) {
      throw new Error('Primary CIDR (index 0) not found');
    }
    return primary;
  }

  /**
   * Get IPv4 CIDR block string.
   * @param index - Zero-based allocation index
   * @returns CIDR block string or undefined
   */
  public getIpv4CidrBlock(index: number): string | undefined {
    const cidr = this.getCidr(index);
    if (cidr?.ipv4 && isBlockCidr(cidr.ipv4)) {
      return cidr.ipv4.block;
    }
    return undefined;
  }
}
```

---

## Enum Best Practices

### Use Enums for Fixed Value Sets

```typescript
// ✅ CORRECT: Enum for fixed values
export enum FlowLogDestinationType {
  CLOUD_WATCH_LOGS = 'logGroup',
  S3 = 's3',
  KINESIS = 'kinesis',
}

export enum VpcIpMode {
  IPV4 = 'ipv4',
  IPV6 = 'ipv6',
  DUAL_STACK = 'dualStack',
}

export enum RouteTableStrategy {
  PER_AZ = 'perAz',
  PER_SEGMENT = 'perSegment',
  SHARED = 'shared',
}
```

### Enum Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Enum name | PascalCase | `FlowLogDestinationType` |
| Enum values | SCREAMING_SNAKE | `CLOUD_WATCH_LOGS` |
| String value | camelCase or kebab | `'logGroup'`, `'log-group'` |

---

## Complete Constructor Example

```typescript
export class VpcConstruct extends Construct {
  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id);

    // ========================================
    // STEP 1: Required Fields (Fail Fast)
    // ========================================
    if (!props.name) {
      throw new Error("VpcConstruct: 'name' is required.");
    }
    if (!props.cidr) {
      throw new Error("VpcConstruct: 'cidr' is required.");
    }
    if (!props.cidr.allocations || props.cidr.allocations.length === 0) {
      throw new Error("VpcConstruct: At least one CIDR allocation is required.");
    }

    // ========================================
    // STEP 2: Mutual Exclusivity
    // ========================================
    if (props.zone !== undefined && props.zones !== undefined) {
      throw new Error("VpcConstruct: Cannot specify both 'zone' and 'zones'.");
    }

    // ========================================
    // STEP 3: Ranges and Constraints
    // ========================================
    if (props.zone?.count !== undefined) {
      if (props.zone.count < 1 || props.zone.count > 4) {
        throw new Error(
          `VpcConstruct: 'zone.count' must be 1-4, got ${props.zone.count}.`
        );
      }
    }

    // ========================================
    // STEP 4: Complex Business Rules
    // ========================================
    // Validate primary CIDR exists
    const indices = props.cidr.allocations.map(a => a.index);
    if (!indices.includes(0)) {
      throw new Error("VpcConstruct: Primary CIDR allocation (index 0) is required.");
    }

    // Validate no duplicate indices
    const duplicates = indices.filter((idx, i) => indices.indexOf(idx) !== i);
    if (duplicates.length > 0) {
      throw new Error(
        `VpcConstruct: Duplicate CIDR indices: ${[...new Set(duplicates)].join(', ')}.`
      );
    }

    // Validate CIDR formats
    for (const allocation of props.cidr.allocations) {
      if (allocation.ipv4 && isBlockCidr(allocation.ipv4)) {
        validateCidrFormat(
          allocation.ipv4.block,
          `cidr.allocations[${allocation.index}].ipv4.block`,
          'VpcConstruct'
        );
      }
    }

    // ========================================
    // STEP 5: Create Resources
    // ========================================
    // Only after all validation passes
    this.createVpc(props);
    this.createSubnets(props);
    this.createFlowLogs(props);
  }

  private createVpc(props: VpcProps): void {
    // Resource creation logic
  }

  private createSubnets(props: VpcProps): void {
    // Resource creation logic
  }

  private createFlowLogs(props: VpcProps): void {
    // Resource creation logic
  }
}
```

---

## Testing Validation

### Unit Tests for Validation

```typescript
describe('VpcConstruct validation', () => {
  test('throws when name missing', () => {
    expect(() => {
      new VpcConstruct(stack, 'TestVpc', {
        cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
      } as VpcProps);
    }).toThrow("VpcConstruct: 'name' is required.");
  });

  test('throws when both zone and zones specified', () => {
    expect(() => {
      new VpcConstruct(stack, 'TestVpc', {
        name: 'test-vpc',
        zone: { count: 2 },
        zones: [{ id: 'a' }],
        cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
      });
    }).toThrow("VpcConstruct: Cannot specify both 'zone' and 'zones'.");
  });

  test('throws when zone.count is out of range', () => {
    expect(() => {
      new VpcConstruct(stack, 'TestVpc', {
        name: 'test-vpc',
        zone: { count: 5 },
        cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
      });
    }).toThrow("VpcConstruct: 'zone.count' must be 1-4, got 5.");
  });

  test('throws when CIDR format invalid', () => {
    expect(() => {
      new VpcConstruct(stack, 'TestVpc', {
        name: 'test-vpc',
        cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0' } }] },
      });
    }).toThrow("format invalid. Expected CIDR with /prefix, got '10.0.0.0'");
  });
});
```

---

## Validation Checklist

When implementing a new construct, verify validation covers:

**Required Fields**:

- [ ] All required properties validated
- [ ] Error messages follow template: `{Construct}: '{property}' is required.`

**Mutual Exclusivity**:

- [ ] Mutually exclusive properties checked
- [ ] Error messages follow template: `Cannot specify both '{prop1}' and '{prop2}'.`

**Ranges**:

- [ ] Numeric ranges checked
- [ ] Error messages follow template: `'{property}' must be {min}-{max}, got {value}.`

**Enums**:

- [ ] Enum values validated
- [ ] Error messages follow template: `must be one of [{values}], got '{value}'.`

**Arrays**:

- [ ] Array indices unique
- [ ] Primary index (0) required where applicable
- [ ] Error messages follow templates

**Formats**:

- [ ] CIDR formats validated
- [ ] Other format validations added

**General**:

- [ ] Validation occurs before resource creation
- [ ] Type guards provided for union types
- [ ] Type-safe accessors provided
- [ ] All validation unit tested

---

## See Also

- **Unit Testing**: [unit.md](./unit.md) - Unit test patterns including validation tests
- **Stack Testing**: [stack.md](./stack.md) - Testing deployed resources (requires AWS)
- **L2 Constructs**: [../L2/constructs.md](../L2/constructs.md) - L2 construct patterns
- **L3 Constructs**: [../L3/constructs.md](../L3/constructs.md) - L3 construct patterns

---

## References

- Validation patterns in `CLAUDE.md` (repository authority)
- TypeScript Type Guards: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
- CDK Best Practices: https://docs.aws.amazon.com/cdk/latest/guide/best-practices.html

