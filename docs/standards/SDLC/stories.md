# Story and Issue Standards

**Entry Point**: Story/Issue Creation Guide for AI Agents

**Audience**: AI Agents and Developers  
**Scope**: All stories, issues, and tasks  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This document defines standards for creating stories, issues, and tasks. Well-written stories ensure clear requirements, proper scope, and successful implementation.

**Core Philosophy**: Stories should be SMART - Specific, Measurable, Achievable, Relevant, Time-bound.

---

## Quick Reference

| Story Type | Use Case | Template |
|------------|----------|----------|
| **Feature Story** | New functionality | [Feature Template](#feature-story-template) |
| **Bug Report** | Fix defect | [Bug Template](#bug-report-template) |
| **Technical Debt** | Refactoring/cleanup | [Tech Debt Template](#technical-debt-template) |
| **Documentation** | Doc updates | [Documentation Template](#documentation-template) |
| **Spike** | Research/investigation | [Spike Template](#spike-template) |

---

## Story Types

### Feature Story

**When to Use**: Adding new functionality or capability

**Key Elements**:
- User persona
- Business value
- Acceptance criteria
- Technical approach (optional)

---

### Bug Report

**When to Use**: Something is broken or not working as expected

**Key Elements**:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

---

### Technical Debt

**When to Use**: Refactoring, cleanup, or improving existing code

**Key Elements**:
- Current problem
- Proposed solution
- Impact if not addressed
- Estimated effort

---

### Documentation

**When to Use**: Creating or updating documentation

**Key Elements**:
- What needs documentation
- Target audience
- Scope
- Related code/features

---

### Spike

**When to Use**: Investigation or research needed before implementation

**Key Elements**:
- Question to answer
- Success criteria
- Time box
- Expected deliverables

---

## Feature Story Template

### Title Format

```text
feat: [Short description of feature]

Examples:
✅ feat: Add SecureBucket construct with KMS encryption
✅ feat: Support IPv6 auto-assignment in VPC construct
✅ feat: Add RAM sharing support to Route53 hosted zones
```

### Story Template

```markdown
# Feature Story: [Feature Name]

## User Story

As a **[persona]**  
I want to **[action]**  
So that **[benefit]**

**Example**:
As a **platform engineer**  
I want to **create S3 buckets with encryption enabled by default**  
So that **I don't have to manually configure security settings each time**

## Business Value

[Explain why this feature is valuable]

**Example**:
- Reduces time to create secure S3 buckets from 30 minutes to 2 minutes
- Ensures consistent security posture across all S3 buckets
- Reduces risk of misconfiguration leading to data exposure

## Acceptance Criteria

Given **[precondition]**  
When **[action]**  
Then **[expected outcome]**

**Example**:

### AC1: Default Encryption

- **Given** a new SecureBucket is created
- **When** no encryption configuration is provided
- **Then** the bucket should use S3-managed encryption (SSE-S3) by default

### AC2: KMS Encryption Support

- **Given** a new SecureBucket is created with a KMS key
- **When** the kmsKey property is provided
- **Then** the bucket should use the specified KMS key for encryption

### AC3: Block Public Access

- **Given** a new SecureBucket is created
- **When** no public access configuration is provided
- **Then** all four Block Public Access settings should be enabled

## Technical Approach (Optional)

[High-level technical approach]

**Example**:
```typescript
// Extend S3 Bucket with secure defaults
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, {
      ...props,
      encryption: props.encryption ?? s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });
  }
}
```

## Definition of Done

- [ ] Code implemented and passes all tests
- [ ] Unit tests added (85%+ coverage)
- [ ] Integration tests added
- [ ] Documentation updated
- [ ] PR approved and merged
- [ ] Deployed to dev environment
- [ ] Acceptance criteria verified

## Dependencies

- [ ] [List any dependencies on other stories/tasks]

## Risks

- [List any potential risks or blockers]

## Estimation

**Story Points**: [1, 2, 3, 5, 8, 13, 21]  
**Estimated Hours**: [X hours]

## Labels

- `new feature`
- `aws-s3`
- `security`
```

---

## Bug Report Template

### Title Format

```text
bug: [Short description of issue]

Examples:
✅ bug: VPC CIDR validation rejects valid IPv6 auto-assignment
✅ bug: SecureBucket constructor throws error with undefined props
✅ bug: Integration tests fail when AWS profile not configured
```

### Bug Template

```markdown
# Bug Report: [Bug Title]

## Description

[Clear, concise description of the bug]

**Example**:
The VPC construct's CIDR validator incorrectly rejects IPv6 configurations
with `auto: true`, even though this is a valid configuration for Amazon-provided
IPv6 CIDR blocks.

## Steps to Reproduce

1. [First step]
2. [Second step]
3. [And so on...]

**Example**:
1. Create a new VPC with IPv6 auto-assignment:
   ```typescript
   new Vpc(this, 'MyVpc', {
     cidr: {
       allocations: [{
         index: 0,
         ipv4: { block: '10.0.0.0/16' },
         ipv6: { auto: true },
       }],
     },
   });
   ```
2. Run `npm run build`
3. Observe validation error

## Expected Behavior

[What you expected to happen]

**Example**:
The VPC should be created successfully with IPv6 auto-assignment enabled.
The validator should recognize `auto: true` as a valid IPv6 configuration.

## Actual Behavior

[What actually happened]

**Example**:
The constructor throws a validation error:

```text
Error: Vpc: 'cidr.allocations[0].ipv6.block' is required when ipv6 is specified.
```

## Environment

- **Node version**: [e.g., 18.18.0]
- **AWS CDK version**: [e.g., 2.120.0]
- **OS**: [e.g., macOS 14.0, Ubuntu 22.04]
- **Package version**: [e.g., @bah/cdk-core-constructs@1.2.3]

## Screenshots/Logs

[If applicable, add screenshots or error logs]

**Example**:
```
Error: Vpc: 'cidr.allocations[0].ipv6.block' is required when ipv6 is specified.
    at Vpc.validateCidr (/path/to/Vpc.ts:123:11)
    at Vpc.constructor (/path/to/Vpc.ts:45:10)
    ...
```

## Root Cause (If Known)

[Explanation of root cause]

**Example**:
The validator in `validateCidr()` checks for the presence of `ipv6.block`
but doesn't account for `ipv6.auto` as an alternative. The check should be:

```typescript
// Current (incorrect)
if (ipv6 && !ipv6.block) {
  throw new Error("'block' is required");
}

// Correct
if (ipv6 && !ipv6.block && !ipv6.auto) {
  throw new Error("Either 'block' or 'auto' is required");
}
```

## Proposed Fix

[How to fix the issue]

**Example**:
Update the CIDR validator to accept either `block` or `auto` for IPv6:

```typescript
function validateIpv6Cidr(ipv6: CidrBase): void {
  // Must have either block, auto, ref, or ipam
  const hasValidConfig = 
    ipv6.block !== undefined ||
    ipv6.auto !== undefined ||
    ipv6.ref !== undefined ||
    ipv6.ipam !== undefined;
    
  if (!hasValidConfig) {
    throw new Error(
      "Vpc: 'cidr.allocations[].ipv6' must specify one of: block, auto, ref, or ipam."
    );
  }
}
```

## Priority

- [ ] **Critical** - Blocks all users, no workaround
- [ ] **High** - Significant impact, workaround exists
- [x] **Medium** - Moderate impact, affects some users
- [ ] **Low** - Minor issue, cosmetic

## Labels

- `bug fix`
- `aws-vpc`
- `validation`
```

---

## Technical Debt Template

### Title Format

```text
tech: [Short description of debt]

Examples:
✅ tech: Extract validation logic into reusable helper functions
✅ tech: Refactor CIDR calculation to use functional composition
✅ tech: Remove deprecated kmsKeyArn property from all constructs
```

### Technical Debt Template

```markdown
# Technical Debt: [Debt Title]

## Current Problem

[Describe the current state and why it's problematic]

**Example**:
Validation logic is duplicated across 12 construct files. Each construct
implements its own validation for common patterns (mutual exclusivity, required
fields, ranges). This leads to:
- Inconsistent error messages
- Duplicated code (~200 lines per construct)
- Hard to maintain (changes require updates in 12 places)
- Different validation behavior across constructs

## Proposed Solution

[How to address the debt]

**Example**:
Extract validation logic into reusable helper functions in
`src/core/validation/`:

```typescript
// src/core/validation/functions.ts
export function validateMutualExclusivity<T>(
  props: T,
  field1: keyof T,
  field2: keyof T,
  constructName: string
): void {
  if (props[field1] && props[field2]) {
    throw new Error(
      `${constructName}: Cannot specify both '${String(field1)}' and '${String(field2)}'.`
    );
  }
}
```

Then use in constructs:

```typescript
// In construct constructor
validateMutualExclusivity(props, 'zone', 'zones', 'VpcConstruct');
```

## Impact if Not Addressed

[Consequences of leaving the debt]

**Example**:
- Continued code duplication makes maintenance harder
- Inconsistent validation behavior confuses users
- New constructs will copy-paste old patterns
- Technical debt grows with each new construct
- Harder to onboard new developers

## Estimated Effort

**Story Points**: 5  
**Estimated Hours**: 16 hours

**Breakdown**:
- Create validation helper functions: 4 hours
- Update existing constructs to use helpers: 8 hours
- Update tests: 2 hours
- Documentation: 2 hours

## Benefits

- Reduce duplicated validation code by ~2,400 lines
- Consistent error messages across all constructs
- Easier to add new validation patterns
- Centralized validation logic easier to test
- Faster construct development (reuse helpers)

## Definition of Done

- [ ] Validation helpers created in `src/core/validation/`
- [ ] All constructs updated to use validation helpers
- [ ] Unit tests for validation helpers
- [ ] Documentation updated
- [ ] No regression in existing tests
- [ ] Code coverage maintained (85%+)

## Dependencies

- [ ] None

## Labels

- `maintenance`
- `refactoring`
- `code-quality`
```

---

## Documentation Template

### Title Format

```text
docs: [Short description]

Examples:
✅ docs: Add anti-patterns guide for common mistakes
✅ docs: Update NAMING-CONVENTIONS with singular/plural examples
✅ docs: Create agent-friendly testing README
```

### Documentation Template

```markdown
# Documentation: [Doc Title]

## What Needs Documentation

[Describe what needs to be documented]

**Example**:
Create a comprehensive anti-patterns guide that documents common mistakes
developers make when building CDK constructs. This will help prevent issues
during code review and improve code quality.

## Target Audience

[Who will use this documentation]

**Example**:
- AI agents building constructs
- New developers onboarding to the project
- Code reviewers looking for common issues

## Scope

[What will be included]

**Example**:
Document the following anti-patterns:
1. Redundant `enabled` flags (AP-001)
2. Both singular and plural without validation (AP-002)
3. Direct file imports instead of barrel (AP-003)
4. Validation after resource creation (AP-008)
5. Wrong CIDR layer usage (AP-009)
6. Missing type guards for union types (AP-014)

Each entry includes:
- Description of the anti-pattern
- Why it's problematic
- Example of incorrect code
- Example of correct code
- How to fix it

## Related Code/Features

[Link to relevant code or features]

**Example**:
- Related to validation patterns in `docs/standards/common/validation.md`
- Complements naming conventions in `docs/standards/common/naming.md`
- References CIDR architecture in `docs/constructs/CIDR-ARCHITECTURE.md`

## Definition of Done

- [ ] Documentation written
- [ ] Examples added (correct and incorrect)
- [ ] Cross-references added
- [ ] Reviewed by at least one team member
- [ ] Added to documentation index
- [ ] PR approved and merged

## Estimation

**Story Points**: 3  
**Estimated Hours**: 8 hours

## Labels

- `documentation`
- `standards`
```

---

## Spike Template

### Title Format

```text
spike: [Research question]

Examples:
✅ spike: Investigate Lambda SnapStart support for Node.js 18
✅ spike: Research best approach for multi-region DynamoDB replication
✅ spike: Evaluate CDK custom resource vs AWS SDK for IPAM
```

### Spike Template

```markdown
# Spike: [Research Question]

## Goal

[What question needs to be answered]

**Example**:
Determine the best approach for implementing RAM (Resource Access Manager)
sharing in our CDK constructs. Evaluate whether to use CDK's built-in RAM
constructs, custom resources, or AWS SDK calls.

## Success Criteria

[What would constitute a successful spike]

**Example**:
- Document pros/cons of each approach (CDK, custom resource, SDK)
- Identify limitations and edge cases
- Provide recommendation with justification
- Create proof-of-concept code for recommended approach
- Estimate effort for full implementation

## Questions to Answer

[Specific questions to investigate]

**Example**:
1. Does CDK's `CfnResourceShare` support all RAM sharing scenarios?
2. What are the limitations of CDK's RAM constructs?
3. How do we handle cross-account/cross-OU sharing?
4. Can we use AWS SDK directly instead of custom resources?
5. What's the best way to grant accept permissions to principals?
6. How do we handle resource share invitation acceptance?

## Research Areas

[Areas to investigate]

**Example**:
- AWS RAM documentation
- CDK RAM L1/L2 constructs
- AWS SDK RAM APIs
- Custom resource implementation patterns
- Existing CDK constructs using RAM (if any)
- Community solutions (GitHub, Stack Overflow)

## Time Box

[Maximum time to spend on spike]

**Example**:
**Maximum**: 2 days (16 hours)

If not complete by then, create a follow-up spike or make a decision with
available information.

## Expected Deliverables

[What will be produced]

**Example**:
1. **Research Document** (`docs/research/ram-sharing-spike.md`):
   - Findings for each research area
   - Comparison matrix of approaches
   - Recommendation with justification

2. **Proof of Concept**:
   - Working code example for recommended approach
   - Located in `src/research/ram-poc/`

3. **Implementation Story**:
   - Create follow-up story for full implementation
   - Estimate effort based on spike findings

## Definition of Done

- [ ] All research questions answered
- [ ] Research document created
- [ ] Proof of concept code written
- [ ] Recommendation made
- [ ] Follow-up story created (if implementation recommended)
- [ ] Findings presented to team

## Follow-up Actions

[What happens after spike]

**Example**:
If spike recommends implementation:
- Create feature story for full implementation
- Include effort estimate from spike findings
- Prioritize based on business value

If spike recommends against implementation:
- Document findings
- Close related feature requests with explanation
- Consider alternative approaches

## Labels

- `spike`
- `research`
- `aws-ram`
```

---

## Jira Story Format Template

### Overview

For Jira-based workflows, use this comprehensive template format. This template uses Jira wiki markup and includes all necessary sections for a production-ready story.

### Complete Jira Template

```text
As a [persona]
I want [capability]
So that [business value]

h3. Acceptance Criteria
# Given [precondition], When [action], Then [expected outcome]
# Given [precondition], When [action], Then [expected outcome]
# [Continue with numbered acceptance criteria]
# Unit test coverage is ≥85% for [module] with [requirements]

h3. Description & Context

Why This Matters: [Explain business/technical importance]

Background:
* [Key background point 1]
* [Key background point 2]
* [Key background point 3]
* File structure: [Relevant file paths]

Dependencies:
* [Dependency 1]
* [Dependency 2]

Out of Scope:
* [Out of scope item 1]
* [Out of scope item 2]

Assumptions:
* [Assumption 1]
* [Assumption 2]

h3. Technical Guidance
* Suggested Approach: [High-level implementation approach]
* Key Files: [List relevant files]
* Testing Strategy: [Test approach and requirements]
* [Additional technical guidance as needed]

h3. Definition of Done
* [ ] [Deliverable 1]
* [ ] [Deliverable 2]
* [ ] Unit tests achieve ≥85% coverage
* [ ] Integration tests pass
* [ ] Documentation updated
* [ ] Demo shows [success criteria]
* [ ] No CDK Nag violations introduced

h3. Reference Materials

Existing Code:
* [Path to relevant code files]
* [Path to type definitions]
* [Path to documentation]

Tests:
* [Path to unit tests]
* [Path to integration tests]

Standards:
* docs/standards/testing/ - testing requirements
* docs/standards/constructs/ - construct patterns
```

### Real-World Example: Flow Log Validation Story

This example demonstrates a complete, production-ready Jira story:

```text
As a platform engineer
I want validated Flow Log constructs for all destination types with proven traffic capture
So that network monitoring is production-ready and traffic is verifiably logged

h3. Acceptance Criteria
# Given a VPC with Flow Logs enabled to S3, When network traffic occurs, Then Parquet-formatted logs appear in S3 bucket within 15 minutes
# Given a VPC with Flow Logs enabled to Kinesis Firehose, When network traffic occurs, Then logs are delivered to Firehose S3 destination within 15 minutes
# Given an organization bucket ARN is provided, When Flow Logs are created, Then existing bucket is used without modification or policy changes
# All three destination types (CloudWatch, S3, Kinesis) work simultaneously on same VPC
# Unit test coverage is ≥85% for flow-log module with all destination types tested

h3. Description & Context

Why This Matters: Flow Logs are critical for security monitoring, compliance, and troubleshooting. Current implementation has untested S3/Kinesis destinations, creating production risk. Engineers need confidence that logs are actually captured, not just configured.

Background:
* CloudWatch Logs destination is working (used in base VPC construct)
* S3 and Kinesis Firehose destination builders exist but aren't functionally validated
* Need to support organization-level S3 buckets for centralized logging
* File structure: src/constructs/vpc/flow-log/ with destination builders under destinations/

Dependencies:
* Existing constructs: EncryptedLogGroup, SecureBucket, SecureFirehose
* Integration test infrastructure for AWS deployment

Out of Scope:
* Real-time log streaming or analytics
* Cost optimization or log filtering
* Multi-region aggregation

Assumptions:
* Integration tests can deploy to real AWS account
* Network traffic can be generated via test EC2 instance
* 10-minute Flow Log aggregation interval is acceptable for testing

h3. Technical Guidance
* Suggested Approach: Deploy integration stack, generate traffic (ping/curl), query each destination after aggregation period
* Key Files: destinations/s3.ts, destinations/kinesis.ts, integ.flow-log.ts, new flow-log-functional.test.ts
* Testing Strategy: Integration stack creates real VPC + EC2 instance for traffic generation, functional test validates log presence
* Organization Bucket: When bucket.arn provided, import existing bucket without policy modifications (assume org-level policies)
* Timing: Flow Logs aggregate every 10 minutes (default), add 5-min buffer for delivery = 15-min test wait

h3. Definition of Done
* [ ] S3 destination validated - Parquet logs appear in bucket after traffic
* [ ] Kinesis Firehose destination validated - logs delivered to S3 destination
* [ ] Organization bucket ARN support works (cross-account scenario)
* [ ] All three destinations work simultaneously on same resource
* [ ] Unit tests achieve ≥85% coverage for flow-log module
* [ ] Functional test proves traffic capture (not just CFN validation)
* [ ] Integration stack deploys successfully and generates traffic
* [ ] Documentation updated with functional test instructions
* [ ] Demo shows logs captured in all three destinations with actual traffic
* [ ] No CDK Nag violations introduced

h3. Reference Materials

Existing Code:
* src/constructs/vpc/flow-log/ - main construct directory
* src/constructs/vpc/flow-log/types.ts - complete type definitions
* src/constructs/vpc/flow-log/README.md - API documentation
* src/constructs/vpc/flow-log/destinations/log-groups.ts - working CloudWatch example

Tests:
* src/test/vpc/flow-log.test.ts - unit tests (needs expansion)
* src/integration/vpc/integ.flow-log.ts - basic integration stack
* src/integration/vpc/flow-log.integration.test.ts - CFN validation only

Standards:
* docs/standards/testing/ - testing requirements and coverage targets
* docs/standards/constructs/ - construct organization standards
```

### Key Elements of a Good Jira Story

1. **Clear User Story**: Persona + Want + So That
2. **Measurable Acceptance Criteria**: Given/When/Then format
3. **Context Section**: Why it matters, background, dependencies
4. **Technical Guidance**: Concrete implementation direction
5. **Complete DoD**: Checkboxes for all deliverables
6. **Reference Materials**: Links to relevant code and docs

### When to Use Jira Format vs GitHub Markdown

| Format | When to Use |
|--------|-------------|
| **Jira Wiki Markup** | Creating stories in Jira, formal project management |
| **GitHub Markdown** | Creating issues in GitHub, informal tracking |

Both formats should contain the same information, just with different syntax.

---

## AI Agent Story Creation Workflow

### Step 1: Identify Story Type

Determine which template to use:

| Situation | Template |
|-----------|----------|
| Adding new functionality | [Feature Story](#feature-story-template) |
| Something is broken | [Bug Report](#bug-report-template) |
| Code needs improvement | [Technical Debt](#technical-debt-template) |
| Documentation needed | [Documentation](#documentation-template) |
| Research required | [Spike](#spike-template) |

---

### Step 2: Fill Out Template

Copy appropriate template and fill in all sections.

**Tips**:
- Be specific and concrete
- Include examples
- Add acceptance criteria for features
- Add steps to reproduce for bugs
- Include code snippets where helpful

---

### Step 3: Add Labels

Apply appropriate labels:

| Label Type | Options |
|------------|---------|
| **Type** | `new feature`, `bug fix`, `maintenance`, `documentation`, `spike` |
| **Component** | `aws-s3`, `aws-vpc`, `aws-dynamodb`, `testing`, `standards` |
| **Priority** | `critical`, `high`, `medium`, `low` |
| **Status** | `todo`, `in-progress`, `blocked`, `review` |

---

### Step 4: Create Issue

```bash
# GitHub CLI
gh issue create \
  --title "feat: Add SecureBucket construct with KMS encryption" \
  --body-file story-template.md \
  --label "new feature,aws-s3,security" \
  --assignee @me

# Or create via GitHub Web UI
```

---

### Step 5: Link to Project Board

Add to appropriate project board/column:

- **Backlog**: Not yet started
- **Todo**: Ready to work
- **In Progress**: Currently working
- **Review**: Ready for review
- **Done**: Completed

---

## Common Mistakes

### Mistake 1: Vague Acceptance Criteria

```markdown
❌ BAD:
- [ ] Bucket should be secure

✅ GOOD:
- [ ] Given a new SecureBucket, when created, then all four Block Public Access settings should be enabled
- [ ] Given a new SecureBucket, when no encryption specified, then S3-managed encryption (SSE-S3) should be used
- [ ] Given a new SecureBucket, when created, then SSL enforcement policy should be attached
```

---

### Mistake 2: Missing Steps to Reproduce (Bugs)

```markdown
❌ BAD:
## Steps to Reproduce
It doesn't work.

✅ GOOD:
## Steps to Reproduce
1. Create VPC with this code: [code snippet]
2. Run `npm run build`
3. Observe error: [error message]
```

---

### Mistake 3: No Business Value (Features)

```markdown
❌ BAD:
## Business Value
We need this feature.

✅ GOOD:
## Business Value
- Reduces bucket creation time from 30 min to 2 min
- Eliminates 90% of security misconfigurations
- Saves $X per year in security incident costs
```

---

### Mistake 4: No Time Box (Spikes)

```markdown
❌ BAD:
[No time limit specified]

✅ GOOD:
## Time Box
Maximum: 2 days (16 hours)
If not complete, make decision with available information.
```

---

## Story Quality Checklist

Before creating a story, verify:

- [ ] **Title is clear and follows convention** (feat:, bug:, tech:, docs:, spike:)
- [ ] **Description is specific and detailed**
- [ ] **Acceptance criteria are measurable** (for features)
- [ ] **Steps to reproduce are clear** (for bugs)
- [ ] **Business value is explained** (for features)
- [ ] **Labels are applied** (type, component, priority)
- [ ] **Estimation is provided** (story points or hours)
- [ ] **Dependencies are listed** (if any)
- [ ] **Definition of Done is complete**

---

## References

- **CLAUDE.md**: [../../../CLAUDE.md](../../../CLAUDE.md) - Development workflow
- **Pull Request Standards**: [pull-request.md](./pull-request.md)
- **Testing Standards**: [../testing/README.md](../testing/README.md)

---

## Related Standards

- [pull-request.md](./pull-request.md) - PR creation
- [../testing/README.md](../testing/README.md) - Testing requirements
- [../testing/validation.md](../testing/validation.md) - Validation patterns

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

