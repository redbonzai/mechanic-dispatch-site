# Network Documentation Task List

**Date**: 2025-12-22  
**Owner**: Personal task  
**Purpose**: Migrate and organize network documentation

---

## Current State

**Location**: `docs/standards/network/`

**What Exists**:
- ✅ `cidr.md` (464 lines) - Well-structured CIDR architecture documentation
- ⚠️ `vpc.md` - Empty
- ⚠️ `dns.md` - Empty
- ⚠️ `transit.md` - Empty
- 📁 `to-review/` - 11 legacy "Trusted Environments" standards documents

**Problem**: Legacy docs are human/governance-focused, not agent/construct-focused

---

## Legacy Documents to Review (to-review/)

| File | Lines | Type | Status |
|------|-------|------|--------|
| `standard-three-tier-vpc.md` | ~156 | VPC architecture | Needs adaptation |
| `standard-subnets.md` | ~112 | Subnet standards | Needs adaptation |
| `standard-security-groups.md` | ~103 | Security groups | Needs adaptation |
| `standard-routing.md` | ? | Routing | To review |
| `standard-ingress.md` | ? | Ingress patterns | To review |
| `standard-egress.md` | ? | Egress patterns | To review |
| `standard-logging.md` | ? | Network logging | May move to common/security.md |
| `standard-acl-rules.md` | ? | NACL rules | To review |
| `standard-cwan.md` | ? | Cloud WAN | To review |
| `standard-domain-naming.md` | ? | DNS naming | May move to dns.md |
| `standard-naming-tagging.md` | ~137 | Naming/tagging | May overlap with common/naming.md |

---

## Tasks

### 1. Review and Categorize Legacy Docs

**Goal**: Understand what's useful vs platform-specific

**Questions to Answer**:
- Which patterns are CDK construct design guidance?
- Which patterns are operational/governance (belong in docs/guides/)?
- Which patterns overlap with existing common/ standards?
- Which patterns are specific to "Trusted Environments" platform and not generic?

**Action**:
- [ ] Read all 11 files in to-review/
- [ ] Tag each as: **construct-relevant**, **guide-relevant**, **overlap**, or **platform-specific**
- [ ] Create mapping document

**Estimated Time**: 2-3 hours

---

### 2. Populate Empty Network Standards Files

**Goal**: Create agent-friendly construct standards for VPC, DNS, Transit

#### 2a. vpc.md

**Content Needed**:
- VPC construct interface patterns (L2/L3)
- CIDR allocation patterns (reference cidr.md)
- Subnet layout decision trees
- Multi-AZ patterns
- IPv4/IPv6 dual-stack patterns
- Flow log patterns
- Integration with IPAM constructs

**Sources**:
- `to-review/standard-three-tier-vpc.md` (adapt tier concepts)
- `to-review/standard-subnets.md` (adapt subnet patterns)
- Existing construct examples (if any)

**Format**: Agent-first (decision trees, checklists, "must/should" language)

**Estimated Time**: 4-6 hours

---

#### 2b. dns.md

**Content Needed**:
- Route53 construct patterns
- Hosted zone patterns (public vs private)
- DNS resolution patterns (VPC resolver)
- Split-horizon DNS patterns
- Record management patterns
- DNSSEC patterns

**Sources**:
- `to-review/standard-domain-naming.md` (if relevant)
- Existing Route53 construct patterns

**Format**: Agent-first

**Estimated Time**: 3-4 hours

---

#### 2c. transit.md

**Content Needed**:
- Transit Gateway construct patterns (L2/L3)
- Cloud WAN construct patterns
- Attachment patterns
- Route table association patterns
- Peering patterns
- Multi-region patterns

**Sources**:
- `to-review/standard-cwan.md` (adapt)
- `to-review/standard-routing.md` (adapt)

**Format**: Agent-first

**Estimated Time**: 4-6 hours

---

### 3. Extract Reusable Patterns from Legacy Docs

**Goal**: Move construct-relevant patterns into structured standards

#### 3a. Security Group Patterns

**Source**: `to-review/standard-security-groups.md`

**Destination**: Either:
- `network/security-groups.md` (new file)
- `common/security.md` (expand existing)

**Content to Extract**:
- Security group construct patterns
- Tier-based rule patterns
- Port/protocol patterns
- Reference vs CIDR patterns

**Decision**: Create `network/security-groups.md` (network-specific)

**Estimated Time**: 2-3 hours

---

#### 3b. Routing Patterns

**Source**: `to-review/standard-routing.md`, `to-review/standard-ingress.md`, `to-review/standard-egress.md`

**Destination**: 
- `network/routing.md` (new file)
- Or merge into `transit.md`

**Content to Extract**:
- Route table construct patterns
- Ingress/egress routing strategies
- NAT Gateway patterns
- Internet Gateway patterns
- Blackhole/null routing patterns

**Estimated Time**: 3-4 hours

---

#### 3c. NACL Patterns

**Source**: `to-review/standard-acl-rules.md`

**Destination**: `network/nacl.md` (new file)

**Content to Extract**:
- NACL construct patterns
- Tier-based NACL rules
- Stateless vs stateful considerations
- Rule numbering patterns

**Estimated Time**: 2-3 hours

---

#### 3d. Network Logging Patterns

**Source**: `to-review/standard-logging.md`

**Destination**: Likely `common/security.md` (expand existing observability section)

**Content to Extract**:
- VPC flow log patterns
- CloudWatch log group patterns
- S3 log destination patterns
- Log retention patterns

**Decision**: Review if network-specific or move to common/security.md

**Estimated Time**: 1-2 hours

---

### 4. Resolve Overlaps with Existing Standards

**Goal**: Prevent duplication with common/ standards

#### 4a. Naming/Tagging Overlap

**Source**: `to-review/standard-naming-tagging.md`

**Existing**: `common/naming.md`, `common/types.md` (Tags)

**Action**:
- [ ] Compare network naming conventions with common/naming.md
- [ ] Identify network-specific naming patterns (subnet names, etc.)
- [ ] Merge generic patterns into common/naming.md
- [ ] Keep network-specific patterns in network/ (or reference from vpc.md)

**Estimated Time**: 1-2 hours

---

### 5. Move Non-Construct Content to Guides

**Goal**: Separate operational/governance docs from construct standards

**Candidates for docs/guides/**:
- Platform architecture overviews (3-tier VPC diagrams, etc.)
- Operational runbooks
- Governance policies (IPAM-only allocation, etc.)
- Cost/compliance narratives

**Action**:
- [ ] Identify human-focused, non-construct content
- [ ] Create `docs/guides/network-architecture.md` (or similar)
- [ ] Move human narratives there
- [ ] Keep construct patterns in docs/standards/network/

**Estimated Time**: 2-3 hours

---

### 6. Create Network README

**Goal**: Entry point for network standards

**Content**:
- Navigation to vpc.md, dns.md, transit.md, cidr.md, security-groups.md, etc.
- Decision tree: "What network construct am I building?"
- Quick reference table
- Cross-references to common/ standards

**Format**: Agent-optimized (like docs/standards/constructs/README.md)

**Estimated Time**: 2-3 hours

---

### 7. Delete or Archive Legacy Docs

**Goal**: Clean up to-review/ folder

**Action**:
- [ ] After migration, delete to-review/ files that are fully migrated
- [ ] Archive any platform-specific files that aren't relevant to generic CDK constructs
- [ ] Document what was kept vs discarded

**Estimated Time**: 1 hour

---

## Impacts on Personas, Agents, Skills

### Personas Impacted

#### 1. Network Engineer (Skilled Persona)

**Current Status**: Name only in CLAUDE.md (line 395)

**Needs Full Definition**:
- Expertise domain: VPC, subnets, routing, DNS, transit
- Patterns catalog: Three-tier VPC, multi-AZ, dual-stack, security groups
- Best practices: CIDR sizing, subnet allocation, routing strategies
- Risk identification: Network segmentation, blast radius, single points of failure

**Implementation Location**: `docs/personas/skilled/network-engineer.md`

**Why Important**: Network standards are highly specialized; Network Engineer persona provides the expertise lens for reviewing network constructs

---

### Agents Impacted

#### Agent 1 (Interface Architect)

**Impact**: Network Engineer persona invoked when designing network construct interfaces

**New Workflows Needed**:
- VPC interface design workflow
- Subnet allocation interface workflow
- Transit Gateway interface workflow

---

#### Agent 2 (Operational Review)

**Impact**: Network Engineer persona invoked for network construct reviews

**New Dimensions**:
- Network segmentation review
- Routing path analysis
- DNS resolution validation
- Security group blast radius

---

### Skills Impacted

#### New Skills Needed

##### 1. VPC Design Validator

**Purpose**: Validate VPC construct designs against network standards

**Inputs**:
- VPC interface proposal
- CIDR allocation
- Subnet layout
- Multi-AZ configuration

**Outputs**:
- VPC design validation report
- CIDR overlap detection
- Subnet tier compliance
- Multi-AZ best practices check

**Implementation Location**: `skills/vpc-design-validator.md`

---

##### 2. Network Segmentation Analyzer

**Purpose**: Analyze network segmentation and routing paths

**Inputs**:
- VPC topology
- Route tables
- Security groups
- NACLs

**Outputs**:
- Segmentation analysis
- Routing path validation
- Security boundary verification
- Blast radius assessment

**Implementation Location**: `skills/network-segmentation-analyzer.md`

---

##### 3. CIDR Allocation Validator

**Purpose**: Validate CIDR allocations against standards

**Inputs**:
- Proposed CIDR blocks
- Subnet allocations
- Multi-region considerations

**Outputs**:
- CIDR overlap detection
- Subnet sizing validation
- Growth capacity analysis
- IP exhaustion risk assessment

**Implementation Location**: `skills/cidr-allocation-validator.md`

**Note**: May leverage existing cidr.md patterns

---

## Estimated Total Effort

| Task Category | Time Estimate |
|---------------|---------------|
| Review & categorize legacy docs | 2-3 hours |
| Populate vpc.md | 4-6 hours |
| Populate dns.md | 3-4 hours |
| Populate transit.md | 4-6 hours |
| Extract security group patterns | 2-3 hours |
| Extract routing patterns | 3-4 hours |
| Extract NACL patterns | 2-3 hours |
| Extract logging patterns | 1-2 hours |
| Resolve naming/tagging overlaps | 1-2 hours |
| Move content to guides/ | 2-3 hours |
| Create network README | 2-3 hours |
| Cleanup/archive | 1 hour |
| **Subtotal (Documentation)** | **27-42 hours** |
| Define Network Engineer persona | 2-3 hours |
| Create 3 network-specific skills | 4-6 hours |
| Update agent workflows | 2-3 hours |
| **Subtotal (Personas/Skills)** | **8-12 hours** |
| **TOTAL** | **35-54 hours (~1-1.5 weeks)** |

---

## Phased Approach

### Phase 1: Foundation (Week 1, Days 1-2)

**Priority**: High  
**Goal**: Understand what we have

- [ ] Review and categorize all 11 legacy docs
- [ ] Create mapping document (what goes where)
- [ ] Identify overlaps with common/ standards

**Deliverable**: Migration plan with source → destination mapping

---

### Phase 2: Core Network Standards (Week 1, Days 3-5)

**Priority**: High  
**Goal**: Create essential network construct standards

- [ ] Populate vpc.md (VPC construct patterns)
- [ ] Populate dns.md (Route53 patterns)
- [ ] Populate transit.md (Transit Gateway / Cloud WAN patterns)
- [ ] Create security-groups.md (security group patterns)

**Deliverable**: 4 core network standard files

---

### Phase 3: Extended Network Standards (Week 2, Days 1-2)

**Priority**: Medium  
**Goal**: Complete network standards coverage

- [ ] Create routing.md (or merge into transit.md)
- [ ] Create nacl.md (NACL patterns)
- [ ] Resolve naming/tagging overlaps
- [ ] Extract/move logging patterns

**Deliverable**: Complete network standards suite

---

### Phase 4: Organization & Cleanup (Week 2, Day 3)

**Priority**: Medium  
**Goal**: Create navigation and clean up

- [ ] Create network/README.md (entry point)
- [ ] Move non-construct content to docs/guides/
- [ ] Delete/archive to-review/ folder
- [ ] Update cross-references in other standards

**Deliverable**: Clean, navigable network standards structure

---

### Phase 5: Personas & Skills (Week 2, Days 4-5)

**Priority**: Medium  
**Goal**: Enable network-specific agent workflows

- [ ] Define Network Engineer persona (full definition)
- [ ] Create VPC Design Validator skill
- [ ] Create Network Segmentation Analyzer skill
- [ ] Create CIDR Allocation Validator skill
- [ ] Update Agent 1 & Agent 2 workflows for network constructs

**Deliverable**: Network-specific personas and skills

---

## Dependencies

**Blocks**:
- None (this is independent work)

**Blocked By**:
- None (can start immediately)

**Parallel Work**:
- Can be done in parallel with operational skills (Phase 1 from claude.md analysis)

---

## Decision Points

### 1. Where do Security Groups belong?

**Options**:
- A) `network/security-groups.md` (network-specific)
- B) `common/security.md` (cross-cutting security concern)

**Recommendation**: A (network-specific) - Security groups are network constructs

---

### 2. Where do Network Logs belong?

**Options**:
- A) `network/logging.md` (network-specific)
- B) `common/security.md` (cross-cutting observability concern)

**Recommendation**: B (common/security.md) - Flow logs are observability, not construct design

---

### 3. How much "Trusted Environments" content is generic?

**Decision Required**: Review legacy docs to determine:
- What's platform-specific (discard or archive)
- What's generic CDK patterns (migrate)

**Action**: Phase 1 review will answer this

---

## Success Criteria

**Network Documentation Complete When**:

- ✅ All empty files populated (vpc.md, dns.md, transit.md)
- ✅ All legacy docs reviewed and migrated or discarded
- ✅ Network standards follow agent-first format (decision trees, checklists)
- ✅ network/README.md provides clear entry point
- ✅ No orphaned or redundant content
- ✅ Cross-references updated
- ✅ Network Engineer persona fully defined
- ✅ 3 network-specific skills implemented

---

## Open Questions

1. **Are there existing network constructs in src/** to reference?
   - Check `src/constructs/vpc/`, `src/constructs/route53/`, etc.
   - Use as examples in standards

2. **Do we need L2 vs L3 vs L4 network standards?**
   - VPC L2 patterns (extend ec2.Vpc)
   - VPC L3 patterns (compose VPC + subnets + routes)
   - VPC L4 patterns (opinionated 3-tier VPC)

3. **Should CIDR standards move to common/**?
   - CIDR is cross-cutting (VPC, subnets, security groups, NACLs, routes)
   - But it's network-specific domain knowledge
   - **Recommendation**: Keep in network/cidr.md (it's domain-specific)

---

## Notes

- **Style**: All new network standards must be **agent-first** (not human governance docs)
- **Format**: Follow constructs/L2/README.md style (decision trees, checklists, examples)
- **Tone**: "Must", "Should", "Must not" language (not narrative)
- **Examples**: Include TypeScript interface examples, not just prose
- **Cross-references**: Link to common/ standards (naming, types, security)

---

## Next Steps

**Immediate**:
1. Start Phase 1 (review and categorize legacy docs)
2. Create source → destination mapping
3. Begin Phase 2 (populate core standards)

**Can Be Deferred**:
- Phase 5 (personas/skills) until after standards are complete
- Non-construct content migration to guides/

---

## Summary

**What**: Migrate 11 legacy network docs + populate 3 empty files + create new standards

**Why**: Enable agent-driven network construct design and review

**How**: 5 phases over ~1-1.5 weeks

**Impact**: New Network Engineer persona + 3 network skills + complete network standards

**Status**: Ready to start (no blockers)

