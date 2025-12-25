# Common Standards (Cross-Layer)

**Entry Point**: Cross-Layer Standards for AI Agents

**Layer**: Common (Applies to All Layers)  
**Audience**: AI Agents and Developers  
**Scope**: L2, L3, and L4 constructs  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This directory contains **cross-layer standards** that apply to all construct layers (L2, L3, L4). These are foundational standards for naming, types, security, testing, validation, and code quality.

**Core Philosophy**: Consistency across all layers enables predictability and maintainability.

---

## Quick Reference

| Standard | Purpose | When to Read |
|----------|---------|--------------|
| **[naming.md](./naming.md)** | Naming conventions | Defining any interface or property |
| **[types.md](./types.md)** | Canonical shared types | Before creating new types |
| **[security.md](./security.md)** | Security best practices | Creating any construct |
| **[typescript.md](./typescript.md)** | SOLID principles, patterns | Writing any TypeScript code |
| **[anti-patterns.md](./anti-patterns.md)** | Common mistakes | Code review or before coding |
| **[modules.md](./modules.md)** | Module consumption | Importing constructs or utilities |

---

## Decision Tree: Which Standard Do I Need?

### Starting Point: What Am I Doing?

```text
What am I doing?

├── Defining an interface or property?
│   └── READ: naming.md
│       Question: Is this an object or array?
│       - Object → Singular name (zone: {...})
│       - Array → Plural name (zones: [...])
│
├── Need a type for logging, tags, encryption, etc.?
│   └── READ: types.md
│       Check: Does canonical type already exist?
│       - Yes → Reuse it
│       - No → Create new (follow template)
│
├── Creating any construct that touches AWS resources?
│   └── READ: security.md
│       Checklist:
│       - [ ] Encryption at rest enabled?
│       - [ ] SSL/TLS enforced?
│       - [ ] Public access blocked?
│       - [ ] IAM least privilege?
│       - [ ] Logging enabled?
│
├── Writing TypeScript code?
│   └── READ: typescript.md
│       Topics: SOLID, design patterns, functional programming
│
├── Reviewing code or before coding?
│   └── READ: anti-patterns.md
│       Review: 17 common mistakes to avoid
│
└── Importing a construct or utility?
    └── READ: modules.md
        Rule: Import from index.ts barrel only

For SDLC processes (PRs, stories):
└── See: ../sdlc/README.md
```

---

## Standards Documents

### Core Standards (Most Important)

#### [naming.md](./naming.md) - Naming Conventions

**Purpose**: Rules for naming interfaces, properties, and identifiers

**Key Rules**:
- Singular for objects: `zone: { count: 3 }`
- Plural for arrays: `zones: [{ id: 'a' }]`
- Validate mutual exclusivity if both exist
- Presence implies enablement (no `enabled` flag)
- Flatten single-property objects
- Group 3+ related properties

**When to Read**: Before defining any interface or property

---

#### [types.md](./types.md) - Canonical Shared Types

**Purpose**: Reusable types for logging, observability, tags, encryption, naming

**Key Types**:
- `LogConfig` - Logging configuration
- `ObservabilityConfig` - Monitoring and tracing
- `Tags` - Resource tagging
- `EncryptionConfig` - KMS encryption
- `NamingConfig` - Resource naming patterns

**When to Read**: Before creating new types for common concepts

---

#### [security.md](./security.md) - Security Best Practices

**Purpose**: Security-first patterns for all constructs

**Key Rules**:
- Encryption at rest MUST be enabled by default
- SSL/TLS MUST be enforced for data in transit
- Public access MUST be blocked by default
- IAM MUST use least privilege
- Logging SHOULD be enabled by default
- Secrets MUST use Secrets Manager/SSM

**When to Read**: Before creating any construct that touches AWS resources

---

#### [anti-patterns.md](./anti-patterns.md) - Common Mistakes

**Purpose**: Catalog of mistakes to avoid

**Top Anti-Patterns**:
- AP-002 (CRITICAL): Both singular and plural without validation
- AP-008 (CRITICAL): Validation after resource creation
- AP-016 (HIGH): Bespoke objects for common concepts
- AP-003 (HIGH): Direct file imports

**When to Read**: During code review or before starting to code

---

---

### Code Quality Standards

#### [typescript.md](./typescript.md) - TypeScript Best Practices

**Purpose**: SOLID principles, design patterns, functional programming

**Topics**:
- SOLID principles (SRP, OCP, LSP, ISP, DIP)
- Design patterns (Factory, Builder, Strategy, Observer)
- Functional programming (pure functions, immutability)
- Async/await best practices
- Error handling patterns
- Performance considerations

**When to Read**: Writing any TypeScript code

**Size**: ~3,665 lines (comprehensive reference)

---

#### [modules.md](./modules.md) - Module Consumption

**Purpose**: How to import and use constructs

**Key Rules**:
- Always import from `index.ts` barrel
- Use namespace import for utilities: `import * as cidr from '../core/networking/cidr'`
- Use named import for constructs: `import { SecureVpc } from '../constructs/vpc'`
- Use `import type` for type-only imports
- Never import from internal files

**When to Read**: Importing any construct or utility


## Workflows

### Workflow 1: Creating a New Construct

```text
Step 1: Design Interface
├─ Read: naming.md (naming rules)
├─ Read: types.md (check for existing types)
└─ Read: security.md (security requirements)

Step 2: Implement Construct
├─ Read: typescript.md (SOLID principles)
├─ Read: anti-patterns.md (avoid mistakes)
└─ Follow layer-specific standards:
    - L2: Read ../L2/ standards
    - L3: Read ../L3/ standards
    - L4: Read ../L4/ standards

Step 3: Test Construct
└─ Read: ../testing/README.md (testing requirements)

Step 4: Create Pull Request
└─ Read: ../sdlc/pull-request.md (PR template)
```

---

### Workflow 2: Code Review

```text
Step 1: Check Anti-Patterns
└─ Read: anti-patterns.md
    Review checklist:
    - [ ] CRITICAL: AP-002, AP-008
    - [ ] HIGH: AP-001, AP-003, AP-016, AP-017
    - [ ] MEDIUM: AP-004, AP-007, AP-013, AP-015
    - [ ] LOW: AP-011, AP-012

Step 2: Check Naming
└─ Read: naming.md
    - [ ] Singular for objects, plural for arrays?
    - [ ] Mutual exclusivity validated?
    - [ ] No redundant `enabled` flags?

Step 3: Check Security
└─ Read: security.md
    - [ ] Encryption at rest?
    - [ ] SSL/TLS enforced?
    - [ ] Public access blocked?
    - [ ] IAM least privilege?

Step 4: Check Types
└─ Read: types.md
    - [ ] Reusing canonical types?
    - [ ] No bespoke interfaces for common concepts?
```

---

### Workflow 3: Defining a New Common Type

```text
Step 1: Check if Type Exists
└─ Read: types.md
    Search for similar concepts

Step 2: If Doesn't Exist, Create
└─ Follow template in types.md:
    1. Define interface
    2. Add JSDoc comments
    3. Add examples
    4. Document extension patterns
    5. Add to catalog

Step 3: Update Documentation
└─ Add to types.md catalog
```

---

## AI Agent Guidelines

### Quick Checklist Before Creating Any Code

- [ ] **Naming follows conventions** (singular/plural)
- [ ] **Types are reused** (not bespoke)
- [ ] **Security by default** (encryption, SSL, blocked public access)
- [ ] **Validation before resources** (fail-fast)
- [ ] **Imports from barrels** (index.ts only)
- [ ] **No anti-patterns** (review list)
- [ ] **Error messages consistent** (use templates)

---

### Decision Logic for Common Tasks

#### Task: Name a Property

```text
Is it an object with named properties?
├─ YES → Singular (zone: { count: 3 })
└─ NO ↓
    Is it an array?
    ├─ YES → Plural (zones: [{ id: 'a' }])
    └─ NO → Primitive, singular (name: 'vpc')
```

**See**: [naming.md](./naming.md)

---

#### Task: Define a Type

```text
Is this for logging, tags, encryption, observability, or naming?
├─ YES → Check types.md for canonical type
│   ├─ Exists → Reuse it
│   └─ Doesn't exist → Create following template
└─ NO → Domain-specific type (define in your types.ts)
```

**See**: [types.md](./types.md)

---

#### Task: Validate Props

```text
Order of validation (ALWAYS in constructor):
1. Validate required fields
2. Validate mutual exclusivity
3. Validate ranges/constraints
4. Validate enums
5. Validate indexed arrays
6. THEN create resources
```

**See**: [../testing/validation.md](../testing/validation.md)

---

#### Task: Import a Construct

```text
How to import:
├─ Construct → import { MyConstruct } from '../constructs/my-construct'
├─ Type → import type { MyProps } from '../constructs/my-construct'
├─ Utility → import * as myUtil from '../core/my-util'
└─ NEVER from internal files → ❌ './my-construct/MyConstruct'
```

**See**: [modules.md](./modules.md)

---

## Layer Navigation

### Relationship to Layer Standards

Common standards apply to **ALL layers** (L2, L3, L4):

```text
standards/
├── common/          ← YOU ARE HERE (cross-layer)
│   ├── naming.md
│   ├── types.md
│   ├── security.md
│   ├── typescript.md
│   ├── anti-patterns.md
│   ├── modules.md
│   ├── pull-request.md
│   └── stories.md
│
├── L2/              ← L2-specific standards
│   ├── README.md    (L2 entry point)
│   ├── constructs.md
│   ├── interface.md
│   ├── structure.md
│   └── inheritance.md
│
├── L3/              ← L3-specific standards
│   ├── README.md    (L3 entry point)
│   ├── constructs.md
│   ├── interface.md
│   ├── structure.md
│   └── composition.md
│
├── L4/              ← L4-specific (future)
│   └── README.md    (use L3 for now)
│
└── testing/         ← Testing standards
    ├── README.md    (testing entry point)
    ├── unit.md
    ├── integration.md
    ├── validation.md
    └── stack.md
```

**Rule**: Read common/ standards FIRST, then read layer-specific standards.

---

### Navigation Links

- **Up**: [standards/](../) - Main standards index
- **Layer-Specific**:
  - [constructs/](../constructs/) - All construct standards (L2/L3/L4)
  - [L2/](../constructs/L2/) - Platform primitives
  - [L3/](../constructs/L3/) - Composition patterns
  - [L4/](../constructs/L4/) - Architectural solutions (future)
- **Testing**: [testing/](../testing/) - Testing standards
- **SDLC Process**: [sdlc/](../sdlc/) - PR and story creation

---

## Common Patterns Quick Reference

### Pattern: Count-Based vs Explicit List

```typescript
// ✅ Provide both options (mutually exclusive)
interface VpcProps {
  readonly zone?: { count: number };     // Singular object
  readonly zones?: Array<{ id: string }>; // Plural array
}

// Constructor validates
if (props.zone && props.zones) {
  throw new Error("Cannot specify both 'zone' and 'zones'.");
}
```

---

### Pattern: Presence Implies Enablement

```typescript
// ✅ CORRECT: No enabled flag
interface VpcProps {
  readonly flowLog?: {
    trafficType: string;    // Presence = enabled
  };
}

// ❌ INCORRECT: Redundant enabled
interface VpcProps {
  readonly flowLog?: {
    enabled: boolean;       // ❌ Redundant
    trafficType: string;
  };
}
```

---

### Pattern: Reuse Canonical Types

```typescript
// ✅ CORRECT: Reuse canonical types
import type { LogConfig, Tags, EncryptionConfig } from '@/core/common';

interface MyConstructProps {
  readonly logs?: ReadonlyArray<LogConfig>;
  readonly tags?: Tags;
  readonly encryption?: EncryptionConfig;
}

// ❌ INCORRECT: Bespoke types
interface MyConstructProps {
  readonly logDestination?: string;      // ❌ Bespoke
  readonly resourceTags?: Record<...>;   // ❌ Bespoke
  readonly kmsKeyArn?: string;           // ❌ Bespoke
}
```

---

### Pattern: Import from Barrel

```typescript
// ✅ CORRECT
import { SecureVpc } from '../constructs/vpc';
import type { VpcProps } from '../constructs/vpc';

// ❌ INCORRECT
import { SecureVpc } from '../constructs/vpc/Vpc';
import type { VpcProps } from '../constructs/vpc/types';
```

---

## Troubleshooting

### Issue: "Should this be singular or plural?"

**Answer**: Look at the type
- Object type? → Singular name
- Array type? → Plural name

**See**: [naming.md](./naming.md)

---

### Issue: "Should I create a new type or reuse existing?"

**Answer**: Check [types.md](./types.md) first
- For logging, tags, encryption, observability → Use canonical types
- For domain-specific concepts → Create new type

---

### Issue: "Where do I import from?"

**Answer**: Always from `index.ts` barrel
- ✅ `from '../constructs/vpc'`
- ❌ `from '../constructs/vpc/Vpc'`

**See**: [modules.md](./modules.md)

---

### Issue: "When do I validate props?"

**Answer**: BEFORE creating any resources

**Order**:
1. `super(scope, id)`
2. Validate required
3. Validate mutual exclusivity
4. Validate ranges
5. THEN create resources

**See**: [../testing/validation.md](../testing/validation.md)

---

## Examples

### Example 1: Create Interface with Canonical Types

```typescript
import type { LogConfig, Tags, EncryptionConfig } from '@/core/common';
import type { ZoneConfig, ZoneSpec } from '../constructs/vpc';

/**
 * Properties for SecureBucket.
 */
export interface SecureBucketProps {
  /**
   * Bucket name.
   * Must be DNS-compliant.
   */
  readonly name: string;
  
  /**
   * KMS encryption configuration.
   * If not provided, uses S3-managed encryption.
   */
  readonly encryption?: EncryptionConfig;
  
  /**
   * Logging configuration.
   * Logs bucket access to specified destinations.
   */
  readonly logs?: ReadonlyArray<LogConfig>;
  
  /**
   * Resource tags.
   * Applied to bucket and related resources.
   */
  readonly tags?: Tags;
  
  /**
   * Availability zone configuration.
   * Use either zone (count-based) OR zones (explicit list).
   */
  readonly zone?: ZoneConfig;
  readonly zones?: ZoneSpec[];
}
```

---

### Example 2: Validate Props

```typescript
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id);
    
    // 1. Validate required
    if (!props.name) {
      throw new Error("SecureBucket: 'name' is required.");
    }
    
    // 2. Validate mutual exclusivity
    if (props.zone && props.zones) {
      throw new Error("SecureBucket: Cannot specify both 'zone' and 'zones'.");
    }
    
    // 3. Validate ranges
    if (props.zone && (props.zone.count < 1 || props.zone.count > 4)) {
      throw new Error(
        `SecureBucket: 'zone.count' must be 1-4, got ${props.zone.count}.`
      );
    }
    
    // 4. NOW create resources
    // ... resource creation
  }
}
```

---

## References

All common standards link back to:

- **Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)
- **Layer Standards**: [../L2/](../L2/), [../L3/](../L3/), [../L4/](../L4/)
- **Testing Standards**: [../testing/](../testing/)

---

## Summary

This directory contains cross-layer standards that apply to all constructs:

**Core Standards** (Read First):
1. [naming.md](./naming.md) - How to name things
2. [types.md](./types.md) - What types to reuse
3. [security.md](./security.md) - How to be secure
4. [anti-patterns.md](./anti-patterns.md) - What to avoid

**Reference Standards**:
5. [typescript.md](./typescript.md) - SOLID principles and patterns
6. [modules.md](./modules.md) - How to import

**SDLC Process Standards** (in [../sdlc/](../sdlc/)):
7. [../sdlc/pull-request.md](../sdlc/pull-request.md) - How to create PRs
8. [../sdlc/stories.md](../sdlc/stories.md) - How to create stories

**Start Here**: If you're an AI agent creating a construct, read in this order:
1. [naming.md](./naming.md)
2. [types.md](./types.md)
3. [security.md](./security.md)
4. [anti-patterns.md](./anti-patterns.md)
5. Then read layer-specific standards ([L2/](../L2/), [L3/](../L3/), [L4/](../L4/))

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

