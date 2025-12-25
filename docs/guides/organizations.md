# Default Security Policies Implementation

This document demonstrates how the `OrganizationalServices` construct now includes default security policies based on the BaseRootPayerStack, with full toggle and customization capabilities.

## Overview

The `OrganizationalServices` construct now automatically includes security-focused policies by default:

### Default Resource Control Policies
- **Secure Transport Policy**: Enforces HTTPS/TLS for AWS services (STS, S3, SQS, Secrets Manager, KMS)

### Default Declarative EC2 Policies
- **Allowed AMIs Policy**: Restricts EC2 instances to approved AMI providers
- **EC2 Metadata Policy**: Enforces secure metadata settings (IMDSv2, hop limits)
- **Serial Console Policy**: Disables serial console access for security
- **Snapshot Block Public Access**: Blocks public sharing of EBS snapshots
- **Image Block Public Access**: Blocks public sharing of EC2 images

## Usage Examples

### 1. Basic Usage (Default Policies Enabled)

```typescript
import { OrganizationalServices } from '@bah-te/cdk-core-constructs';

// Default security policies are automatically enabled
new OrganizationalServices(this, 'OrgServices', {
  namePrefix: 'MyOrg',
  targets: ['r-rootid'],
  // All default security policies are automatically created
});
```

### 2. Replicating BaseRootPayerStack

```typescript
// This exactly replicates the BaseRootPayerStack functionality
new OrganizationalServices(this, 'BaseRootPayerOrgServices', {
  namePrefix: 'BaseResourceControlPolicy',
  targets: ['ou-fwiy-max7hdh4'], // Same target as BaseRootPayerStack
  
  defaultPolicyOverrides: {
    declarativeEc2Policies: {
      // Use the exact AMI providers from BaseRootPayerStack
      allowedAmiProviders: [
        '011528256587', // Booz Allen Hamilton
        '971422683627', // Additional approved provider
        'amazon',       // Amazon
      ],
    },
  },
});
```

### 3. Customizing Default Policies

```typescript
new OrganizationalServices(this, 'CustomOrgServices', {
  namePrefix: 'CustomOrg',
  targets: ['r-rootid'],
  
  defaultPolicyOverrides: {
    resourceControlPolicies: {
      enableSecureTransport: true, // Keep default
      additionalPolicies: [
        {
          name: 'CustomDataResidency',
          policies: [
            {
              Effect: 'Deny',
              Action: 's3:*',
              Resource: '*',
              Condition: {
                StringNotEquals: {
                  'aws:RequestedRegion': ['us-east-1', 'us-west-2'],
                },
              },
            },
          ],
        },
      ],
    },
    declarativeEc2Policies: {
      allowedAmiProviders: ['amazon', 'my-company'], // Override default
      enableSerialConsole: false, // Allow serial console
      enableEc2Metadata: false, // Disable metadata policy
      additionalPolicies: [
        {
          name: 'CustomEC2Encryption',
          content: {
            ec2_attributes: {
              ebs_encryption: {
                state: {
                  '@@assign': 'enabled',
                },
              },
            },
          },
        },
      ],
    },
  },
});
```

### 4. Disabling Default Policies

```typescript
// Disable all default policies
new OrganizationalServices(this, 'NoDefaultsOrgServices', {
  namePrefix: 'NoDefaults',
  targets: ['r-rootid'],
  enableDefaultResourceControlPolicies: false,
  enableDefaultDeclarativeEc2Policies: false,
  
  // Only custom policies
  resourceControlPolicies: [
    {
      name: 'CustomRCP',
      policies: [
        {
          Effect: 'Deny',
          Action: 'ec2:*',
          Resource: '*',
        },
      ],
    },
  ],
});
```

### 5. Selective Policy Control

```typescript
new OrganizationalServices(this, 'SelectiveOrgServices', {
  namePrefix: 'SelectiveOrg',
  targets: ['r-rootid'],
  
  defaultPolicyOverrides: {
    resourceControlPolicies: {
      enableSecureTransport: false, // Disable secure transport
    },
    declarativeEc2Policies: {
      enableAllowedAmis: true, // Keep AMI restrictions
      enableSerialConsole: false, // Allow serial console
      enableEc2Metadata: true, // Keep metadata security
      enableSnapshotBlockPublicAccess: false, // Allow snapshot sharing
      enableImageBlockPublicAccess: false, // Allow image sharing
    },
  },
});
```

## Configuration Options

### DefaultResourceControlPolicyConfig
- `enableSecureTransport?: boolean` - Enable/disable secure transport policy
- `additionalPolicies?: any[]` - Add custom RCP policies

### DefaultDeclarativeEc2PolicyConfig
- `enableAllowedAmis?: boolean` - Enable/disable allowed AMIs policy
- `enableEc2Metadata?: boolean` - Enable/disable EC2 metadata policy
- `enableSerialConsole?: boolean` - Enable/disable serial console policy
- `enableSnapshotBlockPublicAccess?: boolean` - Enable/disable snapshot block public access
- `enableImageBlockPublicAccess?: boolean` - Enable/disable image block public access
- `allowedAmiProviders?: string[]` - Custom AMI providers (overrides default)
- `additionalPolicies?: any[]` - Add custom EC2 declarative policies

## Migration from BaseRootPayerStack

To migrate from the BaseRootPayerStack to OrganizationalServices:

1. **Replace the individual policy creations** with OrganizationalServices
2. **Use the same target IDs** from your BaseRootPayerStack
3. **Customize the default policies** using `defaultPolicyOverrides` if needed
4. **Add any additional policies** using the `additionalPolicies` arrays

### Before (BaseRootPayerStack)
```typescript
new core.ResourceControlPolicy(this, 'BaseResourceControlPolicy', {
  name: 'BaseResourceControlPolicy',
  targetIds: ["ou-fwiy-max7hdh4"],
  policies: [
    {
      Sid: 'EnforceSecureTransport',
      Effect: 'Deny',
      Principal: '*',
      Action: ['sts:*', 's3:*', 'sqs:*', 'secretsmanager:*', 'kms:*'],
      Resource: '*',
      Condition: {
        BoolIfExists: {
          'aws:SecureTransport': 'false',
        },
      },
    },
  ],
});

// ... multiple DeclarativePolicyForEc2 instances
```

### After (OrganizationalServices)
```typescript
new OrganizationalServices(this, 'OrgServices', {
  namePrefix: 'BaseResourceControlPolicy',
  targets: ['ou-fwiy-max7hdh4'],
  // All policies are automatically created with the same configuration
});
```

## Benefits

1. **Security by Default**: New deployments get security best practices automatically
2. **Flexibility**: Full control over which policies to enable/disable
3. **Extensibility**: Easy to add custom policies alongside defaults
4. **Backward Compatibility**: Existing configurations continue to work
5. **Consistency**: Standardized security policies across the organization
6. **Maintainability**: Centralized policy management

## Testing

The implementation includes comprehensive tests covering:
- Default policy creation
- Policy customization and overrides
- Disabling default policies
- Backward compatibility
- Integration with existing functionality

Run the tests with:
```bash
npm test -- --testPathPattern=organizational-services
```
