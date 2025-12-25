# Testing Standards

**Entry Point**: Testing documentation for AI agents and developers

---

## Overview

This directory contains **4 testing standards** organized by test type and credential requirements. Each standard provides comprehensive guidance, examples, and checklists.

---

## Quick Reference

| Test Type | File | AWS Credentials? | Duration | Use Case |
|-----------|------|------------------|----------|----------|
| **Unit Tests** | [unit.md](./unit.md) | ❌ No | < 5 min | Fast feedback, logic validation |
| **Integration Tests** | [integration.md](./integration.md) | ❌ No | < 5 min | Complex scenarios, compositions |
| **Validation** | [validation.md](./validation.md) | ❌ No* | N/A | Constructor patterns |
| **Stack Tests** | [stack.md](./stack.md) | ✅ Yes (AWS SSO) | 5-15 min | Real AWS deployment validation |

*Validation executes during synth (no AWS), but testing deployed resources requires AWS credentials

---

## Decision Tree: Which Test Do I Need?

### Starting Point: What Are You Doing?

```text
What are you testing?

├─ Testing construct logic and CloudFormation templates LOCALLY?
│  ├─ Testing individual methods/properties?
│  │  └─ READ: unit.md
│  │     • Fast feedback (< 1 min)
│  │     • No AWS credentials needed
│  │     • Tests: happy path, validation, defaults
│  │
│  └─ Testing multiple constructs working together?
│     └─ READ: integration.md
│        • Fast feedback (< 5 min)
│        • No AWS credentials needed
│        • Tests: compositions, relationships, scenarios
│
├─ Implementing constructor validation?
│  └─ READ: validation.md
│     • Fail-fast patterns
│     • Error message templates
│     • Type guards and accessors
│
└─ Testing actual AWS deployment?
   └─ READ: stack.md
      • Requires AWS SSO authentication
      • Costs money (usually < $0.01)
      • Real AWS resource validation
```

---

## Testing Workflow (Recommended Order)

### Phase 1: Local Development (Fast - No AWS)

```bash
# 1. Write unit tests first (< 1 min)
npx jest src/test/{module}

# 2. Write integration tests (< 2 min)
npx jest --config src/integration/jest.config.js --testPathPattern={module}

# 3. Run linter (< 30 sec)
npx eslint "src/constructs/{module}/**/*.ts"
```

**Why this order?** Fast feedback loops catch 80% of issues in < 3 minutes

---

### Phase 2: Pre-Deployment (Full Build)

```bash
# 4. Run full build (5-10 min)
npx projen build
```

**Only run when confident** local tests will pass

---

### Phase 3: AWS Deployment (Requires Authentication)

```bash
# 5. Request user authentication (AI pauses here)
aws sso login --profile <profile-name>

# 6. Deploy stack test (2-5 min + costs money)
npx cdk deploy --app "npx ts-node src/integration/{module}/integ.{module}.ts" --profile <profile>

# 7. Validate with AWS CLI (2-5 min)
# (See stack.md for validation commands)

# 8. Cleanup (1-3 min)
npx cdk destroy --app "npx ts-node src/integration/{module}/integ.{module}.ts" --profile <profile> --force
```

---

## When to Use Each Test Type

### Use Unit Tests When...

✅ Testing individual construct methods or properties
✅ Validating CloudFormation template generation
✅ Testing validation logic (error cases)
✅ Testing default values and behavior
✅ Need fast feedback during development
✅ Running in CI/CD pipeline

**Read**: [unit.md](./unit.md)

---

### Use Integration Tests When...

✅ Testing multiple constructs working together
✅ Testing L3 composition patterns
✅ Testing cross-resource relationships
✅ Testing complex scenarios and configurations
✅ Testing edge cases and boundary conditions
✅ Need fast feedback without AWS credentials

**Read**: [integration.md](./integration.md)

---

### Use Validation Patterns When...

✅ Implementing new construct constructors
✅ Need fail-fast validation patterns
✅ Want consistent error messages
✅ Need type guards for union types
✅ Creating type-safe accessor methods

**Read**: [validation.md](./validation.md)

---

### Use Stack Tests When...

✅ Validating actual AWS deployment
✅ Testing AWS service interactions
✅ Debugging AWS-specific issues
✅ Pre-release validation
✅ Need to verify security configurations in real AWS

**Read**: [stack.md](./stack.md)

**⚠️ Important**: Stack tests require AWS SSO authentication and cost money. Always run unit and integration tests first!

---

## Coverage Requirements

All constructs must meet these minimum coverage thresholds:

| Metric | Minimum | Target | Measured By |
|--------|---------|--------|-------------|
| Line coverage | 85% | 95% | Unit tests |
| Branch coverage | 80% | 90% | Unit tests |
| Function coverage | 90% | 100% | Unit tests |

**How to check**:

```bash
npm test -- --coverage
```

---

## Performance Requirements (MANDATORY)

All test files must meet these performance criteria:

| Requirement | Target | Maximum | Action if Exceeded |
|-------------|--------|---------|-------------------|
| Test file duration | < 10 seconds | < 30 seconds | Add to `.projen/jest-test-sequencer.js` |
| `Template.fromStack()` calls | Minimize | Use `beforeAll()` | Refactor to share templates |
| Lambda bundling operations | Minimize | 3 per file (hard cap) | Split into multiple test files |

**Critical Guidelines** (see [unit.md](./unit.md) - Performance Optimization):
- ✅ Use `beforeAll()` with single `Template.fromStack()` per configuration
- ✅ Limit lambda function bundling to maximum 3 per test file
- ✅ Benchmark test duration before submitting: `npx jest <test-file> --verbose`
- ✅ Tests > 30 seconds must be added to `.projen/jest-test-sequencer.js` for sharding

**Why this matters**: Fast tests enable quick feedback loops and efficient CI/CD pipelines.

**Read**: [unit.md - Performance Optimization](./unit.md#performance-optimization) for detailed guidelines and examples.

---

## Test Organization

### Directory Structure

```text
src/
├── test/                           # Unit tests (JSII - no AWS)
│   └── {module}/
│       ├── {module}.test.ts        # Main construct tests
│       └── {submodule}/
│           └── {submodule}.test.ts
│
└── integration/                    # Integration tests
    └── {module}/
        ├── {module}.integration.test.ts    # Jest integration (JSII - no AWS)
        └── integ.{module}.ts               # CDK stack test (requires AWS)
```

---

## Required Test Categories

For each construct, you must test:

| Category | Test Name Pattern | Where |
|----------|-------------------|-------|
| **Happy path** | `creates {resource} with {config}` | unit.md |
| **Missing required** | `throws when {property} missing` | unit.md |
| **Invalid value** | `throws when {property} is {invalid}` | unit.md |
| **Mutual exclusivity** | `throws when both {prop1} and {prop2}` | unit.md |
| **Default behavior** | `uses default {property} when not specified` | unit.md |
| **Composition** | `creates {pattern} with integrated {resources}` | integration.md |
| **Real deployment** | Deploy and validate in AWS | stack.md |

---

## Common Patterns

### Pattern 1: Test-Driven Development

```text
1. Write failing test (unit.md)
2. Implement constructor validation (validation.md)
3. Implement resource creation
4. Run test → passes
5. Write integration test (integration.md)
6. Run integration test → passes
7. Deploy stack test (stack.md)
8. Validate in AWS → passes
9. Clean up AWS resources
```

---

### Pattern 2: Debugging Failed Deployment

```text
1. Check unit tests pass (unit.md)
   ❌ If fail → Fix construct logic
   ✅ If pass → Continue

2. Check integration tests pass (integration.md)
   ❌ If fail → Fix construct composition
   ✅ If pass → Continue

3. Check CloudFormation template (stack.md)
   npx cdk synth → Review template
   ❌ If incorrect → Fix construct code
   ✅ If correct → Continue

4. Deploy to AWS (stack.md)
   npx cdk deploy
   ❌ If fail → Check CloudFormation events
   ✅ If pass → Validate resources

5. Validate with AWS CLI (stack.md)
   ❌ If mismatch → File AWS support ticket or fix construct
   ✅ If correct → Success!
```

---

## AI Agent Guidelines

### When Reading Testing Documentation

**Step 1**: Identify the task
- Creating new construct? → Start with validation.md, then unit.md
- Writing tests? → Start with unit.md
- Testing composition? → Start with integration.md
- Deploying to AWS? → Start with stack.md

**Step 2**: Check prerequisites
- Unit/Integration tests: No setup needed (JSII)
- Stack tests: Requires AWS SSO authentication → **PAUSE and request user authentication**

**Step 3**: Follow the workflow
- Always run unit tests before integration tests
- Always run integration tests before stack tests
- Always clean up AWS resources after stack tests

---

### Authentication Handling (Stack Tests)

**Critical**: AI agents **MUST** pause and request user authentication before running stack tests.

**Template**:

```text
I need to run stack tests that deploy to AWS.

Please authenticate with AWS SSO using the te-claude-cdk-* permission set:

  aws sso login --profile <your-profile-name>

Once logged in, provide your profile name and I'll proceed with testing.
```

**Never assume credentials are available** - always request user action.

---

### Error Handling

If tests fail:

1. **Unit test failure** → Fix construct logic, rerun unit tests
2. **Integration test failure** → Fix composition, rerun integration tests
3. **Stack deployment failure** → Check CloudFormation events, fix construct, redeploy
4. **AWS CLI validation failure** → Investigate AWS resource state, may need to file issue

---

## Test File Naming Conventions

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit test | `{module}.test.ts` | `vpc.test.ts` |
| Integration test | `{module}.integration.test.ts` | `vpc.integration.test.ts` |
| Stack test | `integ.{module}.ts` | `integ.vpc.ts` |
| Test factory | `{module}.factory.ts` | `vpc.factory.ts` |

---

## Quick Start: Testing a New Construct

### 1. Create Unit Tests

```bash
# Create test file
touch src/test/my-construct/my-construct.test.ts

# Read unit.md for patterns
# Write tests for:
# - Required properties
# - Validation errors
# - Default values
# - Resource creation

# Run tests
npx jest src/test/my-construct
```

**Guide**: [unit.md](./unit.md)

---

### 2. Create Integration Tests

```bash
# Create test file
touch src/integration/my-construct/my-construct.integration.test.ts

# Read integration.md for patterns
# Write tests for:
# - Construct compositions
# - Cross-resource relationships
# - Complex scenarios

# Run tests
npx jest --config src/integration/jest.config.js --testPathPattern=my-construct
```

**Guide**: [integration.md](./integration.md)

---

### 3. Create Stack Tests (When Ready)

```bash
# Create stack test file
touch src/integration/my-construct/integ.my-construct.ts

# Read stack.md for patterns
# Implement:
# - Test scenarios
# - CfnOutputs for validation
# - RemovalPolicy.DESTROY for cleanup

# Request user authentication
# Then deploy and validate
```

**Guide**: [stack.md](./stack.md)

---

## Troubleshooting

### "Tests are slow"

✅ **Solution**: Run specific test files, not entire suite

```bash
# Slow (runs all tests)
npm test

# Fast (runs specific module)
npx jest src/test/vpc
```

---

### "Coverage is low"

✅ **Solution**: Add missing test categories

Check: happy path, validation, defaults, edge cases
See: [unit.md](./unit.md) - Required Test Categories

---

### "Stack deployment fails"

✅ **Solution**: Follow debugging pattern

1. Check unit tests pass
2. Check integration tests pass
3. Review CloudFormation template (cdk synth)
4. Check CloudFormation events for specific error
5. Fix construct based on error
6. Redeploy

See: [stack.md](./stack.md) - Troubleshooting section

---

### "AWS authentication expired"

✅ **Solution**: Re-authenticate with AWS SSO

```bash
aws sso login --profile <profile-name>
```

See: [stack.md](./stack.md) - Authentication section

---

## Document Map

| Document | Lines | Purpose |
|----------|-------|---------|
| **[unit.md](./unit.md)** | 638 | Unit testing patterns, CDK assertions, coverage |
| **[integration.md](./integration.md)** | 717 | Jest integration tests, compositions, scenarios |
| **[validation.md](./validation.md)** | 774 | Constructor validation, error templates, type guards |
| **[stack.md](./stack.md)** | 687 | CDK stack deployment, AWS CLI validation, cleanup |

**Total**: 2,816 lines of comprehensive testing guidance

---

## Common Questions

### Q: Do I need to write all 4 test types?

**A**: 
- ✅ **Required**: Unit tests and validation patterns
- ✅ **Recommended**: Integration tests for complex constructs
- ⚠️ **As needed**: Stack tests for pre-release validation or debugging

---

### Q: Can I run tests in CI/CD without AWS credentials?

**A**: ✅ Yes! Unit and integration tests run without AWS credentials (JSII)

```bash
# CI/CD pipeline
npx jest src/test                                    # Unit tests
npx jest --config src/integration/jest.config.js    # Integration tests
```

---

### Q: How much do stack tests cost?

**A**: Usually < $0.01 per test if you:
- Use minimal resources
- Run tests in us-east-1
- Destroy stacks immediately after testing
- Set CloudWatch log retention to 1 day

See: [stack.md](./stack.md) - Cost Management

---

### Q: What order should I write tests?

**A**: 
1. **First**: Validation patterns (validation.md) - catch errors at synth time
2. **Second**: Unit tests (unit.md) - fast feedback on logic
3. **Third**: Integration tests (integration.md) - test compositions
4. **Fourth**: Stack tests (stack.md) - final AWS validation

---

### Q: When should AI agents pause for user input?

**A**: Only when running **stack tests** that require AWS credentials.

Unit and integration tests run autonomously (no AWS credentials needed).

---

## See Also

- **Layer Standards**: [../L2/](../L2/), [../L3/](../L3/) - Construct design patterns
- **Common Standards**: [../common/](../common/) - Cross-layer standards
- **Main README**: [../README.md](../README.md) - Standards overview

---

## References

- CDK Assertions: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html
- Jest Documentation: https://jestjs.io/docs/getting-started
- CDK CLI: https://docs.aws.amazon.com/cdk/v2/guide/cli.html
- Repository Authority: `CLAUDE.md` (root)

