# Standards - Subnets

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard governs the allocation, sizing, and tiering of subnets across all VPCs within the Trusted Environments Global Network. It establishes deterministic rules for IP planning, regional expansion, and tier-based subnet layout. This ensures predictability, compatibility with centralized services like IPAM and Cloud WAN, and long-term architectural stability.

## Summary

Subnetting in Trusted Environments follows a **tiered architecture model**, where each tier within a VPC is aligned to a specific functional role. All subnet ranges are allocated from AWS IPAM-managed pools and follow pre-approved CIDR size and placement rules based on VPC type and purpose.

## IPAM-Only Allocation Policy

All CIDR blocks used for subnetting across all VPCs **must** be allocated and tracked through **AWS IPAM**. No hardcoded or manually entered CIDRs are allowed in any Terraform configurations, blueprint files, or pipelines.

This policy ensures:

- Elimination of address overlap
- Consistent lifecycle tracking of allocated IP space
- Full compliance with global and regional IP segmentation rules
- Accurate propagation of IP metadata across provisioning pipelines

**CIDRs must be requested from IPAM pools scoped to environment, region, and network boundary.** These allocations are validated by automated policies in the provisioning system and are subject to centralized governance.

> Any attempt to bypass IPAM using hardcoded CIDRs is a critical violation of the Trusted Environments standard and will result in provisioning failure or rollback.

## Tier Definitions

Each VPC type uses some or all of the following logical tiers. These tiers are applied consistently across Commercial and GovCloud partitions.

| Tier Name       | Purpose                                                                 |
|------------------|-------------------------------------------------------------------------|
| External DMZ     | Internet-facing tier with ALBs/NLBs, IGW or NAT Gateway connectivity    |
| Firewall Tier    | Dedicated AWS Network Firewall subnet tier                              |
| Internal DMZ     | CWAN/Transit Gateway attachment tier                                    |
| Private          | Internal workload hosting, often used for services behind LB            |
| Data             | Reserved for AWS data services like RDS, OpenSearch, Redshift           |
| Compute          | Kubernetes, EC2, and application workloads                              |

> Tiers are always isolated using NACLs, Route Tables, and firewall rules to enforce strict east-west and north-south segmentation.

## VPC Type & Subnet Sizing Matrix

All subnets are derived from VPC-level CIDRs, which are pre-allocated via IPAM. This table defines standard sizing and structure:

| VPC Type           | Parent CIDR | Subnet Sizes | Notes                                                              |
|--------------------|-------------|---------------|--------------------------------------------------------------------|
| Ingress VPC        | /22 + /18   | /26, /24      | External DMZ is sourced from shared /18 for Org-wide subnet sharing |
| Egress VPC         | /21         | /24, /26      | DNS resolvers in External DMZ tier                                 |
| VPC Endpoint VPC   | /21         | /24           | Max of 255 endpoints/VPC requires full prefix utilization          |
| Hybrid/VPN VPC     | /21         | /24           | Mirrors VPCe layout; private tier holds VPN/DC endpoints           |
| Utility VPC        | /23         | /26           | Smaller footprint for AMI builders, CodeStar, etc.                 |
| Local VPC - Simple | /22         | /26, /28      | Uses leftover space from /22                                       |
| Local VPC - Standard | /22 + /22 | /24           | Secondary CIDR for Compute tier                                    |
| Local VPC - Expanded | /22 + 240/16 | /26         | Uses non-routable class E with internal NAT Gateway                |

> **Note:** All secondary CIDRs must be tagged and authorized for use in Terraform provisioning pipelines.

## Subnet Naming Convention

Subnet names follow this deterministic format:

**Example:**

- prod-use1-egress-externaldmz-az1
- dev-usw2-local-compute-az3

## Subnet Tagging Convention

| Tag Key           | Value Example                 | Purpose                                  |
|-------------------|-------------------------------|------------------------------------------|
| `Name`            | `prod-use1-egress-externaldmz-az1` | Human-readable reference                 |
| `tier`            | `external-dmz`                | Tier classification for ACL/firewall     |
| `az-index`        | `az1`, `az2`, `az3`, `az4`     | AZ-based distribution                    |
| `environment`     | `dev`, `test`, `prod`         | Environmental scoping                    |
| `vpc-type`        | `ingress`, `local`, `utility` | Logical grouping                         |
| `shared`          | `true` / `false`              | Marks if subnet is shared across accounts|

## Allocation Rules

- Every subnet must align to a specific tier — **no mixed-tier subnets are permitted**.
- All subnet allocations must be declared in blueprint YAMLs and validated during CI/CD.
- Subnet overlap detection is enforced via IPAM allocation and Terraform policy checks.
- CIDR usage must maintain at least 20% buffer for all tiers to accommodate growth.
- Shared subnets (e.g., External DMZ for Ingress VPC) must follow Org-wide RAM practices.

## Governance

All subnet allocations and tier structures must be approved by Platform Architecture and recorded in version-controlled infrastructure repositories. Unauthorized subnet use or out-of-band changes are prohibited and may trigger audit remediation.

> **Any modifications to tier definitions, allocation sizing, or tier behaviors must be reviewed by the Contract Review Board (CRB).**

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
