# Standards - Egress

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard defines how NAT Gateways and egress policies are implemented across the Trusted Environments Global Network. It ensures that all internet-bound traffic is inspected, controlled, and predictable, and that NAT resources are properly isolated, tagged, and integrated into the multi-tier VPC architecture.

## Summary

NAT Gateways serve as the translation layer for private subnets to reach the public internet, enforcing predictable, auditable egress paths for workload traffic. This standard defines their use in both centralized (shared) and local (per-account) VPC configurations.

## Egress Control Principles

The Global Network enforces the following principles for NAT and egress traffic:

- **All Internet-bound traffic must pass through a NAT Gateway.**
- **NAT Gateways must route through Network Firewall inspection (Edge Firewall).**
- **Each AZ must have its own NAT Gateway to preserve high availability and route symmetry.**
- **Each NAT Gateway must use a dedicated, reserved Elastic IP.**
- **Only ports 80, 443, and 6443 are permitted outbound, with optional port ranges for platform tooling.**
- **DNS traffic (TCP/UDP port 53) is explicitly allowed and inspected.**
- **Ephemeral ports (1024–65535) are only allowed in the egress direction.**

## Deployment Architecture

### Ingress/Egress VPCs

- NAT Gateways are deployed in the **External DMZ Tier**, isolated by ACLs from CWAN and internal subnets.
- Each NAT Gateway is paired with a dedicated **Firewall Subnet** per AZ.
- Return traffic follows a deterministic route: **Private Subnet → NAT Gateway → Firewall → EIP**.

### Local VPCs (Expanded Tier Only)

- Local VPCs that adopt the **Expanded Tier Model** receive internal NAT Gateways.
- These NAT Gateways do not use EIPs and are routed to the central firewall via Cloud WAN and centralized egress VPCs.

## NAT Gateway IP Allocation

| NAT Type            | CIDR Source      | IP Type     | Notes                                      |
|---------------------|------------------|-------------|--------------------------------------------|
| Central Egress NAT  | External DMZ     | EIP         | Dedicated EIP per AZ, fixed and allowlisted |
| Internal NAT (Local)| 240.0.0.0/4 Pool | Private     | Used in expanded tier; no internet access   |

## Elastic IP Allocation Rules

- All central NAT Gateways must use **pre-allocated EIPs** from a reserved pool.
- Each EIP must be assigned a meaningful name and tag identifying:
  - The AZ
  - The environment
  - The purpose (egress-nat)

## Security and ACL Controls

- ACLs between tiers ensure NAT Gateway traffic flows through the correct firewall inspection layers.
- NAT Gateways do not allow inbound traffic.
- Ephemeral return traffic is restricted to known port ranges.

## Compliance & Observability

- All NAT Gateways must have flow logs enabled.
- Logs must be routed to a centralized S3 bucket with encryption and lifecycle policies.
- NAT usage and egress behavior must be continuously monitored via:
- VPC Flow Logs
- AWS CloudWatch Metrics
- Route 53 Resolver Query Logs (if applicable)

## Audit Requirements

- NAT Gateway usage must be verifiable by CIDR, AZ, and VPC.
- Flow logs must demonstrate that all egress paths traverse the inspection layer.
- EIP assignments must be reconciled against the reserved allocation pool.

## Exceptions

- Temporary bypass of NAT or egress firewalling must be approved via formal Security Exception Request (SER) and reviewed quarterly.
- DNS resolvers within the VPC may bypass NAT only if traffic is restricted to TCP/UDP 53 and directed to approved destinations.

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
