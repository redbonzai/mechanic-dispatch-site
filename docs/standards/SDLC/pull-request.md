# Pull Request Standards

**Entry Point**: Pull Request Creation Guide for AI Agents

**Audience**: AI Agents and Developers  
**Scope**: All pull requests to this repository  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This document defines standards for creating pull requests (PRs). All PRs MUST follow this template and checklist to ensure quality, consistency, and proper review.

**Core Philosophy**: PRs should tell a story - what, why, how, and verification.

---

## Quick Reference

| PR Element | Requirement | Purpose |
|------------|-------------|---------|
| **Title** | Concise, descriptive | Used in release notes |
| **Description** | What + Why | Context for reviewers |
| **Type of Change** | Required checkbox | Categorization |
| **Testing** | Evidence of testing | Verification |
| **Checklist** | All items checked | Quality gate |
| **Labels** | Appropriate label | Release notes categorization |

---

## Pull Request Template

**Note**: This template is automatically populated by GitHub when you create a PR via the web interface (from `.github/pull_request_template.md`).

Copy this template when creating a PR manually or via CLI:

```markdown
<!--

The PR title will be used in the release notes.

Please ensure the title explains the PR in a concise manner that makes sense for release notes.

-->

# Description

<!--

Describe what this PR accomplishes.

If this relates to a GitHub issue or Jira ticket, please link it here.

-->

**Jira Ticket**: [Ticket ID](link-to-jira-ticket)

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update
- [ ] Maintenance (version updates, etc)

# Work Remaining

<!--

Please describe any work that is left to do or known issues before this PR can be merged.

If this PR is a work in progress, make this a Draft PR.

-->

# How Has This Been Tested?

<!--

Please describe the tests that you ran to verify your changes.

Provide instructions so your tests can be reproduced.

Please also list any relevant details for your test configuration.

-->

# Pull Request Checklist

<!--

Labels are used to organize release notes. Please ensure that an appropriate label is added.

Labels included in release notes:

breaking change, new feature, bug fix, enhancement, maintenance, documentation, security fix, dependencies

If this PR should not be included in release notes use the 'skip-changelog' label

-->

- [ ] I have applied an applicable **label** to this PR
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] I have attached screenshots (if applicable)
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
- [ ] After creating this PR, I have resolved any issues with the automated PR checks
```

---

## PR Title Guidelines

**Rule**: Titles should be concise and descriptive. They appear in release notes.

### Good Titles

```text
✅ feat: Add SecureBucket construct with KMS encryption support
✅ fix: Resolve VPC CIDR allocation validation error
✅ docs: Update NAMING-CONVENTIONS with singular/plural examples
✅ refactor: Extract validation logic into reusable helpers
✅ test: Add integration tests for SecureVpc construct
✅ chore: Update aws-cdk-lib to 2.120.0
```

### Bad Titles

```text
❌ Update code
❌ Fix bug
❌ PR for feature
❌ Changes
❌ Stuff
```

### Title Conventions

Use conventional commit prefixes:

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feat:` | New feature | feat: Add SecureTable construct |
| `fix:` | Bug fix | fix: Correct CIDR validation logic |
| `docs:` | Documentation only | docs: Add anti-patterns guide |
| `test:` | Tests only | test: Add unit tests for VPC |
| `refactor:` | Code refactor | refactor: Extract common validation |
| `chore:` | Maintenance | chore: Update dependencies |
| `perf:` | Performance improvement | perf: Optimize CIDR calculations |
| `style:` | Code style/format | style: Run prettier on all files |
| `ci:` | CI/CD changes | ci: Add automated linting |

---

## Description Section

**Rule**: Provide clear context about what changed and why.

### Template

```markdown
# Description

This PR adds a new `SecureBucket` construct that provides:
- S3-managed encryption by default
- Blocked public access (all four BPA settings)
- SSL enforcement via bucket policy
- Optional access logging
- Optional KMS customer-managed key support

**Why**: Current S3 bucket usage requires manual configuration of security
settings. This construct provides secure defaults and enforces best practices.

**Jira Ticket**: [INFRA-123](https://jira.example.com/browse/INFRA-123)
```

### Good Descriptions

```markdown
✅ GOOD: Clear what and why

This PR fixes a validation bug in VPC CIDR allocation where the validator
incorrectly rejected valid IPv6 auto-assignment configurations.

**Root Cause**: The validator checked for `block` property on IPv6 CIDRs
with `auto: true`, but `auto` CIDRs should not have `block`.

**Fix**: Updated validator to allow IPv6 CIDRs with only `auto: true`.

**Jira Ticket**: [BUG-456](https://jira.example.com/browse/BUG-456)
```

### Bad Descriptions

```markdown
❌ BAD: No context

Fixed the bug.

---

❌ BAD: Too vague

Made some changes to the VPC code.

---

❌ BAD: No link to ticket

This PR adds a new construct.
```

---

## Type of Change

**Rule**: Check ALL applicable boxes.

```markdown
## Type of change

- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update
- [ ] Maintenance (version updates, etc)
```

**Multiple boxes OK**: A bug fix that requires documentation update should check both boxes.

---

## Work Remaining

**Rule**: Document any known issues or incomplete work.

### If Complete

```markdown
# Work Remaining

None. PR is ready for review.
```

### If Incomplete (Draft PR)

```markdown
# Work Remaining

- [ ] Add integration tests for SecureBucket
- [ ] Update COMMON-INTERFACES.md with BucketEncryptionConfig
- [ ] Add CDK Nag suppressions for CloudFront use case

**Note**: This is a Draft PR for early feedback on the interface design.
```

**Rule**: If work remains, mark PR as **Draft** until complete.

---

## How Has This Been Tested?

**Rule**: Provide evidence of testing with instructions to reproduce.

### Template

```markdown
# How Has This Been Tested?

## Unit Tests

```bash
npm run test -- src/test/s3/secure-bucket.test.ts
```

**Results**: All 15 tests passing
- ✅ Creates bucket with default S3-managed encryption
- ✅ Accepts customer-managed KMS key
- ✅ Blocks public access (all four settings)
- ✅ Enforces SSL via bucket policy
- ✅ Validates mutual exclusivity of kmsKey and kmsKeyArn

## Integration Tests

```bash
npm run test:integration -- src/integration/s3/integ.secure-bucket.ts
```

**Results**: CDK synthesis successful, 0 errors

## Stack Tests (Manual)

Deployed to dev account `123456789012`:

```bash
npx cdk deploy SecureBucketTestStack --profile dev
```

**Verification**:
```bash
# Verify encryption
aws s3api get-bucket-encryption --bucket test-secure-bucket-20231201 --profile dev

# Verify public access block
aws s3api get-public-access-block --bucket test-secure-bucket-20231201 --profile dev

# Verify bucket policy (SSL enforcement)
aws s3api get-bucket-policy --bucket test-secure-bucket-20231201 --profile dev
```

**Results**: All security settings verified as expected.

**Cleanup**:
```bash
npx cdk destroy SecureBucketTestStack --profile dev
```

## Test Configuration

- **Node version**: 18.18.0
- **AWS CDK version**: 2.120.0
- **AWS Account**: dev (123456789012)
- **Region**: us-east-1
```

### Good Testing Descriptions

```markdown
✅ GOOD: Specific commands and results

## Unit Tests

```bash
npm run test -- src/test/vpc/vpc.test.ts
```

**Results**: 42/42 tests passing, 95% coverage

## Integration Tests

```bash
npm run test:integration
```

**Results**: All CDK assertions passed, no errors

## Manual Testing

Deployed to dev account and verified:
- VPC created with 3 AZs
- Flow logs writing to CloudWatch
- DNS hostnames enabled
```

### Bad Testing Descriptions

```markdown
❌ BAD: Vague

Tested it and it works.

---

❌ BAD: No commands

Ran some tests.

---

❌ BAD: No results

```bash
npm run test
```

(No indication if tests passed or failed)
```

---

## Pull Request Checklist

**Rule**: ALL boxes must be checked before requesting review (or mark as Draft).

```markdown
# Pull Request Checklist

- [x] I have applied an applicable **label** to this PR
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [ ] I have attached screenshots (if applicable)
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
- [x] After creating this PR, I have resolved any issues with the automated PR checks
```

### Checklist Items Explained

#### 1. Applied Applicable Label

**Purpose**: Labels categorize PRs for release notes.

**Release Note Labels**:
- `new feature` - New functionality
- `bug fix` - Fixes an issue
- `breaking change` - Breaking API change
- `enhancement` - Improvement to existing feature
- `maintenance` - Dependency updates, refactoring
- `documentation` - Documentation only
- `security fix` - Security-related fix
- `dependencies` - Dependency updates

**Special Labels**:
- `skip-changelog` - Don't include in release notes

**Rule**: Every PR MUST have at least one release note label (unless `skip-changelog`).

---

#### 2. Code Follows Style Guidelines

**Verify**:
- [ ] Code passes ESLint (`npm run lint`)
- [ ] Code passes Prettier (`npm run format:check`)
- [ ] Follows naming conventions (see [naming.md](./naming.md))
- [ ] Follows module structure (see [L2/structure.md](../L2/structure.md))
- [ ] No anti-patterns (see [anti-patterns.md](./anti-patterns.md))

---

#### 3. Self-Review Performed

**Verify**:
- [ ] Read through all changes in diff
- [ ] Removed debug statements and console.logs
- [ ] Removed commented-out code
- [ ] No hardcoded credentials or secrets
- [ ] Error messages are clear and helpful
- [ ] No TODO comments (create issues instead)

---

#### 4. Commented Hard-to-Understand Code

**Verify**:
- [ ] Complex algorithms explained
- [ ] Non-obvious business logic documented
- [ ] JSDoc comments on public APIs
- [ ] WHY explained, not WHAT (code shows what)

```typescript
// ✅ GOOD: Explains WHY
// Use floor division to ensure consistent rounding behavior
// across different subnet sizes (avoids floating point issues)
const subnetSize = Math.floor(vpcSize / subnetCount);

// ❌ BAD: Explains WHAT (obvious from code)
// Divide vpcSize by subnetCount
const subnetSize = vpcSize / subnetCount;
```

---

#### 5. Documentation Updated

**Verify**:
- [ ] README.md updated (if public API changed)
- [ ] CHANGELOG.md entry added (if applicable)
- [ ] JSDoc comments on new public APIs
- [ ] Examples updated (if usage changed)
- [ ] Standards docs updated (if patterns changed)

---

#### 6. Screenshots Attached (if applicable)

**When Required**:
- UI changes
- Architectural diagrams
- Before/after comparisons

**Format**:
```markdown
## Screenshots

### Before
![Before](./screenshots/before.png)

### After
![After](./screenshots/after.png)
```

---

#### 7. Tests Added

**Verify**:
- [ ] Unit tests for new code (`src/test/`)
- [ ] Integration tests for construct (`src/integration/`)
- [ ] Tests cover edge cases
- [ ] Tests cover error conditions
- [ ] Coverage meets requirements (85%+ line, 80%+ branch)

**See**: [testing/README.md](../testing/README.md)

---

#### 8. All Tests Pass Locally

**Verify**:
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Linting
npm run lint

# Build
npm run build
```

**Rule**: All checks must pass before requesting review.

---

#### 9. Dependent Changes Merged

**When Applicable**:
- Changes depend on another PR
- Changes depend on upstream package update
- Changes require infrastructure updates

**Verify**:
- [ ] Dependent PRs merged
- [ ] Package versions updated in package.json
- [ ] Infrastructure changes deployed (if applicable)

---

#### 10. Automated PR Checks Resolved

**Verify**:
- [ ] CI/CD pipeline passing (green checkmarks)
- [ ] No merge conflicts
- [ ] Branch up to date with main/master
- [ ] CodeCov passing (if applicable)
- [ ] Security scans passing

**If Failing**:
1. Review CI logs
2. Fix issues locally
3. Push fixes
4. Wait for re-run
5. Repeat until all green

---

## AI Agent PR Creation Workflow

### Step 1: Verify Completeness

Before creating PR, verify:

```bash
# Run all checks
npm run test               # Unit tests
npm run test:integration   # Integration tests
npm run lint               # ESLint
npm run format:check       # Prettier
npm run build              # TypeScript compilation
```

**All must pass** before creating PR.

---

### Step 2: Prepare PR Description

Create PR description file (e.g., `pr-description.md`):

```markdown
# Description

[What changed and why]

**Jira Ticket**: [Link]

## Type of change

- [x] [Applicable types]

# Work Remaining

[None or list items]

# How Has This Been Tested?

[Detailed testing evidence]

# Pull Request Checklist

- [x] [All applicable items checked]
```

---

### Step 3: Create Pull Request

```bash
# Option 1: GitHub CLI
gh pr create \
  --title "feat: Add SecureBucket construct" \
  --body-file pr-description.md \
  --label "new feature" \
  --base main

# Option 2: Web UI
# Navigate to GitHub and create PR manually with prepared description
```

---

### Step 4: Add Labels

**Required**: At least one release note label

```bash
# GitHub CLI
gh pr edit <PR_NUMBER> --add-label "new feature"

# Or via Web UI
```

---

### Step 5: Request Review

```bash
# GitHub CLI
gh pr review <PR_NUMBER> --request-reviewer @username

# Or via Web UI: Click "Reviewers" and select reviewers
```

---

### Step 6: Respond to Feedback

When reviewer requests changes:

1. **Acknowledge**: Comment on PR acknowledging feedback
2. **Make Changes**: Implement requested changes
3. **Update PR**: Push changes to same branch
4. **Respond**: Comment on specific feedback items explaining changes
5. **Re-request Review**: Mark conversations as resolved and re-request review

**Example Response**:
```markdown
## Feedback Response

### Comment 1: Add validation for kmsKey mutual exclusivity

✅ **Resolved**: Added validation in constructor to check mutual exclusivity of
`kmsKey` and `kmsKeyArn`. See commit abc123.

### Comment 2: Add JSDoc example for encryption config

✅ **Resolved**: Added example to JSDoc showing both S3-managed and KMS
encryption. See commit def456.

### Comment 3: Increase test coverage for error cases

✅ **Resolved**: Added 5 new tests for error conditions. Coverage now 94% line,
89% branch. See commit ghi789.

---

**All feedback addressed. Ready for re-review.**
```

---

## Common Mistakes

### Mistake 1: Vague PR Title

```text
❌ BAD: "Update code"
✅ GOOD: "feat: Add SecureBucket construct with KMS encryption"
```

---

### Mistake 2: No Testing Evidence

```markdown
❌ BAD:
# How Has This Been Tested?

Tested it.

---

✅ GOOD:
# How Has This Been Tested?

## Unit Tests
```bash
npm run test -- src/test/s3/secure-bucket.test.ts
```
Results: 15/15 tests passing, 95% coverage
```

---

### Mistake 3: Incomplete Checklist

```markdown
❌ BAD: Checklist has unchecked items but PR is not Draft

- [ ] I have added tests  # ❌ Not done!
- [x] Tests pass locally

---

✅ GOOD: All items checked OR PR is Draft

- [x] I have added tests
- [x] Tests pass locally
```

---

### Mistake 4: No Label

```text
❌ BAD: PR created without any labels

✅ GOOD: PR has "new feature" label applied
```

---

## Troubleshooting

### Issue: "CI checks failing"

**Solution**:
1. Review CI logs on GitHub
2. Fix issues locally
3. Run checks locally before pushing
4. Push fixes
5. CI will re-run automatically

---

### Issue: "Merge conflicts"

**Solution**:
```bash
# Update local main
git checkout main
git pull origin main

# Rebase feature branch
git checkout feature/my-feature
git rebase main

# Resolve conflicts
# (Edit files, remove conflict markers)

# Continue rebase
git add .
git rebase --continue

# Force push (rebased branch)
git push --force-with-lease
```

---

### Issue: "PR description too long for GitHub"

**Solution**:
1. Move detailed test results to PR comment
2. Link to external documents if needed
3. Keep description focused on what/why
4. Put "how" details in comments

---

## References

- **GitHub PR Template**: [.github/pull_request_template.md](../../../.github/pull_request_template.md) - Official template file
- **CLAUDE.md**: [../../../CLAUDE.md](../../../CLAUDE.md) - Main development workflow
- **Testing Standards**: [../testing/README.md](../testing/README.md)
- **Style Guidelines**: [../common/typescript.md](../common/typescript.md)
- **Naming Conventions**: [../common/naming.md](../common/naming.md)

---

## Related Standards

- [stories.md](./stories.md) - Story/issue creation
- [../testing/README.md](../testing/README.md) - Testing requirements
- [../common/typescript.md](../common/typescript.md) - Code style
- [../common/naming.md](../common/naming.md) - Naming conventions

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)
