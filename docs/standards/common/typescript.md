# TypeScript Best Practices & Design Principles

```yaml
schema_version: "1.0"
audience: "Developers and AI Assistants"
scope: "All TypeScript code in this repository"
principle: "Write loosely coupled, highly scalable, production-grade code"
```

---

## Overview

This document defines TypeScript best practices and design principles for writing production-grade code. These standards work in tandem with [CLAUDE.md](./CLAUDE.md) and [docs/constructs/](./docs/constructs/) to ensure code is maintainable, scalable, and follows industry best practices.

**Core Philosophy**: Write code that is easy to test, easy to change, and easy to understand.

---

## Table of Contents

1. [SOLID Principles](#solid-principles)
2. [Additional Core Principles](#additional-core-principles)
3. [TypeScript-Specific Best Practices](#typescript-specific-best-practices)
4. [Design Patterns](#design-patterns)
5. [Advanced Architectural Patterns](#advanced-architectural-patterns)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [Domain-Driven Design Basics](#domain-driven-design-basics)
8. [Functional Programming Principles](#functional-programming-principles)
9. [Immutability Patterns](#immutability-patterns)
10. [Async/Promise Best Practices](#asyncpromise-best-practices)
11. [Resource Management & Cleanup](#resource-management--cleanup)
12. [Dependency Management](#dependency-management)
13. [Error Handling](#error-handling)
14. [Code Organization](#code-organization)
15. [Testing Principles](#testing-principles)
16. [Performance Considerations](#performance-considerations)
17. [Caching Strategies](#caching-strategies)
18. [Documentation Standards](#documentation-standards)
19. [Code Review Checklist](#code-review-checklist)
20. [Additional Resources](#additional-resources)

---

## SOLID Principles

### S - Single Responsibility Principle (SRP)

**Definition**: A class should have one, and only one, reason to change.

```typescript
// ❌ BAD - Multiple responsibilities
class UserManager {
  validateUser(user: User): boolean { /* ... */ }
  saveToDatabase(user: User): void { /* ... */ }
  sendWelcomeEmail(user: User): void { /* ... */ }
  generateReport(user: User): string { /* ... */ }
}

// ✅ GOOD - Single responsibility per class
class UserValidator {
  validate(user: User): boolean { /* ... */ }
}

class UserRepository {
  save(user: User): void { /* ... */ }
}

class EmailService {
  sendWelcome(user: User): void { /* ... */ }
}

class UserReportGenerator {
  generate(user: User): string { /* ... */ }
}
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Separate concerns
class BucketEncryptionManager {
  configureEncryption(bucket: s3.Bucket, key: kms.IKey): void { /* ... */ }
}

class BucketPolicyManager {
  addEncryptionPolicies(bucket: s3.Bucket, key: kms.IKey): void { /* ... */ }
}

class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id, props);
    
    // Delegate to specialized classes
    const encryptionMgr = new BucketEncryptionManager();
    const policyMgr = new BucketPolicyManager();
    
    encryptionMgr.configureEncryption(this, key);
    policyMgr.addEncryptionPolicies(this, key);
  }
}
```

---

### O - Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension, but closed for modification.

```typescript
// ❌ BAD - Must modify class to add new shapes
class AreaCalculator {
  calculate(shape: any): number {
    if (shape.type === 'circle') {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    }
    // Must add more if-else for new shapes
    return 0;
  }
}

// ✅ GOOD - Open for extension, closed for modification
interface Shape {
  calculateArea(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  
  calculateArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  
  calculateArea(): number {
    return this.width * this.height;
  }
}

class AreaCalculator {
  calculate(shape: Shape): number {
    return shape.calculateArea(); // No modification needed for new shapes
  }
}
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Strategy pattern for encryption
interface EncryptionStrategy {
  apply(bucket: s3.Bucket): void;
}

class S3ManagedEncryption implements EncryptionStrategy {
  apply(bucket: s3.Bucket): void {
    // Apply S3-managed encryption
  }
}

class KMSEncryption implements EncryptionStrategy {
  constructor(private key: kms.IKey) {}
  
  apply(bucket: s3.Bucket): void {
    // Apply KMS encryption
  }
}

class BucketBuilder {
  constructor(private encryptionStrategy: EncryptionStrategy) {}
  
  build(scope: Construct, id: string): s3.Bucket {
    const bucket = new s3.Bucket(scope, id);
    this.encryptionStrategy.apply(bucket);
    return bucket;
  }
}
```

---

### L - Liskov Substitution Principle (LSP)

**Definition**: Objects of a superclass should be replaceable with objects of a subclass without breaking the application.

```typescript
// ❌ BAD - Violates LSP
class Bird {
  fly(): void {
    console.log('Flying');
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly!'); // Breaks contract
  }
}

// ✅ GOOD - Follows LSP
interface Bird {
  move(): void;
}

class FlyingBird implements Bird {
  move(): void {
    this.fly();
  }
  
  private fly(): void {
    console.log('Flying');
  }
}

class Penguin implements Bird {
  move(): void {
    this.swim();
  }
  
  private swim(): void {
    console.log('Swimming');
  }
}
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Subclass maintains superclass contract
class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props?: SecureBucketProps) {
    super(scope, id, {
      // Enhance defaults, don't break them
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      ...props, // User can still override
    });
  }
}

// Can be used anywhere s3.Bucket is expected
function grantReadAccess(bucket: s3.Bucket, role: iam.IRole): void {
  bucket.grantRead(role); // Works with both Bucket and SecureBucket
}
```

---

### I - Interface Segregation Principle (ISP)

**Definition**: Clients should not be forced to depend on interfaces they do not use.

```typescript
// ❌ BAD - Fat interface
interface Worker {
  code(): void;
  test(): void;
  design(): void;
  manage(): void;
  deploy(): void;
}

class Developer implements Worker {
  code(): void { /* ... */ }
  test(): void { /* ... */ }
  design(): void { throw new Error('Not my job'); } // Forced to implement
  manage(): void { throw new Error('Not my job'); }
  deploy(): void { throw new Error('Not my job'); }
}

// ✅ GOOD - Segregated interfaces
interface Coder {
  code(): void;
}

interface Tester {
  test(): void;
}

interface Designer {
  design(): void;
}

class Developer implements Coder, Tester {
  code(): void { /* ... */ }
  test(): void { /* ... */ }
}

class Architect implements Designer, Coder {
  design(): void { /* ... */ }
  code(): void { /* ... */ }
}
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Focused interfaces
interface Encryptable {
  readonly encryptionKey?: kms.IKey;
}

interface Loggable {
  readonly enableLogging?: boolean;
  readonly logDestination?: logs.ILogGroup;
}

interface Taggable {
  readonly tags?: Record<string, string>;
}

// Construct only implements what it needs
class SimpleConstruct extends Construct implements Encryptable {
  readonly encryptionKey?: kms.IKey;
  
  constructor(scope: Construct, id: string, props: SimpleConstructProps) {
    super(scope, id);
    this.encryptionKey = props.kmsKey;
  }
}

// Complex construct implements multiple interfaces
class ComplexConstruct extends Construct implements Encryptable, Loggable, Taggable {
  readonly encryptionKey?: kms.IKey;
  readonly enableLogging?: boolean;
  readonly logDestination?: logs.ILogGroup;
  readonly tags?: Record<string, string>;
  
  // ... implementation
}
```

---

### D - Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

```typescript
// ❌ BAD - High-level depends on low-level
class MySQLDatabase {
  save(data: string): void {
    console.log('Saving to MySQL');
  }
}

class UserService {
  private db = new MySQLDatabase(); // Tight coupling
  
  saveUser(user: User): void {
    this.db.save(JSON.stringify(user));
  }
}

// ✅ GOOD - Both depend on abstraction
interface Database {
  save(data: string): void;
}

class MySQLDatabase implements Database {
  save(data: string): void {
    console.log('Saving to MySQL');
  }
}

class PostgreSQLDatabase implements Database {
  save(data: string): void {
    console.log('Saving to PostgreSQL');
  }
}

class UserService {
  constructor(private db: Database) {} // Depends on abstraction
  
  saveUser(user: User): void {
    this.db.save(JSON.stringify(user));
  }
}

// Usage - easy to swap implementations
const service1 = new UserService(new MySQLDatabase());
const service2 = new UserService(new PostgreSQLDatabase());
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Depend on CDK interfaces, not concrete classes
class DataPipeline extends Construct {
  constructor(
    scope: Construct,
    id: string,
    private sourceBucket: s3.IBucket,      // Interface, not s3.Bucket
    private destinationBucket: s3.IBucket, // Interface, not s3.Bucket
  ) {
    super(scope, id);
    // Works with any bucket implementation
  }
}

// Can use with different bucket implementations
const pipeline1 = new DataPipeline(this, 'Pipeline1', 
  new s3.Bucket(this, 'Source'),
  new SecureBucket(this, 'Dest')
);
```

---

## Additional Core Principles

### 1. DRY (Don't Repeat Yourself)

**Definition**: Every piece of knowledge should have a single, unambiguous representation within a system.

```typescript
// ❌ BAD - Duplication
function calculateUserDiscount(user: User): number {
  if (user.isPremium && user.yearsActive > 5) {
    return 0.2;
  }
  return 0;
}

function calculateOrderDiscount(order: Order): number {
  if (order.user.isPremium && order.user.yearsActive > 5) {
    return 0.2;
  }
  return 0;
}

// ✅ GOOD - Single source of truth
function getPremiumDiscount(user: User): number {
  return user.isPremium && user.yearsActive > 5 ? 0.2 : 0;
}

function calculateUserDiscount(user: User): number {
  return getPremiumDiscount(user);
}

function calculateOrderDiscount(order: Order): number {
  return getPremiumDiscount(order.user);
}
```

---

### 2. Law of Demeter (Principle of Least Knowledge)

**Definition**: A method should only talk to its immediate friends, not strangers.

```typescript
// ❌ BAD - Violates Law of Demeter (chain of calls)
class Order {
  constructor(private customer: Customer) {}
  
  process(): void {
    const discount = this.customer.wallet.loyaltyCard.getDiscount();
    // Knows too much about customer's internal structure
  }
}

// ✅ GOOD - Follows Law of Demeter
class Order {
  constructor(private customer: Customer) {}
  
  process(): void {
    const discount = this.customer.getDiscount();
    // Only talks to immediate friends
  }
}

class Customer {
  constructor(private wallet: Wallet) {}
  
  getDiscount(): number {
    return this.wallet.getLoyaltyDiscount();
  }
}

class Wallet {
  constructor(private loyaltyCard: LoyaltyCard) {}
  
  getLoyaltyDiscount(): number {
    return this.loyaltyCard.getDiscount();
  }
}
```

**Application in CDK Constructs**:
```typescript
// ❌ BAD - Reaching deep into nested structures
function configureVpc(stack: Stack): void {
  const vpc = stack.node.scope.node.findChild('Vpc') as ec2.Vpc;
  vpc.node.defaultChild.addPropertyOverride('EnableDnsSupport', true);
}

// ✅ GOOD - Use proper interfaces and methods
class VpcConfig extends Construct {
  constructor(scope: Construct, id: string, private vpc: ec2.IVpc) {
    super(scope, id);
  }
  
  enableDnsSupport(): void {
    // Use VPC's public API
    this.vpc.enableDnsSupport();
  }
}
```

---

### 3. Tell, Don't Ask

**Definition**: Tell objects what to do, don't ask for their state and make decisions for them.

```typescript
// ❌ BAD - Asking for data and making decisions
function processPayment(order: Order): void {
  if (order.getTotal() > 100 && order.getCustomer().isPremium()) {
    order.applyDiscount(0.1);
  }
  order.charge();
}

// ✅ GOOD - Telling objects what to do
class Order {
  processPayment(): void {
    this.applyEligibleDiscounts();
    this.charge();
  }
  
  private applyEligibleDiscounts(): void {
    if (this.isEligibleForDiscount()) {
      this.applyDiscount(0.1);
    }
  }
  
  private isEligibleForDiscount(): boolean {
    return this.total > 100 && this.customer.isPremium();
  }
}

// Usage - simple and clear
order.processPayment();
```

**Application in CDK Constructs**:
```typescript
// ❌ BAD - Asking and deciding
function setupBucket(bucket: s3.Bucket, needsEncryption: boolean): void {
  if (needsEncryption) {
    const key = new kms.Key(this, 'Key');
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [bucket.bucketArn],
        effect: iam.Effect.DENY,
        conditions: {
          StringNotEquals: {
            's3:x-amz-server-side-encryption': 'aws:kms',
          },
        },
      })
    );
  }
}

// ✅ GOOD - Telling the bucket what to do
class SecureBucket extends s3.Bucket {
  enableEncryption(key: kms.IKey): void {
    this.addEncryptionPolicy(key);
  }
  
  private addEncryptionPolicy(key: kms.IKey): void {
    this.addToResourcePolicy(
      new iam.PolicyStatement({
        // ... encryption policy
      })
    );
  }
}
```

---

### 4. Command Query Separation (CQS)

**Definition**: Methods should either change state (command) or return data (query), but not both.

```typescript
// ❌ BAD - Mixing command and query
class Stack<T> {
  private items: T[] = [];
  
  pop(): T | undefined {
    // Both removes AND returns (mixing command and query)
    return this.items.pop();
  }
}

// ✅ GOOD - Separate command and query
class Stack<T> {
  private items: T[] = [];
  
  peek(): T | undefined {
    // Query - doesn't modify state
    return this.items[this.items.length - 1];
  }
  
  pop(): void {
    // Command - modifies state, returns void
    this.items.pop();
  }
  
  // If you need both, make it explicit
  popAndGet(): T | undefined {
    return this.items.pop();
  }
}
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Separate queries from commands
class NetworkConstruct extends Construct {
  private vpc: ec2.Vpc;
  
  // Query - no side effects
  getVpc(): ec2.IVpc {
    return this.vpc;
  }
  
  getSubnets(): ec2.ISubnet[] {
    return this.vpc.privateSubnets;
  }
  
  // Command - modifies state
  addSecurityGroup(sg: ec2.ISecurityGroup): void {
    this.securityGroups.push(sg);
  }
  
  enableFlowLogs(): void {
    new ec2.FlowLog(this, 'FlowLog', {
      resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
    });
  }
}
```

---

### 5. YAGNI (You Aren't Gonna Need It)

**Definition**: Don't add functionality until it's necessary.

```typescript
// ❌ BAD - Adding features "just in case"
interface UserProps {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;  // Not needed yet
  readonly address?: Address;  // Not needed yet
  readonly preferences?: UserPreferences;  // Not needed yet
  readonly notificationSettings?: NotificationSettings;  // Not needed yet
}

// ✅ GOOD - Only what's needed now
interface UserProps {
  readonly name: string;
  readonly email: string;
}

// Add more when actually needed
```

---

### 6. KISS (Keep It Simple, Stupid)

**Definition**: Most systems work best if they are kept simple rather than made complicated.

```typescript
// ❌ BAD - Overly complex
class DataProcessor {
  process<T extends Record<string, any>>(
    data: T,
    transformers: Array<(item: T) => T>,
    filters: Array<(item: T) => boolean>,
    validators: Array<(item: T) => boolean>,
    errorHandlers: Array<(error: Error) => void>,
  ): T {
    let result = data;
    try {
      if (validators.every(v => v(result))) {
        result = filters.reduce((acc, filter) => 
          filter(acc) ? acc : null, result
        );
        result = transformers.reduce((acc, transform) => 
          transform(acc), result
        );
      }
    } catch (error) {
      errorHandlers.forEach(handler => handler(error));
      throw error;
    }
    return result;
  }
}

// ✅ GOOD - Simple and clear
class DataProcessor {
  process(data: Data): Data {
    this.validate(data);
    const filtered = this.filter(data);
    return this.transform(filtered);
  }
  
  private validate(data: Data): void {
    if (!data.isValid()) {
      throw new Error('Invalid data');
    }
  }
  
  private filter(data: Data): Data {
    return data.items.filter(item => item.isActive);
  }
  
  private transform(data: Data): Data {
    return {
      ...data,
      items: data.items.map(item => this.transformItem(item)),
    };
  }
}
```

---

## TypeScript-Specific Best Practices

### 1. Leverage Type System

```typescript
// ✅ Use strict type checking
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}

// ✅ Use discriminated unions for type safety
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

function processResult<T>(result: Result<T>): void {
  if (result.success) {
    // TypeScript knows result.value exists
    console.log(result.value);
  } else {
    // TypeScript knows result.error exists
    console.error(result.error);
  }
}

// ✅ Use type guards
function isKmsKey(key: kms.IKey | string): key is kms.IKey {
  return typeof key !== 'string';
}

function useKey(key: kms.IKey | string): void {
  if (isKmsKey(key)) {
    // TypeScript knows key is kms.IKey
    console.log(key.keyArn);
  } else {
    // TypeScript knows key is string
    console.log(key);
  }
}
```

### 2. Prefer Readonly and Immutability

```typescript
// ✅ GOOD - Readonly properties
interface UserProps {
  readonly name: string;
  readonly email: string;
  readonly roles: readonly string[];
}

// ✅ GOOD - Readonly arrays and objects
const config: Readonly<{ apiUrl: string; timeout: number }> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

// ❌ BAD - Mutable state
class Counter {
  value = 0; // Can be changed from outside
}

// ✅ GOOD - Encapsulated state
class Counter {
  private _value = 0;
  
  get value(): number {
    return this._value;
  }
  
  increment(): void {
    this._value++;
  }
}
```

### 3. Use Union Types Over Enums When Appropriate

```typescript
// ✅ GOOD - Union types (more flexible)
type Status = 'pending' | 'active' | 'inactive' | 'archived';

interface User {
  readonly status: Status;
}

// ✅ GOOD - Const enums (when you need reverse mapping)
const enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// ❌ AVOID - Regular enums (generate extra code)
enum HttpStatus {
  OK = 200,
  NotFound = 404,
}
```

### 4. Leverage Utility Types

```typescript
// Built-in utility types
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Record<K extends keyof any, T> = { [P in K]: T };

// ✅ GOOD - Using utility types
interface BucketProps {
  readonly bucketName: string;
  readonly encryption: s3.BucketEncryption;
  readonly versioned: boolean;
}

// Create a partial version for updates
type BucketUpdateProps = Partial<BucketProps>;

// Pick only certain properties
type BucketIdentifier = Pick<BucketProps, 'bucketName'>;

// Omit sensitive properties
type PublicBucketInfo = Omit<BucketProps, 'encryption'>;
```

### 5. Avoid `any`, Use `unknown` Instead

```typescript
// ❌ BAD - any disables type checking
function processData(data: any): void {
  console.log(data.someProperty); // No type safety
}

// ✅ GOOD - unknown requires type checking
function processData(data: unknown): void {
  if (typeof data === 'object' && data !== null) {
    if ('someProperty' in data) {
      console.log((data as { someProperty: string }).someProperty);
    }
  }
}

// ✅ BETTER - Use generics
function processData<T extends { someProperty: string }>(data: T): void {
  console.log(data.someProperty); // Type-safe
}
```

---

## Design Patterns

### 1. Factory Pattern

**Use Case**: Creating objects without specifying their exact classes.

```typescript
// ✅ GOOD - Factory pattern
interface EncryptionStrategy {
  apply(bucket: s3.Bucket): void;
}

class EncryptionFactory {
  static create(type: 'S3_MANAGED' | 'KMS', key?: kms.IKey): EncryptionStrategy {
    switch (type) {
      case 'S3_MANAGED':
        return new S3ManagedEncryption();
      case 'KMS':
        if (!key) throw new Error('KMS key required for KMS encryption');
        return new KMSEncryption(key);
    }
  }
}

// Usage
const encryption = EncryptionFactory.create('KMS', myKey);
encryption.apply(bucket);
```

### 2. Builder Pattern

**Use Case**: Constructing complex objects step by step.

```typescript
// ✅ GOOD - Builder pattern
class BucketBuilder {
  private props: Partial<s3.BucketProps> = {};
  
  withEncryption(encryption: s3.BucketEncryption): this {
    this.props.encryption = encryption;
    return this;
  }
  
  withVersioning(enabled: boolean): this {
    this.props.versioned = enabled;
    return this;
  }
  
  withLogging(bucket: s3.IBucket): this {
    this.props.serverAccessLogsBucket = bucket;
    return this;
  }
  
  build(scope: Construct, id: string): s3.Bucket {
    return new s3.Bucket(scope, id, this.props);
  }
}

// Usage - fluent API
const bucket = new BucketBuilder()
  .withEncryption(s3.BucketEncryption.S3_MANAGED)
  .withVersioning(true)
  .withLogging(logsBucket)
  .build(this, 'MyBucket');
```

### 3. Strategy Pattern

**Use Case**: Defining a family of algorithms and making them interchangeable.

```typescript
// ✅ GOOD - Strategy pattern
interface ValidationStrategy {
  validate(value: string): boolean;
}

class EmailValidation implements ValidationStrategy {
  validate(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}

class PhoneValidation implements ValidationStrategy {
  validate(value: string): boolean {
    return /^\d{10}$/.test(value);
  }
}

class Validator {
  constructor(private strategy: ValidationStrategy) {}
  
  validate(value: string): boolean {
    return this.strategy.validate(value);
  }
  
  setStrategy(strategy: ValidationStrategy): void {
    this.strategy = strategy;
  }
}

// Usage
const validator = new Validator(new EmailValidation());
console.log(validator.validate('test@example.com')); // true

validator.setStrategy(new PhoneValidation());
console.log(validator.validate('1234567890')); // true
```

### 4. Observer Pattern (Pub/Sub)

**Use Case**: Notifying multiple objects about state changes.

```typescript
// ✅ GOOD - Observer pattern
interface Observer<T> {
  update(data: T): void;
}

class Subject<T> {
  private observers: Observer<T>[] = [];
  
  subscribe(observer: Observer<T>): void {
    this.observers.push(observer);
  }
  
  unsubscribe(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Usage
class Logger implements Observer<string> {
  update(data: string): void {
    console.log('Log:', data);
  }
}

class Alerter implements Observer<string> {
  update(data: string): void {
    console.log('Alert:', data);
  }
}

const subject = new Subject<string>();
subject.subscribe(new Logger());
subject.subscribe(new Alerter());
subject.notify('Something happened'); // Both get notified
```

### 5. Decorator Pattern

**Use Case**: Adding behavior to objects dynamically.

```typescript
// ✅ GOOD - Decorator pattern
interface Component {
  operation(): string;
}

class ConcreteComponent implements Component {
  operation(): string {
    return 'ConcreteComponent';
  }
}

abstract class Decorator implements Component {
  constructor(protected component: Component) {}
  
  operation(): string {
    return this.component.operation();
  }
}

class LoggingDecorator extends Decorator {
  operation(): string {
    const result = super.operation();
    console.log(`Logging: ${result}`);
    return result;
  }
}

class TimingDecorator extends Decorator {
  operation(): string {
    const start = Date.now();
    const result = super.operation();
    const end = Date.now();
    console.log(`Timing: ${end - start}ms`);
    return result;
  }
}

// Usage - wrap with multiple decorators
const component = new ConcreteComponent();
const logged = new LoggingDecorator(component);
const timed = new TimingDecorator(logged);
timed.operation();
```

---

## Advanced Architectural Patterns

### 1. Hexagonal Architecture (Ports & Adapters)

**Use Case**: Decoupling business logic from external dependencies (databases, APIs, services).

```typescript
// Core domain (no dependencies on external systems)
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

interface NotificationService {
  send(recipient: string, message: string): Promise<void>;
}

interface Logger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}

// Application layer - depends only on abstractions (ports)
class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly notifier: NotificationService,
    private readonly logger: Logger,
  ) {}
  
  async registerUser(userData: UserData): Promise<User> {
    this.logger.info(`Registering user: ${userData.email}`);
    
    // Business logic - no knowledge of infrastructure
    const existing = await this.userRepo.findByEmail(userData.email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    const user = new User(userData);
    await this.userRepo.save(user);
    await this.notifier.send(user.email, 'Welcome!');
    
    this.logger.info(`User registered: ${user.id}`);
    return user;
  }
}

// Infrastructure adapters (implementations)
class DynamoDBUserRepository implements UserRepository {
  constructor(private tableName: string) {}
  
  async save(user: User): Promise<void> {
    // DynamoDB-specific implementation
    const client = new DynamoDBClient({});
    await client.putItem({
      TableName: this.tableName,
      Item: marshal(user),
    });
  }
  
  async findById(id: string): Promise<User | null> {
    // DynamoDB-specific implementation
    const client = new DynamoDBClient({});
    const result = await client.getItem({
      TableName: this.tableName,
      Key: { id: { S: id } },
    });
    return result.Item ? unmarshal(result.Item) : null;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    // DynamoDB query implementation
    // ...
  }
}

class SESNotificationService implements NotificationService {
  async send(recipient: string, message: string): Promise<void> {
    // SES-specific implementation
    const client = new SESClient({});
    await client.sendEmail({
      Destination: { ToAddresses: [recipient] },
      Message: {
        Subject: { Data: 'Notification' },
        Body: { Text: { Data: message } },
      },
      Source: 'noreply@example.com',
    });
  }
}

class CloudWatchLogger implements Logger {
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }
  
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

// Easy to swap implementations
const userService = new UserService(
  new DynamoDBUserRepository('users'),
  new SESNotificationService(),
  new CloudWatchLogger(),
);

// Or use different implementations for testing
const testUserService = new UserService(
  new InMemoryUserRepository(),
  new MockNotificationService(),
  new ConsoleLogger(),
);
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Hexagonal approach for CDK
interface StorageProvider {
  getBucket(): s3.IBucket;
}

interface EncryptionProvider {
  getKey(): kms.IKey;
}

class DataPipeline extends Construct {
  constructor(
    scope: Construct,
    id: string,
    private storage: StorageProvider,
    private encryption: EncryptionProvider,
  ) {
    super(scope, id);
    this.setupPipeline();
  }
  
  private setupPipeline(): void {
    const bucket = this.storage.getBucket();
    const key = this.encryption.getKey();
    
    // Business logic without tight coupling
    bucket.grantRead(this.processingRole);
    key.grantDecrypt(this.processingRole);
  }
}

// Different implementations
class S3StorageProvider implements StorageProvider {
  constructor(private bucket: s3.Bucket) {}
  
  getBucket(): s3.IBucket {
    return this.bucket;
  }
}

class EFSStorageProvider implements StorageProvider {
  constructor(private fileSystem: efs.FileSystem) {}
  
  getBucket(): s3.IBucket {
    // Adapter pattern - adapt EFS to look like S3
    throw new Error('EFS doesn\'t provide S3 bucket interface');
  }
}
```

---

### 2. Repository Pattern

**Use Case**: Abstracting data access logic and providing a collection-like interface.

```typescript
// Generic repository interface
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

// Base repository with common functionality
abstract class BaseRepository<T> implements Repository<T> {
  constructor(protected tableName: string) {}
  
  async findById(id: string): Promise<T | null> {
    const client = new DynamoDBClient({});
    const result = await client.getItem({
      TableName: this.tableName,
      Key: { id: { S: id } },
    });
    return result.Item ? this.deserialize(result.Item) : null;
  }
  
  async findAll(): Promise<T[]> {
    const client = new DynamoDBClient({});
    const result = await client.scan({
      TableName: this.tableName,
    });
    return result.Items?.map(item => this.deserialize(item)) ?? [];
  }
  
  async save(entity: T): Promise<void> {
    const client = new DynamoDBClient({});
    await client.putItem({
      TableName: this.tableName,
      Item: this.serialize(entity),
    });
  }
  
  async update(entity: T): Promise<void> {
    await this.save(entity); // Simple implementation
  }
  
  async delete(id: string): Promise<void> {
    const client = new DynamoDBClient({});
    await client.deleteItem({
      TableName: this.tableName,
      Key: { id: { S: id } },
    });
  }
  
  protected abstract serialize(entity: T): Record<string, any>;
  protected abstract deserialize(item: Record<string, any>): T;
}

// Specific repository
class UserRepository extends BaseRepository<User> {
  constructor() {
    super('Users');
  }
  
  // Custom query methods
  async findByEmail(email: string): Promise<User | null> {
    const client = new DynamoDBClient({});
    const result = await client.query({
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
    });
    return result.Items?.[0] ? this.deserialize(result.Items[0]) : null;
  }
  
  async findPremiumUsers(): Promise<User[]> {
    const allUsers = await this.findAll();
    return allUsers.filter(user => user.isPremium);
  }
  
  protected serialize(user: User): Record<string, any> {
    return {
      id: { S: user.id },
      name: { S: user.name },
      email: { S: user.email },
      isPremium: { BOOL: user.isPremium },
    };
  }
  
  protected deserialize(item: Record<string, any>): User {
    return new User({
      id: item.id.S,
      name: item.name.S,
      email: item.email.S,
      isPremium: item.isPremium.BOOL,
    });
  }
}

// Usage - clean and testable
class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async getUser(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }
  
  async getPremiumUsers(): Promise<User[]> {
    return this.userRepo.findPremiumUsers();
  }
}

// Easy to test with mock repository
class MockUserRepository extends BaseRepository<User> {
  private users: Map<string, User> = new Map();
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }
  
  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
  
  protected serialize(user: User): Record<string, any> {
    return user as any;
  }
  
  protected deserialize(item: Record<string, any>): User {
    return item as User;
  }
}
```

---

### 3. Specification Pattern

**Use Case**: Encapsulating business rules that can be combined and reused.

```typescript
// Specification interface
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// Base specification with composition support
abstract class CompositeSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;
  
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }
  
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }
  
  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

// Composite specifications
class AndSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>,
  ) {
    super();
  }
  
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && 
           this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>,
  ) {
    super();
  }
  
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || 
           this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends CompositeSpecification<T> {
  constructor(private spec: Specification<T>) {
    super();
  }
  
  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

// Business rule specifications
class PremiumUserSpecification extends CompositeSpecification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.subscriptionType === 'premium';
  }
}

class ActiveUserSpecification extends CompositeSpecification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.isActive && !user.isDeleted;
  }
}

class RecentUserSpecification extends CompositeSpecification<User> {
  constructor(private days: number) {
    super();
  }
  
  isSatisfiedBy(user: User): boolean {
    const daysSinceCreation = 
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= this.days;
  }
}

// Compose specifications
const eligibleForDiscount = new PremiumUserSpecification()
  .and(new ActiveUserSpecification())
  .and(new RecentUserSpecification(30).not());

const eligibleForWelcomeOffer = new ActiveUserSpecification()
  .and(new RecentUserSpecification(7));

// Usage
if (eligibleForDiscount.isSatisfiedBy(user)) {
  applyDiscount(user, 0.2);
}

if (eligibleForWelcomeOffer.isSatisfiedBy(user)) {
  sendWelcomeOffer(user);
}

// Can also be used for filtering
const users: User[] = getAllUsers();
const discountEligibleUsers = users.filter(u => 
  eligibleForDiscount.isSatisfiedBy(u)
);
```

---

### 4. Null Object Pattern

**Use Case**: Avoiding null checks by providing a default object that does nothing.

```typescript
// ❌ BAD - Null checks everywhere
function processUser(user: User | null): void {
  if (user) {
    console.log(user.name);
    if (user.email) {
      sendEmail(user.email);
    }
    if (user.preferences) {
      applyPreferences(user.preferences);
    }
  }
}

// ✅ GOOD - Null Object Pattern
interface User {
  readonly name: string;
  readonly email: string;
  isNull(): boolean;
  sendEmail(message: string): void;
  applyPreferences(): void;
}

class RealUser implements User {
  constructor(
    public readonly name: string,
    public readonly email: string,
    private preferences: UserPreferences,
  ) {}
  
  isNull(): boolean {
    return false;
  }
  
  sendEmail(message: string): void {
    // Actually send email
    emailService.send(this.email, message);
  }
  
  applyPreferences(): void {
    // Apply real preferences
    settingsService.apply(this.preferences);
  }
}

class NullUser implements User {
  readonly name = 'Guest';
  readonly email = '';
  
  isNull(): boolean {
    return true;
  }
  
  sendEmail(message: string): void {
    // Do nothing - no email to send to
  }
  
  applyPreferences(): void {
    // Do nothing - no preferences to apply
  }
}

// No null checks needed
function processUser(user: User): void {
  console.log(user.name); // Always works
  user.sendEmail('Hello'); // Always works
  user.applyPreferences(); // Always works
  
  // Check if needed
  if (!user.isNull()) {
    // Special handling for real users
  }
}

// Usage
const user = findUser(id) ?? new NullUser();
processUser(user); // No null checks needed
```

**Application in CDK Constructs**:
```typescript
// ✅ GOOD - Null Object for optional resources
interface IEncryptionKey {
  readonly keyArn: string;
  grantEncrypt(grantee: iam.IGrantable): void;
  grantDecrypt(grantee: iam.IGrantable): void;
}

class RealEncryptionKey implements IEncryptionKey {
  constructor(private key: kms.IKey) {}
  
  get keyArn(): string {
    return this.key.keyArn;
  }
  
  grantEncrypt(grantee: iam.IGrantable): void {
    this.key.grantEncrypt(grantee);
  }
  
  grantDecrypt(grantee: iam.IGrantable): void {
    this.key.grantDecrypt(grantee);
  }
}

class NoEncryption implements IEncryptionKey {
  readonly keyArn = '';
  
  grantEncrypt(grantee: iam.IGrantable): void {
    // No-op - no encryption
  }
  
  grantDecrypt(grantee: iam.IGrantable): void {
    // No-op - no encryption
  }
}

// Usage
class DataProcessor extends Construct {
  constructor(
    scope: Construct,
    id: string,
    encryptionKey?: kms.IKey,
  ) {
    super(scope, id);
    
    const encryption: IEncryptionKey = encryptionKey 
      ? new RealEncryptionKey(encryptionKey)
      : new NoEncryption();
    
    // No null checks needed
    encryption.grantEncrypt(this.role);
    encryption.grantDecrypt(this.role);
  }
}
```

---

## Event-Driven Architecture

### 1. Event Bus Pattern

**Use Case**: Decoupling components through event-based communication.

```typescript
// ✅ GOOD - Event bus for loose coupling
interface Event {
  readonly type: string;
  readonly timestamp: Date;
  readonly data: any;
}

interface EventHandler {
  handle(event: Event): void | Promise<void>;
}

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }
  
  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type);
    
    if (!handlers || handlers.size === 0) {
      return;
    }
    
    // Execute all handlers
    const promises = Array.from(handlers).map(handler => 
      Promise.resolve(handler.handle(event))
    );
    
    await Promise.all(promises);
  }
  
  clear(): void {
    this.handlers.clear();
  }
}

// Usage - loosely coupled components
class UserCreatedEvent implements Event {
  readonly type = 'user.created';
  readonly timestamp = new Date();
  
  constructor(public readonly data: { userId: string; email: string }) {}
}

class EmailNotificationHandler implements EventHandler {
  async handle(event: Event): Promise<void> {
    if (event.type === 'user.created') {
      const { email } = event.data;
      await this.sendWelcomeEmail(email);
    }
  }
  
  private async sendWelcomeEmail(email: string): Promise<void> {
    console.log(`Sending welcome email to ${email}`);
  }
}

class AnalyticsHandler implements EventHandler {
  async handle(event: Event): Promise<void> {
    if (event.type === 'user.created') {
      const { userId } = event.data;
      await this.trackUserSignup(userId);
    }
  }
  
  private async trackUserSignup(userId: string): Promise<void> {
    console.log(`Tracking signup for user ${userId}`);
  }
}

// Setup
const eventBus = new EventBus();
eventBus.subscribe('user.created', new EmailNotificationHandler());
eventBus.subscribe('user.created', new AnalyticsHandler());

// Publish event - both handlers execute
await eventBus.publish(new UserCreatedEvent({
  userId: '123',
  email: 'user@example.com',
}));
```

---

### 2. Domain Events

**Use Case**: Capturing important domain occurrences as first-class concepts.

```typescript
// ✅ GOOD - Domain events
abstract class DomainEvent {
  readonly occurredAt: Date = new Date();
  
  abstract get eventType(): string;
}

class OrderPlacedEvent extends DomainEvent {
  get eventType(): string {
    return 'order.placed';
  }
  
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
  ) {
    super();
  }
}

class OrderShippedEvent extends DomainEvent {
  get eventType(): string {
    return 'order.shipped';
  }
  
  constructor(
    public readonly orderId: string,
    public readonly trackingNumber: string,
  ) {
    super();
  }
}

// Aggregate root that produces events
class Order {
  private events: DomainEvent[] = [];
  
  constructor(
    private id: string,
    private customerId: string,
    private items: OrderItem[],
    private status: OrderStatus,
  ) {}
  
  place(): void {
    if (this.status !== 'draft') {
      throw new Error('Only draft orders can be placed');
    }
    
    this.status = 'placed';
    this.events.push(new OrderPlacedEvent(
      this.id,
      this.customerId,
      this.calculateTotal(),
    ));
  }
  
  ship(trackingNumber: string): void {
    if (this.status !== 'placed') {
      throw new Error('Only placed orders can be shipped');
    }
    
    this.status = 'shipped';
    this.events.push(new OrderShippedEvent(
      this.id,
      trackingNumber,
    ));
  }
  
  getEvents(): DomainEvent[] {
    return [...this.events];
  }
  
  clearEvents(): void {
    this.events = [];
  }
  
  private calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// Event dispatcher
class EventDispatcher {
  constructor(private eventBus: EventBus) {}
  
  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventBus.publish({
        type: event.eventType,
        timestamp: event.occurredAt,
        data: event,
      });
    }
  }
}
```

---

## Domain-Driven Design Basics

### 1. Value Objects

**Definition**: Objects that represent a descriptive aspect of the domain with no conceptual identity.

```typescript
// ✅ GOOD - Value object
class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }
  }
  
  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }
  
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
  
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }
  
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
  
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
  
  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}

// Usage - immutable and self-validating
const price = Money.create(100, 'USD');
const tax = Money.create(10, 'USD');
const total = price.add(tax); // 110 USD
```

---

### 2. Entities

**Definition**: Objects with distinct identity that runs through time and different representations.

```typescript
// ✅ GOOD - Entity with identity
class User {
  constructor(
    private readonly id: string,
    private name: string,
    private email: Email, // Value object
  ) {}
  
  getId(): string {
    return this.id;
  }
  
  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    this.name = newName;
  }
  
  changeEmail(newEmail: Email): void {
    this.email = newEmail;
  }
  
  equals(other: User): boolean {
    return this.id === other.id; // Equality based on identity
  }
}

// Value object for email
class Email {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email address');
    }
  }
  
  static create(value: string): Email {
    return new Email(value);
  }
  
  getValue(): string {
    return this.value;
  }
  
  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

---

### 3. Aggregate Roots

**Definition**: Entities that are entry points to a cluster of related objects, ensuring consistency.

```typescript
// ✅ GOOD - Aggregate root
class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = 'draft';
  
  constructor(
    private readonly id: string,
    private readonly customerId: string,
  ) {}
  
  // Public methods enforce invariants
  addItem(product: Product, quantity: number): void {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify a placed order');
    }
    
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    const existingItem = this.items.find(item => 
      item.productId === product.id
    );
    
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      this.items.push(new OrderItem(product.id, product.price, quantity));
    }
  }
  
  removeItem(productId: string): void {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify a placed order');
    }
    
    this.items = this.items.filter(item => item.productId !== productId);
  }
  
  place(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot place an empty order');
    }
    
    if (this.status !== 'draft') {
      throw new Error('Order already placed');
    }
    
    this.status = 'placed';
  }
  
  getTotal(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.create(0, 'USD'),
    );
  }
  
  // Only return copies, never direct references to internal state
  getItems(): readonly OrderItem[] {
    return [...this.items];
  }
}

class OrderItem {
  constructor(
    public readonly productId: string,
    private price: Money,
    private quantity: number,
  ) {}
  
  increaseQuantity(amount: number): void {
    this.quantity += amount;
  }
  
  getSubtotal(): Money {
    return this.price.multiply(this.quantity);
  }
}
```

---

### 4. Domain Services

**Definition**: Operations that don't naturally fit within entities or value objects.

```typescript
// ✅ GOOD - Domain service
class PricingService {
  calculateDiscount(
    customer: Customer,
    order: Order,
  ): Money {
    let discountPercentage = 0;
    
    // Business logic that spans multiple aggregates
    if (customer.isPremium()) {
      discountPercentage += 0.1;
    }
    
    if (order.getTotal().amount > 100) {
      discountPercentage += 0.05;
    }
    
    if (customer.getOrderCount() > 10) {
      discountPercentage += 0.05;
    }
    
    const total = order.getTotal();
    const discountAmount = total.amount * discountPercentage;
    
    return Money.create(discountAmount, total.currency);
  }
}

// Usage
class OrderService {
  constructor(
    private pricingService: PricingService,
    private orderRepository: OrderRepository,
    private customerRepository: CustomerRepository,
  ) {}
  
  async placeOrder(orderId: string, customerId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    const customer = await this.customerRepository.findById(customerId);
    
    if (!order || !customer) {
      throw new Error('Order or customer not found');
    }
    
    // Use domain service for cross-aggregate logic
    const discount = this.pricingService.calculateDiscount(customer, order);
    order.applyDiscount(discount);
    
    order.place();
    await this.orderRepository.save(order);
  }
}
```

---

## Functional Programming Principles

### 1. Pure Functions

**Definition**: Functions that always produce the same output for the same input and have no side effects.

```typescript
// ❌ BAD - Impure (depends on external state, has side effects)
let total = 0;
function addToTotal(value: number): number {
  total += value; // Side effect - modifies external state
  console.log('Added:', value); // Side effect - I/O
  return total;
}

// ✅ GOOD - Pure function
function add(a: number, b: number): number {
  return a + b; // No side effects, deterministic
}

// ✅ GOOD - Separate concerns
function calculateTotal(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

function logCalculation(result: number): void {
  console.log('Total:', result);
}

// Usage
const total = calculateTotal([1, 2, 3]);
logCalculation(total);
```

---

### 2. Higher-Order Functions

**Definition**: Functions that take functions as arguments or return functions.

```typescript
// ✅ GOOD - Higher-order functions
function filter<T>(
  array: T[],
  predicate: (item: T) => boolean,
): T[] {
  return array.filter(predicate);
}

function map<T, U>(
  array: T[],
  transform: (item: T) => U,
): U[] {
  return array.map(transform);
}

function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

// Usage - function composition
const addTax = (price: number) => price * 1.1;
const addShipping = (price: number) => price + 5;
const applyDiscount = (price: number) => price * 0.9;

const calculateFinalPrice = pipe(
  applyDiscount,
  addTax,
  addShipping,
);

const finalPrice = calculateFinalPrice(100); // 104
```

---

### 3. Avoid Mutations - Return New Objects

**Definition**: Don't modify existing data structures, return new ones.

```typescript
// ❌ BAD - Mutating
function addItem(cart: Cart, item: Item): Cart {
  cart.items.push(item); // Mutates existing cart
  return cart;
}

// ✅ GOOD - Return new object
function addItem(cart: Cart, item: Item): Cart {
  return {
    ...cart,
    items: [...cart.items, item],
  };
}

// ✅ GOOD - Immutable operations
const cart: Cart = {
  id: '123',
  items: [{ id: '1', name: 'Book' }],
  total: 20,
};

// Add item - returns new cart
const newCart = addItem(cart, { id: '2', name: 'Pen' });

// Remove item - returns new cart
const removeItem = (cart: Cart, itemId: string): Cart => ({
  ...cart,
  items: cart.items.filter(item => item.id !== itemId),
});

// Update item - returns new cart
const updateItem = (cart: Cart, itemId: string, updates: Partial<Item>): Cart => ({
  ...cart,
  items: cart.items.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  ),
});
```

---

## Immutability Patterns

### 1. Readonly Properties and Deep Readonly

```typescript
// ✅ GOOD - Readonly properties
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly retries: number;
}

// ✅ GOOD - Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface AppConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
}

type ImmutableConfig = DeepReadonly<AppConfig>;

const config: ImmutableConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      username: 'admin',
      password: 'secret',
    },
  },
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
  },
};

// config.database.host = 'newhost'; // Error - readonly
```

---

### 2. Immutable Update Patterns

```typescript
// ✅ GOOD - Object spread for shallow updates
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

const user: User = { id: '1', name: 'Alice', email: 'alice@example.com' };
const updatedUser: User = { ...user, email: 'newemail@example.com' };

// ✅ GOOD - Nested immutable updates
interface State {
  readonly user: {
    readonly profile: {
      readonly name: string;
      readonly age: number;
    };
    readonly settings: {
      readonly theme: string;
    };
  };
}

const state: State = {
  user: {
    profile: { name: 'Alice', age: 30 },
    settings: { theme: 'dark' },
  },
};

// Update nested property immutably
const newState: State = {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      age: 31,
    },
  },
};
```

---

### 3. Immutable Collections

```typescript
// ✅ GOOD - Immutable array operations
const numbers = [1, 2, 3, 4, 5];

// Add to end
const withSix = [...numbers, 6];

// Add to beginning
const withZero = [0, ...numbers];

// Remove item
const withoutThree = numbers.filter(n => n !== 3);

// Update item
const doubled = numbers.map(n => n * 2);

// Insert at index
const insertAtIndex = (arr: number[], index: number, item: number): number[] => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index),
];

const withTenAtIndex2 = insertAtIndex(numbers, 2, 10); // [1, 2, 10, 3, 4, 5]

// ✅ GOOD - Immutable Map operations
const userMap = new Map<string, User>([
  ['1', { id: '1', name: 'Alice', email: 'alice@example.com' }],
]);

// Add/update entry (returns new Map)
const addUser = (map: Map<string, User>, user: User): Map<string, User> =>
  new Map(map).set(user.id, user);

// Remove entry (returns new Map)
const removeUser = (map: Map<string, User>, id: string): Map<string, User> => {
  const newMap = new Map(map);
  newMap.delete(id);
  return newMap;
};
```

---

## Async/Promise Best Practices

### 1. Prefer Async/Await Over Promises

```typescript
// ❌ BAD - Promise chains
function getUser(id: string): Promise<User> {
  return fetchUser(id)
    .then(user => {
      return fetchUserDetails(user.id)
        .then(details => {
          return { ...user, details };
        });
    })
    .then(userWithDetails => {
      return fetchUserPreferences(userWithDetails.id)
        .then(preferences => {
          return { ...userWithDetails, preferences };
        });
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

// ✅ GOOD - Async/await
async function getUser(id: string): Promise<User> {
  try {
    const user = await fetchUser(id);
    const details = await fetchUserDetails(user.id);
    const preferences = await fetchUserPreferences(user.id);
    
    return {
      ...user,
      details,
      preferences,
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

### 2. Parallel Async Operations

```typescript
// ❌ BAD - Sequential (slow)
async function loadDashboard(userId: string): Promise<Dashboard> {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(userId);
  const friends = await fetchUserFriends(userId);
  const notifications = await fetchUserNotifications(userId);
  
  return { user, posts, friends, notifications };
}

// ✅ GOOD - Parallel (fast)
async function loadDashboard(userId: string): Promise<Dashboard> {
  const [user, posts, friends, notifications] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserFriends(userId),
    fetchUserNotifications(userId),
  ]);
  
  return { user, posts, friends, notifications };
}

// ✅ GOOD - Promise.allSettled for handling mixed results
async function loadDashboardSafe(userId: string): Promise<Dashboard> {
  const results = await Promise.allSettled([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserFriends(userId),
    fetchUserNotifications(userId),
  ]);
  
  const [userResult, postsResult, friendsResult, notificationsResult] = results;
  
  return {
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    posts: postsResult.status === 'fulfilled' ? postsResult.value : [],
    friends: friendsResult.status === 'fulfilled' ? friendsResult.value : [],
    notifications: notificationsResult.status === 'fulfilled' 
      ? notificationsResult.value 
      : [],
  };
}
```

---

### 3. Error Handling in Async Code

```typescript
// ✅ GOOD - Specific error handling
async function fetchData(url: string): Promise<Data> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(`Resource not found: ${url}`);
      }
      if (response.status === 401) {
        throw new UnauthorizedError('Authentication required');
      }
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw error; // Re-throw known errors
    }
    
    // Wrap unknown errors
    throw new NetworkError('Failed to fetch data', { cause: error });
  }
}

// ✅ GOOD - Retry logic
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

// Usage
const data = await fetchWithRetry(() => fetchData('/api/users'), 3, 1000);
```

---

## Resource Management & Cleanup

### 1. Disposable Pattern

```typescript
// ✅ GOOD - Disposable interface
interface Disposable {
  dispose(): void | Promise<void>;
}

class DatabaseConnection implements Disposable {
  private client: Client;
  
  constructor(connectionString: string) {
    this.client = new Client(connectionString);
  }
  
  async connect(): Promise<void> {
    await this.client.connect();
  }
  
  async query(sql: string): Promise<any> {
    return this.client.query(sql);
  }
  
  async dispose(): Promise<void> {
    await this.client.end();
    console.log('Database connection closed');
  }
}

// ✅ GOOD - Using statement pattern
async function withDatabase<T>(
  connectionString: string,
  fn: (db: DatabaseConnection) => Promise<T>,
): Promise<T> {
  const db = new DatabaseConnection(connectionString);
  try {
    await db.connect();
    return await fn(db);
  } finally {
    await db.dispose();
  }
}

// Usage
const result = await withDatabase('postgresql://...', async (db) => {
  return await db.query('SELECT * FROM users');
});
```

---

### 2. Cleanup in Async Operations

```typescript
// ✅ GOOD - AbortController for cleanup
async function fetchWithTimeout(
  url: string,
  timeout: number = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId); // Cleanup
  }
}

// ✅ GOOD - Cleanup in event listeners
class EventManager {
  private listeners: Map<string, Set<Function>> = new Map();
  
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return cleanup function
    return () => this.off(event, callback);
  }
  
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }
  
  emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
  
  dispose(): void {
    this.listeners.clear();
  }
}

// Usage with auto-cleanup
const manager = new EventManager();
const cleanup = manager.on('data', (data) => console.log(data));

// Later...
cleanup(); // Remove listener
```

---

## Dependency Management

### 1. Dependency Injection

```typescript
// ✅ GOOD - Constructor injection
class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {}
  
  async createUser(userData: UserData): Promise<User> {
    this.logger.info('Creating user');
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcome(user);
    return user;
  }
}

// Easy to test - inject mocks
const service = new UserService(
  mockUserRepository,
  mockEmailService,
  mockLogger,
);
```

---

### 2. Avoid Circular Dependencies

```typescript
// ❌ BAD - Circular dependency
// user.ts
import { Order } from './order';
export class User {
  orders: Order[];
}

// order.ts
import { User } from './user';
export class Order {
  user: User;
}

// ✅ GOOD - Use interfaces to break cycle
// types.ts
export interface IUser {
  id: string;
  name: string;
}

export interface IOrder {
  id: string;
  userId: string;
}

// user.ts
import type { IOrder } from './types';
export class User {
  orders: IOrder[];
}

// order.ts
import type { IUser } from './types';
export class Order {
  user: IUser;
}
```

---

## Error Handling

### 1. Use Custom Error Classes

```typescript
// ✅ GOOD - Custom error hierarchy
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public readonly field: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

// Usage
function validateUser(user: User): void {
  if (!user.email) {
    throw new ValidationError('Email is required', 'email');
  }
}

function findUser(id: string): User {
  const user = database.get(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
}
```

### 2. Use Result Types for Expected Errors

```typescript
// ✅ GOOD - Result type for expected errors
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: 'Division by zero' };
  }
  return { ok: true, value: a / b };
}

// Usage with proper error handling
const result = divide(10, 2);
if (result.ok) {
  console.log('Result:', result.value);
} else {
  console.error('Error:', result.error);
}
```

### 3. Validate Early

```typescript
// ✅ GOOD - Validate in constructor before creating resources
class SecureBucket extends s3.Bucket {
  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    // Validate FIRST
    SecureBucket.validateProps(props);
    
    // Then create resources
    super(scope, id, {
      // ... configuration
    });
  }
  
  private static validateProps(props: SecureBucketProps): void {
    if (props.kmsKey && props.kmsKeyArn) {
      throw new Error(
        "SecureBucket: Cannot specify both 'kmsKey' and 'kmsKeyArn'. " +
        'Provide only one.'
      );
    }
    
    if (props.malwareProtectionPrefixes && !props.malwareProtection) {
      throw new Error(
        "SecureBucket: 'malwareProtectionPrefixes' requires " +
        "'malwareProtection' to be enabled."
      );
    }
  }
}
```

---

## Code Organization

### 1. File Structure

```typescript
// ✅ GOOD - Clear file organization
src/
├── constructs/
│   └── service/
│       ├── index.ts           // Barrel exports
│       ├── types.ts            // Type definitions
│       ├── ServiceName.ts      // Main construct (PascalCase)
│       ├── helpers.ts          // Helper functions
│       └── constants.ts        // Constants
└── utils/
    ├── validation.ts
    └── formatting.ts
```

### 2. Import Organization

```typescript
// ✅ GOOD - Organized imports
// 1. Node built-ins
import { readFileSync } from 'fs';
import { join } from 'path';

// 2. External dependencies (alphabetically)
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_kms as kms } from 'aws-cdk-lib';

// 3. Internal absolute imports
import { Logger } from '@/utils/logger';
import { Config } from '@/config';

// 4. Internal relative imports
import { SecureBucketProps } from './types';
import { validateProps } from './helpers';

// 5. Type-only imports (separate)
import type { IKey } from 'aws-cdk-lib/aws-kms';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
```

### 3. Barrel Exports

```typescript
// ✅ GOOD - index.ts barrel file
// Export types first
export type {
  SecureBucketProps,
  BucketEncryptionConfig,
} from './types';

// Export main constructs
export { SecureBucket } from './SecureBucket';

// Export utilities if public
export { validateBucketName } from './helpers';

// DON'T export internal implementation details
// ❌ export { internalHelper } from './internal';
```

---

## Testing Principles

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
// ✅ GOOD - Clear test structure
test('SecureBucket creates bucket with encryption', () => {
  // Arrange
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  const props: SecureBucketProps = {
    bucketName: 'test-bucket',
    kmsKey: mockKey,
  };
  
  // Act
  new SecureBucket(stack, 'TestBucket', props);
  const template = Template.fromStack(stack);
  
  // Assert
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [{
        ServerSideEncryptionByDefault: {
          SSEAlgorithm: 'aws:kms',
        },
      }],
    },
  });
});
```

### 2. Test Organization

```typescript
// ✅ GOOD - Organized test suites
describe('SecureBucket', () => {
  describe('constructor', () => {
    test('creates bucket with default settings', () => { /* ... */ });
    test('accepts custom encryption key', () => { /* ... */ });
  });
  
  describe('validation', () => {
    test('throws error when both kmsKey and kmsKeyArn provided', () => { /* ... */ });
    test('throws error for invalid bucket name', () => { /* ... */ });
  });
  
  describe('encryption', () => {
    test('uses S3-managed encryption by default', () => { /* ... */ });
    test('uses customer-managed key when provided', () => { /* ... */ });
  });
  
  describe('NAG compliance', () => {
    test('passes security checks with suppressions', () => { /* ... */ });
  });
});
```

### 3. Test Helper Functions

```typescript
// ✅ GOOD - Reusable test helpers
function createTestStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

function createMinimalBucketProps(): SecureBucketProps {
  return {
    bucketName: 'test-bucket',
  };
}

function createFullBucketProps(): SecureBucketProps {
  return {
    bucketName: 'test-bucket',
    kmsKey: mockKey,
    accessLogging: true,
    malwareProtection: true,
  };
}

// Usage
test('creates bucket with minimal props', () => {
  const stack = createTestStack();
  new SecureBucket(stack, 'Test', createMinimalBucketProps());
  // ...
});
```

---

## Performance Considerations

### 1. Avoid Premature Optimization

```typescript
// ✅ GOOD - Clear and maintainable first
function findUser(users: User[], id: string): User | undefined {
  return users.find(user => user.id === id);
}

// ❌ BAD - Premature optimization (unless proven bottleneck)
function findUser(users: User[], id: string): User | undefined {
  // Creating hash map for single lookup is overkill
  const userMap = new Map(users.map(u => [u.id, u]));
  return userMap.get(id);
}

// ✅ GOOD - Optimize when data is large and frequently accessed
class UserCache {
  private userMap: Map<string, User>;
  
  constructor(users: User[]) {
    this.userMap = new Map(users.map(u => [u.id, u]));
  }
  
  find(id: string): User | undefined {
    return this.userMap.get(id);
  }
}
```

### 2. Use Lazy Initialization

```typescript
// ✅ GOOD - Lazy initialization for expensive operations
class DataService {
  private _cache?: Map<string, Data>;
  
  get cache(): Map<string, Data> {
    if (!this._cache) {
      this._cache = this.buildCache(); // Only build when needed
    }
    return this._cache;
  }
  
  private buildCache(): Map<string, Data> {
    // Expensive operation
    return new Map(/* ... */);
  }
}
```

### 3. Avoid Memory Leaks

```typescript
// ❌ BAD - Memory leak with event listeners
class EventEmitter {
  private listeners: Function[] = [];
  
  on(listener: Function): void {
    this.listeners.push(listener);
  }
  
  // Missing: removeListener method
}

// ✅ GOOD - Proper cleanup
class EventEmitter {
  private listeners: Set<Function> = new Set();
  
  on(listener: Function): void {
    this.listeners.add(listener);
  }
  
  off(listener: Function): void {
    this.listeners.delete(listener);
  }
  
  clear(): void {
    this.listeners.clear();
  }
}
```

---

## Caching Strategies

### 1. Memoization

**Definition**: Cache the results of expensive function calls.

```typescript
// ✅ GOOD - Simple memoization
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Usage
const expensiveCalculation = (n: number): number => {
  console.log(`Calculating for ${n}`);
  return n * n;
};

const memoized = memoize(expensiveCalculation);
console.log(memoized(5)); // Calculates
console.log(memoized(5)); // Returns cached result
console.log(memoized(10)); // Calculates
```

---

### 2. LRU (Least Recently Used) Cache

```typescript
// ✅ GOOD - LRU Cache implementation
class LRUCache<K, V> {
  private cache: Map<K, V>;
  
  constructor(private capacity: number) {
    this.cache = new Map();
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key: K, value: V): void {
    // Remove if exists (to re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Add to end
    this.cache.set(key, value);
    
    // Remove oldest if over capacity
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  get size(): number {
    return this.cache.size;
  }
}

// Usage
const cache = new LRUCache<string, User>(100);
cache.set('user1', user1);
cache.set('user2', user2);
const user = cache.get('user1'); // Returns user1, makes it most recent
```

---

### 3. Time-Based Cache (TTL)

```typescript
// ✅ GOOD - Cache with expiration
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<K, V> {
  private cache: Map<K, CacheEntry<V>> = new Map();
  
  constructor(private defaultTTL: number = 60000) {} // Default 60 seconds
  
  set(key: K, value: V, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  has(key: K): boolean {
    const value = this.get(key);
    return value !== undefined;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage
const cache = new TTLCache<string, Data>(5000); // 5 second TTL
cache.set('key1', data1);
cache.set('key2', data2, 10000); // Custom 10 second TTL

setTimeout(() => {
  console.log(cache.get('key1')); // undefined (expired)
  console.log(cache.get('key2')); // Still valid
}, 6000);
```

---

### 4. Cache Invalidation Strategies

```typescript
// ✅ GOOD - Cache with invalidation
class CacheManager<K, V> {
  private cache = new Map<K, V>();
  private dependencies = new Map<K, Set<K>>();
  
  set(key: K, value: V, dependsOn?: K[]): void {
    this.cache.set(key, value);
    
    // Track dependencies
    if (dependsOn) {
      for (const dep of dependsOn) {
        if (!this.dependencies.has(dep)) {
          this.dependencies.set(dep, new Set());
        }
        this.dependencies.get(dep)!.add(key);
      }
    }
  }
  
  get(key: K): V | undefined {
    return this.cache.get(key);
  }
  
  invalidate(key: K): void {
    this.cache.delete(key);
    
    // Invalidate dependent entries
    const dependents = this.dependencies.get(key);
    if (dependents) {
      for (const dependent of dependents) {
        this.invalidate(dependent); // Recursive invalidation
      }
      this.dependencies.delete(key);
    }
  }
  
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(String(key))) {
        this.invalidate(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
    this.dependencies.clear();
  }
}

// Usage
const cache = new CacheManager<string, any>();
cache.set('user:1', user1);
cache.set('user:1:posts', posts1, ['user:1']); // Depends on user:1
cache.set('user:1:profile', profile1, ['user:1']);

// Invalidate user and all dependent data
cache.invalidate('user:1'); // Also invalidates posts and profile

// Invalidate by pattern
cache.invalidatePattern(/^user:1:/); // Invalidates all user:1:* entries
```

---

### 5. Async Cache with Deduplication

```typescript
// ✅ GOOD - Prevent duplicate fetches
class AsyncCache<K, V> {
  private cache = new Map<K, V>();
  private pending = new Map<K, Promise<V>>();
  
  async get(
    key: K,
    fetcher: () => Promise<V>,
  ): Promise<V> {
    // Return cached value if available
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    // Return pending promise if already fetching
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }
    
    // Start new fetch
    const promise = fetcher()
      .then(value => {
        this.cache.set(key, value);
        this.pending.delete(key);
        return value;
      })
      .catch(error => {
        this.pending.delete(key);
        throw error;
      });
    
    this.pending.set(key, promise);
    return promise;
  }
  
  invalidate(key: K): void {
    this.cache.delete(key);
    this.pending.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }
}

// Usage
const cache = new AsyncCache<string, User>();

// Multiple simultaneous calls only trigger one fetch
const [user1, user2, user3] = await Promise.all([
  cache.get('user:1', () => fetchUser('1')),
  cache.get('user:1', () => fetchUser('1')), // Uses same promise
  cache.get('user:1', () => fetchUser('1')), // Uses same promise
]);

// Only one network request was made
```

---

**Application in CDK Constructs**:

```typescript
// ✅ GOOD - Cache expensive lookups
class VpcLookupCache {
  private static cache = new Map<string, ec2.IVpc>();
  
  static lookup(
    scope: Construct,
    vpcId: string,
  ): ec2.IVpc {
    if (this.cache.has(vpcId)) {
      return this.cache.get(vpcId)!;
    }
    
    const vpc = ec2.Vpc.fromLookup(scope, `Vpc-${vpcId}`, {
      vpcId,
    });
    
    this.cache.set(vpcId, vpc);
    return vpc;
  }
  
  static clear(): void {
    this.cache.clear();
  }
}

// Usage - multiple constructs can share the lookup result
const vpc1 = VpcLookupCache.lookup(this, 'vpc-123');
const vpc2 = VpcLookupCache.lookup(this, 'vpc-123'); // Returns cached
```

---

## Documentation Standards

### 1. TSDoc Comments

```typescript
/**
 * Creates a secure S3 bucket with encryption and security best practices.
 *
 * This construct extends the standard S3 Bucket with:
 * - Default encryption (S3-managed or customer-managed KMS)
 * - Public access blocking
 * - SSL enforcement
 * - Versioning enabled
 * - Optional access logging
 * - Optional malware protection
 *
 * @param scope - The scope in which to define this construct
 * @param id - The scoped construct ID
 * @param props - Configuration properties
 *
 * @throws {Error} When both kmsKey and kmsKeyArn are provided
 * @throws {ValidationError} When bucket name is invalid
 *
 * @example Basic usage with default encryption
 * new SecureBucket(this, 'MyBucket', \{
 *   bucketName: 'my-secure-bucket',
 * \});
 *
 * @example With customer-managed KMS key
 * const key = new kms.Key(this, 'BucketKey');
 * new SecureBucket(this, 'MyBucket', \{
 *   bucketName: 'my-bucket',
 *   kmsKey: key,
 * \});
 *
 * @stability stable
 * @security Enforces encryption at rest and in transit
 */
export class SecureBucket extends s3.Bucket {
  // ...
}
```

### 2. Inline Comments

```typescript
// ✅ GOOD - Explain WHY, not WHAT
function calculateDiscount(price: number, customer: Customer): number {
  // Apply 10% discount for premium customers to encourage retention
  if (customer.isPremium) {
    return price * 0.9;
  }
  return price;
}

// ❌ BAD - Obvious comments
function calculateDiscount(price: number, customer: Customer): number {
  // Check if customer is premium
  if (customer.isPremium) {
    // Multiply price by 0.9
    return price * 0.9;
  }
  // Return original price
  return price;
}
```

---

## Code Review Checklist

### SOLID Principles
- [ ] Each class has a single, well-defined responsibility (SRP)
- [ ] Code is open for extension, closed for modification (OCP)
- [ ] Subclasses can replace parent classes without breaking functionality (LSP)
- [ ] Interfaces are focused and segregated (ISP)
- [ ] Dependencies are on abstractions, not concrete implementations (DIP)

### Core Principles
- [ ] No code duplication (DRY)
- [ ] Law of Demeter followed (minimal coupling between components)
- [ ] Tell, Don't Ask principle applied
- [ ] Command Query Separation maintained
- [ ] YAGNI - no unnecessary features added
- [ ] KISS - solutions are as simple as possible

### TypeScript Best Practices
- [ ] Strict type checking enabled
- [ ] No use of `any` (use `unknown` or proper types)
- [ ] Readonly properties where appropriate
- [ ] Type guards used for type narrowing
- [ ] Utility types leveraged effectively
- [ ] Discriminated unions for complex types
- [ ] Proper use of generics

### Functional Programming
- [ ] Pure functions where possible (no side effects)
- [ ] Higher-order functions used appropriately
- [ ] Function composition over complex logic
- [ ] No mutations - return new objects
- [ ] Data transformations use map/filter/reduce pipelines

### Immutability
- [ ] Objects and arrays not mutated
- [ ] Readonly modifiers used
- [ ] Deep readonly for nested structures
- [ ] Immutable update patterns followed

### Async/Promise Handling
- [ ] Async/await preferred over promise chains
- [ ] Parallel operations use Promise.all where appropriate
- [ ] Proper error handling in async code
- [ ] No unhandled promise rejections
- [ ] Retry logic for flaky operations
- [ ] Timeout handling implemented

### Resource Management
- [ ] Disposable pattern for resources requiring cleanup
- [ ] Proper cleanup in finally blocks
- [ ] Event listeners removed when done
- [ ] AbortController used for cancellable operations
- [ ] No resource leaks

### Architectural Patterns
- [ ] Hexagonal architecture applied (business logic decoupled)
- [ ] Repository pattern for data access
- [ ] Specification pattern for business rules
- [ ] Null Object pattern to avoid null checks
- [ ] Appropriate design patterns used
- [ ] Patterns implemented correctly
- [ ] No anti-patterns present

### Dependency Management
- [ ] Constructor injection used
- [ ] Dependencies on interfaces, not implementations
- [ ] No circular dependencies
- [ ] Proper use of barrel exports

### Error Handling
- [ ] Custom error classes for domain errors
- [ ] Validation performed early (fail fast)
- [ ] Error messages are clear and actionable
- [ ] Expected errors handled gracefully
- [ ] Result types used for expected failures

### Code Organization
- [ ] Files follow standard structure
- [ ] Imports organized correctly (node, external, internal, types)
- [ ] Barrel exports used appropriately
- [ ] PascalCase for classes and types
- [ ] camelCase for functions and variables
- [ ] One construct per file

### Testing
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Test coverage meets requirements (85%+)
- [ ] Edge cases tested
- [ ] Integration tests included
- [ ] Tests are isolated and independent
- [ ] Mock dependencies properly

### Performance & Caching
- [ ] No premature optimization
- [ ] Expensive operations are lazy
- [ ] No obvious memory leaks
- [ ] Efficient algorithms used
- [ ] Appropriate caching strategy
- [ ] Cache invalidation handled
- [ ] LRU/TTL cache for bounded memory

### Documentation
- [ ] TSDoc comments for public APIs
- [ ] Complex logic explained with comments
- [ ] Examples provided for usage
- [ ] README updated if needed
- [ ] @throws documented for errors
- [ ] @stability tags used appropriately

### CDK-Specific
- [ ] Constructs follow composition over inheritance
- [ ] Props interfaces use readonly
- [ ] Validation in constructor before creating resources
- [ ] Security best practices applied
- [ ] CDK Nag suppressions justified
- [ ] Integration tests verify deployment

---

## Additional Resources

### Books
- **Clean Code** by Robert C. Martin
- **Refactoring** by Martin Fowler
- **Design Patterns** by Gang of Four
- **Effective TypeScript** by Dan Vanderkam

### Online Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

### Internal Documentation
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines
- [docs/constructs/](./docs/constructs/) - CDK construct standards
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

## License

UNLICENSED - Copyright (c) 2017-2025 Booz Allen Hamilton Inc. All Rights Reserved.

