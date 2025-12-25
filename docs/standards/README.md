# CDK Core Constructs Standards

**Entry Point**: All Standards for AWS CDK Construct Development

**Audience**: AI Agents and Developers  
**Authority**: [CLAUDE.md](../../CLAUDE.md)

---

## Quick Start: What Am I Doing?

### Decision Tree (Start Here)

```text
What am I doing?

├── Creating a CDK construct?
│   └─ READ: constructs/README.md (layer decision tree)
│      Questions:
│      • Does it create AWS resources? (No → L2 Utility, Yes → continue)
│      • How many AWS resources? (One → L2 Construct, Multiple → L3)
│      • Is it opinionated? (No → L3, Yes → L4 not implemented)
│
├── Naming interfaces or properties?
│   └─ READ: common/naming.md
│      Rules: Singular vs plural, presence==enablement, validation
│
├── Implementing security?
│   └─ READ: common/security.md
│      Defaults: Encryption, SSL, blocked public access, IAM least-privilege
│
├── Writing TypeScript code?
│   └─ READ: common/typescript.md
│      Patterns: SOLID principles, functional patterns
│
├── Reusing shared types (logging, tags, encryption)?
│   └─ READ: common/types.md
│      Types: LogConfig, Tags, Encryption, Naming
│
├── Testing constructs?
│   └─ READ: testing/README.md
│      Types: Unit, integration, validation, stack tests
│
├── Creating a pull request?
│   └─ READ: sdlc/pull-request.md
│      Template: Complete PR template with checklist
│
└── Creating a story or issue?
    └─ READ: sdlc/stories.md
        Templates: Feature, Bug, Tech Debt, Docs, Spike
```

---

## Standards Directory Structure

```text
docs/standards/
│
├── constructs/          ← All construct layers (L2/L3/L4)
│   ├── README.md        (Entry: layer decision tree)
│   ├── L2/              (Platform primitives)
│   ├── L3/              (Composition patterns)
│   └── L4/              (Architectural - future)
│
├── common/              ← Cross-layer standards
│   ├── README.md        (Entry: construct development)
│   ├── naming.md        (Interface/property naming)
│   ├── types.md         (Canonical shared types)
│   ├── security.md      (Security best practices)
│   ├── typescript.md    (SOLID principles, patterns)
│   ├── anti-patterns.md (Common mistakes)
│   └── modules.md       (Module consumption)
│
├── testing/             ← Testing standards
│   ├── README.md        (Entry: testing decision tree)
│   ├── unit.md          (CDK assertions)
│   ├── integration.md   (Jest integration)
│   ├── validation.md    (Constructor validation)
│   └── stack.md         (Deployment tests)
│
└── sdlc/                ← SDLC process
    ├── README.md        (Entry: PR & story creation)
    ├── pull-request.md  (PR template)
    └── stories.md       (Story/issue templates)
```

---

## Layer Definitions (Quick Reference)

| Layer | Pattern | Resources | Location | Use Case |
|-------|---------|-----------|----------|----------|
| **L1** | AWS-provided | N/A | `aws-cdk-lib` | AWS base constructs |
| **L2 Utility** | Pure TypeScript | None | `src/core/**` | CIDR calculator, tag helpers |
| **L2 Construct** | Inheritance | One | `src/constructs/**` | SecureBucket, SecureVpc |
| **L3** | Composition | Multiple | `src/constructs/**` | SecureWebsite, DataPipeline |
| **L4** | Opinionated | Multiple | **Not implemented** | Use L3 instead |

---

## AI Agent Quick Reference

### Task → Standards Mapping

| Task | Primary Standard | Related Standards |
|------|------------------|-------------------|
| **Create L2 utility** | [constructs/L2/structure.md](./constructs/L2/structure.md) | [constructs/L2/interface.md](./constructs/L2/interface.md) |
| **Create L2 construct** | [constructs/L2/constructs.md](./constructs/L2/constructs.md) | [constructs/L2/inheritance.md](./constructs/L2/inheritance.md), [constructs/L2/interface.md](./constructs/L2/interface.md) |
| **Create L3 composition** | [constructs/L3/composition.md](./constructs/L3/composition.md) | [constructs/L3/constructs.md](./constructs/L3/constructs.md), [constructs/L3/interface.md](./constructs/L3/interface.md) |
| **Name interface/property** | [common/naming.md](./common/naming.md) | [common/anti-patterns.md](./common/anti-patterns.md) |
| **Reuse shared types** | [common/types.md](./common/types.md) | [common/naming.md](./common/naming.md) |
| **Implement security** | [common/security.md](./common/security.md) | [common/anti-patterns.md](./common/anti-patterns.md) |
| **Write tests** | [testing/README.md](./testing/) | [testing/unit.md](./testing/unit.md), [testing/integration.md](./testing/integration.md) |
| **Create PR** | [sdlc/pull-request.md](./sdlc/pull-request.md) | [testing/README.md](./testing/) |
| **Create story** | [sdlc/stories.md](./sdlc/stories.md) | [sdlc/README.md](./sdlc/) |

---

## Workflows (Agent Guidance)

### Workflow 1: Creating a Construct

```text
Step 1: Determine Layer
└─ READ: constructs/README.md (decision tree)
   Answer: L2 Utility, L2 Construct, or L3 Composition

Step 2: Read Layer-Specific Standards
├─ L2 Utility → constructs/L2/structure.md, constructs/L2/interface.md
├─ L2 Construct → constructs/L2/constructs.md, constructs/L2/inheritance.md
└─ L3 Composition → constructs/L3/composition.md, constructs/L3/constructs.md

Step 3: Apply Common Standards (All)
├─ Naming → common/naming.md
├─ Types → common/types.md (reuse canonical types)
├─ Security → common/security.md (secure defaults)
└─ TypeScript → common/typescript.md (SOLID principles)

Step 4: Implement Construct
└─ Follow module file structure (types.ts, Construct.ts, index.ts)

Step 5: Write Tests
└─ READ: testing/README.md
   Types: Unit, integration, validation, stack

Step 6: Create Pull Request
└─ READ: sdlc/pull-request.md (PR template)
```

---

### Workflow 2: Code Review

```text
Step 1: Verify Layer Correct
└─ READ: constructs/README.md
   Verify: Correct layer choice (L2 vs L3)

Step 2: Check Naming
└─ READ: common/naming.md
   Verify: Singular/plural, presence==enablement, validation

Step 3: Check Security
└─ READ: common/security.md
   Verify: Encryption, SSL, blocked public access, IAM

Step 4: Check Anti-Patterns
└─ READ: common/anti-patterns.md
   Verify: No common mistakes (17 anti-patterns)

Step 5: Check Tests
└─ READ: testing/README.md
   Verify: Unit, integration tests present

Step 6: Check PR Format
└─ READ: sdlc/pull-request.md
   Verify: Complete template, checklist, labels
```

---

### Workflow 3: Creating Types

```text
Step 1: Check for Canonical Types
└─ READ: common/types.md
   Question: Does canonical type exist? (LogConfig, Tags, Encryption, Naming)
   ├─ YES → Reuse canonical type
   └─ NO → Continue to Step 2

Step 2: Apply Naming Conventions
└─ READ: common/naming.md
   Rules:
   • Singular for single object (bucket, role)
   • Plural for arrays (logs, tags)
   • Presence implies enablement (monitoring: {} enables monitoring)
   • Validate mutual exclusivity (zone xor zones)

Step 3: Design Interface
├─ L2 → READ: constructs/L2/interface.md (extend upstream props)
└─ L3 → READ: constructs/L3/interface.md (minimal inputs)

Step 4: Implement Validation
└─ READ: testing/validation.md
   Pattern: Fail-fast constructor validation
```

---

## Decision Trees

### Decision Tree 1: Which Layer?

```text
Creating a construct:

Does it create AWS resources?
├─ NO → L2 Utility Module
│   Location: src/core/{capability}/
│   Files: types.ts, functions.ts, index.ts
│   Example: CIDR calculator, tag helpers
│   READ: constructs/L2/structure.md
│
└─ YES → How many AWS resources?
    ├─ ONE → L2 Construct Module
    │   Location: src/constructs/{service}/
    │   Pattern: Inheritance (extends upstream)
    │   Files: types.ts, {Construct}.ts, index.ts
    │   Example: SecureBucket extends s3.Bucket
    │   READ: constructs/L2/constructs.md
    │
    └─ MULTIPLE → L3 Composition
        Location: src/constructs/{domain}/
        Pattern: Composition (uses multiple L2)
        Files: types.ts, {Construct}.ts, index.ts
        Example: SecureWebsite (S3 + CloudFront + ACM)
        READ: constructs/L3/composition.md
```

---

### Decision Tree 2: Which Testing Standard?

```text
What am I testing?

├─ Constructor validation (no AWS)?
│   └─ READ: testing/validation.md
│      Pattern: Fail-fast validation in constructor
│
├─ CDK assertions (no AWS)?
│   └─ READ: testing/unit.md
│      Pattern: CDK assertions, JSII-compatible
│
├─ Jest integration tests (no AWS)?
│   └─ READ: testing/integration.md
│      Pattern: Jest, mock AWS calls
│
└─ Deployment tests (requires AWS)?
    └─ READ: testing/stack.md
       Pattern: CDK deploy, AWS profile required
       ⚠️  PAUSE for AWS credentials before executing
```

---

### Decision Tree 3: Which Common Standard?

```text
What do I need?

├─ Naming interface or property?
│   └─ READ: common/naming.md
│      Rules: Singular/plural, presence==enablement, validation
│
├─ Reusing shared types?
│   └─ READ: common/types.md
│      Types: LogConfig, Tags, Encryption, Naming
│
├─ Implementing security?
│   └─ READ: common/security.md
│      Defaults: Encryption, SSL, IAM, logging
│
├─ Writing TypeScript?
│   └─ READ: common/typescript.md
│      Patterns: SOLID, functional programming
│
├─ Avoiding mistakes?
│   └─ READ: common/anti-patterns.md
│      List: 17 common anti-patterns with fixes
│
└─ Importing modules?
    └─ READ: common/modules.md
        Pattern: Module namespace import (import * as)
```

---

## Standards by Category

### Construct Standards (Layer-Based)

| Category | L2 Utility | L2 Construct | L3 Composition |
|----------|------------|--------------|----------------|
| **Entry Point** | [constructs/L2/README.md](./constructs/L2/) | [constructs/L2/README.md](./constructs/L2/) | [constructs/L3/README.md](./constructs/L3/) |
| **Structure** | [constructs/L2/structure.md](./constructs/L2/structure.md) | [constructs/L2/structure.md](./constructs/L2/structure.md) | [constructs/L3/structure.md](./constructs/L3/structure.md) |
| **Pattern** | Pure TypeScript | [constructs/L2/inheritance.md](./constructs/L2/inheritance.md) | [constructs/L3/composition.md](./constructs/L3/composition.md) |
| **Interface** | [constructs/L2/interface.md](./constructs/L2/interface.md) | [constructs/L2/interface.md](./constructs/L2/interface.md) | [constructs/L3/interface.md](./constructs/L3/interface.md) |
| **Constructs** | N/A (utilities only) | [constructs/L2/constructs.md](./constructs/L2/constructs.md) | [constructs/L3/constructs.md](./constructs/L3/constructs.md) |

---

### Common Standards (All Layers)

| Standard | Purpose | When to Read |
|----------|---------|--------------|
| [common/naming.md](./common/naming.md) | Interface/property naming | Defining any interface or property |
| [common/types.md](./common/types.md) | Canonical shared types | Before creating new types |
| [common/security.md](./common/security.md) | Security best practices | Creating any construct |
| [common/typescript.md](./common/typescript.md) | SOLID principles, patterns | Writing any TypeScript code |
| [common/anti-patterns.md](./common/anti-patterns.md) | Common mistakes | Code review or before coding |
| [common/modules.md](./common/modules.md) | Module consumption | Importing constructs or utilities |

**Entry Point**: [common/README.md](./common/) - Complete common standards guide

---

### Testing Standards (All Layers)

| Test Type | Scope | AWS Required? | Standard |
|-----------|-------|---------------|----------|
| **Unit** | CDK assertions | No | [testing/unit.md](./testing/unit.md) |
| **Integration** | Jest integration | No | [testing/integration.md](./testing/integration.md) |
| **Validation** | Constructor validation | No | [testing/validation.md](./testing/validation.md) |
| **Stack** | CDK deployment | Yes | [testing/stack.md](./testing/stack.md) |

**Entry Point**: [testing/README.md](./testing/) - Complete testing guide

---

### SDLC Standards (All Personas)

| Standard | Purpose | Persona | When to Read |
|----------|---------|---------|--------------|
| [sdlc/pull-request.md](./sdlc/pull-request.md) | PR template & guidelines | Developers, AI Agents | Before creating PR |
| [sdlc/stories.md](./sdlc/stories.md) | Story/issue templates | All | Creating stories or issues |

**Entry Point**: [sdlc/README.md](./sdlc/) - Complete SDLC process guide

---

## AI Agent Guidelines

### Pre-Implementation Checklist

Before implementing any construct:

- [ ] **Layer determined** (L2 utility, L2 construct, or L3 composition)
- [ ] **Location identified** (src/core/** or src/constructs/**)
- [ ] **Pattern selected** (pure TypeScript, inheritance, or composition)
- [ ] **Standards read** (layer-specific + common + testing)
- [ ] **Module structure planned** (types.ts, functions.ts or {Construct}.ts, index.ts)
- [ ] **Canonical types identified** (reuse from common/types.md)
- [ ] **Security defaults planned** (encryption, SSL, IAM)

---

### Implementation Checklist

During implementation:

- [ ] **Naming conventions followed** (singular/plural, validation)
- [ ] **Security by default** (encryption, SSL, blocked public access)
- [ ] **Validation before resources** (fail-fast in constructor)
- [ ] **Canonical types reused** (logging, tags, encryption, etc.)
- [ ] **No anti-patterns** (see common/anti-patterns.md)
- [ ] **Module consumption correct** (import * as pattern)
- [ ] **JSII constraints respected** (public types exposed)

---

### Post-Implementation Checklist

After implementation:

- [ ] **Tests written** (unit, integration, validation)
- [ ] **Stack tests considered** (if deployment testing needed)
- [ ] **Documentation updated** (JSDoc, examples)
- [ ] **PR created** (follow sdlc/pull-request.md)
- [ ] **All checklist items checked** (PR template)
- [ ] **Appropriate labels applied** (release notes)

---

### Fail-Closed Rule

**CRITICAL**: If inputs are missing, ambiguous, or conflicting:

1. **STOP** immediately
2. **Ask** for clarification
3. **DO NOT** proceed with assumptions

This rule overrides all others.

---

### AWS Credentials Rule

**CRITICAL**: Before any AWS operation:

1. **PAUSE** and verify AWS credentials are available
2. **ASK** user to provide AWS profile or SSO credentials
3. **DO NOT** proceed with AWS operations without credentials

Applies to:
- CDK deploy operations
- Stack tests (testing/stack.md)
- Any AWS API calls

---

## Common Patterns (Quick Reference)

### Pattern 1: L2 Construct (Inheritance)

```typescript
// Extends upstream construct, adds secure defaults
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, {
      ...props,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });
  }
}
```

**READ**: [constructs/L2/constructs.md](./constructs/L2/constructs.md), [constructs/L2/inheritance.md](./constructs/L2/inheritance.md)

---

### Pattern 2: L3 Composition (Funnel Pattern)

```typescript
// Composes multiple L2 constructs
export class SecureWebsite extends Construct {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: SecureWebsiteProps) {
    super(scope, id);
    
    this.bucket = new SecureBucket(this, 'Bucket', { /* ... */ });
    this.distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: { origin: new origins.S3Origin(this.bucket) },
    });
  }
}

// Two-export funnel in index.ts
export { SecureWebsite } from './SecureWebsite';
export type { SecureWebsiteProps } from './types';
```

**READ**: [constructs/L3/composition.md](./constructs/L3/composition.md)

---

### Pattern 3: Canonical Type Reuse

```typescript
// Reuse canonical types from common/types.md
import { LogConfig, Tags, Encryption } from '../core/types';

export interface MyConstructProps {
  readonly logs?: ReadonlyArray<LogConfig>;  // ✅ Reuse
  readonly tags?: Tags;                      // ✅ Reuse
  readonly encryption?: Encryption;          // ✅ Reuse
}
```

**READ**: [common/types.md](./common/types.md)

---

### Pattern 4: Fail-Fast Validation

```typescript
export class MyConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MyConstructProps) {
    super(scope, id);

    // Validate BEFORE creating resources
    if (props.zone && props.zones) {
      throw new Error('Cannot specify both zone and zones. Use one or the other.');
    }

    // Now create resources
    // ...
  }
}
```

**READ**: [testing/validation.md](./testing/validation.md)

---

## Troubleshooting (Quick Answers)

| Issue | Solution |
|-------|----------|
| "Should this be L2 or L3?" | Count AWS resources: One → L2, Multiple → L3 |
| "Should this be utility or construct?" | Check AWS resources: None → Utility, Has → Construct |
| "Can I create L4?" | No. L4 not implemented. Use L3 with documentation. |
| "Where do files go?" | L2 Utility: `src/core/**`, Constructs: `src/constructs/**` |
| "What types to reuse?" | READ: [common/types.md](./common/types.md) for canonical types |
| "How to name properties?" | READ: [common/naming.md](./common/naming.md) for rules |
| "What security defaults?" | READ: [common/security.md](./common/security.md) for checklist |
| "What tests to write?" | READ: [testing/README.md](./testing/) for all test types |
| "How to create PR?" | READ: [sdlc/pull-request.md](./sdlc/pull-request.md) for template |

---

## Personas & Entry Points

### For AI Agents (Automated Development)

**Start Here**: This README (decision trees)

**Primary Standards**:
1. [constructs/README.md](./constructs/) - Layer decision tree
2. [common/README.md](./common/) - Cross-layer standards
3. [testing/README.md](./testing/) - Testing decision tree
4. [sdlc/pull-request.md](./sdlc/pull-request.md) - PR automation

**Follow**: All checklists and fail-closed rules

---

### For Developers (Manual Development)

**Start Here**: [constructs/README.md](./constructs/)

**Primary Standards**:
1. Layer-specific standards (L2/L3)
2. [common/README.md](./common/) - Cross-layer standards
3. [testing/README.md](./testing/) - Testing requirements
4. [sdlc/README.md](./sdlc/) - PR and story creation

**Reference**: [common/typescript.md](./common/typescript.md) for SOLID principles

---

### For Code Reviewers

**Start Here**: Workflow 2 (Code Review) above

**Primary Standards**:
1. [constructs/README.md](./constructs/) - Verify layer correct
2. [common/naming.md](./common/naming.md) - Check naming
3. [common/security.md](./common/security.md) - Check security
4. [common/anti-patterns.md](./common/anti-patterns.md) - Check anti-patterns
5. [testing/README.md](./testing/) - Check tests
6. [sdlc/pull-request.md](./sdlc/pull-request.md) - Check PR format

---

### For Product Managers

**Start Here**: [sdlc/README.md](./sdlc/)

**Primary Standards**:
1. [sdlc/stories.md](./sdlc/stories.md) - Story creation templates
2. [common/security.md](./common/security.md) - Security requirements

---

### For Technical Leads

**Start Here**: All README files

**Primary Standards**:
1. [constructs/README.md](./constructs/) - Architecture patterns
2. [common/README.md](./common/) - Team guidance
3. [testing/README.md](./testing/) - Testing strategy
4. [sdlc/README.md](./sdlc/) - Process standards

**Review**: [common/anti-patterns.md](./common/anti-patterns.md) for common mistakes

---

## Approval Gates (Human Required)

Human approval required before:

### Layer & Structure
- Creating new layer (L5, etc.)
- Reclassifying constructs between layers
- Changing layer definitions
- Modifying cross-layer standards

### Breaking Changes
- Breaking backward compatibility in public interfaces
- Modifying or deprecating canonical shared types
- Changing module consumption patterns

### AWS Operations
- CDK deploy operations
- Stack tests (require AWS credentials)
- Any AWS API calls

---

## References

**Repository Authority**: [CLAUDE.md](../../CLAUDE.md) - Main governance document  
**Agent Orchestration**: [AGENTS.md](../../AGENTS.md) - Agent model and skills  
**Skills Directory**: [skills/](../../skills/) - Executable skill specifications  
**Analysis Directory**: [docs/analysis/](../analysis/) - Migration analyses

---

## Summary

This standards directory provides layer-based guidance for AWS CDK construct development:

**By Category**:
- [constructs/](./constructs/) - All construct layers (L2/L3/L4)
- [common/](./common/) - Cross-layer standards (6 standards)
- [testing/](./testing/) - Testing standards (4 types)
- [sdlc/](./sdlc/) - SDLC process (PR, stories)

**By Layer**:
- [constructs/L2/](./constructs/L2/) - Platform primitives (utilities and constructs)
- [constructs/L3/](./constructs/L3/) - Composition patterns
- [constructs/L4/](./constructs/L4/) - Architectural solutions (not implemented - use L3)

**Start Here**:
- AI Agents → This README (decision trees)
- Developers → [constructs/README.md](./constructs/)
- Code Reviewers → Workflow 2 (above)
- Product Managers → [sdlc/README.md](./sdlc/)
- Technical Leads → All README files

**Authority**: All standards defer to [CLAUDE.md](../../CLAUDE.md)
