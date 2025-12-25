# CIDR Architecture

```yaml
schema_version: "1.0"
parent: "./README.md"
applies_to:
  - "src/constructs/vpc/**"
  - "src/constructs/ipam/**"
  - "src/constructs/route53/**"
```

---

## Overview

All network addressing follows a 4-layer architecture. Each layer builds on the previous, providing increasing specificity.

```
Layer 1: CidrBase      → Universal primitive (routes, SG rules, NACLs)
Layer 2: CidrFamily    → IPv4/IPv6 distinction (subnets, ENIs)
Layer 3: IndexedCidr   → With metadata (VPC allocations)
Layer 4: CidrConfig    → Allocations container (VPC top-level)
```

---

## Layer Selection Decision Tree

```
What resource needs a CIDR?
│
├── VPC or IPAM Pool (root network resource)?
│   └── Layer 4: CidrConfig
│       { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] }
│
├── Subnet, ENI, or Secondary IP?
│   └── Layer 2: CidrFamily
│       { ipv4: { block: '10.0.1.0/24' } }
│
├── Route destination?
│   └── Layer 1: CidrBase
│       { block: '0.0.0.0/0' }
│
├── Security Group source/destination?
│   └── Layer 1: CidrBase
│       Single IP: { address: '10.0.1.5' }
│       Range: { block: '10.0.0.0/16' }
│
├── NACL rule?
│   └── Layer 1: CidrBase
│       { block: '10.0.0.0/8' }
│
├── DNS A/AAAA record?
│   └── Layer 1: CidrBase (address property only)
│       { address: '10.0.1.5' }
│
└── Prefix List entry?
    └── Layer 1: CidrBase
        { block: '10.0.0.0/8' }
```

---

## Layer 1: CidrBase (Universal Primitive)

**Purpose**: Used everywhere - routes, security groups, NACLs, DNS records, prefix lists.

### TypeScript Definition

```typescript
/**
 * Universal CIDR primitive. Exactly ONE property MUST be specified.
 */
export interface CidrBase {
  /**
   * Static CIDR block.
   * MUST include /prefix for ranges (e.g., '10.0.0.0/16').
   * @example '10.0.0.0/16', '0.0.0.0/0', '2001:db8::/32'
   */
  readonly block?: string;

  /**
   * IPAM pool allocation.
   * Dynamically allocates CIDR from specified pool.
   */
  readonly ipam?: IpamAllocation;

  /**
   * Reference to parent CIDR.
   * Used for subnet carving from VPC CIDR.
   */
  readonly ref?: CidrRef;

  /**
   * Single IP address.
   * Implies /32 (IPv4) or /128 (IPv6).
   * @example '10.0.1.5', '2001:db8::1'
   */
  readonly address?: string;

  /**
   * Auto-assign Amazon-provided IPv6.
   * VPC-level only.
   */
  readonly auto?: boolean;
}
```

### Property Exclusivity

| Property | Type | Use Case | Prefix Required? |
|----------|------|----------|------------------|
| `block` | string | Static CIDR range | ✅ Yes (e.g., `/16`) |
| `ipam` | object | Dynamic allocation | Specified in `ipam.prefix` |
| `ref` | object | Parent reference | Specified in `ref.prefix` |
| `address` | string | Single host | ❌ No (implicit /32 or /128) |
| `auto` | boolean | Amazon IPv6 | N/A |

**Rule**: Exactly ONE property MUST be specified. Multiple properties = invalid.

### Usage Examples

```yaml
# Route destination (any IP)
destination: { block: '0.0.0.0/0' }

# Security group source (specific IP)
sources:
  - { address: '203.0.113.5' }

# Security group source (CIDR range)
sources:
  - { block: '10.0.0.0/16' }

# NACL rule
source: { block: '10.0.0.0/16' }

# DNS A record
values:
  - { address: '10.0.1.5' }
  - { address: '10.0.1.6' }

# IPAM allocation
cidr: { ipam: { pool: 'ipam-pool-123', prefix: 24 } }
```

---

## Layer 2: CidrFamily (IPv4/IPv6 Distinction)

**Purpose**: Used when both IPv4 and IPv6 may be specified for a single resource.

### TypeScript Definition

```typescript
/**
 * IPv4 and/or IPv6 CIDR specification.
 * At least one family SHOULD be specified.
 */
export interface CidrFamily {
  /** IPv4 CIDR configuration. */
  readonly ipv4?: CidrBase;
  
  /** IPv6 CIDR configuration. */
  readonly ipv6?: CidrBase;
}
```

### Usage Examples

```yaml
# Subnet with IPv4 only
cidr:
  ipv4: { block: '10.0.1.0/24' }

# Subnet with dual-stack
cidr:
  ipv4: { block: '10.0.1.0/24' }
  ipv6: { auto: true }

# Subnet with IPv6 only
cidr:
  ipv6: { block: '2001:db8::/64' }

# Subnet referencing VPC CIDR
cidr:
  ipv4:
    ref:
      parent: 'vpc.cidr.allocations[0].ipv4'
      prefix: 24
```

---

## Layer 3: IndexedCidr (With Metadata)

**Purpose**: Infrastructure resources that support multiple CIDR blocks with indexing.

### TypeScript Definition

```typescript
/**
 * CIDR with index and optional metadata.
 * Used in allocations arrays where position matters.
 */
export interface IndexedCidr {
  /**
   * Position in allocations array (0-based).
   * Index 0 = primary CIDR (REQUIRED for root resources).
   * Indices 1-49 = secondary CIDRs (optional).
   */
  readonly index: number;

  /**
   * Semantic name for this allocation.
   * @example 'primary', 'eks-pods', 'database'
   */
  readonly name?: string;

  /**
   * Human-readable description.
   */
  readonly description?: string;

  /** IPv4 CIDR for this allocation. */
  readonly ipv4?: CidrBase;
  
  /** IPv6 CIDR for this allocation. */
  readonly ipv6?: CidrBase;
}
```

### Index Conventions

| Index | Meaning | Required? |
|-------|---------|-----------|
| 0 | Primary CIDR | ✅ REQUIRED for root resources |
| 1-49 | Secondary CIDRs | Optional |

**Rules**:

- Index 0 MUST exist for root resources (VPC, IPAM Pool)
- All indices MUST be unique within allocations array
- Indices MAY have gaps (e.g., 0, 1, 5 is valid)

### Usage Examples

```yaml
# VPC with primary CIDR
allocations:
  - index: 0
    name: 'primary'
    ipv4: { block: '10.0.0.0/16' }
    ipv6: { auto: true }

# VPC with multiple CIDRs
allocations:
  - index: 0
    name: 'primary'
    ipv4: { block: '10.0.0.0/16' }
  
  - index: 1
    name: 'eks-pods'
    description: 'RFC 6598 space for Kubernetes pods'
    ipv4: { block: '100.64.0.0/16' }
  
  - index: 2
    name: 'database'
    ipv4: { ipam: { pool: 'ipam-pool-db', prefix: 20 } }
```

---

## Layer 4: CidrConfig (Allocations Container)

**Purpose**: Top-level CIDR configuration for root network resources.

### TypeScript Definition

```typescript
/**
 * Top-level CIDR configuration.
 * Used by VPC, IPAM Pool, and other root network resources.
 */
export interface CidrConfig {
  /**
   * Array of CIDR allocations.
   * MUST contain at least one allocation with index 0.
   */
  readonly allocations: IndexedCidr[];
}
```

### Usage Examples

```yaml
# VPC CIDR configuration
cidr:
  allocations:
    - index: 0
      name: 'primary'
      ipv4: { block: '10.0.0.0/16' }
    - index: 1
      name: 'secondary'
      ipv4: { block: '100.64.0.0/16' }
```

---

## Reference Formats

### Correct Reference Format

```yaml
# Subnet referencing VPC primary IPv4 CIDR
cidr:
  ipv4:
    ref:
      parent: 'vpc.cidr.allocations[0].ipv4'
      prefix: 24

# Subnet referencing VPC secondary IPv4 CIDR
cidr:
  ipv4:
    ref:
      parent: 'vpc.cidr.allocations[1].ipv4'
      prefix: 24

# Subnet referencing VPC IPv6 CIDR
cidr:
  ipv6:
    ref:
      parent: 'vpc.cidr.allocations[0].ipv6'
      prefix: 64
```

### Incorrect Reference Formats (MUST NOT Use)

```yaml
# ❌ INCORRECT: Ambiguous old format
cidr:
  ipv4:
    ref:
      parent: 'vpc.cidr[0]'       # Missing .allocations and .ipv4
      prefix: 24

# ❌ INCORRECT: Missing array index
cidr:
  ipv4:
    ref:
      parent: 'vpc.cidr.ipv4'     # Which allocation?
      prefix: 24

# ❌ INCORRECT: String instead of object
cidr:
  ipv4:
    ref: 'vpc.cidr.allocations[0].ipv4'  # Must be object with prefix
```

---

## Layer Usage Matrix

| Construct Type | Layer | Structure | Reference Example |
|----------------|-------|-----------|-------------------|
| VPC | 4 | `{ allocations: IndexedCidr[] }` | `vpc.cidr.allocations[0].ipv4` |
| IPAM Pool | 4 | `{ allocations: IndexedCidr[] }` | `pool.cidr.allocations[0].ipv4` |
| Subnet | 2 | `{ ipv4?: Cidr, ipv6?: Cidr }` | `subnet.cidr.ipv4` |
| ENI | 2 | `{ ipv4?: Cidr, ipv6?: Cidr }` | `eni.cidr.ipv4` |
| Route | 1 | `{ block: string }` | N/A |
| Security Group Rule | 1 | `{ block: string }` or `{ address: string }` | N/A |
| NACL Rule | 1 | `{ block: string }` | N/A |
| Prefix List Entry | 1 | `{ block: string }` | N/A |
| DNS A/AAAA Record | 1 | `{ address: string }` | N/A |

---

## Validation Rules

### Layer 1 Validation

```typescript
function validateCidrBase(cidr: CidrBase, path: string): void {
  const properties = ['block', 'ipam', 'ref', 'address', 'auto'];
  const specified = properties.filter(p => cidr[p] !== undefined);
  
  if (specified.length === 0) {
    throw new Error(`${path}: At least one CIDR property required`);
  }
  
  if (specified.length > 1) {
    throw new Error(
      `${path}: Exactly one CIDR property allowed, got: ${specified.join(', ')}`
    );
  }
  
  // Validate block format includes prefix
  if (cidr.block && !cidr.block.includes('/')) {
    throw new Error(`${path}: CIDR block must include prefix (e.g., /16)`);
  }
}
```

### Layer 4 Validation

```typescript
function validateCidrConfig(config: CidrConfig, constructName: string): void {
  if (!config.allocations || config.allocations.length === 0) {
    throw new Error(`${constructName}: At least one CIDR allocation required`);
  }
  
  const hasPrimary = config.allocations.some(a => a.index === 0);
  if (!hasPrimary) {
    throw new Error(`${constructName}: Primary CIDR (index 0) is required`);
  }
  
  const indices = config.allocations.map(a => a.index);
  const duplicates = indices.filter((i, idx) => indices.indexOf(i) !== idx);
  if (duplicates.length > 0) {
    throw new Error(
      `${constructName}: Duplicate CIDR indices: ${[...new Set(duplicates)].join(', ')}`
    );
  }
}
```

---

## Best Practices

### Use Minimal Layer

**Principle**: Use the simplest layer that meets requirements.

```yaml
# ✅ CORRECT: Route uses Layer 1 (simple)
route:
  destination: { block: '0.0.0.0/0' }

# ❌ INCORRECT: Route uses Layer 4 (overcomplicated)
route:
  destination:
    allocations:
      - index: 0
        ipv4: { block: '0.0.0.0/0' }
```

### Consistent Reference Paths

**Principle**: Always use full dot-notation path for references.

```yaml
# ✅ CORRECT: Full path
ref:
  parent: 'vpc.cidr.allocations[0].ipv4'
  prefix: 24

# ❌ INCORRECT: Abbreviated path
ref:
  parent: 'vpc.ipv4'
  prefix: 24
```

