# Domain Naming Standard Specification

**Version:** v1.0
**Maintained by:**:

- Customer Success
- Platform Architecture
- Security Engineering

---

## Overview

This document defines the standardized domain naming convention for internal and external service endpoints across all environments. The goal is to ensure clarity, scalability, and consistency in how services are named, routed, and discovered across the platform.

## Domain Format

```bash
https://<service>.<product>.<env>.<boundary>.<tld>/<version>
```

- All segments before the first `/` form a valid DNS name (FQDN).
- All segments after the `/` are part of the URI path, used primarily for API versioning.

## Segment Definitions

| Segment      | Required          | Description                                                                                                                                               |
| ------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<service>`  | ✅                 | Name of the microservice or API being served. Should be unique within the product context.                                                                |
| `<product>`  | ✅                 | Logical grouping or domain of services (e.g., checkout, analytics, accounts).                                                                             |
| `<env>`      | ✅                 | The environment in which the service is running (e.g., dev, stage, prod).                                                                                 |
| `<boundary>` | 🔶 (non-prod only) | Represents the network boundary — used to distinguish between isolated non-production traffic (e.g., non-prod, sandbox). Omitted for `prod` environments. |
| `<tld>`      | ✅                 | Top-level domain (e.g., example.com, internal, svc.cluster.local). Use `.internal` or `.corp` for private services.                                       |
| `<version>`  | ✅                 | API version identifier (e.g., v1, v2beta). Placed in the URI path for REST and gRPC compatibility.                                                        |

## Multi-Tenant Expansion

In SaaS or multi-tenant systems, a tenant-specific identifier can optionally be prepended to the domain:

```bash
https://<tenant>.<service>.<product>.<env>.<boundary>.<tld>/<version>
```

This allows per-tenant isolation of service traffic and routing.

- `<tenant>`: A unique slug or name that identifies the tenant. This enables host-based routing, metrics, and access control by tenant.

Tenant identifiers may be:

- Opaque slugs (e.g., `t-a8x9`)
- Human-friendly names (e.g., `tenant1`)
- Derived from tenant metadata (e.g., UUID, account ID)

Tenant DNS naming is useful in:

- Hard multi-tenancy (separate infra)
- Soft multi-tenancy (shared infra, per-tenant routing)
- Vanity domains or branded endpoints

### Multi-Tenant Examples

**Development Environment:**

- `https://acme.payments.checkout.dev.non-prod.example.internal/v1/`
- `https://t-a8x9.analytics.insights.dev.non-prod.example.internal/v2/`

**Production Environment:**

- `https://acme.payments.checkout.prod.example.com/v1/`
- `https://globex.api.accounts.prod.example.com/v1/`

## Examples

### Non-Production (with `<boundary>`)

- `https://payments.checkout.dev.non-prod.example.internal/v1/`
- `https://metrics.analytics.stage.sandbox.example.internal/v2/`

### Production (without `<boundary>`)

- `https://payments.checkout.prod.example.com/v1/`
- `https://metrics.analytics.prod.example.com/v2/`

## Design Principles

- DNS-Compliant: All domain components before the first slash are valid DNS labels.
- Environment Isolation: `<env>` and `<boundary>` allow complete separation of traffic, DNS zones, and routing logic.
- Versioning: API versioning is done via the URI path, not subdomain or query string.
- Security Boundary Clarity: Only non-production environments include a `.non-prod`, `.sandbox`, or equivalent suffix for explicit traffic boundary management.
- Scalable: Works across thousands of microservices and multiple products with minimal collision risk.

## Reserved Values

| Field        | Recommended Values                                                                       | Notes                                                                         |
| ------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `<env>`      | `dev`, `stage`, `prod`                                                                   | Use `dev` for development, `stage` for staging/testing, `prod` for production |
| `<boundary>` | `non-prod`, `sandbox`, `preview`                                                         | Omit for prod environments. Use `sandbox` for isolated testing                |
| `<tld>`      | `example.com` (external)`example.internal` (internal)`svc.cluster.local` (k8s) | Choose based on network visibility requirements                               |
| `<version>`  | `v1`, `v2`, `v1beta1`, `v2alpha`                                                         | Follow semantic versioning principles                                         |

### Environment-Specific TLD Recommendations

| Environment | Internal TLD           | External TLD         | Use Case                        |
| ----------- | ---------------------- | -------------------- | ------------------------------- |
| `dev`       | `.dev.internal`        | `.dev.example.com`   | Development and local testing   |
| `stage`     | `.stage.internal`      | `.stage.example.com` | Staging and integration testing |
| `prod`      | `.internal` or `.corp` | `.example.com`       | Production traffic              |

## Guidelines

### Naming Conventions

- Use lowercase letters, numbers, and hyphens (`-`) only.
- Avoid underscores, uppercase letters, or long chained names.
- Service names should be 3-32 characters long.
- Product names should be 3-16 characters long.
- Tenant IDs should be 2-32 characters long.

### DNS Compliance

- Domain length (including subdomains) should not exceed 253 characters.
- Each DNS label should not exceed 63 characters.
- Service names must be unique per product/environment combination.

### Tenant ID Sanitization

- Remove or replace special characters: `[^a-z0-9-]`
- Replace spaces and underscores with hyphens
- Ensure tenant IDs start and end with alphanumeric characters
- Examples of valid tenant IDs: `acme`, `tenant-1`, `t-a8x9`

### Security Considerations

- Use `.internal` or `.corp` TLD for services not exposed to the internet
- Implement proper certificate management for each domain pattern
- Consider wildcard certificates for `*.<product>.<env>.<boundary>.<tld>`

## Anti-Patterns

Avoid these common mistakes when implementing the domain naming standard:

### ❌ Don't Use These Patterns

**Version in subdomain:**

- `https://v1.payments.checkout.prod.example.com/` (version should be in path)

**Inconsistent boundary usage:**

- `https://payments.checkout.prod.non-prod.example.com/v1/` (don't use boundary in prod)

**Invalid characters:**

- `https://payments_api.checkout.prod.example.com/v1/` (no underscores)
- `https://PaymentsAPI.checkout.prod.example.com/v1/` (no uppercase)

**Overly long names:**

- `https://very-long-service-name-that-exceeds-limits.checkout.prod.example.com/v1/`

**Poor tenant naming:**

- `https://tenant@123.payments.checkout.prod.example.com/v1/` (invalid characters)
- `https://-tenant.payments.checkout.prod.example.com/v1/` (starts with hyphen)

### ✅ Correct Alternatives

- `https://payments.checkout.prod.example.com/v1/`
- `https://payments.checkout.dev.non-prod.example.internal/v1/`
- `https://payments-api.checkout.prod.example.com/v1/`
- `https://payments.checkout.prod.example.com/v1/`
- `https://tenant123.payments.checkout.prod.example.com/v1/`
- `https://tenant.payments.checkout.prod.example.com/v1/`

## Implementation Considerations

### DNS Zone Management

- Create separate DNS zones for each environment (`dev.non-prod.example.internal`, `prod.example.com`)
- Use wildcard DNS records where appropriate: `*.checkout.prod.example.com`
- Consider DNS delegation for product teams: `checkout.prod.example.com` → team-managed zone

### Certificate Management

- Use wildcard certificates for product domains: `*.checkout.prod.example.com`
- For multi-tenant scenarios, consider: `*.*.checkout.prod.example.com` (if supported)
- Implement automated certificate provisioning (e.g., cert-manager, Let's Encrypt)

### Load Balancer & Ingress Configuration

- Configure host-based routing rules matching the domain pattern
- Implement proper SSL termination at the load balancer level
- Use consistent path-based routing for API versioning

### Service Mesh Integration

- Configure service mesh (e.g., Istio) with proper virtual services
- Implement traffic policies based on domain patterns
- Use consistent naming in service mesh configuration

### Monitoring & Observability

- Tag metrics and logs with domain components (`service`, `product`, `env`, `tenant`)
- Implement domain-based alerting and dashboards
- Track certificate expiration and DNS health

## Path Structure Guidelines

Beyond the base version path, consider these patterns for API endpoints:

### REST API Patterns

```bash
# Resource-based endpoints
https://<service>.<product>.<env>.<boundary>.<tld>/<version>/<resource>
https://<service>.<product>.<env>.<boundary>.<tld>/<version>/<resource>/<id>
https://<service>.<product>.<env>.<boundary>.<tld>/<version>/<resource>/<id>/<sub-resource>

# Examples
https://payments.checkout.prod.example.com/v1/transactions
https://payments.checkout.prod.example.com/v1/transactions/tx-123
https://user.accounts.prod.example.com/v1/users/user-456/preferences
```

### GraphQL Endpoints

```bash
# GraphQL typically uses a single endpoint
https://<service>.<product>.<env>.<boundary>.<tld>/<version>/graphql

# Example
https://api.ecommerce.prod.example.com/v1/graphql
```

### gRPC Services

```bash
# gRPC services use the domain for service discovery
# The actual RPC methods are defined in the proto files
<service>.<product>.<env>.<boundary>.<tld>:443

# Example
payments.checkout.prod.example.com:443
```

### Health & Monitoring Endpoints

```bash
# Standard monitoring paths
https://<service>.<product>.<env>.<boundary>.<tld>/health
https://<service>.<product>.<env>.<boundary>.<tld>/metrics
https://<service>.<product>.<env>.<boundary>.<tld>/readiness
```

## Regional & Multi-Region Considerations

For globally distributed services, consider these regional patterns:

### Region-Specific Services

```bash
# Option 1: Regional subdomain
https://<region>.<service>.<product>.<env>.<boundary>.<tld>/<version>

# Examples
https://us-east-1.payments.checkout.prod.example.com/v1/
https://eu-west-1.payments.checkout.prod.example.com/v1/
```

### Global Services with Regional Routing

```bash
# Option 2: Geographic TLD + intelligent routing
https://<service>.<product>.<env>.us.example.com/<version>
https://<service>.<product>.<env>.eu.example.com/<version>

# Option 3: Single global endpoint with backend routing
https://<service>.<product>.<env>.global.example.com/<version>
```

### Data Residency Compliance

- Use regional TLDs for data sovereignty: `.eu.example.com`, `.us.example.com`
- Implement proper geo-routing at DNS or load balancer level
- Consider tenant data residency requirements in multi-tenant scenarios

## Compliance & Governance

### Audit Trail Requirements

- Log all domain resolution and routing decisions
- Track tenant-to-region mappings for compliance
- Maintain change logs for domain configuration changes

### Privacy Considerations

- Ensure tenant isolation extends to DNS resolution
- Consider data residency in domain/region selection
- Implement proper access controls for DNS management
