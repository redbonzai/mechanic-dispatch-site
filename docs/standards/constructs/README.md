# Construct Standards (All Layers)

**Entry Point**: CDK Construct Standards for All Layers

**Audience**: AI Agents and Developers  
**Scope**: L2, L3, and L4 CDK constructs  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This directory contains **all construct layer standards** (L2, L3, L4) for building AWS CDK constructs. Each layer has specific patterns, responsibilities, and design principles.

**Core Philosophy**: Right tool for the right job - choose the appropriate layer for your use case.

---

## Quick Reference

| Layer | Pattern | Resources | Use Case | Location |
|-------|---------|-----------|----------|----------|
| **[L2](./L2/)** | Inheritance or Utility | Single AWS resource or none | Reusable building blocks | `src/core/**` or `src/constructs/**` |
| **[L3](./L3/)** | Composition | Multiple AWS resources | Design patterns | `src/constructs/**` |
| **[L4](./L4/)** | Opinionated Composition | Multiple AWS resources | Architectural solutions | **Not implemented** (use L3) |

---

## Decision Tree: Which Layer Do I Need?

### Starting Point: What Am I Building?

```text
What am I building?

├── Pure TypeScript utilities (no AWS resources)?
│   └── L2 Utility Module
│       • Location: src/core/{capability}/
│       • Files: types.ts, functions.ts, index.ts
│       • Examples: CIDR calculator, tag helpers, validation functions
│       • READ: L2/structure.md → L2/interface.md
│
├── Wrapping/enhancing ONE AWS resource?
│   └── L2 Construct Module
│       • Location: src/constructs/{service}/
│       • Pattern: Inheritance (extends upstream construct)
│       • Files: types.ts, {Construct}.ts, index.ts
│       • Examples: SecureVpc, SecureBucket, SecureRole
│       • READ: L2/constructs.md → L2/inheritance.md → L2/interface.md
│
├── Combining MULTIPLE AWS resources into a pattern?
│   └── L3 Composition
│       • Location: src/constructs/{domain}/
│       • Pattern: Composition (uses multiple L2 constructs)
│       • Files: types.ts, {Construct}.ts, index.ts
│       • Examples: SecureWebsite, DataPipeline, NetworkStack
│       • READ: L3/constructs.md → L3/composition.md → L3/interface.md
│
└── Creating an opinionated architectural solution?
    └── L4 (Not Implemented - Use L3 Instead)
        • Status: L4 standards don't exist yet
        • Alternative: Use L3 composition with clear documentation
        • Future: Will add opinions and architectural patterns
        • READ: L4/README.md (explains why to use L3)
```

---

## Layer Standards

### [L2/](./L2/) - Platform Primitives

**Purpose**: Reusable building blocks that wrap individual AWS resources or provide utilities

**Two Module Types**:

1. **Utility Modules** (no AWS resources)
   - Location: `src/core/**`
   - Pattern: Pure TypeScript (types + functions)
   - Examples: CIDR calculator, tag helpers
   - Files: `types.ts`, `functions.ts`, `index.ts`

2. **Construct Modules** (single AWS resource)
   - Location: `src/constructs/**`
   - Pattern: Inheritance (extends upstream construct)
   - Examples: SecureVpc, SecureBucket
   - Files: `types.ts`, `{Construct}.ts`, `index.ts`

**Key Standards**:
- [L2/README.md](./L2/README.md) - Entry point with decision trees
- [L2/structure.md](./L2/structure.md) - Module file layout
- [L2/constructs.md](./L2/constructs.md) - L2 construct patterns
- [L2/interface.md](./L2/interface.md) - Interface design
- [L2/inheritance.md](./L2/inheritance.md) - Extending AWS constructs

**When to Use**: Building blocks, secure defaults, single-resource wrappers

---

### [L3/](./L3/) - Composition Patterns

**Purpose**: Design patterns that compose multiple AWS resources into cohesive solutions

**Pattern**: Composition
- Uses multiple L2 constructs
- Implements design patterns
- No opinions (flexible, composable)
- Location: `src/constructs/**`

**Key Standards**:
- [L3/README.md](./L3/README.md) - Entry point with decision trees
- [L3/structure.md](./L3/structure.md) - Module file layout
- [L3/constructs.md](./L3/constructs.md) - L3 construct patterns
- [L3/interface.md](./L3/interface.md) - Interface design
- [L3/composition.md](./L3/composition.md) - Composition patterns (funnel, export-cascade)

**When to Use**: Multi-resource patterns, design patterns, flexible solutions

**Examples**:
- SecureWebsite (S3 + CloudFront + ACM)
- DataPipeline (S3 + Lambda + DynamoDB)
- NetworkStack (VPC + Subnets + Routes + Gateways)

---

### [L4/](./L4/) - Architectural Solutions (Not Implemented)

**Status**: ⚠️ **L4 standards do not exist yet**

**Current Guidance**: **Use L3 composition patterns instead**

**Why L4 Doesn't Exist Yet**:
- L2 and L3 provide sufficient flexibility
- Opinions can be layered on top of L3
- L4 would add architectural constraints
- Team hasn't needed opinionated solutions yet

**When L4 Will Be Created**:
- When team identifies repeated opinionated patterns
- When architectural standards need enforcement
- When specific use cases require rigid structure

**See**: [L4/README.md](./L4/README.md) for full explanation

---

## Workflows

### Workflow 1: Creating an L2 Utility Module

```text
Step 1: Verify No AWS Resources
└─ If creates AWS resources → Use L2 Construct instead

Step 2: Read Standards
└─ L2/structure.md → L2/interface.md

Step 3: Create Module Structure
└─ src/core/{capability}/
    ├── types.ts (public interfaces)
    ├── functions.ts (pure functions)
    └── index.ts (barrel exports)

Step 4: Implement
└─ Follow: ../common/typescript.md (SOLID principles)
└─ Follow: ../common/naming.md (naming conventions)
└─ Follow: ../common/security.md (if applicable)

Step 5: Test
└─ Follow: ../testing/unit.md (unit tests only)

Step 6: Create PR
└─ Follow: ../sdlc/pull-request.md
```

---

### Workflow 2: Creating an L2 Construct

```text
Step 1: Verify Single AWS Resource
└─ If multiple resources → Use L3 Composition instead

Step 2: Read Standards
└─ L2/constructs.md → L2/inheritance.md → L2/interface.md → L2/structure.md

Step 3: Create Module Structure
└─ src/constructs/{service}/
    ├── types.ts (public interfaces)
    ├── {Construct}.ts (construct class)
    └── index.ts (barrel exports)

Step 4: Implement
└─ Extend upstream construct (inheritance pattern)
└─ Add secure defaults
└─ Validate props before creating resources
└─ Follow: ../common/security.md (encryption, IAM, etc.)

Step 5: Test
└─ Follow: ../testing/unit.md (CDK assertions)
└─ Follow: ../testing/integration.md (Jest integration)
└─ Follow: ../testing/stack.md (deployment tests)

Step 6: Create PR
└─ Follow: ../sdlc/pull-request.md
```

---

### Workflow 3: Creating an L3 Composition

```text
Step 1: Verify Multiple AWS Resources
└─ If single resource → Use L2 Construct instead

Step 2: Read Standards
└─ L3/constructs.md → L3/composition.md → L3/interface.md → L3/structure.md

Step 3: Create Module Structure
└─ src/constructs/{domain}/
    ├── types.ts (public interfaces)
    ├── {Construct}.ts (composition class)
    └── index.ts (barrel exports with funnel pattern)

Step 4: Implement
└─ Compose multiple L2 constructs
└─ Use funnel pattern (two-export funnel)
└─ Expose composed resources via public properties
└─ Follow: ../common/security.md (security best practices)

Step 5: Test
└─ Follow: ../testing/unit.md (CDK assertions)
└─ Follow: ../testing/integration.md (Jest integration)
└─ Follow: ../testing/stack.md (deployment tests)

Step 6: Create PR
└─ Follow: ../sdlc/pull-request.md
```

---

## Layer Comparison

| Aspect | L2 Utility | L2 Construct | L3 Composition | L4 (Future) |
|--------|------------|--------------|----------------|-------------|
| **AWS Resources** | None | One | Multiple | Multiple |
| **Pattern** | Pure TypeScript | Inheritance | Composition | Opinionated Composition |
| **Location** | `src/core/**` | `src/constructs/**` | `src/constructs/**` | `src/constructs/**` |
| **Flexibility** | N/A | High | High | Low (opinionated) |
| **Use Case** | Utilities | Building blocks | Design patterns | Architectural solutions |
| **Example** | CIDR calculator | SecureVpc | SecureWebsite | (Not implemented) |

---

## Common Standards (Apply to All Layers)

All layers must follow these cross-layer standards:

| Standard | Purpose | Location |
|----------|---------|----------|
| **Naming** | Interface and property naming | [../common/naming.md](../common/naming.md) |
| **Types** | Canonical shared types | [../common/types.md](../common/types.md) |
| **Security** | Security best practices | [../common/security.md](../common/security.md) |
| **TypeScript** | SOLID principles, patterns | [../common/typescript.md](../common/typescript.md) |
| **Anti-Patterns** | Common mistakes | [../common/anti-patterns.md](../common/anti-patterns.md) |
| **Modules** | Module consumption | [../common/modules.md](../common/modules.md) |

**See**: [../common/README.md](../common/README.md) for complete common standards

---

## Testing Standards (Apply to All Layers)

All constructs must follow testing standards:

| Test Type | Scope | AWS Required? | Location |
|-----------|-------|---------------|----------|
| **Unit Tests** | CDK assertions | No | [../testing/unit.md](../testing/unit.md) |
| **Integration Tests** | Jest integration | No | [../testing/integration.md](../testing/integration.md) |
| **Validation** | Constructor validation | No | [../testing/validation.md](../testing/validation.md) |
| **Stack Tests** | CDK deployment | Yes | [../testing/stack.md](../testing/stack.md) |

**See**: [../testing/README.md](../testing/README.md) for complete testing standards

---

## AI Agent Guidelines

### Decision Logic

**Question 1**: Does it create AWS resources?
- **NO** → L2 Utility Module (src/core/**)
- **YES** → Continue to Question 2

**Question 2**: How many AWS resources?
- **ONE** → L2 Construct Module (src/constructs/**)
- **MULTIPLE** → Continue to Question 3

**Question 3**: Is it opinionated?
- **NO** (flexible, composable) → L3 Composition
- **YES** (rigid, architectural) → L4 (not implemented - use L3 with documentation)

---

### Quick Checklist for AI Agents

#### Before Creating Any Construct:

- [ ] **Layer determined** (L2 utility, L2 construct, or L3 composition)
- [ ] **Location correct** (src/core/** for utilities, src/constructs/** for constructs)
- [ ] **Pattern identified** (pure TypeScript, inheritance, or composition)
- [ ] **Standards read** (layer-specific + common + testing)
- [ ] **Module structure planned** (types.ts, functions.ts or {Construct}.ts, index.ts)

#### During Implementation:

- [ ] **Naming conventions followed** (singular/plural, validation)
- [ ] **Security by default** (encryption, SSL, blocked public access)
- [ ] **Validation before resources** (fail-fast in constructor)
- [ ] **Canonical types reused** (logging, tags, encryption, etc.)
- [ ] **No anti-patterns** (see ../common/anti-patterns.md)

#### After Implementation:

- [ ] **Tests written** (unit, integration, validation, stack)
- [ ] **Documentation updated** (JSDoc, examples)
- [ ] **PR created** (follow ../sdlc/pull-request.md)

---

## Examples

### Example 1: L2 Utility Module (CIDR Calculator)

```typescript
// src/core/networking/cidr/types.ts
export interface CidrBlock {
  readonly block: string;
  readonly prefix: number;
}

// src/core/networking/cidr/functions.ts
export function parse(cidr: string): CidrBlock {
  const [block, prefix] = cidr.split('/');
  return { block, prefix: parseInt(prefix, 10) };
}

export function isValid(cidr: string): boolean {
  // Validation logic
  return true;
}

// src/core/networking/cidr/index.ts
export * from './types';
export * from './functions';

// Usage (module namespace import)
import * as cidr from '../core/networking/cidr';

const block = cidr.parse('10.0.0.0/16');
const valid = cidr.isValid('10.0.0.0/16');
```

---

### Example 2: L2 Construct (SecureBucket)

```typescript
// src/constructs/s3/types.ts
export interface SecureBucketProps extends s3.BucketProps {
  readonly kmsKey?: kms.IKey | string;
}

// src/constructs/s3/SecureBucket.ts
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, {
      ...props,
      // Secure defaults
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });
  }
}

// src/constructs/s3/index.ts
export * from './types';
export * from './SecureBucket';

// Usage
import { SecureBucket } from '../constructs/s3';

const bucket = new SecureBucket(this, 'MyBucket', {
  bucketName: 'my-secure-bucket',
});
```

---

### Example 3: L3 Composition (SecureWebsite)

```typescript
// src/constructs/website/types.ts
export interface SecureWebsiteProps {
  readonly domainName: string;
  readonly certificate?: acm.ICertificate;
}

// src/constructs/website/SecureWebsite.ts
export class SecureWebsite extends Construct {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);

    // Compose multiple L2 constructs
    this.bucket = new SecureBucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    this.certificate = props.certificate ?? new acm.Certificate(this, 'Cert', {
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

// src/constructs/website/index.ts (funnel pattern)
export { SecureWebsite } from './SecureWebsite';
export type { SecureWebsiteProps } from './types';

// Usage
import { SecureWebsite } from '../constructs/website';

const website = new SecureWebsite(this, 'Website', {
  domainName: 'example.com',
});
```

---

## Troubleshooting

### Issue: "Should this be L2 or L3?"

**Decision Rule**: Count AWS resources
- **One resource** → L2 Construct
- **Multiple resources** → L3 Composition

---

### Issue: "Should this be a utility or construct?"

**Decision Rule**: Check for AWS resources
- **No AWS resources** → L2 Utility Module (src/core/**)
- **Has AWS resources** → L2 Construct Module (src/constructs/**)

---

### Issue: "Can I create L4 constructs?"

**Answer**: No - L4 standards don't exist yet

**Alternative**: Use L3 composition with clear documentation of your opinions

**See**: [L4/README.md](./L4/README.md)

---

### Issue: "Where do I put my construct files?"

**Answer**: Depends on type
- **L2 Utility** → `src/core/{capability}/`
- **L2 Construct** → `src/constructs/{service}/`
- **L3 Composition** → `src/constructs/{domain}/`

**See**: Layer-specific structure.md files

---

## Navigation

- **Up**: [standards/](../) - Main standards index
- **Layers**:
  - [L2/](./L2/) - Platform primitives (utilities and constructs)
  - [L3/](./L3/) - Composition patterns
  - [L4/](./L4/) - Architectural solutions (not implemented)
- **Related**:
  - [common/](../common/) - Cross-layer standards
  - [testing/](../testing/) - Testing standards
  - [sdlc/](../sdlc/) - SDLC process standards

---

## Summary

This directory contains all construct layer standards:

**Layers**:
1. [L2/](./L2/) - Platform primitives (utilities and constructs)
2. [L3/](./L3/) - Composition patterns
3. [L4/](./L4/) - Not implemented (use L3)

**Start Here**:
- Building utilities? → [L2/README.md](./L2/README.md)
- Wrapping one AWS resource? → [L2/README.md](./L2/README.md)
- Composing multiple resources? → [L3/README.md](./L3/README.md)
- Need opinionated solution? → [L3/README.md](./L3/README.md) (L4 not implemented)

**All constructs must also follow**:
- [../common/](../common/) - Cross-layer standards
- [../testing/](../testing/) - Testing standards

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

