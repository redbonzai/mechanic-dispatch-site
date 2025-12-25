# Testing Skill

**Version**: 1.0  
**Status**: Active  
**Applicable Agents**: All (Interface Architect, Operational Review, Construct Implementation)

---

## Purpose

Teach AI agents to write **production-quality tests** for CDK constructs, services, functions, and helpers at a **senior developer level**. This skill covers unit testing, integration testing, E2E/stack testing, and BDD patterns with CDK-specific best practices.

---

## When to Use This Skill

Invoke this skill when:

- ✅ Creating a new construct (write tests during development)
- ✅ Modifying existing construct behavior (update tests)
- ✅ Reviewing code for test coverage and quality
- ✅ Debugging test failures
- ✅ Validating construct compositions
- ✅ Preparing for PR submission (test checklist)
- ✅ Optimizing slow test suites

---

## Preconditions (Fail-Closed)

Before invoking this skill, verify:

1. **Construct exists** (or interface approved if TDD)
2. **Standards reviewed**: Read `docs/standards/testing/` for authoritative patterns
3. **Test type identified**: Unit, Integration, Stack, or BDD
4. **Environment ready**: 
   - Unit/Integration: No setup needed (JSII)
   - Stack tests: **MUST request user AWS authentication** (fail-closed)

**If AWS credentials needed**: STOP and request user authentication. Do NOT proceed.

---

## Core Testing Principles

### Test Pyramid

```text
       /\
      /E2E\       ← 5% - Expensive, slow, AWS required
     /______\
    /        \
   /Integration\ ← 15% - Moderate cost, local synth
  /____________\
 /              \
/     UNIT       \ ← 80% - Fast, cheap, local
/__________________\
```

### Foundational Principles

1. **Fail-Fast Philosophy** - Catch errors at earliest, cheapest point
2. **Test Behavior, Not Implementation** - Focus on outcomes
3. **AAA Pattern** - Arrange → Act → Assert (always)
4. **Test Independence** - No shared state between tests
5. **Deterministic Tests** - Same input → same output (no flaky tests)
6. **Single Responsibility** - One test, one concept
7. **Performance Matters** - Fast tests = productive development
8. **Tests as Documentation** - Future developers learn from tests

---

## Testing Strategy Matrix

| What to Test | Unit | Integration | E2E/Stack | BDD |
|-------------|------|-------------|-----------|-----|
| Single method logic | ✅ Primary | ❌ | ❌ | ❌ |
| Validation rules | ✅ Primary | ❌ | ❌ | ❌ |
| Multiple constructs | ✅ Secondary | ✅ Primary | ❌ | ❌ |
| User workflows | ❌ | ✅ Secondary | ✅ Primary | ✅ Primary |
| AWS deployment | ❌ | ❌ | ✅ Primary | ✅ Secondary |
| Business requirements | ❌ | ❌ | ✅ Secondary | ✅ Primary |

---

## Workflow: Unit Testing (80% of Tests)

### Step 1: Setup Test Structure

**Location**: `src/test/{module}/{construct}.test.ts`

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { MyConstruct } from '../../constructs/{module}';

describe('MyConstruct', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
  });

  // Tests here...
});
```

**Rule**: Use `beforeEach()` for fresh state. No shared stacks between tests.

---

### Step 2: Write Required Test Categories

For **EACH** public method/property:

#### Category 1: Happy Path Tests

```typescript
describe('resource creation', () => {
  test('creates S3 bucket with default configuration', () => {
    // Arrange
    const props = {
      name: 'test-bucket',
      encrypted: true,
    };

    // Act
    new MyConstruct(stack, 'TestConstruct', props);
    const template = Template.fromStack(stack);

    // Assert
    template.resourceCountIs('AWS::S3::Bucket', 1);
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: Match.anyValue(),
    });
  });

  test('creates S3 bucket with custom configuration', () => {
    // Test custom scenarios
  });
});
```

**Rule**: Test normal operation with valid inputs.

---

#### Category 2: Validation Tests

```typescript
describe('validation', () => {
  test('throws when name is missing', () => {
    expect(() => {
      new MyConstruct(stack, 'Test', {} as any);
    }).toThrow("MyConstruct: 'name' is required.");
  });

  test('throws when name is empty', () => {
    expect(() => {
      new MyConstruct(stack, 'Test', { name: '' });
    }).toThrow("MyConstruct: 'name' cannot be empty.");
  });

  test('throws when both zone and zones specified', () => {
    expect(() => {
      new MyConstruct(stack, 'Test', {
        name: 'test',
        zone: { count: 2 },
        zones: [{ id: 'a' }],
      });
    }).toThrow("MyConstruct: Cannot specify both 'zone' and 'zones'.");
  });

  test('throws when count is out of range', () => {
    expect(() => {
      new MyConstruct(stack, 'Test', {
        name: 'test',
        count: 10,
      });
    }).toThrow("MyConstruct: 'count' must be between 1 and 5, got 10.");
  });
});
```

**Rules**:
- ✅ Validate exact error message (not partial match)
- ✅ Test required properties
- ✅ Test mutual exclusivity
- ✅ Test range constraints
- ✅ Test format validation

---

#### Category 3: Default Behavior Tests

```typescript
describe('defaults', () => {
  test('uses default count of 3 when not specified', () => {
    const construct = new MyConstruct(stack, 'Test', {
      name: 'test',
    });

    expect(construct.count).toBe(3);
  });

  test('applies secure defaults when encryption not specified', () => {
    new MyConstruct(stack, 'Test', {
      name: 'test',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          }),
        ]),
      },
    });
  });
});
```

**Rule**: Verify default values are applied correctly.

---

#### Category 4: Edge Cases

```typescript
describe('edge cases', () => {
  test('handles maximum CIDR allocations', () => {
    const construct = new MyConstruct(stack, 'Test', {
      name: 'test',
      cidrs: [
        '10.0.0.0/16',
        '10.1.0.0/16',
        '10.2.0.0/16',
        '10.3.0.0/16',
        '10.4.0.0/16', // Max 5
      ],
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::EC2::VPCCidrBlock', 4); // 4 secondary
  });

  test('throws when exceeding CIDR limit', () => {
    expect(() => {
      new MyConstruct(stack, 'Test', {
        name: 'test',
        cidrs: [
          '10.0.0.0/16',
          '10.1.0.0/16',
          '10.2.0.0/16',
          '10.3.0.0/16',
          '10.4.0.0/16',
          '10.5.0.0/16', // Too many!
        ],
      });
    }).toThrow('Maximum 5 CIDR allocations allowed');
  });
});
```

**Rule**: Test boundary conditions (min, max, empty, null).

---

### Step 3: Use CDK Assertions Correctly

```typescript
import { Template, Match } from 'aws-cdk-lib/assertions';

test('CDK assertion patterns', () => {
  const template = Template.fromStack(stack);

  // Resource count
  template.resourceCountIs('AWS::S3::Bucket', 1);

  // Exact property match
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: 'my-bucket',
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });

  // Pattern matching (for tokens)
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: Match.stringLikeRegexp('^my-bucket-'),
    Tags: Match.anyValue(),
  });

  // Partial object match
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Effect: 'Allow',
          Principal: { Service: 'lambda.amazonaws.com' },
        }),
      ]),
    }),
  });

  // Field should NOT exist
  template.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: Match.absent(),
  });

  // Array contains items
  template.hasResourceProperties('AWS::S3::Bucket', {
    Tags: Match.arrayWith([
      { Key: 'Environment', Value: 'test' },
    ]),
  });
});
```

**Common Match Patterns**:

| Pattern | Use Case | Example |
|---------|----------|---------|
| `Match.anyValue()` | Field exists with any value | `Tags: Match.anyValue()` |
| `Match.absent()` | Field should not exist | `PublicAccess: Match.absent()` |
| `Match.stringLikeRegexp()` | Pattern matching | `Name: Match.stringLikeRegexp('^test-')` |
| `Match.objectLike()` | Partial object match | `Config: Match.objectLike({ encrypted: true })` |
| `Match.arrayWith()` | Array contains items | `Subnets: Match.arrayWith([...])` |

---

### Step 4: Optimize for Performance (CRITICAL)

#### Rule 1: Minimize Template.fromStack Calls

**Problem**: `Template.fromStack(stack)` synthesizes the entire CDK app (expensive).

❌ **BAD - Synthesizes 3 times**:

```typescript
describe('MyConstruct', () => {
  test('creates VPC', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new MyConstruct(stack, 'Test', props);
    const template = Template.fromStack(stack); // Synth #1
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('creates subnets', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new MyConstruct(stack, 'Test', props);
    const template = Template.fromStack(stack); // Synth #2
    template.resourceCountIs('AWS::EC2::Subnet', 6);
  });

  test('creates route tables', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new MyConstruct(stack, 'Test', props);
    const template = Template.fromStack(stack); // Synth #3
    template.resourceCountIs('AWS::EC2::RouteTable', 3);
  });
});
```

✅ **GOOD - Synthesizes once**:

```typescript
describe('MyConstruct', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    new MyConstruct(stack, 'Test', props);
    template = Template.fromStack(stack); // Synth once
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
});
```

**Important**: Use separate `describe` blocks with `beforeAll()` for different configurations.

---

#### Rule 2: Limit Lambda Bundling

**Hard Cap**: Maximum **3 bundling operations per test file**.

**Problem**: Lambda functions bundle when constructs are instantiated (expensive).

❌ **BAD - Bundles 5 times (exceeds cap)**:

```typescript
test('test 1', () => {
  new LambdaConstruct(stack, 'Lambda1', props); // Bundle #1
});

test('test 2', () => {
  new LambdaConstruct(stack, 'Lambda2', props); // Bundle #2
});

test('test 3', () => {
  new LambdaConstruct(stack, 'Lambda3', props); // Bundle #3
});

test('test 4', () => {
  new LambdaConstruct(stack, 'Lambda4', props); // Bundle #4 ❌
});

test('test 5', () => {
  new LambdaConstruct(stack, 'Lambda5', props); // Bundle #5 ❌
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

**If you need more than 3**: Split into multiple test files.

---

#### Rule 3: Test File Duration Limits

- **Target**: < 10 seconds per test file
- **Maximum**: < 30 seconds per test file

**Benchmark before submitting**:

```bash
npx jest src/test/{module}/{construct}.test.ts --verbose

# Output:
# PASS  src/test/vpc/vpc.test.ts (8.2s) ✅ Good!
# PASS  src/test/lambda/lambda.test.ts (35s) ❌ Too slow!
```

**If test exceeds 30 seconds**:
1. Review Rule 1: Are you synthesizing too many times?
2. Review Rule 2: Are you bundling too many lambdas?
3. Split tests into multiple files if needed
4. Add to `.projen/jest-test-sequencer.js` for sharding

---

### Step 5: Use Test Data Factories

**Location**: `src/test/factories/{module}.factory.ts`

```typescript
// factories/my-construct.factory.ts
import { MyConstructProps } from '../../constructs/{module}';

/**
 * Creates minimal valid props for testing.
 */
export function createMinimalProps(
  overrides?: Partial<MyConstructProps>
): MyConstructProps {
  return {
    name: 'test',
    required: 'value',
    ...overrides,
  };
}

/**
 * Creates props with all optional features enabled.
 */
export function createFullProps(
  overrides?: Partial<MyConstructProps>
): MyConstructProps {
  return {
    name: 'full-test',
    required: 'value',
    optional: 'enabled',
    features: ['feature1', 'feature2'],
    tags: { Environment: 'test' },
    ...overrides,
  };
}
```

**Usage in tests**:

```typescript
import { createMinimalProps, createFullProps } from '../factories/my-construct.factory';

test('creates construct with minimal props', () => {
  new MyConstruct(stack, 'Test', createMinimalProps());
  // ...
});

test('creates construct with custom name', () => {
  new MyConstruct(stack, 'Test', createMinimalProps({
    name: 'custom-name',
  }));
  // ...
});

test('creates construct with all features', () => {
  new MyConstruct(stack, 'Test', createFullProps({
    optional: 'override', // Override specific property
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

## Workflow: Integration Testing (15% of Tests)

**Purpose**: Test multiple constructs working together without AWS deployment.

**Location**: `src/integration/{module}/{construct}.integration.test.ts`

### When to Use Integration Tests

✅ Multiple constructs composed together  
✅ Cross-resource relationships (VPC → Subnets → Flow Logs)  
✅ L3 composition patterns  
✅ Complex configurations  
✅ End-to-end scenarios (without AWS)  

### Integration Test Structure

```typescript
// src/integration/vpc/vpc.integration.test.ts
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { VpcConstruct } from '../../constructs/vpc';
import { FlowLogConstruct } from '../../constructs/flow-log';

describe('VPC Integration Tests', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'IntegrationTestStack');
  });

  describe('VPC with Flow Logs', () => {
    test('creates VPC with flow log integration', () => {
      // Arrange - Create VPC
      const vpc = new VpcConstruct(stack, 'TestVpc', {
        name: 'integration-test-vpc',
        cidr: {
          allocations: [
            { index: 0, ipv4: { block: '10.0.0.0/16' } },
          ],
        },
      });

      // Act - Add flow logs
      new FlowLogConstruct(stack, 'FlowLog', {
        vpc: vpc.vpc,
        trafficType: 'ALL',
        destination: {
          type: 'logGroup',
          config: { name: '/aws/vpc/test' },
        },
      });

      const template = Template.fromStack(stack);

      // Assert - Verify both resources created
      template.resourceCountIs('AWS::EC2::VPC', 1);
      template.resourceCountIs('AWS::EC2::FlowLog', 1);

      // Assert - Verify flow log references VPC
      template.hasResourceProperties('AWS::EC2::FlowLog', {
        ResourceType: 'VPC',
        ResourceId: Match.anyValue(), // Should reference VPC
        TrafficType: 'ALL',
      });
    });
  });

  describe('Cross-Resource Relationships', () => {
    test('flow log references VPC correctly', () => {
      const vpc = new VpcConstruct(stack, 'Vpc', {
        name: 'test-vpc',
        cidr: { allocations: [{ index: 0, ipv4: { block: '10.0.0.0/16' } }] },
      });

      new FlowLogConstruct(stack, 'FlowLog', {
        vpc: vpc.vpc,
        trafficType: 'ALL',
      });

      const template = Template.fromStack(stack);

      // Verify relationship exists
      template.hasResourceProperties('AWS::EC2::FlowLog', {
        ResourceType: 'VPC',
        ResourceId: Match.objectLike({
          Ref: Match.stringLikeRegexp('Vpc'),
        }),
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles maximum CIDR allocations', () => {
      const vpc = new VpcConstruct(stack, 'TestVpc', {
        name: 'max-cidr-vpc',
        cidr: {
          allocations: [
            { index: 0, ipv4: { block: '10.0.0.0/16' } },
            { index: 1, ipv4: { block: '10.1.0.0/16' } },
            { index: 2, ipv4: { block: '10.2.0.0/16' } },
            { index: 3, ipv4: { block: '10.3.0.0/16' } },
            { index: 4, ipv4: { block: '10.4.0.0/16' } },
          ],
        },
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::EC2::VPCCidrBlock', 4); // 4 secondary CIDRs
    });
  });
});
```

**Run integration tests**:

```bash
npx jest --config src/integration/jest.config.js --testPathPattern={module}
```

---

## Workflow: E2E / Stack Testing (5% of Tests)

**Purpose**: Deploy actual resources to AWS for validation.

**Also Known As**: Deployment tests, CDK integration tests, `integ.*` files

**Location**: `src/integration/{module}/integ.{construct}.ts`

**Key Distinction**: 
- **Jest Integration Tests** (`*.integration.test.ts`) - Template validation only, no AWS deployment
- **CDK Deployment Tests** (`integ.*.ts`) - **THIS SECTION** - Actual AWS deployment and validation

**⚠️ CRITICAL**: Stack tests require AWS credentials. AI agents **MUST** pause and request user authentication.

### Prerequisites (Fail-Closed)

**Before proceeding**, AI agent MUST:

1. **STOP** - Do not attempt AWS operations
2. **Request user authentication**:

```text
I need to run stack tests that deploy to AWS.

Please authenticate with AWS SSO using the te-claude-cdk-* permission set:

  aws sso login --profile <your-profile-name>

Then verify your credentials:

  aws sts get-caller-identity --profile <your-profile-name>

Once authenticated, provide your profile name and I'll proceed with testing.
```

3. **WAIT** for user to provide profile name
4. **ONLY THEN** proceed with deployment

**Never assume credentials are available**.

---

### Stack Test Structure

```typescript
// src/integration/vpc/integ.my-construct.ts
import { App, Stack, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { MyConstruct } from '../../constructs/{module}';

const app = new App();

const stack = new Stack(app, 'IntegTestStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

const construct = new MyConstruct(stack, 'TestConstruct', {
  name: 'integ-test',
  // CRITICAL: Set RemovalPolicy.DESTROY for cleanup
  removalPolicy: RemovalPolicy.DESTROY,
});

// Add outputs for validation
new CfnOutput(stack, 'BucketName', {
  value: construct.bucket.bucketName,
  description: 'Name of the created S3 bucket',
});

new CfnOutput(stack, 'BucketArn', {
  value: construct.bucket.bucketArn,
  description: 'ARN of the created S3 bucket',
});

app.synth();
```

**Critical**: Always set `RemovalPolicy.DESTROY` for test resources!

---

### Stack Test Deployment Workflow

**Step 1: Synthesize**

```bash
npx cdk synth --app "npx ts-node src/integration/{module}/integ.{construct}.ts"
```

Review CloudFormation template in `cdk.out/`.

---

**Step 2: Review Diff**

```bash
npx cdk diff --app "npx ts-node src/integration/{module}/integ.{construct}.ts" --profile <profile-name>
```

Review changes with user before deploying.

---

**Step 3: Deploy**

```bash
npx cdk deploy --app "npx ts-node src/integration/{module}/integ.{construct}.ts" --profile <profile-name>
```

Monitor CloudFormation Events for errors.

---

**Step 4: Validate with AWS CLI**

```bash
# S3 bucket validation
aws s3api get-bucket-encryption --bucket <bucket-name> --profile <profile>
aws s3api get-bucket-versioning --bucket <bucket-name> --profile <profile>
aws s3api get-public-access-block --bucket <bucket-name> --profile <profile>

# IAM role validation
aws iam get-role --role-name <role-name> --profile <profile>
aws iam list-attached-role-policies --role-name <role-name> --profile <profile>

# VPC validation
aws ec2 describe-vpcs --vpc-ids <vpc-id> --profile <profile>
aws ec2 describe-flow-logs --filter "Name=resource-id,Values=<vpc-id>" --profile <profile>

# CloudWatch log group validation
aws logs describe-log-groups --log-group-name-prefix <prefix> --profile <profile>
```

---

**Step 5: Cleanup (MANDATORY)**

```bash
npx cdk destroy --app "npx ts-node src/integration/{module}/integ.{construct}.ts" --profile <profile-name> --force
```

**Verify cleanup**:

```bash
# Verify stack deleted
aws cloudformation describe-stacks --stack-name IntegTestStack --profile <profile>
# Should return error: "Stack with id IntegTestStack does not exist"

# Verify no orphaned resources
aws s3 ls --profile <profile> | grep integ-test
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=integ-*" --profile <profile>
```

**User responsibility**: Confirm no orphaned resources remain.

---

## Workflow: BDD Testing (Behavior-Driven Development)

**Purpose**: Test constructs from a **business requirements perspective** using human-readable scenarios.

**Framework**: Cucumber with Gherkin syntax

**Location**: `src/test/features/{module}/{feature}.feature` (Gherkin scenarios)  
**Location**: `src/test/step-definitions/{module}/{feature}.steps.ts` (Step implementations)

### When to Use BDD Tests

✅ Business requirements validation  
✅ User story acceptance criteria  
✅ Living documentation for stakeholders  
✅ Complex multi-step workflows  
✅ Collaboration with non-technical stakeholders  
✅ Regulatory compliance verification  

❌ Simple unit tests (use Jest instead)  
❌ Performance-critical tests (Cucumber adds overhead)  

---

### BDD Test Structure

**File 1: Gherkin Feature** (`*.feature`)

```gherkin
# src/test/features/vpc/centralized-flow-logs.feature
Feature: Centralized VPC Flow Logs Infrastructure

  As a platform engineer
  I want to create centralized VPC Flow Logs infrastructure
  So that all VPC traffic logs are stored in a central S3 bucket
  And tenants can discover the bucket via SSM Parameter Store

  Background:
    Given I have AWS credentials configured
    And I have an organization ID "o-abc12345"

  Scenario: Create central flow logs with default configuration
    Given I create a CentralizedVpcFlowLogs construct
    And I specify strategy "central"
    And I provide organization ID "o-abc12345"
    When I synthesize the CloudFormation template
    Then an S3 bucket should be created
    And the bucket should have encryption enabled
    And the bucket should have versioning enabled
    And the bucket should block all public access
    And an SSM parameter should be created for bucket ARN
    And an SSM parameter should be created for bucket name
    And the bucket policy should allow organization-wide access

  Scenario: Create central flow logs with custom bucket name
    Given I create a CentralizedVpcFlowLogs construct
    And I specify strategy "central"
    And I provide organization ID "o-abc12345"
    And I specify custom bucket name "my-custom-flow-logs-bucket"
    When I synthesize the CloudFormation template
    Then an S3 bucket should be created with name "my-custom-flow-logs-bucket"

  Scenario: Create central flow logs with replication enabled
    Given I create a CentralizedVpcFlowLogs construct
    And I specify strategy "central"
    And I provide organization ID "o-abc12345"
    And I enable replication to Control Tower Log Archive
    And I provide Log Archive account ID "999999999999"
    When I synthesize the CloudFormation template
    Then an S3 bucket should be created
    And an IAM replication role should be created
    And the role should have permissions to replicate to Log Archive

  Scenario: Fail when organization ID is missing for central strategy
    Given I create a CentralizedVpcFlowLogs construct
    And I specify strategy "central"
    But I do not provide an organization ID
    When I attempt to synthesize the template
    Then I should receive an error
    And the error message should contain "organizationId is required when strategy is 'central'"

  Scenario: Fail when organization ID has invalid format
    Given I create a CentralizedVpcFlowLogs construct
    And I specify strategy "central"
    And I provide organization ID "invalid-org-id"
    When I attempt to synthesize the template
    Then I should receive an error
    And the error message should contain "Organization ID must start with \"o-\""

  Scenario: Create distributed flow logs (no central infrastructure)
    Given I create a CentralizedVpcFlowLogs construct
    And I specify strategy "distributed"
    When I synthesize the CloudFormation template
    Then no S3 bucket should be created
    And no IAM replication role should be created
    And SSM parameters should be created for tenant configuration

  Scenario: Deploy central flow logs to AWS
    Given I have authenticated with AWS SSO
    And I create a CentralizedVpcFlowLogs construct
    And I specify strategy "central"
    And I provide organization ID "o-abc12345"
    When I deploy the stack to AWS
    Then the S3 bucket should exist in AWS
    And the bucket should have encryption at rest
    And the bucket should have versioning enabled
    And the SSM parameters should exist in Parameter Store
    When I destroy the stack
    Then the S3 bucket should be deleted
    And the SSM parameters should be deleted
    And no orphaned resources should remain
```

**Key Gherkin Components**:

- **Feature**: High-level description of functionality
- **Scenario**: Specific test case
- **Background**: Common setup for all scenarios
- **Given**: Preconditions (setup)
- **When**: Action being tested
- **Then**: Expected outcomes (assertions)
- **And**: Additional steps (same level as previous step)
- **But**: Negative condition

---

**File 2: Step Definitions** (`*.steps.ts`)

```typescript
// src/test/step-definitions/vpc/centralized-flow-logs.steps.ts
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@jest/globals';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CentralizedVpcFlowLogs, CentralizedVpcFlowLogsProps } from '../../../constructs/vpc/flow-log';

// World state (shared between steps)
interface TestWorld {
  app: App;
  stack: Stack;
  construct?: CentralizedVpcFlowLogs;
  props: Partial<CentralizedVpcFlowLogsProps>;
  template?: Template;
  error?: Error;
  awsProfile?: string;
}

let world: TestWorld;

// Setup before each scenario
Before(function () {
  world = {
    app: new App(),
    stack: new Stack(undefined, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    }),
    props: {},
  };
});

// Cleanup after each scenario
After(function () {
  world = {} as TestWorld;
});

// === GIVEN steps (preconditions) ===

Given('I have AWS credentials configured', function () {
  // Verify AWS credentials are available
  expect(process.env.AWS_PROFILE).toBeDefined();
});

Given('I have an organization ID {string}', function (orgId: string) {
  world.props.organizationId = orgId;
});

Given('I create a CentralizedVpcFlowLogs construct', function () {
  // Mark that construct should be created (actual creation in When step)
  // This just sets up intent
});

Given('I specify strategy {string}', function (strategy: string) {
  world.props.strategy = strategy as 'central' | 'distributed';
});

Given('I provide organization ID {string}', function (orgId: string) {
  world.props.organizationId = orgId;
});

Given('I specify custom bucket name {string}', function (bucketName: string) {
  world.props.centralBucket = {
    bucketName,
  };
});

Given('I enable replication to Control Tower Log Archive', function () {
  if (!world.props.centralBucket) {
    world.props.centralBucket = {};
  }
  world.props.centralBucket.replicationEnabled = true;
});

Given('I provide Log Archive account ID {string}', function (accountId: string) {
  if (!world.props.centralBucket) {
    world.props.centralBucket = {};
  }
  world.props.centralBucket.logArchiveAccountId = accountId;
});

Given('I do not provide an organization ID', function () {
  // Explicitly omit organizationId
  delete world.props.organizationId;
});

Given('I have authenticated with AWS SSO', function () {
  // Verify AWS credentials
  expect(process.env.AWS_PROFILE).toBeDefined();
  world.awsProfile = process.env.AWS_PROFILE;
});

// === WHEN steps (actions) ===

When('I synthesize the CloudFormation template', function () {
  try {
    // Create construct with accumulated props
    world.construct = new CentralizedVpcFlowLogs(
      world.stack,
      'TestConstruct',
      world.props as CentralizedVpcFlowLogsProps,
    );
    
    // Synthesize template
    world.template = Template.fromStack(world.stack);
  } catch (error) {
    world.error = error as Error;
  }
});

When('I attempt to synthesize the template', function () {
  try {
    world.construct = new CentralizedVpcFlowLogs(
      world.stack,
      'TestConstruct',
      world.props as CentralizedVpcFlowLogsProps,
    );
    world.template = Template.fromStack(world.stack);
  } catch (error) {
    world.error = error as Error;
  }
});

When('I deploy the stack to AWS', async function () {
  // This would use CDK CLI or AWS SDK to deploy
  // For BDD, this is often a placeholder for actual deployment tests
  // In practice, you might use CDK programmatic API
  throw new Error('AWS deployment in BDD not yet implemented - use CDK deployment tests instead');
});

When('I destroy the stack', async function () {
  // Cleanup deployment
  throw new Error('AWS destroy in BDD not yet implemented - use CDK deployment tests instead');
});

// === THEN steps (assertions) ===

Then('an S3 bucket should be created', function () {
  expect(world.template).toBeDefined();
  world.template!.resourceCountIs('AWS::S3::Bucket', 1);
});

Then('the bucket should have encryption enabled', function () {
  world.template!.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: Match.objectLike({
      ServerSideEncryptionConfiguration: Match.arrayWith([
        Match.objectLike({
          ServerSideEncryptionByDefault: Match.anyValue(),
        }),
      ]),
    }),
  });
});

Then('the bucket should have versioning enabled', function () {
  world.template!.hasResourceProperties('AWS::S3::Bucket', {
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });
});

Then('the bucket should block all public access', function () {
  world.template!.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });
});

Then('an SSM parameter should be created for bucket ARN', function () {
  world.template!.hasResourceProperties('AWS::SSM::Parameter', {
    Name: '/network-services/vpc-flow-logs/bucket-arn',
    Type: 'String',
  });
});

Then('an SSM parameter should be created for bucket name', function () {
  world.template!.hasResourceProperties('AWS::SSM::Parameter', {
    Name: '/network-services/vpc-flow-logs/bucket-name',
    Type: 'String',
  });
});

Then('the bucket policy should allow organization-wide access', function () {
  world.template!.hasResourceProperties('AWS::S3::BucketPolicy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Principal: {
            Service: 'delivery.logs.amazonaws.com',
          },
          Condition: Match.objectLike({
            StringEquals: Match.objectLike({
              'aws:PrincipalOrgID': world.props.organizationId,
            }),
          }),
        }),
      ]),
    }),
  });
});

Then('an S3 bucket should be created with name {string}', function (bucketName: string) {
  world.template!.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: bucketName,
  });
});

Then('an IAM replication role should be created', function () {
  world.template!.resourceCountIs('AWS::IAM::Role', 1);
  world.template!.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Principal: {
            Service: 's3.amazonaws.com',
          },
        }),
      ]),
    }),
  });
});

Then('the role should have permissions to replicate to Log Archive', function () {
  world.template!.hasResourceProperties('AWS::IAM::Role', {
    Policies: Match.arrayWith([
      Match.objectLike({
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['s3:ReplicateObject', 's3:ReplicateDelete']),
            }),
          ]),
        }),
      }),
    ]),
  });
});

Then('I should receive an error', function () {
  expect(world.error).toBeDefined();
});

Then('the error message should contain {string}', function (expectedMessage: string) {
  expect(world.error).toBeDefined();
  expect(world.error!.message).toContain(expectedMessage);
});

Then('no S3 bucket should be created', function () {
  expect(world.template).toBeDefined();
  world.template!.resourceCountIs('AWS::S3::Bucket', 0);
});

Then('no IAM replication role should be created', function () {
  world.template!.resourceCountIs('AWS::IAM::Role', 0);
});

Then('SSM parameters should be created for tenant configuration', function () {
  // Verify tenant configuration parameters exist
  world.template!.hasResourceProperties('AWS::SSM::Parameter', {
    Name: Match.stringLikeRegexp('/network-services/vpc-flow-logs/tenant-'),
  });
});

// AWS deployment assertions (would require actual AWS SDK calls)
Then('the S3 bucket should exist in AWS', async function () {
  // Would use AWS SDK: const s3 = new AWS.S3(); await s3.headBucket(...)
  throw new Error('AWS validation not implemented in BDD - use CDK deployment tests');
});

Then('the bucket should have encryption at rest', async function () {
  throw new Error('AWS validation not implemented in BDD - use CDK deployment tests');
});

Then('the SSM parameters should exist in Parameter Store', async function () {
  throw new Error('AWS validation not implemented in BDD - use CDK deployment tests');
});

Then('the S3 bucket should be deleted', async function () {
  throw new Error('AWS validation not implemented in BDD - use CDK deployment tests');
});

Then('the SSM parameters should be deleted', async function () {
  throw new Error('AWS validation not implemented in BDD - use CDK deployment tests');
});

Then('no orphaned resources should remain', async function () {
  throw new Error('AWS validation not implemented in BDD - use CDK deployment tests');
});
```

---

### Running BDD Tests

**Setup Cucumber**:

```bash
npm install --save-dev @cucumber/cucumber @cucumber/pretty-formatter
```

**Create Cucumber configuration** (`cucumber.js`):

```javascript
module.exports = {
  default: {
    require: ['src/test/step-definitions/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
  },
};
```

**Run BDD tests**:

```bash
# Run all features
npx cucumber-js src/test/features/**/*.feature

# Run specific feature
npx cucumber-js src/test/features/vpc/centralized-flow-logs.feature

# Run specific scenario
npx cucumber-js src/test/features/vpc/centralized-flow-logs.feature:15

# Run with tags
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@integration and not @wip"
```

---

### BDD Tags (Organizing Tests)

```gherkin
@smoke @critical
Feature: Centralized VPC Flow Logs

  @happy-path @fast
  Scenario: Create central flow logs with default configuration
    # ...

  @error-handling
  Scenario: Fail when organization ID is missing
    # ...

  @aws-deployment @slow @manual
  Scenario: Deploy central flow logs to AWS
    # ...

  @wip
  Scenario: Work in progress - not yet implemented
    # ...
```

**Run by tags**:

```bash
# Run only smoke tests
npx cucumber-js --tags "@smoke"

# Run critical scenarios
npx cucumber-js --tags "@critical"

# Run fast tests, exclude slow ones
npx cucumber-js --tags "@fast and not @slow"

# Skip work-in-progress
npx cucumber-js --tags "not @wip"
```

---

### BDD Best Practices

#### 1. Write Declarative Scenarios

❌ **BAD - Imperative (how)**:

```gherkin
Scenario: Create bucket
  Given I navigate to the S3 console
  And I click the "Create Bucket" button
  And I type "my-bucket" in the name field
  And I check the "Enable Versioning" checkbox
  And I click "Create"
  Then I should see "Bucket created successfully"
```

✅ **GOOD - Declarative (what)**:

```gherkin
Scenario: Create bucket with versioning
  Given I want to create a secure S3 bucket
  When I create the bucket with versioning enabled
  Then the bucket should be created successfully
  And versioning should be enabled
```

---

#### 2. Keep Scenarios Independent

❌ **BAD - Dependent scenarios**:

```gherkin
Scenario: Create VPC
  When I create a VPC
  Then the VPC should exist

Scenario: Add flow logs to VPC  # Depends on previous scenario!
  When I add flow logs
  Then flow logs should be enabled
```

✅ **GOOD - Independent scenarios**:

```gherkin
Scenario: Create VPC
  When I create a VPC
  Then the VPC should exist

Scenario: Create VPC with flow logs
  Given I create a VPC
  When I add flow logs to the VPC
  Then flow logs should be enabled
```

---

#### 3. Use Background for Common Setup

✅ **GOOD - DRY with Background**:

```gherkin
Background:
  Given I have AWS credentials configured
  And I have an organization ID "o-abc12345"

Scenario: Create central infrastructure
  When I create centralized flow logs
  Then infrastructure should be created

Scenario: Create with replication
  When I create centralized flow logs with replication
  Then replication should be configured
```

---

#### 4. Use Scenario Outline for Data-Driven Tests

✅ **GOOD - Data-driven testing**:

```gherkin
Scenario Outline: Validate organization ID format
  Given I provide organization ID "<org_id>"
  When I attempt to create centralized flow logs
  Then I should receive <result>

  Examples:
    | org_id        | result  |
    | o-abc12345    | success |
    | o-xyz98765    | success |
    | invalid-id    | error   |
    | abc-12345     | error   |
    | o-            | error   |
```

---

### BDD vs Jest: When to Use Each

| Aspect | BDD (Cucumber) | Jest Unit Tests |
|--------|---------------|-----------------|
| **Purpose** | Business requirements | Technical validation |
| **Audience** | Stakeholders + Developers | Developers only |
| **Language** | Gherkin (human-readable) | TypeScript |
| **Speed** | Slower (Cucumber overhead) | Faster |
| **Maintenance** | Higher (feature + steps) | Lower (single file) |
| **Coverage** | High-level workflows | Low-level logic |
| **Use for** | Acceptance criteria | Implementation details |

**Recommendation**: Use BDD for **acceptance criteria** and Jest for **implementation testing**.

---

### BDD Integration with CI/CD

```yaml
# .github/workflows/test.yml
jobs:
  bdd-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run BDD tests
        run: npx cucumber-js src/test/features/**/*.feature --tags "not @manual and not @wip"
      
      - name: Upload BDD report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: bdd-report
          path: test-results/cucumber-report.html
```

---

## Test Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: Testing Implementation Details

```typescript
// BAD - Testing internal methods
test('calls private createBucket method', () => {
  const spy = jest.spyOn(construct as any, 'createBucket');
  construct.doSomething();
  expect(spy).toHaveBeenCalled();
});

// GOOD - Testing outcomes
test('creates bucket with encryption', () => {
  new MyConstruct(stack, 'Test', { encrypted: true });
  
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: Match.anyValue(),
  });
});
```

---

### ❌ Anti-Pattern 2: Shared State Between Tests

```typescript
// BAD - Shared stack
const stack = new Stack();

test('test 1', () => {
  new MyConstruct(stack, 'Test1', props);
  // ...
});

test('test 2', () => {
  new MyConstruct(stack, 'Test2', props); // Polluted by test 1!
  // ...
});

// GOOD - Fresh state
beforeEach(() => {
  app = new App();
  stack = new Stack(app, 'TestStack');
});

test('test 1', () => {
  new MyConstruct(stack, 'Test1', props);
  // ...
});

test('test 2', () => {
  new MyConstruct(stack, 'Test2', props); // Fresh stack
  // ...
});
```

---

### ❌ Anti-Pattern 3: Over-Reliance on Snapshots

```typescript
// BAD - Only snapshot
test('creates resources', () => {
  new MyConstruct(stack, 'Test', props);
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot(); // What are we validating?
});

// GOOD - Specific assertions + snapshot
test('creates bucket correctly', () => {
  new MyConstruct(stack, 'Test', props);
  const template = Template.fromStack(stack);
  
  // Specific assertions
  template.resourceCountIs('AWS::S3::Bucket', 1);
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: Match.anyValue(),
    VersioningConfiguration: { Status: 'Enabled' },
  });
  
  // Snapshot as supplemental validation
  expect(template.toJSON()).toMatchSnapshot();
});
```

---

### ❌ Anti-Pattern 4: Vague Test Names

```typescript
// BAD
test('test 1', () => { /* ... */ });
test('it works', () => { /* ... */ });
test('bucket', () => { /* ... */ });

// GOOD
test('creates S3 bucket with encryption enabled', () => { /* ... */ });
test('throws error when name is missing', () => { /* ... */ });
test('applies default versioning when not specified', () => { /* ... */ });
```

---

### ❌ Anti-Pattern 5: Multiple Unrelated Assertions

```typescript
// BAD - Too much in one test
test('validates props', () => {
  expect(() => new MyConstruct(stack, 'Test', {})).toThrow();
  expect(() => new MyConstruct(stack, 'Test', { name: '' })).toThrow();
  expect(() => new MyConstruct(stack, 'Test', { name: 'x', count: 0 })).toThrow();
  expect(() => new MyConstruct(stack, 'Test', { name: 'x', count: 1 })).not.toThrow();
});

// GOOD - Separate tests
test('throws when name is missing', () => {
  expect(() => {
    new MyConstruct(stack, 'Test', {});
  }).toThrow("MyConstruct: 'name' is required.");
});

test('throws when name is empty', () => {
  expect(() => {
    new MyConstruct(stack, 'Test', { name: '' });
  }).toThrow("MyConstruct: 'name' cannot be empty.");
});

test('throws when count is zero', () => {
  expect(() => {
    new MyConstruct(stack, 'Test', { name: 'test', count: 0 });
  }).toThrow("MyConstruct: 'count' must be greater than 0.");
});

test('accepts valid configuration', () => {
  expect(() => {
    new MyConstruct(stack, 'Test', { name: 'test', count: 1 });
  }).not.toThrow();
});
```

---

### ❌ Anti-Pattern 6: Comparing Tokens Directly

```typescript
// BAD - Tokens are dynamic, comparison fails
template.hasResourceProperties('AWS::S3::Bucket', {
  BucketName: 'my-bucket-123456789012-us-east-1', // Token value changes!
});

// GOOD - Use matchers
template.hasResourceProperties('AWS::S3::Bucket', {
  BucketName: Match.stringLikeRegexp('^my-bucket-'),
});

// Or check structure
template.hasResourceProperties('AWS::S3::Bucket', {
  BucketName: Match.objectLike({
    'Fn::Join': Match.arrayWith([
      Match.arrayWith(['my-bucket-', Match.anyValue()]),
    ]),
  }),
});
```

---

## Output Contract

When completing testing work, you MUST produce:

### For Unit Tests:
- [ ] Test file: `src/test/{module}/{construct}.test.ts`
- [ ] Test categories covered:
  - [ ] Happy path (resource creation)
  - [ ] Validation (required, exclusivity, ranges)
  - [ ] Defaults (default values applied)
  - [ ] Edge cases (boundary conditions)
- [ ] Test data factories (if complex props): `src/test/factories/{module}.factory.ts`
- [ ] Coverage report: ≥ 85% line, ≥ 80% branch, ≥ 90% function
- [ ] Performance validated: < 10 seconds (target) or < 30 seconds (max)
- [ ] All tests passing: `npx jest src/test/{module}`

### For Integration Tests:
- [ ] Test file: `src/integration/{module}/{construct}.integration.test.ts`
- [ ] Composition scenarios tested
- [ ] Cross-resource relationships validated
- [ ] All tests passing: `npx jest --config src/integration/jest.config.js --testPathPattern={module}`

### For Stack Tests:
- [ ] Stack file: `src/integration/{module}/integ.{construct}.ts`
- [ ] RemovalPolicy.DESTROY set for all test resources
- [ ] CfnOutputs added for validation points
- [ ] Deployment successful
- [ ] AWS CLI validation completed
- [ ] Cleanup successful (stack deleted, no orphans)
- [ ] User confirmed cleanup

### For BDD Tests:
- [ ] Feature file: `src/test/features/{module}/{feature}.feature`
- [ ] Step definitions: `src/test/step-definitions/{module}/{feature}.steps.ts`
- [ ] Scenarios cover acceptance criteria
- [ ] Scenarios are declarative (not imperative)
- [ ] Scenarios are independent
- [ ] Background used for common setup
- [ ] Scenario Outline used for data-driven tests (if applicable)
- [ ] Tags applied appropriately (`@smoke`, `@critical`, etc.)
- [ ] All scenarios passing: `npx cucumber-js src/test/features/**/*.feature`

### Quality Checklist:
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Test names are descriptive
- [ ] No shared state between tests
- [ ] No testing implementation details
- [ ] Error messages validated exactly
- [ ] Performance optimizations applied
- [ ] No flaky tests (deterministic)

---

## Constraints

This skill **MAY NOT**:

- ❌ Skip required test categories
- ❌ Write tests that require manual setup
- ❌ Create flaky tests (non-deterministic)
- ❌ Ignore performance requirements
- ❌ Deploy to AWS without user authentication
- ❌ Leave AWS resources orphaned
- ❌ Skip cleanup after stack tests
- ❌ Write tests with shared state
- ❌ Test implementation details instead of behavior
- ❌ Use vague test names

This skill **MUST**:

- ✅ Use `beforeEach()` for fresh state
- ✅ Use `beforeAll()` for shared templates (performance)
- ✅ Validate exact error messages
- ✅ Request user authentication before AWS operations
- ✅ Clean up all AWS resources after stack tests
- ✅ Benchmark test file duration
- ✅ Follow AAA pattern
- ✅ Write descriptive test names

---

## Approval Gate

Human approval required before:

- ✅ Deploying stack tests to AWS
- ✅ Skipping test categories (with documented reason)
- ✅ Exceeding lambda bundling cap (3 per file)
- ✅ Submitting tests > 30 seconds (must add to sequencer)
- ✅ Modifying existing passing tests (breaking changes)

Human approval **NOT** required for:

- ✅ Writing unit tests
- ✅ Writing integration tests (Jest, no AWS)
- ✅ Adding new test cases
- ✅ Improving test coverage
- ✅ Refactoring tests (behavior unchanged)
- ✅ Fixing failing tests

---

## Pre-Submission Checklist

Before submitting tests, AI agent MUST verify:

```text
✅ Test Organization
  - [ ] Tests grouped logically (describe blocks)
  - [ ] Test names are descriptive and follow pattern
  - [ ] One assertion concept per test

✅ Coverage
  - [ ] Line coverage ≥ 85%
  - [ ] Branch coverage ≥ 80%
  - [ ] Function coverage ≥ 90%
  - [ ] All required categories tested

✅ Performance
  - [ ] Template.fromStack() minimized (use beforeAll)
  - [ ] Lambda bundling ≤ 3 per file
  - [ ] Test file completes < 10 seconds (target) or < 30 seconds (max)
  - [ ] If > 30 seconds, added to .projen/jest-test-sequencer.js

✅ Quality
  - [ ] No shared state between tests (beforeEach for isolation)
  - [ ] Error messages validated exactly
  - [ ] No testing implementation details
  - [ ] Factories used for complex props
  - [ ] No flaky tests (deterministic)

✅ Integration/Stack Tests (if applicable)
  - [ ] AWS authentication handled correctly (AI pauses for user)
  - [ ] RemovalPolicy.DESTROY set for cleanup
  - [ ] CfnOutputs added for validation points
  - [ ] Cleanup verified (stack deleted, no orphaned resources)
```

---

## Common Commands Reference

```bash
# Unit tests
npx jest src/test/{module}                    # Run all tests in module
npx jest src/test/{module}/{file}.test.ts     # Run specific file
npx jest -t "test name"                       # Run specific test
npx jest --watch                              # Watch mode
npx jest --coverage                           # With coverage

# Integration tests (Jest - no AWS)
npx jest --config src/integration/jest.config.js --testPathPattern={module}

# BDD tests (Cucumber)
npx cucumber-js src/test/features/**/*.feature                    # Run all features
npx cucumber-js src/test/features/{module}/{feature}.feature      # Run specific feature
npx cucumber-js src/test/features/{module}/{feature}.feature:15   # Run specific scenario (line 15)
npx cucumber-js --tags "@smoke"                                   # Run by tag
npx cucumber-js --tags "@critical and not @wip"                   # Combine tags

# Stack tests (requires AWS authentication)
# Step 1: User authenticates
aws sso login --profile <profile>

# Step 2: Synthesize
npx cdk synth --app "npx ts-node src/integration/{module}/integ.{construct}.ts"

# Step 3: Deploy
npx cdk deploy --app "..." --profile <profile>

# Step 4: Validate (AWS CLI commands)

# Step 5: Cleanup
npx cdk destroy --app "..." --profile <profile> --force

# Performance benchmarking
npx jest src/test/{module}/{file}.test.ts --verbose

# Update snapshots
npx jest -u
```

---

## References

### Authoritative Standards
- **[docs/standards/testing/unit.md](../standards/testing/unit.md)** - Unit testing patterns (979 lines)
- **[docs/standards/testing/integration.md](../standards/testing/integration.md)** - Integration testing patterns (717 lines)
- **[docs/standards/testing/stack.md](../standards/testing/stack.md)** - Stack deployment tests (687 lines)
- **[docs/standards/testing/validation.md](../standards/testing/validation.md)** - Validation patterns (774 lines)
- **[docs/standards/testing/README.md](../standards/testing/README.md)** - Testing overview and decision trees

### External Resources
- CDK Assertions Library: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html
- Jest Documentation: https://jestjs.io/docs/getting-started
- CDK CLI: https://docs.aws.amazon.com/cdk/v2/guide/cli.html

### Repository Authority
- **CLAUDE.md** - Constitutional authority
- **AGENTS.md** - Agent orchestration and skill assignments

---

## Examples from Codebase

### Excellent Unit Test Example
- `src/test/vpc/centralized-vpc-flow-logs.test.ts` - 558 lines
  - Comprehensive validation tests
  - Performance optimized (beforeAll usage)
  - Token handling with Match patterns
  - Clear test organization

### Excellent Integration Test Example
- `src/integration/vpc/centralized-flow-logs.integration.test.ts` - 146 lines
  - Tests CloudFormation templates locally
  - Cross-resource relationship validation
  - No AWS credentials required

### Excellent Stack Test Example
- `src/integration/vpc/integ.centralized-flow-logs.ts` - 70 lines
  - Three test scenarios
  - RemovalPolicy.DESTROY configured
  - CfnOutputs for validation

---

## Summary: Key Testing Principles

1. **Test Pyramid**: 80% Unit → 15% Integration → 5% E2E
2. **Fail-Fast**: Catch errors at earliest, cheapest point
3. **AAA Pattern**: Arrange → Act → Assert (always)
4. **Test Independence**: No shared state between tests
5. **Performance Matters**: < 10 seconds target, < 30 seconds max
6. **AWS Authentication**: AI must pause and request user credentials
7. **Clean Up**: Always destroy test resources
8. **Coverage with Purpose**: ≥ 85% line, ≥ 80% branch, ≥ 90% function
9. **Test Behavior**: Focus on outcomes, not implementation
10. **Documentation Value**: Tests teach future developers

---

*Last Updated*: December 24, 2025  
*Maintained By*: Repository Stewards  
*Version*: 1.0

