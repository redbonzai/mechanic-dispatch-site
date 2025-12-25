# Stack Testing Standard (CDK Deployment)

**Applies to**: All layers (L2, L3, L4)
**Test Type**: Requires AWS credentials (AWS SSO with `te-claude-cdk-*` permission set)
**Location**: `src/integration/{module}/integ.{module}.ts`

---

## Overview

CDK stack tests deploy **actual resources to AWS** for manual validation. These tests validate that constructs deploy successfully to real AWS and that AWS service interactions work correctly.

**Key Principle**: Stack tests are the **final validation** before release - they catch AWS-specific issues that cannot be detected with local tests.

**Important**: Stack tests **require AWS credentials** and **cost money**. Always run [unit tests](./unit.md) and [integration tests](./integration.md) first.

---

## Purpose

Stack tests provide:

1. **Real AWS Validation**: Verify constructs deploy to actual AWS
2. **Service Interaction Testing**: Test cross-service relationships
3. **Security Configuration Validation**: Verify secure-by-default settings
4. **Pre-Release Confidence**: Final check before releasing constructs
5. **Debugging AWS Issues**: Investigate AWS-specific deployment problems

---

## Prerequisites

### 1. AWS SSO Authentication

```bash
aws sso login --profile <your-profile-name>
```

### 2. Permission Set

**Required**: `te-claude-cdk-*`
- Provides necessary IAM permissions for stack creation
- Includes CloudFormation, S3, IAM, and service-specific permissions

### 3. Environment Variables (Optional)

```bash
export CDK_DEFAULT_ACCOUNT="123456789012"
export CDK_DEFAULT_REGION="us-east-1"
export AWS_PROFILE="<your-profile-name>"
```

---

## Test Workflow

### ⚠️ Critical Requirement

**Before deploying any CDK stacks**, you **MUST** run these tests first:

```bash
# 1. Run construct-specific unit tests (REQUIRED)
npx jest src/test/{module}

# 2. Run ESLint on changed code (REQUIRED)
npx eslint "src/constructs/{module}/**/*.ts" "src/integration/{module}/**/*.ts"

# 3. Run Jest integration tests - no AWS required (REQUIRED)
npx jest --config src/integration/jest.config.js --testPathPattern={module}

# 4. ONLY after above pass: Deploy CDK integration stacks
# (proceed to workflow below)

# 5. DEFER full build until PR phase (DO NOT run now)
# npx projen build  <-- Run this ONLY before creating PR
```

**Why This Order?**
- **Unit tests** (< 1 min): Catch logic errors immediately
- **ESLint** (< 30 sec): Catch style/convention issues
- **Jest integration tests** (< 2 min): Validate templates without AWS
- **CDK stack deploy** (2-5 min): Real AWS validation, costs money
- **Full build** (5-10 min): Comprehensive check, run once before PR

**Optimize feedback cycles** by catching issues early with fast, local tests!

---

## Complete Stack Test Workflow

### Phase 1: Request Authentication (AI Agent Pauses Here)

**AI must pause and request user to log in**:

```text
I need to run stack tests that deploy to AWS.

Please authenticate with AWS SSO using the te-claude-cdk-* permission set:

  aws sso login --profile <your-profile-name>

Once logged in, provide your profile name and I'll proceed with testing.
```

**User provides**: Profile name (e.g., `my-dev-profile`)

**AI verifies**:

```bash
# Verify authentication works
aws sts get-caller-identity --profile <user-provided-profile>
```

---

### Phase 2: Synthesize CloudFormation Template

```bash
# Generate CloudFormation template (no AWS required)
npx cdk synth --app "npx ts-node src/integration/{module}/integ.{module}.ts"

# Review template
cat cdk.out/{StackName}.template.json | jq .
```

**AI checks**:
- Synthesis completes without errors
- Template looks correct (resources, properties)
- No obvious misconfigurations

---

### Phase 3: View Diff (Optional)

```bash
# See what will be created/changed
npx cdk diff --app "npx ts-node src/integration/{module}/integ.{module}.ts" --profile <profile>
```

---

### Phase 4: Deploy to AWS

```bash
# Deploy stack (auto-approve to avoid hanging)
npx cdk deploy \
  --app "npx ts-node src/integration/{module}/integ.{module}.ts" \
  --profile <profile> \
  --require-approval never
```

**Monitor deployment**:
- Watch CloudFormation Events in AWS Console
- Resolve issues as they arise
- If deployment fails, fix construct and redeploy

**Success**: Stack reaches `CREATE_COMPLETE` status

---

### Phase 5: Validate with AWS CLI (REQUIRED)

**Don't just check the console - verify programmatically!**

Use AWS CLI to validate deployed resources match expectations:

```bash
# Get stack outputs
STACK_NAME="{StackName}"

# List all stack resources
aws cloudformation describe-stack-resources \
  --stack-name $STACK_NAME \
  --profile <profile>

# Example: Validate S3 bucket encryption
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
  --output text \
  --profile <profile>)

aws s3api get-bucket-encryption \
  --bucket $BUCKET_NAME \
  --profile <profile>

# Verify: Encryption should be enabled with expected KMS key

# Example: Validate IAM role policies
ROLE_NAME=$(aws cloudformation describe-stack-resources \
  --stack-name $STACK_NAME \
  --logical-resource-id MyRole \
  --query 'StackResources[0].PhysicalResourceId' \
  --output text \
  --profile <profile>)

aws iam get-role-policy \
  --role-name $ROLE_NAME \
  --policy-name MyPolicy \
  --profile <profile>

# Verify: Policy document matches expectations

# Example: Validate Route53 hosted zone query logging
ZONE_ID=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`HostedZoneId`].OutputValue' \
  --output text \
  --profile <profile>)

aws route53 get-query-logging-config \
  --hosted-zone-id $ZONE_ID \
  --profile <profile>

# Verify: Query logging enabled with correct CloudWatch log group
```

**Validation Checklist**:
- [ ] All resources exist (via `describe-stack-resources`)
- [ ] Resource properties match expectations
- [ ] Security settings correct (encryption, policies, etc.)
- [ ] Tags applied correctly
- [ ] Outputs contain expected values
- [ ] Service-specific configs verified via AWS CLI

**Document any discrepancies** - if CLI shows something different than expected, investigate!

---

### Phase 6: Cleanup

```bash
# Destroy stack (force to avoid confirmation prompts)
npx cdk destroy \
  --app "npx ts-node src/integration/{module}/integ.{module}.ts" \
  --profile <profile> \
  --force
```

**Monitor cleanup**:
- Watch CloudFormation Events
- Verify stack reaches `DELETE_COMPLETE`
- Check for `DELETE_FAILED` events (investigate and manually clean up)

---

### Phase 7: Verify Complete Cleanup

```bash
# Verify stack is gone
aws cloudformation describe-stacks \
  --stack-name {StackName} \
  --profile <profile>
# Expected: Stack not found error

# Verify no orphaned resources (example for S3)
aws s3api list-buckets \
  --query "Buckets[?contains(Name, 'integ-test')]" \
  --profile <profile>
# Expected: Empty array

# Verify no orphaned IAM resources
aws iam list-roles \
  --query "Roles[?contains(RoleName, 'integ-test')]" \
  --profile <profile>
# Expected: Empty array
```

**Manual cleanup if needed**:
- Delete any orphaned resources found
- Check AWS Cost Explorer for unexpected charges
- Document cleanup issues for construct improvements

---

## Creating Stack Tests

### File Structure

```typescript
// src/integration/{module}/integ.{module}.ts
import { App, Stack, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { MyConstruct } from '../../constructs/{module}';

const app = new App();
const stack = new Stack(app, 'MyConstructIntegStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

// Test Scenario 1: Default configuration
const defaultTest = new MyConstruct(stack, 'DefaultTest', {
  // minimal props
  removalPolicy: RemovalPolicy.DESTROY, // For easy cleanup
});

// Test Scenario 2: Custom configuration
const customTest = new MyConstruct(stack, 'CustomTest', {
  // custom props
  removalPolicy: RemovalPolicy.DESTROY,
});

// Outputs for validation
new CfnOutput(stack, 'DefaultTestOutput', {
  value: defaultTest.someProperty,
  description: 'Output from default test',
});

new CfnOutput(stack, 'CustomTestOutput', {
  value: customTest.someProperty,
  description: 'Output from custom test',
});
```

---

## Best Practices

### 1. Stack Naming

```typescript
// ✅ GOOD - Clear naming with IntegStack suffix
const stack = new Stack(app, 'VpcConstructIntegStack', { /* ... */ });

// ❌ BAD - Unclear naming
const stack = new Stack(app, 'TestStack', { /* ... */ });
```

### 2. Resource Naming

```typescript
// ✅ GOOD - Prefix with integ-test- for easy identification
const vpc = new VpcConstruct(stack, 'TestVpc', {
  name: 'integ-test-vpc',
  // ...
});

// ❌ BAD - No prefix
const vpc = new VpcConstruct(stack, 'TestVpc', {
  name: 'my-vpc',
  // ...
});
```

### 3. Cleanup Configuration

```typescript
// ✅ GOOD - Set RemovalPolicy.DESTROY for test resources
const bucket = new s3.Bucket(this, 'TestBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

// ❌ BAD - Default RemovalPolicy.RETAIN (leaves orphaned resources)
const bucket = new s3.Bucket(this, 'TestBucket', {
  // ...
});
```

### 4. Outputs for Validation

```typescript
// ✅ GOOD - Add CfnOutput for key resources
new CfnOutput(stack, 'VpcId', {
  value: vpc.vpcId,
  description: 'VPC ID for validation',
});

new CfnOutput(stack, 'BucketName', {
  value: bucket.bucketName,
  description: 'Bucket name for validation',
});
```

### 5. Cost Management

```typescript
// ✅ GOOD - Use minimal/cheapest configurations
const vpc = new VpcConstruct(stack, 'TestVpc', {
  name: 'integ-test-vpc',
  zone: { count: 2 }, // Minimum for multi-AZ testing
  cidr: {
    allocations: [
      { index: 0, ipv4: { block: '10.0.0.0/24' } }, // Small CIDR
    ],
  },
});

// ❌ BAD - Expensive configuration
const vpc = new VpcConstruct(stack, 'TestVpc', {
  zone: { count: 4 }, // Unnecessary for testing
  // Large CIDR, many subnets, etc.
});
```

### 6. Comments and Documentation

```typescript
// ✅ GOOD - Document what each test scenario validates
// Test Scenario 1: Default configuration
// Validates: Secure defaults, minimal required props
const defaultTest = new MyConstruct(stack, 'DefaultTest', { /* ... */ });

// Test Scenario 2: Multi-destination flow logs
// Validates: Complex configuration with multiple destinations
const flowLogTest = new MyConstruct(stack, 'FlowLogTest', { /* ... */ });
```

---

## AWS Service-Specific Requirements

### Research Before Creating Tests

Before creating stack tests, **review AWS service documentation** for:

1. **Resource naming patterns** (e.g., alphanumeric only, length limits, allowed special characters)
2. **Required resource attributes** (e.g., KMS key specs for specific services like Route53 DNSSEC requires `ECC_NIST_P256`)
3. **IAM/Resource policies** needed for cross-service interactions
4. **Regional requirements** (some services require specific regions)

### Implement Proactive Sanitization

When AWS APIs have known naming/format constraints:

- Add sanitization methods in constructs to convert/truncate names automatically
- Replace disallowed characters (e.g., hyphens → underscores where required)
- Truncate to meet length limits (e.g., RAM permission names ≤ 36 chars)
- Validate and throw clear errors for unsatisfiable constraints
- Update both construct code and tests to use sanitized values

### Verify RemovalPolicy Propagation

Ensure `removalPolicy` is passed through to underlying resources:

- Check construct implementation passes `removalPolicy` to nested resources (e.g., log groups, KMS keys)
- Verify in synthesized CloudFormation template that `DeletionPolicy` is set correctly
- Test actual cleanup by deploying and destroying a test stack
- Confirm resources are deleted via AWS CLI after stack deletion

### Explicit Dependency Ordering

When resources depend on each other:

- Use `resource.node.addDependency()` or `cfnResource.addDependency()` for explicit ordering
- CloudFormation may not infer all dependencies (especially with custom resources)
- Critical for resources that must be created/deleted in specific order (e.g., DNSSEC must wait for KSKs)
- Document why dependencies are needed in code comments

---

## Iterative Debugging Process

1. Deploy one integration stack at a time
2. Check CloudFormation events for specific error messages
3. Research AWS service requirements based on error messages
4. Fix construct or test code based on findings
5. Re-run unit tests and ESLint before re-deploying
6. Destroy failed stacks completely before re-deploying

---

## Example: Complete VPC Stack Test

```typescript
// src/integration/vpc/integ.vpc.ts
import { App, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from '../../constructs/vpc';

class VpcIntegrationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Test 1: Basic VPC with secure defaults
    // Validates: Minimal configuration, secure-by-default settings
    const basicVpc = new VpcConstruct(this, 'BasicVpc', {
      name: 'integ-test-basic-vpc',
      cidr: {
        allocations: [
          { index: 0, ipv4: { block: '10.0.0.0/16' } },
        ],
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Test 2: VPC with explicit flow logs
    // Validates: Flow log integration, multiple destinations
    const flowLogVpc = new VpcConstruct(this, 'FlowLogVpc', {
      name: 'integ-test-flowlog-vpc',
      cidr: {
        allocations: [
          { index: 0, ipv4: { block: '10.1.0.0/16' } },
        ],
      },
      flowLog: {
        trafficType: 'ALL',
        destinations: [
          {
            type: 'logGroup',
            config: {
              name: '/aws/vpc/integ-test',
              retentionDays: 7,
            },
          },
        ],
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Test 3: Multi-CIDR VPC
    // Validates: Secondary CIDR allocation
    const multiCidrVpc = new VpcConstruct(this, 'MultiCidrVpc', {
      name: 'integ-test-multicidr-vpc',
      cidr: {
        allocations: [
          { index: 0, name: 'primary', ipv4: { block: '10.2.0.0/16' } },
          { index: 1, name: 'secondary', ipv4: { block: '100.64.0.0/16' } },
        ],
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Outputs for CLI validation
    new CfnOutput(this, 'BasicVpcId', {
      value: basicVpc.vpcId,
      description: 'Basic VPC ID',
    });

    new CfnOutput(this, 'FlowLogVpcId', {
      value: flowLogVpc.vpcId,
      description: 'Flow Log VPC ID',
    });

    new CfnOutput(this, 'MultiCidrVpcId', {
      value: multiCidrVpc.vpcId,
      description: 'Multi-CIDR VPC ID',
    });
  }
}

const app = new App();
new VpcIntegrationStack(app, 'VpcIntegrationStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

---

## Running Commands

### Synthesize

```bash
npx cdk synth --app "npx ts-node src/integration/vpc/integ.vpc.ts"
```

### Deploy

```bash
npx cdk deploy \
  --app "npx ts-node src/integration/vpc/integ.vpc.ts" \
  --profile <profile> \
  --require-approval never
```

### Destroy

```bash
npx cdk destroy \
  --app "npx ts-node src/integration/vpc/integ.vpc.ts" \
  --profile <profile> \
  --force
```

---

## Success Criteria for PR

**Only proceed to PR creation if**:

- ✅ Stack deployed without errors
- ✅ All resources validated via AWS CLI
- ✅ Stack destroyed cleanly (`DELETE_COMPLETE`)
- ✅ No orphaned resources remain
- ✅ No manual cleanup required
- ✅ Process documented for future reference

**If any step fails**: Fix the construct, repeat from synthesis

---

## Cost Management

### Estimated Costs for Common Stack Tests

| Test Type | Duration | Estimated Cost |
|-----------|----------|----------------|
| S3 Bucket | < 1 hour | < $0.01 |
| IAM Role/Policy | Any | $0.00 (free) |
| KMS Key | < 1 hour | < $0.01 |
| VPC | < 1 hour | $0.00 (free) |
| Lambda | < 1 hour | < $0.01 |
| CloudWatch Logs | < 1 hour | < $0.01 |

**Tips**:
- Always destroy stacks after testing
- Use smallest resource sizes
- Run tests in `us-east-1` (usually cheapest)
- Set CloudWatch log retention to 1 day
- Use `RemovalPolicy.DESTROY` on all resources

---

## Troubleshooting

### Authentication Issues

| Error | Solution |
|-------|----------|
| "Need to perform AWS calls" | Run: `aws sso login --profile <profile-name>` |
| "Invalid credentials" | Verify permission set is `te-claude-cdk-*` |
| "ExpiredToken" | Re-authenticate: `aws sso login --profile <profile-name>` |
| "Access Denied" | Check IAM permissions in permission set |

### Deployment Issues

| Error | Solution |
|-------|----------|
| "Stack already exists" | Previous test wasn't cleaned up: `cdk destroy` |
| "Resource limit exceeded" | Check AWS service quotas, delete unused resources |
| "CloudFormation failed" | Check CloudFormation Events tab for details |
| "Rollback" | Review CloudFormation Events, fix issue, redeploy |

---

## Stack Test Checklist

**Before Deploying**:

- [ ] Authenticated via AWS SSO: `aws sso login`
- [ ] Have `te-claude-cdk-*` permission set
- [ ] Unit tests passed
- [ ] ESLint passed
- [ ] Jest integration tests passed
- [ ] Reviewed CDK synth output for correctness
- [ ] Stack name includes `IntegStack` suffix
- [ ] Resource names include `integ-test-` prefix
- [ ] Set `RemovalPolicy.DESTROY` on temporary resources
- [ ] Understand cost implications
- [ ] Have cleanup plan documented

**After Deploying**:

- [ ] Stack deployed successfully (check CloudFormation console)
- [ ] All resources created correctly (check service consoles)
- [ ] Validated resources via AWS CLI
- [ ] Stack outputs are correct (check Outputs tab)
- [ ] Documented any issues or learnings
- [ ] Destroyed stack: `cdk destroy --profile <profile-name> --force`
- [ ] Verified cleanup in AWS console (no orphaned resources)
- [ ] No unexpected costs incurred

---

## See Also

- **Unit Testing**: [unit.md](./unit.md) - Fast local tests
- **Integration Testing**: [integration.md](./integration.md) - Jest integration tests (no AWS)
- **Validation**: [validation.md](./validation.md) - Constructor validation patterns
- **L2 Constructs**: [../L2/constructs.md](../L2/constructs.md) - L2 construct patterns
- **L3 Constructs**: [../L3/constructs.md](../L3/constructs.md) - L3 construct patterns

---

## References

- CDK CLI Reference: https://docs.aws.amazon.com/cdk/v2/guide/cli.html
- CloudFormation Best Practices: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html
- AWS CLI Reference: https://docs.aws.amazon.com/cli/
- Stack testing patterns in `CLAUDE.md` (repository authority)

