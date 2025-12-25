# Standards - Routing

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---
This standard defines how routing is implemented, enforced, and scaled within the Trusted Environments Global Network. It ensures that routing behavior is deterministic, tier-aligned, and compatible with ACL enforcement and zero-trust segmentation. All VPCs deployed under Network Services or Local tiers must conform to these practices.

## Summary

Routing within the Trusted Environments architecture is deterministic, tier-enforced, and centrally governed. Each VPC follows a multi-tier model with explicitly managed route tables that control flow between tiers and to/from Cloud WAN, NAT Gateways, and Internet Gateways. These routing standards ensure consistent traffic paths, enforce isolation, and prevent misrouted traffic that could violate segmentation or inspection policies.

## Routing Principles

- **Tier-Based Routing:** Each tier has its own route table.
- **Single Tier Entry/Exit:** All traffic must enter and exit through designated tiers.
- **Cloud WAN Attachments:** Always reside in the Internal DMZ tier.
- **Edge Firewalls:** All Internet-bound traffic must route through the Firewall tier.
- **Blackhole Support:** Reserved IPAM blocks are used to blackhole unauthorized paths.
- **No Transitive Flow:** ACLs and routes prevent skipping tier boundaries.

## Route Table Responsibilities by Tier

| Tier Name        | Route Table Target Examples                                        | Route Enforcements                                     |
|------------------|--------------------------------------------------------------------|--------------------------------------------------------|
| **External DMZ** | Default route to Edge Firewall; NAT Gateway; Cloud WAN return path | No direct access to Internal DMZ or Private/Data Tiers |
| **Internal DMZ** | Cloud WAN or TGW Attachment route                                  | No direct Internet or NAT access                       |
| **Private**      | Route to NAT Gateway or Internal DMZ tier                          | No direct access to IGW or External DMZ                |
| **Data**         | Route to Private tier or Internal DMZ                              | Must not allow egress; isolated tier                   |
| **Compute**      | NAT via Private or directly through Data → Private → NAT           | Enforced path for Kubernetes workloads                 |

> **Note:** All tiers disallow Internet access except via NAT → Firewall → EIP path.

## Blackhole Routes

Blackhole CIDRs are used to enforce network segmentation and ensure non-routable spaces are not mistakenly addressed. These CIDRs are inserted into tenant VPC route tables and are sourced directly from AWS IPAM reserved blocks.

| Use Case                 | CIDR Used    | Enforced In        |
|--------------------------|--------------|--------------------|
| Tenant Prod Blackhole    | 10.0.0.0/9   | TenantNonProd      |
| Tenant NonProd Blackhole | 10.128.0.0/9 | TenantProd         |
| Reserved Non-Routable    | 240.0.0.0/4  | Expanded VPC Tiers |

## Routing for Specific VPC Classes

### Ingress VPC Routing

- IGW → Edge Firewall → External DMZ → Internal DMZ → Cloud WAN
- All traffic destined for internal services must enter through this path
- Return traffic uses NAT in External DMZ → Edge Firewall → EIP

### Egress VPC Routing

- Internal DMZ → NAT Gateway (External DMZ) → Edge Firewall → IGW
- Return flow is symmetrical
- DNS resolvers are deployed in External DMZ for consistent outbound name resolution

### Private Connection & Hybrid VPCs

- Cloud WAN → Internal DMZ → Private Tier (VPN/DirectConnect/Endpoint)
- Only VPN/DX CIDRs allowed in return path
- DNS resolver integration for split-horizon routing

### Local VPCs

- Follow strict tiered path for ingress, egress, and east/west flow
- No IGW in local VPCs; all egress via shared NAT in central egress VPC
- Expanded variants leverage 240/4 CIDR for compute isolation

## Routing Governance

- **Route tables are version-controlled via Terraform modules.**
- **No route table may be edited manually.**
- All changes require contract-compliant updates and pre-deployment validation.
- NAT Gateways and Firewalls must not be bypassed by any static route.

## Enforcement Techniques

- ACLs and Security Groups are paired with routing to ensure enforcement.
- Blackhole routes reinforce CIDR isolation per segment.
- Cloud WAN segment allow-lists and TGW propagations ensure control plane symmetry.
- Route table modules perform validation on tiered structure and destination safety.

## Observability and Validation

- All route table states are validated pre-deployment.
- Drift detection tooling ensures route tables are not modified post-provisioning.
- Route changes are logged and mapped to segment-level change logs.

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
