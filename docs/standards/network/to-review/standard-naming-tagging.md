# Standards - Naming and Tagging

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard governs all naming and tagging practices for network-related AWS resources within the Trusted Environments platform. It ensures consistent identification, cost attribution, operational traceability, and policy enforcement across all VPCs, subnets, route tables, gateways, endpoints, and related components. Compliance with this document is mandatory for all environments, pipelines, and resource deployments.

## Purpose

- Enforce uniform naming to simplify automation and visibility.
- Ensure cost reporting, ownership tracking, and governance policies rely on consistent tags.
- Support environment discovery and access control based on logical metadata.

## Scope

Applies to all resources under:

- Network Services VPCs (Ingress, Egress, Utility, Private Connections)
- Local VPCs deployed to tenant accounts
- Shared platform networking resources (e.g., TGW, CWAN, IPAM, resolvers)

## Naming Conventions

### General Format

All names must follow this pattern:

`<env>-<project>-<resource>-<az/region/ordinal>`

Where:

- env = nonprod | prod | shared
- project = platform identifier (e.g., network, eks, data)
- resource = VPC | subnet | natgw | endpoint | route | tgw-rt | etc.
- az/region/ordinal = where applicable (e.g., usw2a, 001, etc.)

### VPCs

`<env>-<project>-vpc`

Example: nonprod-network-vpc

### Subnets

`<env>-<project>-<tier>-subnet-<az>`

Example: prod-network-compute-subnet-use1a

### NAT Gateways

`<env>-<project>-natgw-<az>`

### Route Tables

`<env>-<project>-<tier>-rt-<az>`

### CWAN Attachments

`<env>-<project>-cwan-attachment-<region>`

### TGW Route Tables

`<env>-<segment>-tgw-rt-<region>`

### VPC Endpoints

`<env>-<project>-vpce-<service>-<az>`

## Tagging Conventions

### Required Tags

All resources must include the following tags:

| Tag Key           | Description                                                            | Example Value                   |
|-------------------|------------------------------------------------------------------------|---------------------------------|
| `Name`            | Human-readable name of the resource                                    | `te-usw2-network-egress-tier1` |
| `Environment`     | Environment classification (e.g., prod, non-prod, shared)              | `prod`                          |
| `Project`         | Logical grouping or workload project name                              | `trusted-environments`          |
| `ManagedBy`       | Owning team, service, or automation system                             | `platform-networking`           |
| `ContractVersion` | Version of the standard or contract under which this was provisioned   | `v2.1`                          |
| `Provisioner`     | Tool or pipeline responsible for deployment                            | `terraform-cicd`                |
| `Region`          | AWS Region the resource resides in                                     | `us-west-2`                     |
| `Boundary`        | Network boundary (e.g., tenant, core, edge, shared)                    | `shared`                        |

### Optional Tags

| Tag Key        | Description                                                            | Example Value        |
|----------------|------------------------------------------------------------------------|----------------------|
| `Lifecycle`    | Resource lifecycle stage (e.g., active, deprecated, planned)           | `active`             |
| `Compliance`   | Compliance profile applied to the resource                             | `baseline`           |
| `Owner`        | Primary engineer or team responsible for resource                      | `network@company.com`|
| `CostCenter`   | Finance or budget tracking identifier                                  | `cc-1485`            |
| `DataClass`    | Data classification (e.g., pii, phi, classified, unclassified)         | `unclassified`       |
| `SecurityTier` | Security enforcement level (e.g., standard, hardened, restricted)      | `hardened`           |
| `SupportTier`  | Operational SLA tier or support level                                  | `tier-2`             |
| `Notes`        | Freeform notes for future operators or context                         | `Do not delete`      |

### Enforcement

- All Terraform modules include tag and name validation.
- CI/CD pipelines run tagging linters before deployment.
- Drift detection monitors for missing or incorrect tags.
- Unlabeled resources are automatically flagged for remediation.

### Governance

- Naming and tagging updates require contract board approval.
- All documentation and automation must reflect these standards.
- Periodic audits validate compliance across environments.

### Exceptions

- AWS-managed resources (e.g., implicit ENIs) are exempt.
- Legacy resources prior to this standard are reviewed case-by-case.
- Custom exceptions require security and architecture sign-off.

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
