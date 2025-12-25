# Developer Guides

**Audience**: Human Developers (You!)  
**Purpose**: Learn by example, tutorials, and practical guides

---

## What's in This Directory?

This directory contains **human-first documentation** - tutorials, guides, and practical examples to help you learn and use the constructs in this repository.

Unlike `docs/standards/` (which is written for AI agents with decision trees and technical specifications), these guides are written for humans with:
- 📖 **Clear explanations** of concepts
- 💡 **Real-world examples** and use cases
- 🚀 **Step-by-step tutorials** 
- 🎯 **Best practices** and tips
- ⚠️ **Common pitfalls** and how to avoid them

---

## Available Guides

### [organizations.md](./organizations.md) - AWS Organizations & Security Policies

**What you'll learn**: How to use the `OrganizationalServices` construct to manage AWS Organizations policies

**Topics covered**:
- Default security policies (Resource Control Policies and Declarative EC2 Policies)
- Basic usage examples
- Customizing default policies
- Disabling policies when needed
- Migrating from BaseRootPayerStack
- Configuration options

**Perfect for**: Anyone setting up AWS Organizations with security policies

**Time**: 10-15 minutes

---

## How to Use These Guides

### For Beginners

Start here if you're new to this repository:

1. Read the guide for the construct you want to use
2. Copy and paste the examples into your project
3. Customize the examples for your needs
4. Refer to `docs/standards/` if you need technical specifications

### For Experienced Developers

Use these guides as:
- **Quick reference** for common patterns
- **Examples** of best practices
- **Migration guides** when updating constructs

---

## What's the Difference?

### `docs/guides/` (Human-First) 👤

**Written for**: You (a human developer)

**Style**: 
- Conversational and friendly
- Example-driven
- Use cases and scenarios
- "How do I..." questions
- Tips and tricks

**When to use**: 
- Learning a new construct
- Looking for examples
- Understanding use cases
- Getting started quickly

---

### `docs/standards/` (Agent-First) 🤖

**Written for**: AI agents and developers needing technical specs

**Style**:
- Decision trees and checklists
- Technical specifications
- Strict rules and patterns
- "Must", "Should", "Must not" language
- Comprehensive references

**When to use**:
- Building new constructs
- Code reviews
- Understanding technical constraints
- Automated tooling and agents

---

## Need Something Else?

### Looking for technical specifications?
→ See `docs/standards/` for layer-based construct standards

### Want to understand the architecture?
→ See `docs/analysis/` for architectural decisions and analyses

### Need to understand governance?
→ See `CLAUDE.md` for repository rules and `AGENTS.md` for agent workflows

### Want API documentation?
→ See the JSDoc comments in the source code

---

## Contributing a Guide

Want to add a guide? Great! Here's what makes a good developer guide:

### ✅ Good Guide Characteristics

- **Practical examples** that readers can copy and use
- **Clear explanations** of why, not just how
- **Progressive complexity** - start simple, then show advanced usage
- **Real-world scenarios** - show actual use cases
- **Troubleshooting** - anticipate common questions and problems
- **Migration guides** - help users move from old to new patterns

### ❌ Avoid

- Dumping raw API specifications (that belongs in JSDoc)
- Decision trees without context (that belongs in `docs/standards/`)
- Just listing properties without explaining use cases
- Technical jargon without explanation

---

## Guide Template

When creating a new guide, use this structure:

```markdown
# [Feature Name] Guide

**What you'll learn**: [One sentence description]

## Overview

[Brief introduction to the concept and why it matters]

## Prerequisites

- [List any requirements]
- [Tools needed]
- [Knowledge required]

## Basic Usage

[Simple, copy-paste example that works]

## Common Use Cases

### Use Case 1: [Name]
[Example and explanation]

### Use Case 2: [Name]
[Example and explanation]

## Advanced Patterns

[More complex examples for experienced users]

## Configuration Options

[Table or list of options with descriptions]

## Troubleshooting

### Problem: [Common issue]
**Solution**: [How to fix it]

## Migration

[If replacing older patterns, show before/after]

## Next Steps

[Links to related guides or documentation]
```

---

## Feedback

Found something unclear? Have a suggestion? Let us know:
- Open an issue describing what could be improved
- Suggest examples you'd like to see
- Share use cases that aren't covered

---

## Summary

**docs/guides/** = Learn by example (for humans)  
**docs/standards/** = Technical specifications (for agents)

Start here, explore examples, and build great things! 🚀

