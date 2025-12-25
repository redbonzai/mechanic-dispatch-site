# Anti-Patterns

**Entry Point**: Common Mistakes for AI Agents to Avoid

**Audience**: AI Agents and Developers  
**Scope**: All TypeScript code and CDK constructs  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This document catalogs common anti-patterns (mistakes) to avoid when building CDK constructs. Each anti-pattern includes severity, explanation, incorrect example, correct example, and fix guidance.

**Core Philosophy**: Learn from others' mistakes. Avoid these patterns proactively.

---

## Severity Levels

| Severity | Impact | Action Required |
|----------|--------|-----------------|
| **CRITICAL** | Will cause runtime errors or security issues | MUST FIX immediately |
| **HIGH** | Breaks standards compliance | SHOULD FIX before merge |
| **MEDIUM** | Reduces maintainability | RECOMMENDED to fix |
| **LOW** | Style/convention violation | NICE to fix |

---

## Anti-Pattern Index

| ID | Anti-Pattern | Severity | Quick Fix |
|----|--------------|----------|-----------|
| [AP-001](#ap-001-redundant-enabled-flag) | Redundant `enabled` flag | HIGH | Remove `enabled`, presence implies enablement |
| [AP-002](#ap-002-both-singular-and-plural) | Both singular and plural | CRITICAL | Add mutual exclusivity validation |
| [AP-003](#ap-003-direct-file-imports) | Direct file imports | HIGH | Import from module barrel |
| [AP-004](#ap-004-inline-interface-definitions) | Inline interface definitions | MEDIUM | Define as named interface |
| [AP-005](#ap-005-file-extension-in-imports) | File extension in imports | HIGH | Omit `.ts` extension |
| [AP-006](#ap-006-ambiguous-cidr-reference) | Ambiguous CIDR reference | HIGH | Use full path `allocations[0].ipv4` |
| [AP-007](#ap-007-types-in-construct-file) | Types in construct file | MEDIUM | Move to `types.ts` |
| [AP-008](#ap-008-validation-after-resource-creation) | Validation after resource creation | CRITICAL | Validate in constructor first |
| [AP-009](#ap-009-wrong-cidr-layer) | Wrong CIDR layer | HIGH | Use appropriate layer for resource |
| [AP-010](#ap-010-scattered-related-properties) | Scattered related properties | MEDIUM | Group into configuration object |
| [AP-011](#ap-011-unnecessary-object-wrapper) | Unnecessary object wrapper | LOW | Flatten single-property objects |
| [AP-012](#ap-012-count-on-array-items) | `count` on array items | LOW | Move `count` to parent object |
| [AP-013](#ap-013-magic-numbers) | Magic numbers | MEDIUM | Extract to constants |
| [AP-014](#ap-014-missing-type-guards) | Missing type guards | MEDIUM | Add type guards for unions |
| [AP-015](#ap-015-inconsistent-error-messages) | Inconsistent error messages | MEDIUM | Use error message templates |
| [AP-016](#ap-016-bespoke-objects-for-common-concepts) | Bespoke objects for common concepts | HIGH | Reuse existing interface objects |
| [AP-017](#ap-017-piecemeal-imports-from-non-index) | Piecemeal imports from non-index | HIGH | Import from index.ts barrel |

---

## AP-001: Redundant `enabled` Flag

**Severity**: HIGH

### Problem

Adding `enabled: true/false` when presence of object already implies enablement.

### Why This Is Wrong

- Redundant - presence already indicates feature is enabled
- Confusing - what if object exists but `enabled: false`?
- Verbose - unnecessary property

### Incorrect Example

```typescript
// ❌ INCORRECT
interface VpcProps {
  readonly flowLog?: {
    enabled: boolean;           // ❌ Redundant
    trafficType: string;
  };
}

// Usage - confusing!
const props = {
  flowLog: {
    enabled: true,              // Why is this needed if object is present?
    trafficType: 'ALL'
  }
};
```

### Correct Example

```typescript
// ✅ CORRECT
interface VpcProps {
  readonly flowLog?: {
    trafficType: string;        // Presence = enabled
  };
}

// Usage - clear!
const props = {
  flowLog: {
    trafficType: 'ALL'          // Presence implies enabled
  }
};

// To disable: omit the entire object
const propsDisabled = {
  // flowLog not present = disabled
};
```

### Fix

1. Remove `enabled` property from interface
2. Document that presence implies enablement
3. Update constructor to treat presence as enablement

### Exception

Use explicit `enabled` flag ONLY when:
- Feature state is inherited and needs override
- Complex sub-configurations exist independently of enablement

```typescript
// ✅ ACCEPTABLE: Override inherited state
interface MonitoringConfig {
  readonly enabled?: boolean;   // ✅ Override inherited config
  readonly interval: number;    // Exists even when disabled
}
```

---

## AP-002: Both Singular and Plural

**Severity**: CRITICAL

### Problem

Defining both singular and plural forms of same property without mutual exclusivity validation.

### Why This Is Wrong

- Ambiguous - which takes precedence?
- Will cause runtime errors
- Users won't know which to use
- Breaks naming conventions

### Incorrect Example

```typescript
// ❌ INCORRECT
interface VpcProps {
  readonly zone?: ZoneConfig;   // Singular
  readonly zones?: ZoneSpec[];  // Plural - which wins?
}

// Usage - conflict!
const props = {
  zone: { count: 2 },
  zones: [{ id: 'a' }, { id: 'b' }]  // Ambiguous! Both specified!
};

// Constructor doesn't validate
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // ❌ No validation - undefined behavior
  const count = props.zone?.count ?? props.zones?.length ?? 3;
}
```

### Correct Example

```typescript
// ✅ CORRECT
interface VpcProps {
  readonly zone?: ZoneConfig;   // Option 1
  readonly zones?: ZoneSpec[];  // Option 2
}

// Constructor validates mutual exclusivity
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // ✅ Validate FIRST
  if (props.zone && props.zones) {
    throw new Error(
      "VpcConstruct: Cannot specify both 'zone' and 'zones'. " +
      "Use 'zone' for count-based or 'zones' for explicit list."
    );
  }
  
  // Now safe to use
  const count = props.zone?.count ?? props.zones?.length ?? 3;
}
```

### Fix

1. Add mutual exclusivity validation in constructor
2. Validate BEFORE any resource creation
3. Use clear error message explaining the choice

**See**: [naming.md](./naming.md) - Rule 2: Mutual Exclusivity

---

## AP-003: Direct File Imports

**Severity**: HIGH

### Problem

Importing directly from internal files instead of module barrel (`index.ts`).

### Why This Is Wrong

- Breaks encapsulation
- Exposes internal file structure
- Makes refactoring harder
- Violates CDK conventions
- Creates tight coupling

### Incorrect Example

```typescript
// ❌ INCORRECT
import { VpcConstruct } from './vpc/Vpc';
import type { VpcProps } from './vpc/types';
import { InternalHelper } from './vpc/internal';  // Importing internal!

// ❌ INCORRECT
import { RamShare } from '../constructs/ram/Share';
import { RamShareProps } from '../constructs/ram/types';
```

### Correct Example

```typescript
// ✅ CORRECT - Import from barrel
import { VpcConstruct } from './vpc';
import type { VpcProps } from './vpc';

// ✅ CORRECT - Combined import
import { RamShare, RamShareProps } from '../constructs/ram';

// ✅ CORRECT - Separate type import
import { RamShare } from '../constructs/ram';
import type { RamShareProps } from '../constructs/ram';
```

### Fix

1. Always import from `index.ts` barrel file
2. Use `import type` for type-only imports
3. Only public exports should be in `index.ts`

**See**: [L2/structure.md](../L2/structure.md) - Module structure

---

## AP-004: Inline Interface Definitions

**Severity**: MEDIUM

### Problem

Defining complex interfaces inline in arrays or properties, making them non-exportable and non-reusable.

### Why This Is Wrong

- Can't export or reuse the type
- Harder to document
- Reduces code reusability
- Makes types harder to find

### Incorrect Example

```typescript
// ❌ INCORRECT
interface TierProps {
  segments: Array<{           // ❌ Inline - can't export or reuse
    index?: number;
    name?: string;
    cidr?: CidrFamily;
    routes?: Array<{          // ❌ Nested inline - even worse!
      destination: string;
      target: string;
    }>;
  }>;
}

// Can't do this:
// import type { Segment } from './types';  // Doesn't exist!
```

### Correct Example

```typescript
// ✅ CORRECT
export interface Route {
  readonly destination: string;
  readonly target: string;
}

export interface Segment {
  readonly index?: number;
  readonly name?: string;
  readonly cidr?: CidrFamily;
  readonly routes?: Route[];
}

interface TierProps {
  readonly segments: Segment[];
}

// Now can import and reuse:
import type { Segment, Route } from './types';
```

### Fix

1. Extract inline interfaces to named types in `types.ts`
2. Export them for reusability
3. Add JSDoc comments

---

## AP-005: File Extension in Imports

**Severity**: HIGH

### Problem

Including `.ts` extension in import paths.

### Why This Is Wrong

- TypeScript doesn't require extensions
- Breaks when compiled to JavaScript
- Violates TypeScript conventions

### Incorrect Example

```typescript
// ❌ INCORRECT
import type { VpcProps } from './vpc/types.ts';
import { SecureBucket } from './s3/SecureBucket.ts';
import * as cidr from '../core/networking/cidr/index.ts';
```

### Correct Example

```typescript
// ✅ CORRECT
import type { VpcProps } from './vpc/types';
import { SecureBucket } from './s3/SecureBucket';
import * as cidr from '../core/networking/cidr';
```

### Fix

Remove file extensions from all imports.

---

## AP-006: Ambiguous CIDR Reference

**Severity**: HIGH

### Problem

Using deprecated or ambiguous CIDR reference format that omits `allocations` array and IP family.

### Why This Is Wrong

- Ambiguous which allocation is referenced
- Ambiguous which IP family (IPv4 or IPv6)
- Deprecated format
- Breaks with multiple allocations

### Incorrect Example

```yaml
# ❌ INCORRECT
ref:
  parent: 'vpc.cidr[0]'         # Missing .allocations and .ipv4

# ❌ INCORRECT
ref:
  parent: 'vpc.cidr.ipv4'       # Missing .allocations
```

### Correct Example

```yaml
# ✅ CORRECT
ref:
  parent: 'vpc.cidr.allocations[0].ipv4'

# ✅ CORRECT
ref:
  parent: 'vpc.cidr.allocations[1].ipv6'
```

### Fix

Use full dot-notation path: `{resource}.cidr.allocations[{index}].{family}`

---

## AP-008: Validation After Resource Creation

**Severity**: CRITICAL

### Problem

Creating AWS resources before validating props. If validation fails, resources are already created in the CDK tree.

### Why This Is Wrong

- Resources created before validation
- Hard to debug (error after creation)
- Can cause CDK synthesis errors
- Violates fail-fast principle

### Incorrect Example

```typescript
// ❌ INCORRECT
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // ❌ Creating resource BEFORE validation
  this.vpc = new ec2.Vpc(this, 'Vpc', {
    cidr: props.cidr,
  });
  
  // ❌ Validation TOO LATE - VPC already in CDK tree!
  if (!props.name) {
    throw new Error('name is required');
  }
  
  if (props.zone && props.zones) {
    throw new Error("Can't have both zone and zones");
  }
}
```

### Correct Example

```typescript
// ✅ CORRECT
constructor(scope: Construct, id: string, props: VpcProps) {
  super(scope, id);
  
  // ✅ Validate FIRST (in order)
  this.validateRequired(props);
  this.validateMutualExclusivity(props);
  this.validateRanges(props);
  
  // ✅ Then create resources
  this.vpc = new ec2.Vpc(this, 'Vpc', {
    cidr: props.cidr,
  });
}

private validateRequired(props: VpcProps): void {
  if (!props.name) {
    throw new Error("VpcConstruct: 'name' is required.");
  }
}

private validateMutualExclusivity(props: VpcProps): void {
  if (props.zone && props.zones) {
    throw new Error(
      "VpcConstruct: Cannot specify both 'zone' and 'zones'."
    );
  }
}
```

### Fix

**Always follow this order in constructor**:

1. Call `super(scope, id)`
2. Validate required fields
3. Validate mutual exclusivity
4. Validate ranges/constraints
5. Validate enum values
6. Validate indexed arrays
7. THEN create resources

**See**: [testing/validation.md](../testing/validation.md) - Validation order

---

## AP-013: Magic Numbers

**Severity**: MEDIUM

### Problem

Using unexplained numbers directly in code without constants.

### Why This Is Wrong

- Unclear meaning
- Hard to maintain
- Can't reuse
- Hard to update if value changes

### Incorrect Example

```typescript
// ❌ INCORRECT
if (zoneCount > 4) {           // Why 4?
  throw new Error('Too many zones');
}

const subnetSize = vpcSize / 256;  // Why 256?

if (props.timeout > 3600) {    // What's 3600?
  console.warn('Timeout too long');
}
```

### Correct Example

```typescript
// ✅ CORRECT
const MAX_AVAILABILITY_ZONES = 4;
const BITS_PER_SUBNET = 8;  // /8 = 256 addresses
const MAX_TIMEOUT_SECONDS = 3600;  // 1 hour

if (zoneCount > MAX_AVAILABILITY_ZONES) {
  throw new Error(
    `VpcConstruct: 'zone.count' must be 1-${MAX_AVAILABILITY_ZONES}, got ${zoneCount}.`
  );
}

const subnetSize = vpcSize / Math.pow(2, BITS_PER_SUBNET);

if (props.timeout > MAX_TIMEOUT_SECONDS) {
  console.warn(`Timeout ${props.timeout}s exceeds recommended maximum ${MAX_TIMEOUT_SECONDS}s`);
}
```

### Fix

1. Extract magic numbers to named constants
2. Put constants in `constants.ts` if shared
3. Use descriptive names
4. Add comments explaining the value

---

## AP-014: Missing Type Guards

**Severity**: MEDIUM

### Problem

Not providing type guards for union types, preventing TypeScript type narrowing.

### Why This Is Wrong

- TypeScript can't narrow types
- Lose type safety
- More runtime checks needed
- Can lead to runtime errors

### Incorrect Example

```typescript
// ❌ INCORRECT
function processCidr(cidr: CidrBase) {
  if (cidr.block) {            // ❌ TypeScript doesn't narrow type
    // cidr.block might still be undefined in TypeScript's view
    const length = cidr.block.length;  // Could error
  }
}

interface CidrBase {
  readonly block?: string;
  readonly auto?: boolean;
  readonly ref?: CidrRef;
}
```

### Correct Example

```typescript
// ✅ CORRECT
function isBlockCidr(cidr: CidrBase): cidr is { block: string } {
  return 'block' in cidr && cidr.block !== undefined;
}

function isAutoCidr(cidr: CidrBase): cidr is { auto: boolean } {
  return 'auto' in cidr && cidr.auto !== undefined;
}

function isRefCidr(cidr: CidrBase): cidr is { ref: CidrRef } {
  return 'ref' in cidr && cidr.ref !== undefined;
}

function processCidr(cidr: CidrBase) {
  if (isBlockCidr(cidr)) {
    // ✅ TypeScript knows cidr.block is string
    const length = cidr.block.length;
  } else if (isAutoCidr(cidr)) {
    // ✅ TypeScript knows cidr.auto is boolean
    console.log('Auto-assign:', cidr.auto);
  } else if (isRefCidr(cidr)) {
    // ✅ TypeScript knows cidr.ref is CidrRef
    console.log('Reference:', cidr.ref.parent);
  }
}
```

### Fix

1. Add type guard functions for union types
2. Use `is` keyword for type predicates
3. Check both presence and type

---

## AP-015: Inconsistent Error Messages

**Severity**: MEDIUM

### Problem

Using inconsistent error message formats across constructs.

### Why This Is Wrong

- Hard to parse for users
- Hard to search/grep
- Looks unprofessional
- Harder to understand errors

### Incorrect Example

```typescript
// ❌ INCORRECT - inconsistent formats
throw new Error('name required');
throw new Error('The zone.count value is invalid');
throw new Error(`Cannot have both zone and zones`);
throw new Error('INVALID: cidr property missing');
throw new Error('Error: bucket name too long');
```

### Correct Example

```typescript
// ✅ CORRECT - consistent templates
throw new Error("VpcConstruct: 'name' is required.");
throw new Error("VpcConstruct: 'zone.count' must be 1-4, got 5.");
throw new Error("VpcConstruct: Cannot specify both 'zone' and 'zones'.");
throw new Error("VpcConstruct: 'cidr' is required.");
throw new Error("S3Bucket: 'bucketName' must be 3-63 characters, got 2.");
```

### Error Message Template

```text
{ConstructName}: {error message}

Templates:
- Required: "{ConstructName}: '{property}' is required."
- Mutual exclusivity: "{ConstructName}: Cannot specify both '{prop1}' and '{prop2}'."
- Range: "{ConstructName}: '{property}' must be {min}-{max}, got {actual}."
- Enum: "{ConstructName}: '{property}' must be one of: {values}, got {actual}."
- Pattern: "{ConstructName}: '{property}' must match pattern {pattern}, got {actual}."
```

### Fix

Use consistent error message templates from [testing/validation.md](../testing/validation.md).

---

## AP-016: Bespoke Objects for Common Concepts

**Severity**: HIGH

### Problem

Creating custom properties instead of reusing existing common interface objects.

### Why This Is Wrong

- Duplicates existing interfaces
- Creates inconsistency across constructs
- Increases maintenance burden
- Harder for developers to learn
- Different patterns per construct confuses users

### Incorrect Example

```typescript
// ❌ INCORRECT - Bespoke RAM Share properties
export interface SubnetProps {
  readonly cidr: CidrFamily;
  readonly shareName?: string;                    // ❌ Custom
  readonly shareTargets?: string[];               // ❌ Custom
  readonly shareAllowExternalPrincipals?: boolean; // ❌ Custom
}

// ❌ INCORRECT - Bespoke encryption properties
export interface BucketProps {
  readonly name: string;
  readonly encryptionType?: 'S3' | 'KMS';         // ❌ Custom
  readonly encryptionKeyArn?: string;             // ❌ Custom
}

// ❌ INCORRECT - Bespoke zone properties
export interface VpcProps {
  readonly availabilityZoneCount?: number;        // ❌ Custom
  readonly availabilityZoneIds?: string[];        // ❌ Custom
}
```

### Correct Example

```typescript
// ✅ CORRECT - Reusing RamShareProps
import type { RamShareProps } from '../ram';

export interface SubnetProps {
  readonly cidr: CidrFamily;
  readonly share?: RamShareProps;                 // ✅ Reuse
}

// ✅ CORRECT - Reusing standard KMS pattern
import type * as kms from 'aws-cdk-lib/aws-kms';

export interface BucketProps {
  readonly name: string;
  readonly kmsKey?: kms.IKey | string;            // ✅ Standard
}

// ✅ CORRECT - Reusing ZoneConfig/ZoneSpec
export interface VpcProps {
  readonly zone?: ZoneConfig;                     // ✅ Reuse
  readonly zones?: ZoneSpec[];                    // ✅ Reuse
}
```

### Common Interfaces to Reuse

| Attribute | Type | Use For |
|-----------|------|---------|
| `share` | `RamShareProps` | RAM resource sharing |
| `kmsKey` | `kms.IKey \| string` | Encryption (single key) |
| `tags` | `Record<string, string>` | Resource tagging |
| `zone`/`zones` | `ZoneConfig`/`ZoneSpec[]` | Availability zones |
| `cidr` | `CidrConfig`/`CidrFamily`/`CidrBase` | IP addressing |

### Fix

1. Review [types.md](./types.md) for existing common types
2. Import and reuse existing interfaces
3. Don't create bespoke properties for common concepts

---

## AP-017: Piecemeal Imports from Non-Index

**Severity**: HIGH

### Problem

Importing from multiple internal files instead of barrel (`index.ts`).

### Why This Is Wrong

- Breaks encapsulation
- Exposes internal structure
- Creates tight coupling
- Makes refactoring harder
- Violates conventions

### Incorrect Example

```typescript
// ❌ INCORRECT - Multiple file imports
import { RamShare } from '../constructs/ram/Share';
import type { RamShareProps } from '../constructs/ram/types';
import { InternalHelper } from '../constructs/ram/internal-helper';
import { validateShare } from '../constructs/ram/validation';

// ❌ INCORRECT - Reaching into subdirectories
import { Vpc } from '../constructs/vpc/Vpc';
import { VpcCidr } from '../constructs/vpc/cidr/VpcCidr';
import type { CidrConfig } from '../constructs/vpc/cidr/types';
```

### Correct Example

```typescript
// ✅ CORRECT - Single barrel import
import { RamShare } from '../constructs/ram';
import type { RamShareProps } from '../constructs/ram';

// ✅ CORRECT - Combined import
import { RamShare, RamShareProps } from '../constructs/ram';

// ✅ CORRECT - Single module import
import { Vpc } from '../constructs/vpc';
import type { VpcProps, CidrConfig } from '../constructs/vpc';
```

### Fix

1. Always import from module's `index.ts` barrel
2. Use `import type` for type-only imports
3. Combine imports from same module

---

## Code Review Checklist

When reviewing code, check for these anti-patterns by severity:

### Critical (MUST FIX)

- [ ] **AP-002**: Both singular and plural without validation
- [ ] **AP-008**: Validation after resource creation

### High (SHOULD FIX)

- [ ] **AP-001**: Redundant `enabled` flags
- [ ] **AP-003**: Direct file imports
- [ ] **AP-005**: File extensions in imports
- [ ] **AP-006**: Ambiguous CIDR references
- [ ] **AP-009**: Wrong CIDR layer
- [ ] **AP-016**: Bespoke objects for common concepts
- [ ] **AP-017**: Piecemeal imports from non-index

### Medium (RECOMMENDED)

- [ ] **AP-004**: Inline interface definitions
- [ ] **AP-007**: Types in construct file
- [ ] **AP-010**: Scattered related properties
- [ ] **AP-013**: Magic numbers
- [ ] **AP-014**: Missing type guards
- [ ] **AP-015**: Inconsistent error messages

### Low (NICE TO FIX)

- [ ] **AP-011**: Unnecessary object wrappers
- [ ] **AP-012**: `count` on array items

---

## AI Agent Guidelines

### Before Creating Code

Review this checklist:

1. **Check naming**: Singular for objects, plural for arrays
2. **Check mutual exclusivity**: Validate if both singular/plural exist
3. **Check imports**: Use barrel imports from `index.ts`
4. **Check types**: Put types in `types.ts`, not in construct file
5. **Check validation**: Validate BEFORE creating resources
6. **Check reusability**: Use common interfaces, not bespoke
7. **Check error messages**: Use consistent templates

### During Code Creation

Ask yourself:

- Is this a common concept? → Check [types.md](./types.md) for existing interface
- Am I using both singular and plural? → Add mutual exclusivity validation
- Am I importing from internal files? → Use barrel import
- Am I creating resources? → Did I validate first?
- Am I using a magic number? → Extract to constant
- Is my error message consistent? → Use template

### After Code Creation

Run this checklist:

- [ ] No redundant `enabled` flags
- [ ] No singular/plural conflicts (or validated)
- [ ] All imports from barrel (`index.ts`)
- [ ] No inline interfaces (extracted to `types.ts`)
- [ ] No `.ts` extensions in imports
- [ ] Validation BEFORE resource creation
- [ ] Using common interfaces (not bespoke)
- [ ] Consistent error messages

---

## References

- **Naming Conventions**: [naming.md](./naming.md)
- **Common Types**: [types.md](./types.md)
- **Validation Patterns**: [testing/validation.md](../testing/validation.md)
- **Module Structure**: [L2/structure.md](../L2/structure.md)

---

## Related Standards

- [naming.md](./naming.md) - Naming conventions
- [types.md](./types.md) - Common types to reuse
- [testing/validation.md](../testing/validation.md) - Validation order and templates
- [L2/structure.md](../L2/structure.md) - Module file organization

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

