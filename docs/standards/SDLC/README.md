# SDLC Process Standards

**Entry Point**: Software Development Lifecycle Standards for All Personas

**Audience**: Developers, AI Agents, Product Managers, Project Leads  
**Scope**: Pull requests, stories, issues, and SDLC processes  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This directory contains **SDLC (Software Development Lifecycle) process standards** that apply to all team members. These standards define how to create pull requests, write stories, report bugs, and manage the development workflow.

**Core Philosophy**: Clear processes enable effective collaboration and quality delivery.

---

## Quick Reference

| Standard | Persona | Purpose | When to Use |
|----------|---------|---------|-------------|
| **[pull-request.md](./pull-request.md)** | Developers, AI Agents | PR creation template and guidelines | Before creating any PR |
| **[stories.md](./stories.md)** | All | Story/issue templates | Creating features, bugs, or tasks |

---

## Decision Tree: Which Standard Do I Need?

### Starting Point: What Am I Doing?

```text
What am I doing?

├── Creating a pull request?
│   └── READ: pull-request.md
│       Includes:
│       - Complete PR template (copy-paste ready)
│       - PR title conventions (feat:, fix:, docs:, etc.)
│       - Description format
│       - Testing evidence requirements
│       - Complete checklist
│       - Label requirements
│
└── Creating a story or issue?
    └── READ: stories.md
        Templates for:
        - Feature Story (with acceptance criteria)
        - Bug Report (with reproduction steps)
        - Technical Debt (with impact analysis)
        - Documentation (with scope definition)
        - Spike (with time box and deliverables)
        - Jira Story Format (complete wiki markup template)
```

---

## SDLC Standards

### [pull-request.md](./pull-request.md) - Pull Request Creation

**Purpose**: Complete template and guidelines for creating pull requests

**Target Persona**: 
- Developers (creating PRs)
- AI Agents (automated PR creation)
- Code Reviewers (reviewing PRs)

**Key Contents**:
- **PR Template** - Copy-paste ready GitHub PR template
- **Title Conventions** - Conventional commit prefixes (feat:, fix:, docs:, etc.)
- **Description Format** - What changed, why, and how
- **Type of Change** - Checkboxes for categorization
- **Testing Evidence** - How to document testing
- **PR Checklist** - 10-item checklist with explanations
- **Label Requirements** - Release note labels
- **AI Agent Workflow** - Step-by-step PR creation for agents
- **Common Mistakes** - What to avoid
- **Troubleshooting** - CI failures, merge conflicts, etc.

**When to Read**: Before creating any pull request

**Example PR Title**:
```text
✅ feat: Add SecureBucket construct with KMS encryption support
✅ fix: Resolve VPC CIDR allocation validation error
✅ docs: Update naming conventions with singular/plural examples
```

---

### [stories.md](./stories.md) - Story and Issue Creation

**Purpose**: Templates for creating well-structured stories and issues

**Target Persona**:
- Product Managers (feature stories)
- Developers (technical debt, bugs)
- Technical Leads (spikes, documentation)
- All team members (issue creation)

**Key Contents**:
- **Feature Story Template** - User story with acceptance criteria
- **Bug Report Template** - Reproduction steps and environment
- **Technical Debt Template** - Current problem and proposed solution
- **Documentation Template** - What needs documentation and why
- **Spike Template** - Research question with time box
- **Jira Story Format Template** - Complete Jira wiki markup template with real-world example
- **AI Agent Workflow** - Step-by-step story creation
- **Story Quality Checklist** - Ensure stories are well-formed
- **Common Mistakes** - What to avoid

**When to Read**: Creating any story, issue, or task

**Example Story Titles**:
```text
✅ feat: Add SecureBucket construct with KMS encryption
✅ bug: VPC CIDR validation rejects valid IPv6 auto-assignment
✅ tech: Extract validation logic into reusable helper functions
✅ docs: Add anti-patterns guide for common mistakes
✅ spike: Investigate Lambda SnapStart support for Node.js 18
```

---

## Workflows

### Workflow 1: Feature Development Lifecycle

```text
Step 1: Create Feature Story
└─ Read: stories.md (Feature Story template)
   - Write user story (As a... I want... So that...)
   - Define acceptance criteria
   - Add business value justification

Step 2: Develop Feature
└─ Read: ../common/ standards for construct development
   - Follow naming conventions
   - Implement security best practices
   - Write tests
   - Follow TypeScript patterns

Step 3: Create Pull Request
└─ Read: pull-request.md (PR template)
   - Write clear title (feat: ...)
   - Fill out PR template
   - Provide testing evidence
   - Check all checklist items
   - Apply labels

Step 4: Code Review & Merge
└─ Respond to feedback
   - Address review comments
   - Update PR with changes
   - Re-request review

Step 5: Deploy & Verify
└─ See: ../testing/stack.md for deployment testing
```

---

### Workflow 2: Bug Fix Lifecycle

```text
Step 1: Report Bug
└─ Read: stories.md (Bug Report template)
   - Provide steps to reproduce
   - Document expected vs actual behavior
   - Include environment details
   - Attach screenshots/logs

Step 2: Fix Bug
└─ Implement fix following standards
   - Add regression tests
   - Verify fix locally

Step 3: Create Pull Request
└─ Read: pull-request.md
   - Write clear title (fix: ...)
   - Reference bug report
   - Provide before/after testing evidence

Step 4: Verify Fix
└─ Deploy and verify in test environment
```

---

### Workflow 3: Technical Debt Cleanup

```text
Step 1: Identify Tech Debt
└─ Read: stories.md (Technical Debt template)
   - Document current problem
   - Propose solution
   - Estimate impact if not addressed
   - Estimate effort

Step 2: Prioritize with Team
└─ Discuss with tech lead
   - Balance with feature work
   - Schedule for appropriate sprint

Step 3: Execute Cleanup
└─ Refactor following standards
   - Maintain test coverage
   - Ensure no regressions

Step 4: Create Pull Request
└─ Read: pull-request.md
   - Write clear title (refactor: or tech: ...)
   - Document improvements
   - Show before/after metrics
```

---

## Personas and Their Standards

### For Developers (All Standards)

**Primary Standards**:
1. [pull-request.md](./pull-request.md) - Every PR you create
2. [stories.md](./stories.md) - Bug reports, technical debt

**Related Standards**:
- [../common/](../common/) - Construct development
- [../testing/](../testing/) - Testing requirements
- [../L2/](../L2/), [../L3/](../L3/) - Layer-specific standards

---

### For AI Agents (Automated Workflows)

**Primary Standards**:
1. [pull-request.md](./pull-request.md) - Automated PR creation
   - Follow PR template exactly
   - Provide complete testing evidence
   - Apply appropriate labels
2. [stories.md](./stories.md) - Story validation
   - Verify story has acceptance criteria
   - Ensure bug reports have reproduction steps

**Related Standards**:
- [../common/](../common/) - All construct development standards
- [../testing/](../testing/) - Testing automation

---

### For Product Managers (Feature Definition)

**Primary Standards**:
1. [stories.md](./stories.md) - Feature stories
   - Write clear user stories
   - Define acceptance criteria (Given-When-Then)
   - Document business value
   - Estimate story points

**Related Standards**:
- [../common/security.md](../common/security.md) - Security requirements
- [../testing/](../testing/) - Testing expectations

---

### For Technical Leads (Planning & Architecture)

**Primary Standards**:
1. [stories.md](./stories.md) - All story types
   - Feature stories (review acceptance criteria)
   - Technical debt (prioritize)
   - Spikes (research and investigation)
   - Documentation (standards updates)
2. [pull-request.md](./pull-request.md) - Code review standards
   - Ensure PRs follow template
   - Verify testing evidence
   - Check checklist completeness

**Related Standards**:
- [../common/](../common/) - All standards for team guidance
- [../L2/](../L2/), [../L3/](../L3/), [../L4/](../L4/) - Architecture patterns

---

## AI Agent Guidelines

### Decision Logic

**Question 1**: Am I creating a PR?
- **YES** → Read [pull-request.md](./pull-request.md)
  - Use PR template
  - Follow title conventions
  - Provide testing evidence
  - Check all checklist items

**Question 2**: Am I creating a story or issue?
- **YES** → Read [stories.md](./stories.md)
  - Choose appropriate template (Feature, Bug, Tech Debt, Docs, Spike)
  - Fill out all required sections
  - Include examples and acceptance criteria

---

### Quick Checklist for AI Agents

#### Before Creating a PR:

- [ ] **Title follows convention** (feat:, fix:, docs:, etc.)
- [ ] **Description is complete** (what, why, how)
- [ ] **Testing evidence provided** (unit, integration, stack tests)
- [ ] **All checklist items checked**
- [ ] **Appropriate label applied** (new feature, bug fix, etc.)
- [ ] **All tests passing locally**

#### Before Creating a Story:

- [ ] **Appropriate template used** (Feature, Bug, Tech Debt, Docs, Spike)
- [ ] **All template sections filled out**
- [ ] **Clear acceptance criteria** (for features)
- [ ] **Reproduction steps** (for bugs)
- [ ] **Business value documented** (for features)
- [ ] **Effort estimated** (story points or hours)

---

## Common Patterns

### Pattern: Feature Story → Development → PR

```text
1. Product Manager creates Feature Story
   └─ Uses stories.md Feature Story template
   └─ Defines acceptance criteria
   └─ Adds business value

2. Developer implements feature
   └─ Follows ../common/ standards
   └─ Writes tests per ../testing/ standards
   └─ Follows layer standards (../L2/, ../L3/)

3. Developer creates PR
   └─ Uses pull-request.md PR template
   └─ References feature story
   └─ Provides testing evidence
   └─ Checks all checklist items

4. Code Review & Merge
   └─ Technical Lead reviews
   └─ Developer addresses feedback
   └─ PR merged after approval

5. Verify Acceptance Criteria
   └─ Product Manager verifies
   └─ Story marked complete
```

---

### Pattern: Bug Discovery → Fix → Verification

```text
1. User/Developer discovers bug
   └─ Creates Bug Report using stories.md template
   └─ Provides reproduction steps
   └─ Documents expected vs actual behavior

2. Developer investigates & fixes
   └─ Identifies root cause
   └─ Implements fix
   └─ Adds regression tests

3. Developer creates PR
   └─ Uses pull-request.md template
   └─ References bug report
   └─ Shows before/after testing

4. Verification
   └─ Code review
   └─ Deploy to test environment
   └─ Verify fix resolves issue
   └─ Close bug report
```

---

## Troubleshooting

### Issue: "My PR was rejected due to incomplete template"

**Solution**: Review [pull-request.md](./pull-request.md) checklist
- Ensure all sections filled out
- Provide testing evidence with commands and results
- Check all checklist items
- Apply appropriate label

---

### Issue: "My story lacks acceptance criteria"

**Solution**: Review [stories.md](./stories.md) Feature Story template
- Write Given-When-Then format:
  - **Given** [precondition]
  - **When** [action]
  - **Then** [expected outcome]
- Be specific and measurable
- Include examples

---

### Issue: "Not sure which story template to use"

**Decision Tree**:
```text
What are you creating?

├── New functionality? → Feature Story
├── Something broken? → Bug Report
├── Code needs improvement? → Technical Debt
├── Documentation needed? → Documentation
└── Research required? → Spike
```

---

## References

All SDLC standards link back to:

- **Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)
- **Construct Standards**: [../common/](../common/)
- **Testing Standards**: [../testing/](../testing/)
- **Layer Standards**: [../L2/](../L2/), [../L3/](../L3/), [../L4/](../L4/)

---

## Navigation

- **Up**: [standards/](../) - Main standards index
- **Related**:
  - [common/](../common/) - Construct development standards
  - [testing/](../testing/) - Testing standards
  - [L2/](../L2/), [L3/](../L3/), [L4/](../L4/) - Layer-specific standards

---

## Summary

This directory contains SDLC process standards:

**Process Standards**:
1. [pull-request.md](./pull-request.md) - How to create PRs
2. [stories.md](./stories.md) - How to create stories/issues

**Target Personas**:
- **Developers**: Pull requests, bug reports, technical debt
- **AI Agents**: Automated PR creation, story validation
- **Product Managers**: Feature stories, acceptance criteria
- **Technical Leads**: All story types, code review standards

**Start Here**: 
- Creating a PR? → [pull-request.md](./pull-request.md)
- Creating a story? → [stories.md](./stories.md)

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

