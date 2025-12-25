# Integration Testing Standard (Jest)

**Applies to**: All layers (L2, L3, L4)
**Test Type**: JSII - No AWS credentials required
**Location**: `src/integration/{module}/{module}.integration.test.ts`

---

## Overview

Jest integration tests validate construct **templates and logic locally** without deploying to AWS. These tests are more comprehensive than unit tests and test **multiple constructs working together**.

**Key Difference from Unit Tests**:
- **Unit tests**: Test individual construct methods/properties in isolation
- **Integration tests**: Test multiple constructs composed together, complex scenarios, and edge cases

**Important**: These tests do **NOT** deploy to AWS. For actual AWS deployment tests, see [stack.md](./stack.md).

---

## Purpose

Jest integration tests provide:

1. **Fast Feedback**: Run in CI/CD without AWS credentials (< 5 minutes)
2. **Complex Scenarios**: Test construct compositions and interactions
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Template Validation**: Verify CloudFormation templates are correct
5. **Regression Prevention**: Catch breaking changes before AWS deployment

---

## When to Use Jest Integration Tests

| Scenario | Jest Integration Test | CDK Stack Test (stack.md) |
|----------|----------------------|---------------------------|
| Developing new construct | ✅ Yes - fast feedback | ❌ Not yet |
| Pre-commit validation | ✅ Yes - automated | ❌ Too slow |
| CI/CD pipeline | ✅ Yes - no AWS needed | ❌ Requires AWS credentials |
| Testing complex compositions | ✅ Yes - test templates | ✅ Yes - both |
| Debugging AWS-specific issues | ❌ May not catch all issues | ✅ Yes - see real behavior |
| Pre-release validation | ✅ Yes - both | ✅ Yes - both |

**Recommendation**:
1. Start with Jest integration tests during development
2. Use CDK stack tests before releases or when debugging AWS-specific issues
3. Always run Jest integration tests in CI/CD

---

## Directory Structure

```text
src/integration/
├── {module}/
│   ├── {module}.integration.test.ts    # Jest integration tests
│   └── integ.{module}.ts               # CDK stack tests (see stack.md)
└── jest.config.js                      # Jest configuration
```

---

## Test Structure

### Basic Template

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

      // Assert - Verify flow log points to VPC
      template.hasResourceProperties('AWS::EC2::FlowLog', {
        ResourceType: 'VPC',
        ResourceId: Match.anyValue(), // Should reference VPC
        TrafficType: 'ALL',
      });
    });

    test('creates VPC with multiple flow log destinations', () => {
      // Test complex multi-destination scenario
      // ...
    });
  });

  describe('VPC with Subnets', () => {
    test('creates VPC with subnets in multiple AZs', () => {
      // Test subnet allocation and distribution
      // ...
    });

    test('inherits tags from VPC to subnets', () => {
      // Test tag propagation
      // ...
    });
  });

  describe('Edge Cases', () => {
    test('handles maximum CIDR allocations', () => {
      // Test boundary condition (5 CIDRs max)
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

    test('throws when exceeding CIDR limit', () => {
      expect(() => {
        new VpcConstruct(stack, 'TestVpc', {
          name: 'too-many-cidrs',
          cidr: {
            allocations: [
              { index: 0, ipv4: { block: '10.0.0.0/16' } },
              { index: 1, ipv4: { block: '10.1.0.0/16' } },
              { index: 2, ipv4: { block: '10.2.0.0/16' } },
              { index: 3, ipv4: { block: '10.3.0.0/16' } },
              { index: 4, ipv4: { block: '10.4.0.0/16' } },
              { index: 5, ipv4: { block: '10.5.0.0/16' } }, // Too many!
            ],
          },
        });
      }).toThrow('Maximum 5 CIDR allocations allowed');
    });
  });
});
```

---

## Test Categories

### 1. Construct Composition Tests

Test multiple constructs working together:

```typescript
describe('L3 Composition', () => {
  test('creates network services with VPC, DNS, and load balancer', () => {
    // Create L3 composition
    const networkServices = new NetworkServices(stack, 'NetworkServices', {
      vpcConfig: { /* ... */ },
      dnsConfig: { /* ... */ },
      loadBalancerConfig: { /* ... */ },
    });

    const template = Template.fromStack(stack);

    // Verify all components created
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::Route53::HostedZone', 1);
    template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);

    // Verify wiring between components
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      HostedZoneId: Match.anyValue(),
      Type: 'A',
      AliasTarget: Match.objectLike({
        DNSName: Match.anyValue(), // Should point to LB
      }),
    });
  });
});
```

### 2. Cross-Resource Relationship Tests

Test resources reference each other correctly:

```typescript
describe('Resource References', () => {
  test('flow log references VPC correctly', () => {
    const vpc = new VpcConstruct(stack, 'TestVpc', { /* ... */ });
    const flowLog = new FlowLogConstruct(stack, 'FlowLog', {
      vpc: vpc.vpc,
      trafficType: 'ALL',
    });

    const template = Template.fromStack(stack);

    // Capture VPC logical ID
    const vpcCapture = new Capture();
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
    });

    // Verify flow log references VPC
    template.hasResourceProperties('AWS::EC2::FlowLog', {
      ResourceId: { Ref: vpcCapture },
      ResourceType: 'VPC',
    });
  });
});
```

### 3. Complex Scenario Tests

Test realistic, complex configurations:

```typescript
describe('Complex Scenarios', () => {
  test('creates enterprise VPC with all features', () => {
    const vpc = new VpcConstruct(stack, 'EnterpriseVpc', {
      name: 'enterprise-vpc',
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
          { type: 'logGroup', config: { name: '/aws/vpc/enterprise' } },
          { type: 's3', config: { bucketName: 'enterprise-flow-logs' } },
        ],
      },
      subnets: {
        public: { cidrMask: 24 },
        private: { cidrMask: 22 },
        isolated: { cidrMask: 26 },
      },
      tags: {
        Environment: 'production',
        CostCenter: 'engineering',
        Compliance: 'pci-dss',
      },
    });

    const template = Template.fromStack(stack);

    // Verify comprehensive configuration
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 9); // 3 AZs × 3 subnet types
    template.resourceCountIs('AWS::EC2::FlowLog', 2); // 2 destinations
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('AWS::S3::Bucket', 1);

    // Verify tags applied
    template.hasResourceProperties('AWS::EC2::VPC', {
      Tags: Match.arrayWith([
        { Key: 'Environment', Value: 'production' },
        { Key: 'CostCenter', Value: 'engineering' },
        { Key: 'Compliance', Value: 'pci-dss' },
      ]),
    });
  });
});
```

### 4. Edge Case Tests

Test boundary conditions:

```typescript
describe('Edge Cases', () => {
  test('handles minimum configuration', () => {
    const vpc = new VpcConstruct(stack, 'MinimalVpc', {
      name: 'minimal',
      cidr: {
        allocations: [
          { index: 0, ipv4: { block: '10.0.0.0/16' } },
        ],
      },
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('handles maximum AZ count', () => {
    const vpc = new VpcConstruct(stack, 'MaxAzVpc', {
      name: 'max-az',
      zone: { count: 4 }, // Maximum
      cidr: {
        allocations: [
          { index: 0, ipv4: { block: '10.0.0.0/16' } },
        ],
      },
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::EC2::Subnet', 12); // 4 AZs × 3 subnet types
  });

  test('throws when AZ count exceeds limit', () => {
    expect(() => {
      new VpcConstruct(stack, 'TooManyAz', {
        name: 'invalid',
        zone: { count: 5 }, // Too many!
        cidr: {
          allocations: [
            { index: 0, ipv4: { block: '10.0.0.0/16' } },
          ],
        },
      });
    }).toThrow("'zone.count' must be 1-4, got 5");
  });
});
```

### 5. Error Handling Tests

Test error conditions:

```typescript
describe('Error Handling', () => {
  test('throws clear error for invalid CIDR format', () => {
    expect(() => {
      new VpcConstruct(stack, 'InvalidCidr', {
        name: 'invalid-cidr',
        cidr: {
          allocations: [
            { index: 0, ipv4: { block: '10.0.0.0' } }, // Missing /prefix
          ],
        },
      });
    }).toThrow("format invalid. Expected CIDR with /prefix, got '10.0.0.0'");
  });

  test('throws when required property missing', () => {
    expect(() => {
      new VpcConstruct(stack, 'MissingName', {
        cidr: {
          allocations: [
            { index: 0, ipv4: { block: '10.0.0.0/16' } },
          ],
        },
      } as any);
    }).toThrow("VpcConstruct: 'name' is required.");
  });
});
```

---

## Advanced Assertion Techniques

### Using Capture for Cross-Resource Validation

```typescript
import { Capture } from 'aws-cdk-lib/assertions';

test('subnet references VPC correctly', () => {
  const vpc = new VpcConstruct(stack, 'TestVpc', { /* ... */ });
  
  const template = Template.fromStack(stack);
  
  // Capture VPC logical ID
  const vpcIdCapture = new Capture();
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  });
  const vpcLogicalId = template.findResources('AWS::EC2::VPC');
  const vpcId = Object.keys(vpcLogicalId)[0];
  
  // Verify subnet references VPC
  template.hasResourceProperties('AWS::EC2::Subnet', {
    VpcId: { Ref: vpcId },
  });
});
```

### Testing IAM Policies

```typescript
test('creates IAM role with correct policies', () => {
  const role = new CustomRole(stack, 'TestRole', { /* ... */ });
  
  const template = Template.fromStack(stack);
  
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        }),
      ]),
    }),
  });
});
```

### Testing Tags Propagation

```typescript
test('propagates tags to all resources', () => {
  const vpc = new VpcConstruct(stack, 'TaggedVpc', {
    name: 'tagged',
    cidr: { /* ... */ },
    tags: {
      Environment: 'test',
      Owner: 'platform-team',
    },
  });
  
  const template = Template.fromStack(stack);
  
  // Verify VPC has tags
  template.hasResourceProperties('AWS::EC2::VPC', {
    Tags: Match.arrayWith([
      { Key: 'Environment', Value: 'test' },
      { Key: 'Owner', Value: 'platform-team' },
    ]),
  });
  
  // Verify subnets inherit tags
  template.hasResourceProperties('AWS::EC2::Subnet', {
    Tags: Match.arrayWith([
      { Key: 'Environment', Value: 'test' },
      { Key: 'Owner', Value: 'platform-team' },
    ]),
  });
});
```

---

## Running Integration Tests

### Run All Integration Tests

```bash
npx jest --config src/integration/jest.config.js
```

### Run Specific Module

```bash
npx jest --config src/integration/jest.config.js --testPathPattern=vpc
```

### Run Specific Test

```bash
npx jest --config src/integration/jest.config.js --testNamePattern="creates VPC with flow log integration"
```

### Run with Coverage

```bash
npx jest --config src/integration/jest.config.js --coverage
```

### Watch Mode

```bash
npx jest --config src/integration/jest.config.js --watch --testPathPattern=vpc
```

### Debug Mode

```bash
npx jest --config src/integration/jest.config.js --verbose --no-cache
```

---

## Jest Configuration

Example `src/integration/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.integration.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/integ.*.ts', // Exclude CDK stack tests
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  testTimeout: 30000, // 30 seconds for complex tests
};
```

---

## Best Practices

### 1. Test Realistic Scenarios

```typescript
// ✅ GOOD - Tests realistic production configuration
test('creates production-grade VPC', () => {
  const vpc = new VpcConstruct(stack, 'ProductionVpc', {
    name: 'prod-vpc',
    zone: { count: 3 }, // Multi-AZ
    cidr: {
      allocations: [
        { index: 0, ipv4: { block: '10.0.0.0/16' } },
      ],
    },
    flowLog: { /* ... */ },
    tags: { Environment: 'production' },
  });
  // ...
});
```

### 2. Test Error Paths

```typescript
// ✅ GOOD - Tests error handling
test('throws when configuration is invalid', () => {
  expect(() => {
    new VpcConstruct(stack, 'InvalidVpc', {
      name: 'invalid',
      zone: { count: 0 }, // Invalid!
      cidr: { /* ... */ },
    });
  }).toThrow("'zone.count' must be 1-4, got 0");
});
```

### 3. Use Descriptive Test Names

```typescript
// ❌ BAD
test('vpc test', () => { /* ... */ });

// ✅ GOOD
test('creates VPC with flow logs in multiple destinations', () => { /* ... */ });
```

### 4. Group Related Tests

```typescript
describe('VPC Integration Tests', () => {
  describe('with Flow Logs', () => {
    test('single destination', () => { /* ... */ });
    test('multiple destinations', () => { /* ... */ });
  });
  
  describe('with Subnets', () => {
    test('public subnets', () => { /* ... */ });
    test('private subnets', () => { /* ... */ });
  });
});
```

### 5. Clean Up Between Tests

```typescript
beforeEach(() => {
  app = new App();
  stack = new Stack(app, 'IntegrationTestStack');
});

// Each test gets fresh App and Stack
```

---

## Common Mistakes

### Mistake 1: Not Testing Construct Interactions

```typescript
// ❌ BAD - Tests constructs in isolation (use unit tests for this)
test('creates VPC', () => {
  new VpcConstruct(stack, 'TestVpc', { /* ... */ });
  template.resourceCountIs('AWS::EC2::VPC', 1);
});

// ✅ GOOD - Tests constructs working together
test('creates VPC with integrated flow logs and subnets', () => {
  const vpc = new VpcConstruct(stack, 'TestVpc', { /* ... */ });
  const flowLog = new FlowLogConstruct(stack, 'FlowLog', {
    vpc: vpc.vpc,
    // ...
  });
  // Verify integration
});
```

### Mistake 2: Testing Too Much in One Test

```typescript
// ❌ BAD - Tests everything in one test
test('creates entire infrastructure', () => {
  // Creates VPC, subnets, flow logs, DNS, load balancer, etc.
  // Too much to debug if it fails!
});

// ✅ GOOD - Focused tests
test('creates VPC with flow logs', () => { /* ... */ });
test('creates VPC with subnets', () => { /* ... */ });
test('creates VPC with DNS', () => { /* ... */ });
```

### Mistake 3: Not Using Assertions Library

```typescript
// ❌ BAD - Manual template parsing
const template = Template.fromStack(stack);
const resources = template.toJSON().Resources;
const vpc = Object.values(resources).find(r => r.Type === 'AWS::EC2::VPC');
expect(vpc.Properties.CidrBlock).toBe('10.0.0.0/16');

// ✅ GOOD - Use assertions library
template.hasResourceProperties('AWS::EC2::VPC', {
  CidrBlock: '10.0.0.0/16',
});
```

---

## Integration Test Checklist

**Before Committing**:

- [ ] Tests run without AWS credentials
- [ ] Tests are fast (< 5 seconds per test)
- [ ] Tests are grouped logically
- [ ] Test names are descriptive
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Cross-resource relationships validated
- [ ] Complex scenarios included
- [ ] Coverage meets thresholds (80%/75%/80%)

**CI/CD Ready**:

- [ ] Tests run in CI/CD pipeline
- [ ] No external dependencies
- [ ] Deterministic (no flaky tests)
- [ ] Fast feedback (< 5 minutes total)

---

## See Also

- **Unit Testing**: [unit.md](./unit.md) - Unit test patterns
- **Stack Testing**: [stack.md](./stack.md) - CDK deployment tests (requires AWS)
- **Validation**: [validation.md](./validation.md) - Constructor validation patterns
- **L3 Composition**: [../L3/composition.md](../L3/composition.md) - Composition patterns

---

## References

- CDK Assertions Library: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html
- Jest Documentation: https://jestjs.io/docs/getting-started
- Integration Testing Best Practices: `CLAUDE.md` (repository authority)

