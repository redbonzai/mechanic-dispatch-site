# Unit Testing Standard

**Applies to**: All layers (L2, L3, L4)
**Test Type**: JSII - No AWS credentials required
**Location**: `src/test/**`

---

## Overview

Unit tests validate construct logic, CloudFormation template generation, and property validation **without deploying to AWS**. Unit tests use CDK assertions to inspect synthesized CloudFormation templates.

**Key Principle**: Unit tests are **fast, local, and repeatable** - they should run in CI/CD without AWS credentials.

---

## Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line coverage | 85% | 95% |
| Branch coverage | 80% | 90% |
| Function coverage | 90% | 100% |

---

## Test Organization

### Directory Structure

```text
src/test/
├── {module}/
│   ├── {module}.test.ts           # Main construct tests
│   └── {submodule}/
│       └── {submodule}.test.ts    # Submodule tests
└── factories/
    └── {module}.factory.ts        # Test data factories
```

### File Naming Conventions

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit test | `{module}.test.ts` | `vpc.test.ts` |
| Submodule test | `{submodule}.test.ts` | `flow-log.test.ts` |
| Test factory | `{module}.factory.ts` | `vpc.factory.ts` |

---

## Required Test Categories

For **EACH** public method/property, generate tests covering:

| Category | Test Name Pattern | Example |
|----------|-------------------|---------|
| Happy path | `creates {resource} with {config}` | `creates VPC with primary CIDR` |
| Missing required | `throws when {property} missing` | `throws when name missing` |
| Invalid value | `throws when {property} is {invalid}` | `throws when zone.count is 0` |
| Mutual exclusivity | `throws when both {prop1} and {prop2} specified` | `throws when both zone and zones specified` |
| Default behavior | `uses default {property} when not specified` | `uses default zone count of 3` |
| Inheritance | `child inherits {property} from parent` | `subnet inherits tags from VPC` |

---

## Unit Test Structure

### Basic Test Template

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { VpcConstruct, VpcProps } from '../../constructs/vpc';

describe('VpcConstruct', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
  });

  // Category: Happy Path
  describe('resource creation', () => {
    test('creates VPC with primary CIDR', () => {
      // Arrange
      const props: VpcProps = {
        name: 'test-vpc',
        cidr: {
          allocations: [
            { index: 0, ipv4: { block: '10.0.0.0/16' } },
          ],
        },
      };

      // Act
      new VpcConstruct(stack, 'TestVpc', props);
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/16',
      });
    });

    test('creates VPC with multiple CIDRs', () => {
      // ... test implementation
    });
  });

  // Category: Validation
  describe('validation', () => {
    test('throws when name missing', () => {
      expect(() => {
        new VpcConstruct(stack, 'TestVpc', {
          cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
        } as VpcProps);
      }).toThrow("VpcConstruct: 'name' is required.");
    });

    test('throws when both zone and zones specified', () => {
      expect(() => {
        new VpcConstruct(stack, 'TestVpc', {
          name: 'test-vpc',
          zone: { count: 2 },
          zones: [{ id: 'a' }],
          cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
        } as VpcProps);
      }).toThrow("VpcConstruct: Cannot specify both 'zone' and 'zones'.");
    });

    test('throws when zone.count is out of range', () => {
      expect(() => {
        new VpcConstruct(stack, 'TestVpc', {
          name: 'test-vpc',
          zone: { count: 5 },
          cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
        });
      }).toThrow("VpcConstruct: 'zone.count' must be 1-4, got 5.");
    });
  });

  // Category: Defaults
  describe('defaults', () => {
    test('uses default zone count of 3 when not specified', () => {
      const vpc = new VpcConstruct(stack, 'TestVpc', {
        name: 'test-vpc',
        cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
      });

      expect(vpc.zoneCount).toBe(3);
    });
  });
});
```

---

## Test Grouping Pattern

Organize tests by **logical concern**:

```typescript
describe('VpcConstruct', () => {
  describe('resource creation', () => {
    // Happy path tests
  });

  describe('validation', () => {
    // Validation error tests
  });

  describe('defaults', () => {
    // Default value tests
  });

  describe('CIDR', () => {
    // CIDR-specific tests
  });

  describe('flow logs', () => {
    // Flow log tests
  });

  describe('accessors', () => {
    // Accessor method tests
  });
});
```

**Benefits**:
- Easy to locate tests
- Clear test organization
- Natural documentation structure

---

## CDK Assertions

### Template Assertions

```typescript
import { Template, Match } from 'aws-cdk-lib/assertions';

test('creates VPC with correct properties', () => {
  // ... create construct

  const template = Template.fromStack(stack);

  // Exact match
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  });

  // Partial match with regex
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: Match.stringLikeRegexp('^10\\.0\\.'),
  });

  // Resource count
  template.resourceCountIs('AWS::EC2::VPC', 1);

  // Any value (field exists)
  template.hasResourceProperties('AWS::EC2::FlowLog', {
    LogGroupName: Match.anyValue(),
  });

  // Absent (field should not exist)
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: Match.absent(),
  });
});
```

### Common Match Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| `Match.anyValue()` | Field exists with any value | `Tags: Match.anyValue()` |
| `Match.absent()` | Field should not exist | `PublicAccess: Match.absent()` |
| `Match.stringLikeRegexp()` | Pattern matching | `Name: Match.stringLikeRegexp('^test-')` |
| `Match.objectLike()` | Partial object match | `Config: Match.objectLike({ encrypted: true })` |
| `Match.arrayWith()` | Array contains items | `Subnets: Match.arrayWith([...])` |

---

## Snapshot Tests

### When to Use

| Use Case | Use Snapshot? |
|----------|--------------|
| CloudFormation template validation | ✅ Yes |
| Complex resource configurations | ✅ Yes |
| Cross-resource relationships | ✅ Yes |
| Simple property tests | ❌ No |
| Validation error tests | ❌ No |

### Implementation

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { VpcConstruct } from '../../constructs/vpc';

describe('VpcConstruct snapshots', () => {
  test('matches snapshot for standard configuration', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    new VpcConstruct(stack, 'TestVpc', {
      name: 'snapshot-test-vpc',
      cidr: {
        allocations: [
          { index: 0, ipv4: { block: '10.0.0.0/16' } },
        ],
      },
    });

    const template = app.synth().getStackByName('TestStack').template;
    expect(template).toMatchSnapshot();
  });
});
```

### Updating Snapshots

```bash
# Update all snapshots
npm test -- -u

# Update specific test file
npm test -- vpc.test.ts -u
```

**When to update**:
- ✅ Intentional construct changes
- ✅ CDK library upgrades (review changes!)
- ❌ Accidental behavior changes (fix the code)

---

## Test Data Factories

### Purpose

Create **reusable test data** to reduce duplication and improve test maintainability.

### Implementation

```typescript
// src/test/factories/vpc.factory.ts

import { VpcProps } from '../../constructs/vpc';

/**
 * Creates minimal valid VpcProps for testing.
 */
export function createMinimalVpcProps(
  overrides?: Partial<VpcProps>
): VpcProps {
  return {
    name: 'test-vpc',
    cidr: {
      allocations: [
        { index: 0, ipv4: { block: '10.0.0.0/16' } },
      ],
    },
    ...overrides,
  };
}

/**
 * Creates VpcProps with all optional features.
 */
export function createFullVpcProps(
  overrides?: Partial<VpcProps>
): VpcProps {
  return {
    name: 'full-test-vpc',
    zone: { count: 3 },
    cidr: {
      allocations: [
        { index: 0, name: 'primary', ipv4: { block: '10.0.0.0/16' } },
        { index: 1, name: 'secondary', ipv4: { block: '100.64.0.0/16' } },
      ],
    },
    dns: {
      hostnames: true,
      support: true,
    },
    flowLog: {
      trafficType: 'ALL',
      destinations: [
        { type: 'logGroup', config: { name: '/aws/vpc/test' } },
      ],
    },
    tags: {
      Environment: 'test',
    },
    ...overrides,
  };
}
```

### Usage

```typescript
import { createMinimalVpcProps, createFullVpcProps } from '../factories/vpc.factory';

test('creates VPC with minimal props', () => {
  new VpcConstruct(stack, 'TestVpc', createMinimalVpcProps());
  // ...
});

test('creates VPC with custom name', () => {
  new VpcConstruct(stack, 'TestVpc', createMinimalVpcProps({
    name: 'custom-vpc',
  }));
  // ...
});

test('creates VPC with all features', () => {
  new VpcConstruct(stack, 'TestVpc', createFullVpcProps({
    zone: { count: 2 }, // Override specific property
  }));
  // ...
});
```

**Benefits**:
- Reduces test code duplication
- Centralizes test data changes
- Makes tests more readable
- Easier to maintain

---

## Running Unit Tests

### Run All Unit Tests

```bash
npm test
```

### Run Specific Module

```bash
npx jest src/test/vpc
```

### Run Specific Test File

```bash
npx jest src/test/vpc/vpc.test.ts
```

### Run Specific Test

```bash
npx jest -t "creates VPC with primary CIDR"
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Watch Mode (during development)

```bash
npm test -- --watch
```

### Debug Mode

```bash
npx jest --verbose --no-cache
```

---

## Test Checklist

When writing tests for a new construct:

**Completeness**:

- [ ] Unit tests for all public methods
- [ ] Unit tests for all public properties
- [ ] Validation tests (required, exclusivity, ranges)
- [ ] Default value tests
- [ ] Snapshot tests for complex configurations
- [ ] Test data factories created

**Quality**:

- [ ] Coverage meets minimum thresholds (85%/80%/90%)
- [ ] Tests follow naming conventions
- [ ] Tests are grouped logically
- [ ] Arrange-Act-Assert pattern used
- [ ] Error messages validated exactly
- [ ] No hardcoded values (use factories)

**CI/CD Ready**:

- [ ] Tests run without AWS credentials
- [ ] Tests are fast (< 5 seconds per test file)
- [ ] No external dependencies
- [ ] Deterministic (no flaky tests)

---

## Best Practices

### 1. Use Arrange-Act-Assert Pattern

```typescript
test('example test', () => {
  // Arrange - Set up test data
  const props = createMinimalVpcProps({ name: 'test' });
  
  // Act - Perform the action
  new VpcConstruct(stack, 'TestVpc', props);
  const template = Template.fromStack(stack);
  
  // Assert - Verify the outcome
  template.resourceCountIs('AWS::EC2::VPC', 1);
});
```

### 2. Test One Thing Per Test

```typescript
// ❌ BAD - Tests multiple things
test('creates VPC with CIDR and flow logs and tags', () => {
  // Too much in one test
});

// ✅ GOOD - Tests one thing
test('creates VPC with primary CIDR', () => { /* ... */ });
test('creates VPC with flow logs enabled', () => { /* ... */ });
test('creates VPC with tags applied', () => { /* ... */ });
```

### 3. Validate Error Messages Exactly

```typescript
// ❌ BAD - Partial match
expect(() => { /* ... */ }).toThrow('required');

// ✅ GOOD - Exact match
expect(() => { /* ... */ }).toThrow("VpcConstruct: 'name' is required.");
```

### 4. Use Factories for Complex Props

```typescript
// ❌ BAD - Repeated props
test('test 1', () => {
  new VpcConstruct(stack, 'TestVpc', {
    name: 'test',
    cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
  });
});

test('test 2', () => {
  new VpcConstruct(stack, 'TestVpc', {
    name: 'test',
    cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
  });
});

// ✅ GOOD - Use factory
test('test 1', () => {
  new VpcConstruct(stack, 'TestVpc', createMinimalVpcProps());
});

test('test 2', () => {
  new VpcConstruct(stack, 'TestVpc', createMinimalVpcProps());
});
```

### 5. Group Related Tests

```typescript
// ✅ GOOD - Clear organization
describe('VpcConstruct', () => {
  describe('validation', () => {
    test('throws when name missing', () => { /* ... */ });
    test('throws when CIDR missing', () => { /* ... */ });
  });
  
  describe('defaults', () => {
    test('uses default zone count', () => { /* ... */ });
    test('uses default DNS settings', () => { /* ... */ });
  });
});
```

---

## Common Mistakes

### Mistake 1: Testing Implementation Details

```typescript
// ❌ BAD - Testing internal implementation
test('calls createVpc method', () => {
  const spy = jest.spyOn(vpc, 'createVpc');
  // ...
  expect(spy).toHaveBeenCalled();
});

// ✅ GOOD - Testing outcome
test('creates VPC resource', () => {
  // ...
  template.resourceCountIs('AWS::EC2::VPC', 1);
});
```

### Mistake 2: Not Cleaning Up Between Tests

```typescript
// ❌ BAD - Shared state
const app = new App();
const stack = new Stack(app, 'TestStack');

test('test 1', () => { /* uses same stack */ });
test('test 2', () => { /* uses same stack - polluted! */ });

// ✅ GOOD - Fresh state
beforeEach(() => {
  app = new App();
  stack = new Stack(app, 'TestStack');
});
```

### Mistake 3: Over-Reliance on Snapshots

```typescript
// ❌ BAD - Only snapshot
test('creates VPC', () => {
  // ...
  expect(template).toMatchSnapshot(); // What are we validating?
});

// ✅ GOOD - Snapshot + specific assertions
test('creates VPC with correct configuration', () => {
  // ...
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  });
  expect(template).toMatchSnapshot(); // Additional validation
});
```

---

## Performance Optimization

### Critical Performance Rules

**CRITICAL**: These rules are **mandatory** for all test files to ensure fast test execution and efficient CI/CD pipelines.

---

### Rule 1: Minimize Template.fromStack Calls

**Problem**: `Template.fromStack(stack)` causes a CDK application to synthesize, which is expensive.

**Solution**: Reuse a single stack and a single `Template.fromStack` call for multiple tests.

❌ **BAD - Synthesizes 3 times**:

```typescript
describe('VpcConstruct', () => {
  test('creates VPC', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new VpcConstruct(stack, 'Vpc', props);
    const template = Template.fromStack(stack); // Synth #1
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('creates subnets', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new VpcConstruct(stack, 'Vpc', props);
    const template = Template.fromStack(stack); // Synth #2
    template.resourceCountIs('AWS::EC2::Subnet', 6);
  });
});
```

✅ **GOOD - Synthesizes once**:

```typescript
describe('VpcConstruct', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new VpcConstruct(stack, 'Vpc', props);
    template = Template.fromStack(stack); // Synth once
  });

  test('creates VPC', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('creates subnets', () => {
    template.resourceCountIs('AWS::EC2::Subnet', 6);
  });
});
```

**Important**: Do NOT modify the construct tree after synthesis. If you need different configurations, use separate `describe` blocks with their own `beforeAll` hooks.

---

### Rule 2: Minimize Lambda Function Bundling

**Problem**: Lambda functions bundle when their constructs are called with `new`, which is expensive.

**Solution**: Limit bundling operations to a maximum of 3 per test file.

❌ **BAD - Bundles 5 times**:

```typescript
test('test 1', () => {
  new LambdaConstruct(stack, 'Lambda1', props); // Bundle #1
  // ...
});

test('test 2', () => {
  new LambdaConstruct(stack, 'Lambda2', props); // Bundle #2
  // ...
});

test('test 3', () => {
  new LambdaConstruct(stack, 'Lambda3', props); // Bundle #3
  // ...
});

test('test 4', () => {
  new LambdaConstruct(stack, 'Lambda4', props); // Bundle #4 ❌
  // ...
});

test('test 5', () => {
  new LambdaConstruct(stack, 'Lambda5', props); // Bundle #5 ❌
  // ...
});
```

✅ **GOOD - Bundles 3 times maximum**:

```typescript
describe('LambdaConstruct - Scenario 1', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new LambdaConstruct(stack, 'Lambda1', props1); // Bundle #1
    template = Template.fromStack(stack);
  });

  test('test 1', () => { /* assertions */ });
  test('test 2', () => { /* assertions */ });
});

describe('LambdaConstruct - Scenario 2', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new LambdaConstruct(stack, 'Lambda2', props2); // Bundle #2
    template = Template.fromStack(stack);
  });

  test('test 3', () => { /* assertions */ });
  test('test 4', () => { /* assertions */ });
});

describe('LambdaConstruct - Scenario 3', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new LambdaConstruct(stack, 'Lambda3', props3); // Bundle #3
    template = Template.fromStack(stack);
  });

  test('test 5', () => { /* assertions */ });
});
```

**Hard Cap**: Maximum 3 bundling operations per test file. No exceptions.

---

### Rule 3: Test File Duration Limits

**Target**: Test files should complete in **under 10 seconds**

**Maximum**: Test files must complete in **under 30 seconds**

**Problem**: Slow tests block CI/CD pipelines and slow down development.

**Solution**: Optimize tests using Rule 1 and Rule 2, and benchmark test duration.

**Before submitting tests**:

```bash
# Run the test file and check duration
npx jest src/test/{module}/{construct}.test.ts --verbose

# Look for duration in output:
# PASS  src/test/vpc/vpc.test.ts (8.2s) ✅ Good!
# PASS  src/test/lambda/lambda.test.ts (35s) ❌ Too slow!
```

**If test exceeds 30 seconds**:
1. Review Rule 1: Are you synthesizing too many times?
2. Review Rule 2: Are you bundling too many lambdas?
3. Split tests into multiple files if needed
4. If still slow after optimization, see Rule 4

---

### Rule 4: Slow Test Sharding

**Problem**: Slow tests can block CI/CD if not properly distributed across test shards.

**Solution**: Add slow tests to `.projen/jest-test-sequencer.js` for proper sharding.

**When to add**:
- Test file takes > 30 seconds
- Test file cannot be optimized further

**How to add**:

```typescript
// .projen/jest-test-sequencer.js
const slowTests = [
  'src/test/vpc/vpc.test.ts',              // Existing slow test
  'src/test/lambda/complex-lambda.test.ts', // Your new slow test ← Add here
];
```

**Why this matters**: Jest CI runs tests in parallel shards. Without this configuration, all slow tests might end up in one shard, creating a bottleneck.

---

### Performance Checklist

Before submitting a test file, verify:

- [ ] Uses `beforeAll()` with single `Template.fromStack()` call per configuration
- [ ] Lambda bundling operations ≤ 3 per file
- [ ] Test file completes in < 10 seconds (target) or < 30 seconds (maximum)
- [ ] If > 30 seconds, added to `.projen/jest-test-sequencer.js`
- [ ] No repeated synthesis for the same configuration
- [ ] No modification of construct tree after synthesis

---

### Benchmarking Test Performance

**Always benchmark before submitting**:

```bash
# Run specific test file with timing
npx jest src/test/{module}/{construct}.test.ts --verbose

# Run all tests in module with timing
npx jest src/test/{module} --verbose

# Generate performance report
npx jest --listTests --verbose
```

**Review output for**:
- Individual test duration
- Total file duration
- Warning signs (> 30s per file)

---

### Example: High-Performance Test Suite

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { VpcConstruct } from '../../constructs/vpc';

describe('VpcConstruct', () => {
  // Scenario 1: Default configuration
  describe('default configuration', () => {
    let template: Template;

    beforeAll(() => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');
      new VpcConstruct(stack, 'Vpc', {
        name: 'test-vpc',
        cidr: {
          allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }],
        },
      });
      template = Template.fromStack(stack); // Single synth
    });

    test('creates VPC', () => {
      template.resourceCountIs('AWS::EC2::VPC', 1);
    });

    test('creates subnets', () => {
      template.resourceCountIs('AWS::EC2::Subnet', 6);
    });

    test('creates route tables', () => {
      template.resourceCountIs('AWS::EC2::RouteTable', 3);
    });

    test('creates internet gateway', () => {
      template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    });
  });

  // Scenario 2: Custom configuration
  describe('custom configuration', () => {
    let template: Template;

    beforeAll(() => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');
      new VpcConstruct(stack, 'Vpc', {
        name: 'custom-vpc',
        cidr: {
          allocations: [{ index: 0, ipv4: { block: '172.16.0.0/16' } }],
        },
        zones: { count: 2 },
      });
      template = Template.fromStack(stack); // Single synth for this scenario
    });

    test('creates VPC with custom CIDR', () => {
      template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '172.16.0.0/16',
      });
    });

    test('creates 4 subnets (2 zones * 2 types)', () => {
      template.resourceCountIs('AWS::EC2::Subnet', 4);
    });
  });

  // Validation tests (require fresh stacks for error testing)
  describe('validation', () => {
    let app: App;
    let stack: Stack;

    beforeEach(() => {
      app = new App();
      stack = new Stack(app, 'TestStack');
    });

    test('throws when name missing', () => {
      expect(() => {
        new VpcConstruct(stack, 'Vpc', { cidr: { allocations: [] } } as any);
      }).toThrow('name is required');
    });

    test('throws when cidr missing', () => {
      expect(() => {
        new VpcConstruct(stack, 'Vpc', { name: 'test' } as any);
      }).toThrow('cidr is required');
    });
  });
});

// Result: ~8 seconds for entire file ✅
```

**Why this is fast**:
- ✅ Only 2 synthesis operations (one per scenario)
- ✅ Multiple tests share same synthesized template
- ✅ Validation tests don't synthesize (fail before synthesis)
- ✅ No lambda bundling

---

## See Also

- **Integration Testing**: [integration.md](./integration.md) - Jest integration tests (no AWS)
- **Stack Testing**: [stack.md](./stack.md) - CDK deployment tests (requires AWS)
- **Validation**: [validation.md](./validation.md) - Constructor validation patterns
- **L2 Constructs**: [../L2/constructs.md](../L2/constructs.md) - L2 construct patterns
- **L3 Constructs**: [../L3/constructs.md](../L3/constructs.md) - L3 construct patterns

---

## References

- CDK Assertions Library: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html
- Jest Documentation: https://jestjs.io/docs/getting-started
- Test Coverage Best Practices: `CLAUDE.md` (repository authority)
- Test Performance: `.projen/jest-test-sequencer.js` (sharding configuration)

