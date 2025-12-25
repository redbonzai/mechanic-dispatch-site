# Security Standards

**Entry Point**: Security Best Practices for AI Agents

**Audience**: AI Agents and Developers  
**Scope**: All CDK constructs and AWS resources  
**Authority**: [CLAUDE.md](../../../CLAUDE.md)

---

## Overview

This document defines security standards and best practices for building secure AWS infrastructure using CDK. All constructs MUST follow these security-first principles.

**Core Philosophy**: Secure by default, explicit opt-out required.

---

## Quick Reference

| Security Principle | Rule | Enforcement |
|--------------------|------|-------------|
| **Encryption at Rest** | MUST be enabled by default | CDK Nag + Unit tests |
| **Encryption in Transit** | MUST enforce SSL/TLS | CDK Nag + Unit tests |
| **Public Access** | MUST be blocked by default | CDK Nag + Unit tests |
| **IAM Least Privilege** | MUST use minimum permissions | CDK Nag + Code review |
| **Logging** | SHOULD be enabled by default | CDK Nag + Code review |
| **Secrets Management** | MUST use Secrets Manager/SSM | Code review |

---

## Rule 1: Encryption at Rest

**Rule**: All data at rest MUST be encrypted by default.

### S3 Buckets

```typescript
// ✅ CORRECT: Encryption enabled by default
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, {
      ...props,
      // Secure default: S3-managed encryption
      encryption: props.encryption ?? s3.BucketEncryption.S3_MANAGED,
      // Block all public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Enforce SSL
      enforceSSL: true,
    });
  }
}

// ❌ INCORRECT: No encryption
export class InsecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: s3.BucketProps) {
    super(scope, id, props);  // Missing encryption!
  }
}
```

### DynamoDB Tables

```typescript
// ✅ CORRECT: Encryption by default
export class SecureTable extends dynamodb.Table {
  constructor(scope: Construct, id: string, props: SecureTableProps) {
    super(scope, id, {
      ...props,
      // Secure default: AWS-managed DynamoDB encryption
      encryption: props.encryption ?? dynamodb.TableEncryption.AWS_MANAGED,
      // Enable point-in-time recovery
      pointInTimeRecovery: props.pointInTimeRecovery ?? true,
    });
  }
}
```

### EBS Volumes

```typescript
// ✅ CORRECT: Encrypted volumes
const volume = new ec2.Volume(this, 'Volume', {
  availabilityZone: 'us-east-1a',
  size: cdk.Size.gibibytes(100),
  // Secure default: Encrypted
  encrypted: true,
  // Optional: Customer-managed key
  encryptionKey: props.kmsKey,
});
```

### RDS Databases

```typescript
// ✅ CORRECT: Encrypted database
const database = new rds.DatabaseInstance(this, 'Database', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15_2,
  }),
  // Secure defaults
  storageEncrypted: true,
  encryptionKey: props.kmsKey,  // Customer-managed key
  backupRetention: cdk.Duration.days(7),
  deletionProtection: true,
});
```

---

## Rule 2: Encryption in Transit

**Rule**: All data in transit MUST use SSL/TLS encryption.

### API Gateway

```typescript
// ✅ CORRECT: HTTPS only
const api = new apigateway.RestApi(this, 'Api', {
  restApiName: 'Secure API',
  // Secure default: Require HTTPS
  endpointConfiguration: {
    types: [apigateway.EndpointType.REGIONAL],
  },
  policy: new iam.PolicyDocument({
    statements: [
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['execute-api:Invoke'],
        resources: ['execute-api:/*'],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false',  // Deny non-HTTPS
          },
        },
      }),
    ],
  }),
});
```

### S3 Bucket Policy

```typescript
// ✅ CORRECT: Enforce SSL
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, {
      ...props,
      enforceSSL: true,  // Denies non-HTTPS requests
    });
    
    // Alternative: Explicit bucket policy
    this.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:*'],
        resources: [this.bucketArn, `${this.bucketArn}/*`],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false',
          },
        },
      })
    );
  }
}
```

### Load Balancer

```typescript
// ✅ CORRECT: HTTPS listener with redirect
const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
  vpc,
  internetFacing: true,
});

// HTTPS listener (primary)
const httpsListener = lb.addListener('HttpsListener', {
  port: 443,
  protocol: elbv2.ApplicationProtocol.HTTPS,
  certificates: [certificate],
  // Secure TLS policy
  sslPolicy: elbv2.SslPolicy.TLS13_RES,
});

// HTTP listener (redirect to HTTPS)
const httpListener = lb.addListener('HttpListener', {
  port: 80,
  protocol: elbv2.ApplicationProtocol.HTTP,
  defaultAction: elbv2.ListenerAction.redirect({
    protocol: 'HTTPS',
    port: '443',
    permanent: true,
  }),
});
```

---

## Rule 3: Block Public Access

**Rule**: Public access MUST be blocked by default unless explicitly required for the use case.

### S3 Buckets

```typescript
// ✅ CORRECT: Block all public access
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, {
      ...props,
      // Secure default: Block ALL public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }
}

// ✅ ACCEPTABLE: Explicit public access for CloudFront origin
export class PublicBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: PublicBucketProps) {
    // Document WHY public access is needed
    if (!props.publicAccessJustification) {
      throw new Error(
        'PublicBucket: publicAccessJustification is required. ' +
        'Document why public access is necessary.'
      );
    }
    
    super(scope, id, {
      ...props,
      // Explicit: Only what's needed
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false,  // Allow for CloudFront OAI
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
    });
    
    // Add CDK Nag suppression with justification
    NagSuppressions.addResourceSuppressions(this, [
      {
        id: 'AwsSolutions-S1',
        reason: props.publicAccessJustification,
      },
    ]);
  }
}
```

### EC2 Security Groups

```typescript
// ✅ CORRECT: No 0.0.0.0/0 ingress except for specific use cases
const webSg = new ec2.SecurityGroup(this, 'WebSG', {
  vpc,
  description: 'Security group for web servers',
  // Secure default: No rules
});

// Explicit rules with justification
webSg.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(443),
  'Allow HTTPS from internet (required for public web service)'
);

webSg.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(80),
  'Allow HTTP from internet (redirects to HTTPS)'
);

// ❌ INCORRECT: No justification for wide-open SSH
webSg.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(22),
  'Allow SSH'  // ❌ 0.0.0.0/0 SSH access is a security risk
);

// ✅ CORRECT: Restricted SSH access
webSg.addIngressRule(
  ec2.Peer.ipv4('10.0.0.0/8'),  // Internal network only
  ec2.Port.tcp(22),
  'Allow SSH from corporate network'
);
```

---

## Rule 4: IAM Least Privilege

**Rule**: IAM permissions MUST follow least privilege principle. Grant only permissions required for the specific task.

### IAM Roles

```typescript
// ✅ CORRECT: Specific permissions
const lambdaRole = new iam.Role(this, 'LambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  description: 'Role for Lambda to process S3 events',
});

// Specific bucket access
bucket.grantRead(lambdaRole);

// Specific DynamoDB table access
table.grantWriteData(lambdaRole);

// CloudWatch Logs (standard for Lambda)
lambdaRole.addToPolicy(
  new iam.PolicyStatement({
    actions: [
      'logs:CreateLogGroup',
      'logs:CreateLogStream',
      'logs:PutLogEvents',
    ],
    resources: [
      `arn:aws:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/aws/lambda/${functionName}:*`,
    ],
  })
);

// ❌ INCORRECT: Overly broad permissions
const badRole = new iam.Role(this, 'BadRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
});

badRole.addManagedPolicy(
  iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')  // ❌ Never do this!
);

badRole.addToPolicy(
  new iam.PolicyStatement({
    actions: ['s3:*'],           // ❌ Too broad
    resources: ['*'],            // ❌ All resources
  })
);
```

### Resource-Based Policies

```typescript
// ✅ CORRECT: Specific principal, specific actions
bucket.addToResourcePolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
    actions: ['s3:GetObject'],
    resources: [`${bucket.bucketArn}/*`],
    conditions: {
      StringEquals: {
        'AWS:SourceArn': distributionArn,
      },
    },
  })
);

// ❌ INCORRECT: No principal restrictions
bucket.addToResourcePolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    principals: [new iam.AnyPrincipal()],  // ❌ Anyone!
    actions: ['s3:*'],                      // ❌ All actions!
    resources: [`${bucket.bucketArn}/*`],
  })
);
```

---

## Rule 5: Logging and Monitoring

**Rule**: Logging SHOULD be enabled by default to support security auditing and troubleshooting.

### VPC Flow Logs

```typescript
// ✅ CORRECT: Flow logs enabled
export class SecureVpc extends ec2.Vpc {
  constructor(scope: Construct, id: string, props: SecureVpcProps) {
    super(scope, id, props);
    
    // Enable flow logs by default
    if (props.flowLog !== false) {  // Allow explicit opt-out
      new ec2.FlowLog(this, 'FlowLog', {
        resourceType: ec2.FlowLogResourceType.fromVpc(this),
        trafficType: ec2.FlowLogTrafficType.ALL,
        destination: ec2.FlowLogDestination.toCloudWatchLogs(
          new logs.LogGroup(this, 'FlowLogGroup', {
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
          })
        ),
      });
    }
  }
}
```

### S3 Access Logging

```typescript
// ✅ CORRECT: Access logging enabled
export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    // Create or use provided logs bucket
    const logsBucket = props.logsBucket ?? new s3.Bucket(this, 'LogsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [{
        expiration: cdk.Duration.days(90),
      }],
    });
    
    super(scope, id, {
      ...props,
      // Enable access logging
      serverAccessLogsBucket: logsBucket,
      serverAccessLogsPrefix: `${props.bucketName}/`,
    });
  }
}
```

### ALB Access Logs

```typescript
// ✅ CORRECT: ALB logging
const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
  vpc,
  internetFacing: true,
});

// Enable access logs
lb.logAccessLogs(logsBucket, 'alb-logs/');
```

### CloudTrail

```typescript
// ✅ CORRECT: CloudTrail for API audit
const trail = new cloudtrail.Trail(this, 'CloudTrail', {
  bucket: trailBucket,
  enableFileValidation: true,  // Tamper detection
  includeGlobalServiceEvents: true,
  isMultiRegionTrail: true,
  managementEvents: cloudtrail.ReadWriteType.ALL,
});

// Log data events for sensitive buckets
trail.addS3EventSelector([{
  bucket: sensitiveBucket,
  objectPrefix: 'sensitive/',
}], {
  readWriteType: cloudtrail.ReadWriteType.ALL,
});
```

---

## Rule 6: Secrets Management

**Rule**: Secrets MUST NOT be hardcoded. Use AWS Secrets Manager or Systems Manager Parameter Store.

### Secrets Manager

```typescript
// ✅ CORRECT: Secrets Manager for credentials
const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
  secretName: `/app/${props.environment}/db/credentials`,
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: 'admin' }),
    generateStringKey: 'password',
    excludeCharacters: '"@\\',
    passwordLength: 32,
  },
});

// Reference secret in RDS
const database = new rds.DatabaseInstance(this, 'Database', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15_2,
  }),
  credentials: rds.Credentials.fromSecret(dbSecret),
  vpc,
});

// ❌ INCORRECT: Hardcoded password
const badDatabase = new rds.DatabaseInstance(this, 'BadDB', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15_2,
  }),
  credentials: rds.Credentials.fromPassword(
    'admin',
    cdk.SecretValue.unsafePlainText('MyPassword123')  // ❌ NEVER DO THIS!
  ),
  vpc,
});
```

### SSM Parameter Store

```typescript
// ✅ CORRECT: SSM Parameter Store for non-sensitive config
const apiKey = new ssm.StringParameter(this, 'ApiKey', {
  parameterName: `/app/${props.environment}/api-key`,
  stringValue: props.apiKey,  // Injected at deploy time
  tier: ssm.ParameterTier.STANDARD,
});

// Reference in Lambda
const lambda = new lambda.Function(this, 'Function', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    API_KEY_PARAM: apiKey.parameterName,  // ✅ Reference, not value
  },
});

// Grant read access
apiKey.grantRead(lambda);

// ❌ INCORRECT: Hardcoded in environment variable
const badLambda = new lambda.Function(this, 'BadFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    API_KEY: 'sk-abc123xyz',  // ❌ Exposed in CloudFormation!
  },
});
```

---

## Rule 7: Network Security

**Rule**: Use security groups and NACLs to control network traffic. Deny by default, allow explicitly.

### Security Group Best Practices

```typescript
// ✅ CORRECT: Layered security groups
const albSg = new ec2.SecurityGroup(this, 'AlbSG', {
  vpc,
  description: 'ALB security group',
});

const appSg = new ec2.SecurityGroup(this, 'AppSG', {
  vpc,
  description: 'Application server security group',
});

const dbSg = new ec2.SecurityGroup(this, 'DbSG', {
  vpc,
  description: 'Database security group',
});

// ALB: Internet → 443
albSg.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(443),
  'HTTPS from internet'
);

// App: ALB → 8080
appSg.addIngressRule(
  albSg,
  ec2.Port.tcp(8080),
  'Application traffic from ALB'
);

// DB: App → 5432
dbSg.addIngressRule(
  appSg,
  ec2.Port.tcp(5432),
  'PostgreSQL from application'
);
```

### NACL Best Practices

```typescript
// ✅ CORRECT: NACL for additional layer
const nacl = new ec2.NetworkAcl(this, 'SubnetNacl', {
  vpc,
  subnetSelection: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
});

// Allow HTTPS inbound from VPC
nacl.addEntry('AllowHttpsInbound', {
  cidr: ec2.AclCidr.ipv4(vpc.vpcCidrBlock),
  ruleNumber: 100,
  traffic: ec2.AclTraffic.tcpPort(443),
  direction: ec2.TrafficDirection.INGRESS,
  ruleAction: ec2.Action.ALLOW,
});

// Allow ephemeral return traffic
nacl.addEntry('AllowEphemeralInbound', {
  cidr: ec2.AclCidr.anyIpv4(),
  ruleNumber: 110,
  traffic: ec2.AclTraffic.tcpPortRange(1024, 65535),
  direction: ec2.TrafficDirection.INGRESS,
  ruleAction: ec2.Action.ALLOW,
});

// Allow all outbound (default)
nacl.addEntry('AllowAllOutbound', {
  cidr: ec2.AclCidr.anyIpv4(),
  ruleNumber: 100,
  traffic: ec2.AclTraffic.allTraffic(),
  direction: ec2.TrafficDirection.EGRESS,
  ruleAction: ec2.Action.ALLOW,
});
```

---

## Rule 8: Resource Deletion Protection

**Rule**: Production resources MUST have deletion protection enabled.

### RDS Databases

```typescript
// ✅ CORRECT: Deletion protection for production
const database = new rds.DatabaseInstance(this, 'Database', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15_2,
  }),
  vpc,
  // Secure defaults for production
  deletionProtection: props.environment === 'production',  // True for prod
  removalPolicy: props.environment === 'production'
    ? cdk.RemovalPolicy.RETAIN
    : cdk.RemovalPolicy.DESTROY,
  backupRetention: props.environment === 'production'
    ? cdk.Duration.days(30)
    : cdk.Duration.days(7),
});
```

### S3 Buckets

```typescript
// ✅ CORRECT: Retention policy for production
const bucket = new s3.Bucket(this, 'Bucket', {
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  // Secure defaults for production
  removalPolicy: props.environment === 'production'
    ? cdk.RemovalPolicy.RETAIN
    : cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: props.environment !== 'production',  // Only dev/test
});
```

---

## AI Agent Guidelines

### Decision Logic

**Question 1**: Does this resource store data?
- **YES** → Enable encryption at rest
- **NO** → N/A

**Question 2**: Does this resource transmit data?
- **YES** → Enforce SSL/TLS
- **NO** → N/A

**Question 3**: Does this resource need public access?
- **NO** → Block all public access
- **YES** → Require justification, minimal access, document reason

**Question 4**: Does this resource need IAM permissions?
- **YES** → Least privilege only, no wildcards unless justified
- **NO** → N/A

**Question 5**: Is logging valuable for this resource?
- **YES** → Enable by default, allow opt-out
- **NO** → Skip

---

### Security Checklist

When creating any construct, verify:

- [ ] **Encryption at rest enabled** (if stores data)
- [ ] **SSL/TLS enforced** (if transmits data)
- [ ] **Public access blocked** (unless explicitly required + justified)
- [ ] **IAM least privilege** (specific actions, specific resources)
- [ ] **Logging enabled** (CloudWatch, S3 access logs, etc.)
- [ ] **Secrets in Secrets Manager/SSM** (no hardcoded credentials)
- [ ] **Security groups deny by default** (explicit allow rules)
- [ ] **Deletion protection for production** (RDS, S3, etc.)
- [ ] **CDK Nag suppressions justified** (with reason)
- [ ] **No admin/wildcard permissions** (specific only)

---

### Common Mistakes

#### Mistake 1: No Encryption

```typescript
// ❌ BAD: No encryption
const bucket = new s3.Bucket(this, 'Bucket');

// ✅ GOOD: Encryption by default
const bucket = new s3.Bucket(this, 'Bucket', {
  encryption: s3.BucketEncryption.S3_MANAGED,
});
```

---

#### Mistake 2: Overly Broad IAM

```typescript
// ❌ BAD: Wildcard permissions
role.addToPolicy(
  new iam.PolicyStatement({
    actions: ['s3:*'],          // ❌ All actions
    resources: ['*'],           // ❌ All resources
  })
);

// ✅ GOOD: Specific permissions
bucket.grantRead(role);         // Only GetObject, ListBucket
```

---

#### Mistake 3: Hardcoded Secrets

```typescript
// ❌ BAD: Hardcoded
const apiKey = 'sk-abc123xyz';

// ✅ GOOD: Secrets Manager
const secret = secretsmanager.Secret.fromSecretNameV2(
  this,
  'ApiKey',
  '/app/api-key'
);
```

---

## CDK Nag Integration

**Rule**: All constructs MUST pass CDK Nag security checks or have documented suppressions.

### Running CDK Nag

```typescript
// In your stack
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();
const stack = new MyStack(app, 'MyStack');

// Add CDK Nag checks
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
```

### Suppressing Findings

```typescript
import { NagSuppressions } from 'cdk-nag';

// ✅ CORRECT: Suppression with justification
NagSuppressions.addResourceSuppressions(bucket, [
  {
    id: 'AwsSolutions-S1',
    reason: 'Public access required for CloudFront origin. Bucket policy restricts to CloudFront OAI only.',
  },
  {
    id: 'AwsSolutions-S10',
    reason: 'SSL enforcement handled by bucket policy (enforceSSL: true).',
  },
]);

// ❌ INCORRECT: No justification
NagSuppressions.addResourceSuppressions(bucket, [
  {
    id: 'AwsSolutions-S1',
    reason: 'Suppressed',  // ❌ Not helpful!
  },
]);
```

---

## References

- **AWS Security Best Practices**: https://aws.amazon.com/security/best-practices/
- **CDK Nag**: https://github.com/cdklabs/cdk-nag
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CIS AWS Foundations Benchmark**: https://www.cisecurity.org/benchmark/amazon_web_services

---

## Related Standards

- [L2/constructs.md](../L2/constructs.md) - L2 secure defaults
- [L3/constructs.md](../L3/constructs.md) - L3 composition security
- [testing/stack.md](../testing/stack.md) - Security testing in deployments
- [types.md](./types.md) - Encryption and security types

---

**Repository Authority**: [CLAUDE.md](../../../CLAUDE.md)

