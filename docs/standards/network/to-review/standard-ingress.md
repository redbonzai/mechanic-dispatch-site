# Standards - Ingress

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---
This standard defines the authoritative structure and operational model for all **Ingress VPCs** within the Trusted Environments Global Network. It enforces strict security, deterministic routing, and scalable access patterns to ensure all external traffic enters the platform safely, predictably, and auditable at scale.

## Summary

Ingress VPCs provide controlled entry points for all traffic originating outside the Trusted Environment. These VPCs enforce Zero Trust principles through tiered subnet architecture, stateless inspection with AWS Network Firewall, TLS passthrough handling, and strict egress and return-path controls. All ingress traffic is routed through the Cloud WAN `NetworkServices` segment, ensuring regional independence while maintaining global consistency.

Ingress VPCs are deployed regionally and support up to four Availability Zones.

## Design Overview

Ingress VPCs follow a **three-tier architecture**:

1. **Firewall Tier** – Subnets hosting the AWS Network Firewall (Edge Firewall) and dedicated gateway endpoints per AZ.
2. **External DMZ Tier** – Subnets hosting external-facing NLBs/ALBs.
3. **Internal DMZ Tier** – Subnets hosting Cloud WAN attachments that connect to the internal Global Network.

All traffic flows **Inbound → Firewall Tier → External DMZ → Internal DMZ → Cloud WAN attachment**.

## CIDR & Subnet Standards

- **Primary CIDR (/22)** – Used for Firewall and Internal DMZ tiers.
- **Secondary CIDR (/18)** – Used for External DMZ tier; sourced from the `ingress-shared` IPAM pool.
- Subnets are broken into `/20` or `/21` slices to support 3–4 AZ deployments with room for scaling.
- All CIDRs must be allocated from centralized AWS IPAM; no ad hoc ranges permitted.

## Routing Enforcement

- IGW routes all ingress traffic to firewall gateway endpoints by AZ.
- Firewall Tier inspects traffic and forwards it to External DMZ subnets via stateless rule groups.
- External DMZ subnets house NLBs/ALBs which proxy to services routed through Internal DMZ.
- Return traffic is routed through NAT Gateways (per AZ) to Edge Firewall and out via dedicated EIPs.

## Return Traffic Path

All outbound traffic returning to the requester must follow this deterministic path:

1. Internal DMZ (Cloud WAN attachment)  
2. External DMZ (NLB/ALB)  
3. AZ-matched NAT Gateway  
4. Firewall Tier  
5. Edge Firewall gateway endpoint  
6. Dedicated Elastic IP (EIP)

> This guarantees symmetrical pathing and preserves firewall observability.

## Security Enforcement

- ACLs enforce that all traffic from Firewall to Internal DMZ must transit through the External DMZ.
- Only the following ports are allowed across tiers:
  - **80 (HTTP)**
  - **443 (HTTPS)**
  - **6443 (Kube API)**

## Subnet Sharing Behavior

- **Only External DMZ subnets are shared** across the AWS Organization.
- Shared via RAM for direct use by tenant workloads, allowing ingress without requiring VPC peering or IAM access to the Network account.
- Enables direct connectivity to ingress resources from tenant accounts.

## Cloud WAN Attachment

- Ingress VPCs attach to the `NetworkServices` segment in Cloud WAN.
- Segment routing enforces only SharedServices, AWSUtility, and tenant workloads as reachable destinations.
- Traffic must be authorized by ingress firewall rules and NACLs before reaching platform workloads.

## DNS and TLS Behavior

- TLS is passed through the Edge Firewall unmodified until it reaches the NLB/ALB.
- DNS is handled via split-horizon model external to the ingress VPC (see DNS standards).

## Operational Considerations

- NAT Gateways must be AZ-paired with the NLBs to preserve path symmetry.
- Elastic IPs used for outbound return traffic must be allow-listed in strict regulatory environments.
- Ingress VPC deployments are fully pipeline-controlled and versioned.

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
