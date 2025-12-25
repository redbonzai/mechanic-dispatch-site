# Coding Conventions Skill

**Version**: 1.0  
**Status**: Active  
**Applicable Agents**: All (Interface Architect, Operational Review, Construct Implementation)

---

## Purpose

Teach AI agents to write **scalable, loosely-coupled, maintainable code** at a senior software engineer level. This skill enforces SOLID principles, design patterns, separation of concerns, and minimal technical debt through actionable conventions and decision trees.

**Core Goals**:
- Write code that scales without major refactoring
- Minimize coupling between components
- Properly separate concerns (business logic, infrastructure, configuration)
- Implement interfaces that enable extensibility
- Produce zero-technical-debt code from the start

---

## When to Use This Skill

Invoke this skill when:

- ✅ Writing new construct code
- ✅ Refactoring existing code
- ✅ Reviewing code for technical debt
- ✅ Making architectural decisions (class vs function, interface vs type)
- ✅ Implementing design patterns
- ✅ Splitting large modules or classes
- ✅ Choosing between inheritance and composition
- ✅ Designing for extensibility

---

## Preconditions (Fail-Closed)

Before invoking this skill, verify:

1. **Requirements clear** - Understand what the code must do
2. **Interface approved** (if applicable) - See [Interface Designer skill](./interface-designer.md)
3. **Standards reviewed**: Read `docs/standards/common/` for repository conventions
4. **Technical context understood**: Know the layer (L2/L3/L4) and construct pattern

**If any precondition missing**: STOP and request clarification.

---

## SOLID Principles (Foundation)

### S - Single Responsibility Principle

**Rule**: A class/module should have **one reason to change**.

❌ **BAD - Multiple responsibilities**:

```typescript
// This class does TOO MUCH
class VpcManager {
  createVpc(props: VpcProps): ec2.Vpc { /* ... */ }
  createSubnets(vpc: ec2.Vpc): ec2.Subnet[] { /* ... */ }
  createFlowLogs(vpc: ec2.Vpc): ec2.FlowLog { /* ... */ }
  validateCidr(cidr: string): boolean { /* ... */ }
  calculateSubnetMasks(): string[] { /* ... */ }
  sendMetrics(): void { /* ... */ }
}
// Reasons to change: VPC logic, subnet logic, flow log logic, CIDR logic, metrics
```

✅ **GOOD - Single responsibility**:

```typescript
// Each class has ONE responsibility
class VpcConstruct extends Construct {
  // Responsibility: VPC resource orchestration
  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id);
    const cidr = CidrValidator.validate(props.cidr); // Delegates
    this.vpc = this.createVpc(cidr);
  }
}

class CidrValidator {
  // Responsibility: CIDR validation logic
  static validate(cidr: string): string {
    if (!this.isValidCidr(cidr)) {
      throw new Error(`Invalid CIDR: ${cidr}`);
    }
    return cidr;
  }
}

class SubnetAllocator {
  // Responsibility: Subnet CIDR calculation
  static allocate(vpcCidr: string, zones: number): string[] {
    // Subnet allocation logic
  }
}
```

**When to split**:
- Class > 300 lines → Extract responsibilities
- Method > 50 lines → Extract helper functions
- Module doing validation + creation + monitoring → Split

---

### O - Open/Closed Principle

**Rule**: Open for **extension**, closed for **modification**.

❌ **BAD - Must modify class to add behavior**:

```typescript
class FlowLogDestination {
  createDestination(type: string, config: any): any {
    if (type === 's3') {
      return new s3.Bucket(this, 'Bucket', config);
    } else if (type === 'cloudwatch') {
      return new logs.LogGroup(this, 'LogGroup', config);
    } else if (type === 'kinesis') { // Must modify code to add new type!
      return new firehose.DeliveryStream(this, 'Stream', config);
    }
    throw new Error('Unknown type');
  }
}
```

✅ **GOOD - Extensible without modification**:

```typescript
// Interface defines contract
interface IFlowLogDestination {
  readonly type: FlowLogDestinationType;
  create(scope: Construct, id: string): any;
}

// Strategy pattern - add new destinations without modifying existing code
class S3Destination implements IFlowLogDestination {
  readonly type = 'S3';
  
  constructor(private config: S3DestinationConfig) {}
  
  create(scope: Construct, id: string): s3.IBucket {
    return new SecureBucket(scope, id, this.config);
  }
}

class CloudWatchDestination implements IFlowLogDestination {
  readonly type = 'CLOUDWATCH';
  
  constructor(private config: CloudWatchConfig) {}
  
  create(scope: Construct, id: string): logs.ILogGroup {
    return new EncryptedLogGroup(scope, id, this.config);
  }
}

// Easy to extend - just add new class
class KinesisDestination implements IFlowLogDestination {
  readonly type = 'KINESIS';
  
  constructor(private config: KinesisConfig) {}
  
  create(scope: Construct, id: string): firehose.IDeliveryStream {
    return new SecureFirehose(scope, id, this.config);
  }
}

// Consumer uses interface, not concrete types
class FlowLogConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    destination: IFlowLogDestination, // Accepts ANY implementation
  ) {
    super(scope, id);
    const dest = destination.create(this, 'Destination');
    // ...
  }
}
```

**Pattern**: Use **Strategy Pattern** for interchangeable behaviors.

---

### L - Liskov Substitution Principle

**Rule**: Subtypes must be substitutable for their base types.

❌ **BAD - Violates LSP**:

```typescript
interface Storage {
  save(data: string): void;
  load(): string;
}

class S3Storage implements Storage {
  save(data: string): void {
    // Saves to S3
  }
  
  load(): string {
    return 'data from S3';
  }
}

class ReadOnlyStorage implements Storage {
  save(data: string): void {
    throw new Error('Read-only storage cannot save!'); // Violates contract!
  }
  
  load(): string {
    return 'data';
  }
}

// This breaks when using ReadOnlyStorage
function processStorage(storage: Storage) {
  storage.save('test'); // Works with S3Storage, fails with ReadOnlyStorage!
}
```

✅ **GOOD - Honors LSP**:

```typescript
// Separate interfaces for different capabilities
interface Readable {
  load(): string;
}

interface Writable {
  save(data: string): void;
}

interface Storage extends Readable, Writable {}

class S3Storage implements Storage {
  save(data: string): void { /* ... */ }
  load(): string { /* ... */ }
}

class ReadOnlyStorage implements Readable { // Only implements what it can do
  load(): string { /* ... */ }
}

// Type-safe - only accepts writable storage
function processWritableStorage(storage: Writable) {
  storage.save('test'); // Guaranteed to work
}

// Accepts any readable storage
function processReadableStorage(storage: Readable) {
  const data = storage.load(); // Guaranteed to work
}
```

**Pattern**: Use **Interface Segregation** to define precise capabilities.

---

### I - Interface Segregation Principle

**Rule**: Clients shouldn't depend on interfaces they don't use.

❌ **BAD - Fat interface**:

```typescript
interface IConstruct {
  create(): void;
  update(): void;
  delete(): void;
  backup(): void;
  restore(): void;
  migrate(): void;
  validate(): void;
  monitor(): void;
}

// This class only needs create/validate
class SimpleConstruct implements IConstruct {
  create(): void { /* ... */ }
  validate(): void { /* ... */ }
  
  // Forced to implement methods it doesn't need!
  update(): void { throw new Error('Not supported'); }
  delete(): void { throw new Error('Not supported'); }
  backup(): void { throw new Error('Not supported'); }
  restore(): void { throw new Error('Not supported'); }
  migrate(): void { throw new Error('Not supported'); }
  monitor(): void { throw new Error('Not supported'); }
}
```

✅ **GOOD - Segregated interfaces**:

```typescript
// Small, focused interfaces
interface ICreatable {
  create(): void;
}

interface IValidatable {
  validate(): void;
}

interface IUpdatable {
  update(): void;
}

interface IBackupable {
  backup(): void;
  restore(): void;
}

interface IMonitorable {
  monitor(): void;
}

// Compose only what you need
class SimpleConstruct implements ICreatable, IValidatable {
  create(): void { /* ... */ }
  validate(): void { /* ... */ }
}

class FullFeaturedConstruct 
  implements ICreatable, IValidatable, IUpdatable, IBackupable, IMonitorable {
  create(): void { /* ... */ }
  validate(): void { /* ... */ }
  update(): void { /* ... */ }
  backup(): void { /* ... */ }
  restore(): void { /* ... */ }
  monitor(): void { /* ... */ }
}

// Functions depend on specific capabilities
function validateAndCreate(construct: ICreatable & IValidatable) {
  construct.validate();
  construct.create();
}
```

**Pattern**: Compose interfaces from **small, focused contracts**.

---

### D - Dependency Inversion Principle

**Rule**: Depend on **abstractions**, not concretions.

❌ **BAD - Tight coupling to concrete types**:

```typescript
class FlowLogConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    // Tightly coupled to concrete S3 implementation
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: 'flow-logs',
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    
    // Cannot switch to CloudWatch or Kinesis without code change!
    new ec2.FlowLog(this, 'FlowLog', {
      destination: ec2.FlowLogDestination.toS3(bucket),
    });
  }
}
```

✅ **GOOD - Depends on abstraction**:

```typescript
// Abstraction (interface)
interface IFlowLogDestination {
  getDestination(): ec2.FlowLogDestination;
}

// Concrete implementations
class S3FlowLogDestination implements IFlowLogDestination {
  private bucket: s3.IBucket;
  
  constructor(scope: Construct, id: string, props: S3DestinationProps) {
    this.bucket = new SecureBucket(scope, id, props);
  }
  
  getDestination(): ec2.FlowLogDestination {
    return ec2.FlowLogDestination.toS3(this.bucket);
  }
}

class CloudWatchFlowLogDestination implements IFlowLogDestination {
  private logGroup: logs.ILogGroup;
  
  constructor(scope: Construct, id: string, props: CloudWatchProps) {
    this.logGroup = new EncryptedLogGroup(scope, id, props);
  }
  
  getDestination(): ec2.FlowLogDestination {
    return ec2.FlowLogDestination.toCloudWatchLogs(this.logGroup);
  }
}

// Construct depends on abstraction
class FlowLogConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    destination: IFlowLogDestination, // Abstraction injected!
  ) {
    super(scope, id);
    
    new ec2.FlowLog(this, 'FlowLog', {
      destination: destination.getDestination(),
    });
  }
}

// Usage - swap implementations easily
const s3Destination = new S3FlowLogDestination(stack, 'S3Dest', s3Props);
new FlowLogConstruct(stack, 'FlowLog1', s3Destination);

const cwDestination = new CloudWatchFlowLogDestination(stack, 'CWDest', cwProps);
new FlowLogConstruct(stack, 'FlowLog2', cwDestination);
```

**Pattern**: Use **Dependency Injection** - pass abstractions as constructor parameters.

---

## Design Patterns (When to Use)

### Pattern 1: Strategy Pattern

**Use When**: Multiple interchangeable algorithms or behaviors.

**Example**: Encryption strategies

```typescript
interface IEncryptionStrategy {
  encrypt(scope: Construct, props: EncryptionProps): kms.IKey | undefined;
}

class KmsEncryptionStrategy implements IEncryptionStrategy {
  encrypt(scope: Construct, props: EncryptionProps): kms.IKey {
    return new kms.Key(scope, 'Key', {
      alias: props.alias,
      enableKeyRotation: true,
    });
  }
}

class S3ManagedEncryptionStrategy implements IEncryptionStrategy {
  encrypt(scope: Construct, props: EncryptionProps): undefined {
    // S3-managed encryption doesn't need KMS key
    return undefined;
  }
}

class BucketWithEncryption extends Construct {
  constructor(
    scope: Construct,
    id: string,
    strategy: IEncryptionStrategy,
  ) {
    super(scope, id);
    
    const key = strategy.encrypt(this, { alias: 'bucket-key' });
    
    new s3.Bucket(this, 'Bucket', {
      encryptionKey: key,
      encryption: key 
        ? s3.BucketEncryption.KMS 
        : s3.BucketEncryption.S3_MANAGED,
    });
  }
}
```

---

### Pattern 2: Factory Pattern

**Use When**: Complex object creation logic or multiple creation paths.

**Example**: Destination factory

```typescript
interface FlowLogDestination {
  type: 'S3' | 'CLOUDWATCH' | 'KINESIS';
  config: any;
}

class FlowLogDestinationFactory {
  static create(
    scope: Construct,
    id: string,
    destination: FlowLogDestination,
  ): ec2.FlowLogDestination {
    switch (destination.type) {
      case 'S3':
        const bucket = new SecureBucket(scope, `${id}Bucket`, destination.config);
        return ec2.FlowLogDestination.toS3(bucket);
        
      case 'CLOUDWATCH':
        const logGroup = new EncryptedLogGroup(scope, `${id}LogGroup`, destination.config);
        return ec2.FlowLogDestination.toCloudWatchLogs(logGroup);
        
      case 'KINESIS':
        const stream = new SecureFirehose(scope, `${id}Stream`, destination.config);
        return ec2.FlowLogDestination.toKinesisDataFirehose(stream);
        
      default:
        throw new Error(`Unknown destination type: ${destination.type}`);
    }
  }
}

// Usage
const destination = FlowLogDestinationFactory.create(this, 'Destination', {
  type: 'S3',
  config: { bucketName: 'flow-logs' },
});
```

**Alternative**: Use **Static Factory Methods** on the class itself.

---

### Pattern 3: Builder Pattern

**Use When**: Complex object with many optional parameters.

**Example**: VPC configuration builder

```typescript
class VpcConfigurationBuilder {
  private config: Partial<VpcConfiguration> = {};
  
  withCidr(cidr: string): this {
    this.config.cidr = cidr;
    return this;
  }
  
  withZones(zones: number): this {
    this.config.zones = zones;
    return this;
  }
  
  withFlowLogs(enabled: boolean): this {
    this.config.flowLogsEnabled = enabled;
    return this;
  }
  
  withNatGateways(count: number): this {
    this.config.natGateways = count;
    return this;
  }
  
  withTags(tags: Record<string, string>): this {
    this.config.tags = { ...this.config.tags, ...tags };
    return this;
  }
  
  build(): VpcConfiguration {
    // Validate required fields
    if (!this.config.cidr) {
      throw new Error('CIDR is required');
    }
    
    // Apply defaults
    return {
      cidr: this.config.cidr,
      zones: this.config.zones ?? 3,
      flowLogsEnabled: this.config.flowLogsEnabled ?? true,
      natGateways: this.config.natGateways ?? this.config.zones ?? 3,
      tags: this.config.tags ?? {},
    };
  }
}

// Usage - fluent API
const config = new VpcConfigurationBuilder()
  .withCidr('10.0.0.0/16')
  .withZones(2)
  .withFlowLogs(true)
  .withTags({ Environment: 'prod' })
  .build();
```

**When NOT to use**: Simple objects with < 5 properties (use plain objects).

---

### Pattern 4: Adapter Pattern

**Use When**: Need to make incompatible interfaces work together.

**Example**: Adapting AWS SDK to CDK interface

```typescript
// CDK expects this interface
interface ICidrBlock {
  readonly cidrBlock: string;
  readonly cidrBlockState: string;
}

// AWS SDK returns this (incompatible)
interface AwsVpcCidrBlock {
  CidrBlock: string;
  State: string;
}

// Adapter makes them compatible
class VpcCidrBlockAdapter implements ICidrBlock {
  constructor(private awsCidr: AwsVpcCidrBlock) {}
  
  get cidrBlock(): string {
    return this.awsCidr.CidrBlock;
  }
  
  get cidrBlockState(): string {
    return this.awsCidr.State;
  }
}

// Usage
function processCidr(cidr: ICidrBlock) {
  console.log(cidr.cidrBlock, cidr.cidrBlockState);
}

const awsCidr: AwsVpcCidrBlock = { CidrBlock: '10.0.0.0/16', State: 'associated' };
processCidr(new VpcCidrBlockAdapter(awsCidr));
```

---

### Pattern 5: Facade Pattern

**Use When**: Simplifying complex subsystem interactions.

**Example**: Networking facade

```typescript
// Complex subsystem
class VpcManager { /* ... */ }
class SubnetManager { /* ... */ }
class RouteTableManager { /* ... */ }
class SecurityGroupManager { /* ... */ }

// Facade simplifies interaction
class NetworkingFacade {
  private vpcManager: VpcManager;
  private subnetManager: SubnetManager;
  private routeTableManager: RouteTableManager;
  private sgManager: SecurityGroupManager;
  
  constructor(scope: Construct) {
    this.vpcManager = new VpcManager(scope);
    this.subnetManager = new SubnetManager(scope);
    this.routeTableManager = new RouteTableManager(scope);
    this.sgManager = new SecurityGroupManager(scope);
  }
  
  // Simple method that coordinates multiple managers
  setupNetwork(config: NetworkConfig): Network {
    const vpc = this.vpcManager.createVpc(config.cidr);
    const subnets = this.subnetManager.createSubnets(vpc, config.zones);
    const routeTables = this.routeTableManager.setupRoutes(subnets);
    const securityGroup = this.sgManager.createDefaultSecurityGroup(vpc);
    
    return { vpc, subnets, routeTables, securityGroup };
  }
}

// Usage - simple!
const network = new NetworkingFacade(this).setupNetwork({
  cidr: '10.0.0.0/16',
  zones: 3,
});
```

---

## Separation of Concerns

### Concern 1: Business Logic vs Infrastructure

❌ **BAD - Mixed concerns**:

```typescript
class UserService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    // Infrastructure AND business logic mixed!
    const table = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });
    
    const lambda = new lambda.Function(this, 'CreateUser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          // Business logic in infrastructure code!
          const user = JSON.parse(event.body);
          if (!user.email || !user.email.includes('@')) {
            return { statusCode: 400, body: 'Invalid email' };
          }
          // Save to DynamoDB...
        };
      `),
    });
  }
}
```

✅ **GOOD - Separated concerns**:

```typescript
// Business logic layer (pure TypeScript)
// src/user/domain/user-validator.ts
export class UserValidator {
  static validate(user: User): ValidationResult {
    if (!user.email || !user.email.includes('@')) {
      return { valid: false, error: 'Invalid email' };
    }
    if (!user.name || user.name.length < 2) {
      return { valid: false, error: 'Invalid name' };
    }
    return { valid: true };
  }
}

// Infrastructure layer (CDK constructs)
// src/user/infrastructure/user-table.ts
export class UserTable extends Construct {
  public readonly table: dynamodb.ITable;
  
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    this.table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });
  }
}

// Application layer (Lambda handlers)
// src/assets/user-handler/create-user.ts
import { UserValidator } from '../../user/domain/user-validator';

export async function handler(event: APIGatewayEvent) {
  const user = JSON.parse(event.body);
  
  // Business logic separate from infrastructure
  const validation = UserValidator.validate(user);
  if (!validation.valid) {
    return { statusCode: 400, body: validation.error };
  }
  
  // Save to DynamoDB...
}
```

**Rule**: Keep business logic in **pure TypeScript** (no CDK imports).

---

### Concern 2: Configuration vs Implementation

❌ **BAD - Hardcoded configuration**:

```typescript
class MyConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    new s3.Bucket(this, 'Bucket', {
      bucketName: 'my-app-bucket-prod', // Hardcoded!
      versioned: true,
      lifecycleRules: [
        { transitions: [{ storageClass: s3.StorageClass.GLACIER, transitionAfter: Duration.days(90) }] },
      ],
    });
  }
}
```

✅ **GOOD - Configuration separated**:

```typescript
// Configuration (types.ts)
export interface BucketConfiguration {
  readonly namePrefix: string;
  readonly versioned: boolean;
  readonly lifecycleRules?: s3.LifecycleRule[];
}

// Implementation (construct)
class MyConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    config: BucketConfiguration,
  ) {
    super(scope, id);
    
    new s3.Bucket(this, 'Bucket', {
      bucketName: `${config.namePrefix}-${this.node.addr.substring(0, 8)}`,
      versioned: config.versioned,
      lifecycleRules: config.lifecycleRules,
    });
  }
}

// Usage - configuration injected
const config: BucketConfiguration = {
  namePrefix: 'my-app-bucket-prod',
  versioned: true,
  lifecycleRules: [
    { transitions: [{ storageClass: s3.StorageClass.GLACIER, transitionAfter: Duration.days(90) }] },
  ],
};

new MyConstruct(stack, 'Construct', config);
```

---

### Concern 3: Validation vs Creation

❌ **BAD - Validation after creation**:

```typescript
class MyConstruct extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    
    // Create resources FIRST
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
    });
    
    // Validate AFTER (too late!)
    if (!props.bucketName || props.bucketName.length > 63) {
      throw new Error('Invalid bucket name');
    }
  }
}
```

✅ **GOOD - Validation before creation**:

```typescript
class MyConstruct extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    
    // Validate FIRST (fail-fast)
    this.validateProps(props);
    
    // Create resources AFTER validation
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
    });
  }
  
  private validateProps(props: Props): void {
    if (!props.bucketName) {
      throw new Error("MyConstruct: 'bucketName' is required.");
    }
    
    if (props.bucketName.length > 63) {
      throw new Error(`MyConstruct: 'bucketName' must be ≤ 63 characters, got ${props.bucketName.length}.`);
    }
    
    if (!/^[a-z0-9.-]+$/.test(props.bucketName)) {
      throw new Error("MyConstruct: 'bucketName' must contain only lowercase letters, numbers, dots, and hyphens.");
    }
  }
}
```

**Rule**: **Always validate props before creating resources** (fail-fast).

---

## Code Organization

### Rule 1: File Organization

✅ **Module structure**:

```text
src/constructs/{service}/
├── types.ts              # Public interfaces and types
├── {Construct}.ts        # Main construct class
├── functions.ts          # Shared helper functions
├── constants.ts          # Constants (if needed)
└── index.ts              # Barrel exports
```

❌ **Anti-patterns**:
- Putting types in construct file
- Multiple constructs in one file
- No barrel exports
- Mixing capability module and construct patterns

---

### Rule 2: Class Organization

✅ **Member ordering**:

```typescript
export class MyConstruct extends Construct {
  // 1. Public static fields/methods
  public static readonly DEFAULT_ZONES = 3;
  
  // 2. Protected static fields/methods
  protected static validateCidr(cidr: string): void { /* ... */ }
  
  // 3. Private static fields/methods
  private static readonly INTERNAL_PREFIX = 'internal';
  
  // 4. Public instance fields
  public readonly vpc: ec2.IVpc;
  public readonly subnets: ec2.ISubnet[];
  
  // 5. Protected instance fields
  protected readonly config: VpcConfig;
  
  // 6. Private instance fields
  private readonly natGateways: ec2.INatGateway[];
  
  // 7. Constructor
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    this.validateProps(props);
    this.config = this.buildConfig(props);
    this.vpc = this.createVpc();
    this.subnets = this.createSubnets();
    this.natGateways = this.createNatGateways();
  }
  
  // 8. Public instance methods
  public getSubnetsByType(type: string): ec2.ISubnet[] { /* ... */ }
  
  // 9. Protected instance methods
  protected createVpc(): ec2.IVpc { /* ... */ }
  
  // 10. Private instance methods
  private validateProps(props: Props): void { /* ... */ }
  private buildConfig(props: Props): VpcConfig { /* ... */ }
  private createSubnets(): ec2.ISubnet[] { /* ... */ }
  private createNatGateways(): ec2.INatGateway[] { /* ... */ }
}
```

**Rule**: ESLint enforces this via `@typescript-eslint/member-ordering`.

---

### Rule 3: Function Size

**Limits**:
- **Method**: ≤ 50 lines
- **Function**: ≤ 30 lines
- **Lambda handler**: ≤ 100 lines

❌ **BAD - 200-line method**:

```typescript
createVpc(props: VpcProps): ec2.Vpc {
  // 200 lines of logic...
}
```

✅ **GOOD - Extracted helpers**:

```typescript
createVpc(props: VpcProps): ec2.Vpc {
  const cidr = this.validateAndParseCidr(props.cidr);
  const zones = this.determineAvailabilityZones(props.zones);
  const subnets = this.calculateSubnetAllocations(cidr, zones);
  
  return new ec2.Vpc(this, 'Vpc', {
    cidr,
    maxAzs: zones.length,
    subnetConfiguration: subnets,
  });
}

private validateAndParseCidr(cidr: string): string { /* ... */ }
private determineAvailabilityZones(zones?: number): string[] { /* ... */ }
private calculateSubnetAllocations(cidr: string, zones: string[]): SubnetConfig[] { /* ... */ }
```

---

### Rule 4: Module Cohesion

**High cohesion**: Functions/classes in a module work together.

❌ **BAD - Low cohesion**:

```typescript
// utils.ts (grab bag of unrelated functions)
export function formatDate(date: Date): string { /* ... */ }
export function validateEmail(email: string): boolean { /* ... */ }
export function calculateSubnets(cidr: string): string[] { /* ... */ }
export function encryptData(data: string): string { /* ... */ }
```

✅ **GOOD - High cohesion**:

```typescript
// date-utils.ts
export function formatDate(date: Date): string { /* ... */ }
export function parseDate(str: string): Date { /* ... */ }

// email-validator.ts
export function validateEmail(email: string): boolean { /* ... */ }
export function extractDomain(email: string): string { /* ... */ }

// cidr-calculator.ts
export function calculateSubnets(cidr: string): string[] { /* ... */ }
export function validateCidr(cidr: string): boolean { /* ... */ }

// encryption.ts
export function encryptData(data: string): string { /* ... */ }
export function decryptData(encrypted: string): string { /* ... */ }
```

**Rule**: Functions in a module should relate to a **single concept**.

---

## Error Handling

### Rule 1: Fail-Fast Validation

✅ **Validate at entry points**:

```typescript
constructor(scope: Construct, id: string, props: Props) {
  super(scope, id);
  
  // Validate IMMEDIATELY
  this.validateProps(props);
  
  // Then proceed with creation
  this.createResources(props);
}

private validateProps(props: Props): void {
  // Required properties
  if (!props.name) {
    throw new Error("ConstructName: 'name' is required.");
  }
  
  // Type validation
  if (typeof props.count !== 'number') {
    throw new Error(`ConstructName: 'count' must be a number, got ${typeof props.count}.`);
  }
  
  // Range validation
  if (props.count < 1 || props.count > 10) {
    throw new Error(`ConstructName: 'count' must be between 1 and 10, got ${props.count}.`);
  }
  
  // Mutual exclusivity
  if (props.zone && props.zones) {
    throw new Error("ConstructName: Cannot specify both 'zone' and 'zones'.");
  }
  
  // Format validation
  if (!/^[a-z0-9-]+$/.test(props.name)) {
    throw new Error(`ConstructName: 'name' must contain only lowercase letters, numbers, and hyphens.`);
  }
}
```

**Template**: `ConstructName: '{property}' {constraint}.`

---

### Rule 2: Explicit Error Messages

❌ **BAD - Vague errors**:

```typescript
throw new Error('Invalid input');
throw new Error('Bad value');
throw new Error('Failed');
```

✅ **GOOD - Explicit errors**:

```typescript
throw new Error("VpcConstruct: 'cidr' is required.");
throw new Error(`VpcConstruct: 'cidr' must be a valid CIDR block, got '${cidr}'.`);
throw new Error(`VpcConstruct: 'zones' must be between 1 and 4, got ${zones}.`);
throw new Error("VpcConstruct: Cannot specify both 'zone' and 'zones'. Use 'zones' for multiple availability zones.");
```

**Rule**: Include **construct name**, **property name**, and **expected vs actual** values.

---

### Rule 3: Don't Swallow Errors

❌ **BAD - Silent failure**:

```typescript
try {
  this.createBucket(props);
} catch (error) {
  // Swallowed error - caller doesn't know it failed!
  console.log('Failed to create bucket');
}
```

✅ **GOOD - Propagate or handle**:

```typescript
try {
  this.createBucket(props);
} catch (error) {
  // Re-throw with context
  throw new Error(`Failed to create bucket: ${error.message}`);
}

// Or handle and provide fallback
try {
  this.createBucket(props);
} catch (error) {
  console.warn(`Failed to create bucket, using default: ${error.message}`);
  this.useDefaultBucket();
}
```

---

## Dependency Management

### Rule 1: Minimize Dependencies

❌ **BAD - Unnecessary dependency**:

```typescript
import * as lodash from 'lodash'; // Heavy library for one function

function unique<T>(array: T[]): T[] {
  return lodash.uniq(array); // Could use native Set
}
```

✅ **GOOD - Native solution**:

```typescript
function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}
```

---

### Rule 2: Import Barrel Files

❌ **BAD - Direct file imports**:

```typescript
import { VpcConstruct } from '../constructs/vpc/Vpc';
import { VpcProps } from '../constructs/vpc/types';
```

✅ **GOOD - Barrel imports**:

```typescript
import { VpcConstruct, VpcProps } from '../constructs/vpc';
```

---

### Rule 3: No Circular Dependencies

❌ **BAD - Circular dependency**:

```typescript
// a.ts
import { B } from './b';
export class A {
  useB(b: B) { /* ... */ }
}

// b.ts
import { A } from './a'; // Circular!
export class B {
  useA(a: A) { /* ... */ }
}
```

✅ **GOOD - Extract interface**:

```typescript
// interfaces.ts
export interface IA {
  doSomething(): void;
}

export interface IB {
  doOther(): void;
}

// a.ts
import { IB } from './interfaces';
export class A implements IA {
  useB(b: IB) { /* ... */ }
}

// b.ts
import { IA } from './interfaces';
export class B implements IB {
  useA(a: IA) { /* ... */ }
}
```

---

## TypeScript Best Practices

### Rule 1: Use Readonly

✅ **Immutability**:

```typescript
// Props interfaces
export interface VpcProps {
  readonly name: string;
  readonly cidr: string;
  readonly zones?: number;
}

// Class fields that don't change
export class MyConstruct extends Construct {
  public readonly vpc: ec2.IVpc;
  private readonly config: Config;
  
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    this.config = this.buildConfig(props); // Assigned once
    this.vpc = this.createVpc(); // Assigned once
  }
}
```

**Rule**: Use `readonly` for properties that shouldn't change after construction.

---

### Rule 2: Avoid `any`

❌ **BAD - Type unsafe**:

```typescript
function processData(data: any): any {
  return data.someProperty; // No type safety
}
```

✅ **GOOD - Type safe**:

```typescript
interface DataShape {
  someProperty: string;
}

function processData(data: DataShape): string {
  return data.someProperty; // Type safe
}

// Or use generics
function processData<T extends { someProperty: string }>(data: T): string {
  return data.someProperty;
}
```

---

### Rule 3: Use Union Types

✅ **Type-safe enums**:

```typescript
// Instead of enum
type FlowLogType = 'S3' | 'CLOUDWATCH' | 'KINESIS';

// Use in props
export interface FlowLogProps {
  readonly type: FlowLogType;
}

// Type guard
function isS3Type(type: FlowLogType): type is 'S3' {
  return type === 'S3';
}
```

---

### Rule 4: Use Utility Types

```typescript
// Partial - make all properties optional
type PartialProps = Partial<VpcProps>;

// Pick - select specific properties
type NameAndCidr = Pick<VpcProps, 'name' | 'cidr'>;

// Omit - exclude specific properties
type PropsWithoutName = Omit<VpcProps, 'name'>;

// Required - make all properties required
type RequiredProps = Required<VpcProps>;

// Readonly - make all properties readonly
type ImmutableProps = Readonly<VpcProps>;

// Record - map keys to values
type ConfigMap = Record<string, Config>;
```

---

## CDK-Specific Patterns

### Pattern 1: Extend Upstream Props

✅ **L2 Inheritance pattern**:

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// Extend upstream props
export interface SecureBucketProps extends s3.BucketProps {
  readonly malwareProtection?: boolean;
}

export class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    // Apply secure defaults
    const secureProps: s3.BucketProps = {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      ...props, // User props override defaults
    };
    
    super(scope, id, secureProps);
    
    if (props.malwareProtection) {
      this.enableMalwareProtection();
    }
  }
  
  private enableMalwareProtection(): void {
    // Add malware protection
  }
}
```

---

### Pattern 2: Composition over Inheritance

✅ **L3 Composition pattern**:

```typescript
export class NetworkServices extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly flowLogs: ec2.FlowLog;
  public readonly bastionHost: ec2.BastionHostLinux;
  
  constructor(scope: Construct, id: string, props: NetworkServicesProps) {
    super(scope, id);
    
    // Compose L2 constructs
    const vpcConstruct = new VpcConstruct(this, 'Vpc', props.vpcConfig);
    this.vpc = vpcConstruct.vpc;
    
    const flowLogConstruct = new FlowLogConstruct(this, 'FlowLogs', {
      vpc: this.vpc,
      ...props.flowLogConfig,
    });
    this.flowLogs = flowLogConstruct.flowLog;
    
    if (props.bastionConfig) {
      const bastionConstruct = new BastionHostConstruct(this, 'Bastion', {
        vpc: this.vpc,
        ...props.bastionConfig,
      });
      this.bastionHost = bastionConstruct.bastionHost;
    }
  }
}
```

**Rule**: L3 constructs **compose** L2 constructs, don't extend them.

---

## Refactoring Checklist

When refactoring code, verify:

### Technical Debt Indicators

- [ ] **God Class** (> 500 lines) → Extract responsibilities
- [ ] **Long Method** (> 50 lines) → Extract helper methods
- [ ] **Duplicate Code** → Extract to shared function
- [ ] **Magic Numbers** → Extract to named constants
- [ ] **Hardcoded Strings** → Extract to configuration
- [ ] **Deep Nesting** (> 3 levels) → Extract guards or methods
- [ ] **Tight Coupling** → Introduce interfaces
- [ ] **Mixed Concerns** → Separate layers
- [ ] **No Tests** → Add tests first (characterization tests)
- [ ] **Unclear Names** → Rename for clarity

---

## Output Contract

When completing coding work, you MUST produce:

### Code Quality
- [ ] SOLID principles applied
- [ ] Appropriate design patterns used
- [ ] Separation of concerns maintained
- [ ] No circular dependencies
- [ ] Single responsibility per class/module
- [ ] Dependencies injected (not hardcoded)

### Code Organization
- [ ] Proper file structure (types.ts, construct, index.ts)
- [ ] Correct member ordering (public → protected → private)
- [ ] Functions ≤ 50 lines
- [ ] Modules have high cohesion
- [ ] Barrel exports used

### TypeScript Quality
- [ ] No `any` types
- [ ] All props interfaces use `readonly`
- [ ] Proper type safety (union types, type guards)
- [ ] Utility types used appropriately

### Error Handling
- [ ] Fail-fast validation
- [ ] Explicit error messages
- [ ] Errors not swallowed
- [ ] Validation before resource creation

### Testing
- [ ] Unit tests written (see [Testing skill](./testing.md))
- [ ] Test coverage ≥ 85%
- [ ] No technical debt introduced

---

## Constraints

This skill **MAY NOT**:

- ❌ Violate SOLID principles
- ❌ Create God classes (> 500 lines)
- ❌ Mix business logic and infrastructure
- ❌ Use `any` type without justification
- ❌ Create circular dependencies
- ❌ Hardcode configuration values
- ❌ Swallow errors silently
- ❌ Skip validation
- ❌ Create tight coupling
- ❌ Ignore TypeScript compiler errors

This skill **MUST**:

- ✅ Apply SOLID principles
- ✅ Use appropriate design patterns
- ✅ Separate concerns properly
- ✅ Validate props before resource creation
- ✅ Inject dependencies
- ✅ Use TypeScript type safety
- ✅ Write self-documenting code
- ✅ Follow repository conventions
- ✅ Produce zero technical debt

---

## Approval Gate

Human approval required before:

- ✅ Introducing new design patterns (justify choice)
- ✅ Major refactoring (> 500 lines changed)
- ✅ Changing public interfaces (breaking change)
- ✅ Adding new dependencies (justify need)
- ✅ Deviating from SOLID principles (must document why)

Human approval **NOT** required for:

- ✅ Applying standard patterns
- ✅ Extracting functions/classes (improves code)
- ✅ Adding type safety
- ✅ Improving error handling
- ✅ Following this skill's guidelines

---

## Decision Trees

### Decision: Class vs Function?

```text
Does it have state (fields)?
├─ YES → Use Class
│  └─ Does it manage AWS resources?
│     ├─ YES → Extend Construct
│     └─ NO → Plain TypeScript class
│
└─ NO → Use Function
   └─ Is it a pure utility?
      ├─ YES → Static function in utility class
      └─ NO → Exported function
```

### Decision: Interface vs Type?

```text
Do you need extensibility (implements)?
├─ YES → Use Interface
│  └─ Examples: IDestination, IValidator
│
└─ NO → Use Type
   └─ Is it a union or primitive type?
      ├─ YES → Use Type (e.g., type Status = 'active' | 'inactive')
      └─ NO → Use Interface (props interfaces)
```

### Decision: Inheritance vs Composition?

```text
Is it an L2 construct (single AWS resource)?
├─ YES → Use Inheritance (extend upstream CDK class)
│
└─ NO → Use Composition
   └─ Is it an L3 construct (multiple resources)?
      ├─ YES → Use Composition (compose L2 constructs)
      └─ MAYBE → Prefer composition unless clear "is-a" relationship
```

### Decision: When to Extract a Function?

```text
Is the code block > 10 lines?
├─ YES → Consider extracting
│  └─ Does it have a clear single purpose?
│     ├─ YES → Extract to private method
│     └─ NO → Refactor for clarity first
│
└─ NO → Keep inline (unless reused elsewhere)
```

---

## Examples from Codebase

### Excellent Example: CentralizedVpcFlowLogs

**Location**: `src/constructs/vpc/flow-log/CentralizedVpcFlowLogs.ts`

**What it does well**:
- ✅ Single Responsibility: Manages centralized flow log infrastructure
- ✅ Validation before creation: All props validated in constructor
- ✅ Separation of concerns: Strategy pattern for central vs distributed
- ✅ Dependency injection: Bucket config injected, not hardcoded
- ✅ Explicit error messages: Clear validation errors
- ✅ Type safety: Strong typing with union types

### Excellent Example: SecureBucket

**Location**: `src/constructs/s3/SecureBucket.ts`

**What it does well**:
- ✅ Inheritance pattern: Extends s3.Bucket (L2 pattern)
- ✅ Secure defaults: Encryption, versioning, public access blocking
- ✅ Helper methods: Static resolveKmsKey, addEncryptionGuards
- ✅ Single responsibility: S3 bucket with secure defaults
- ✅ Extensibility: Additional features (malware protection)

---

## References

### Authoritative Standards
- **[docs/standards/common/naming.md](../standards/common/naming.md)** - Naming conventions
- **[docs/standards/common/types.md](../standards/common/types.md)** - Type patterns
- **[docs/standards/common/security.md](../standards/common/security.md)** - Security best practices
- **[docs/standards/common/anti-patterns.md](../standards/common/anti-patterns.md)** - What to avoid
- **[docs/standards/common/typescript.md](../standards/common/typescript.md)** - TypeScript guidelines

### Related Skills
- **[Interface Designer](./interface-designer.md)** - Design stable interfaces
- **[Canonical Type Reuse](./canonical-type-reuse.md)** - Prevent type fragmentation
- **[Module Layout Enforcer](./module-layout-enforcer.md)** - File organization
- **[Testing](./testing.md)** - Write quality tests

### External Resources
- Clean Code by Robert C. Martin
- Design Patterns: Elements of Reusable Object-Oriented Software
- Refactoring: Improving the Design of Existing Code by Martin Fowler
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

---

## Summary: Core Principles

1. **SOLID First** - Every design decision follows SOLID principles
2. **Loose Coupling** - Depend on abstractions, inject dependencies
3. **High Cohesion** - Related code stays together
4. **Fail-Fast** - Validate early, fail explicitly
5. **Separation of Concerns** - Business logic ≠ infrastructure ≠ configuration
6. **Composition > Inheritance** - Prefer composition (L3 pattern)
7. **Type Safety** - Use TypeScript's type system fully
8. **No Technical Debt** - Write it right the first time
9. **Self-Documenting** - Code clarity > clever code
10. **Testable** - Design for testability from the start

---

*Last Updated*: December 24, 2025  
*Maintained By*: Repository Stewards  
*Version*: 1.0

