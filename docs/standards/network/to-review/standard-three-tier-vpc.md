# Standards - VPC Architecture

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard is what is used across the Trusted Environments platform to define, enforce, and govern the design of all VPC network topologies that interact with the Global Network. It establishes the foundational structure for all ingress, egress, utility, endpoint, hybrid, and local account VPCs. Adherence to this standard ensures deterministic routing behavior, secure and scalable segmentation, and uniform operational patterns across all AWS partitions. It is the authoritative reference for platform engineers, security reviewers, and infrastructure governance teams to evaluate VPC compliance, support automated provisioning pipelines, and safeguard the integrity of multi-tenant workloads at scale.

## Summary

The Trusted Environments platform defines a standardized three-tier VPC architecture for all network services VPCs. This model provides deterministic routing, segment-based isolation, secure ingress and egress control, and platform-wide consistency. All tiers are designed to support both IPv4 and IPv6, and are provisioned using pipeline-governed infrastructure with integrated IPAM and Cloud WAN segmentation.

The three-tier architecture applies to the following VPC types:

- Centralized Ingress VPC
- Centralized Egress VPC
- Private Connectivity VPCs (VPCe, Hybrid, Utility)
- Local Account VPCs

## Tier Definitions

| Tier Name         | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Firewall Tier** | Frontline tier containing Internet Gateway, Edge Firewall (AWS Network Firewall), and route control for all ingress/egress.                                      |
| **External DMZ**  | Intermediate layer containing ALBs/NLBs or NAT Gateways exposed to firewall tier, but not directly routable from public internet.                                |
| **Internal DMZ**  | Platform-trusted internal tier that connects to Cloud WAN, hosts workloads, or routes to private data/services. Often where attachments or VPN endpoints reside. |

Each tier is designed with scalable, AZ-specific subnets, ACL enforcement, and deterministic flow control.

## Centralized Ingress VPC Standards

- **CIDR Sizing**
  - Primary CIDR: `/22` (used for Internal DMZ + Firewall Tier)
  - Secondary CIDR (Ingress-Shared Pool): `/18` → divided into `/20`s per AZ (External DMZ)
- **Subnets**
  - AZ-based layout with 3–4 Availability Zones
  - One subnet per tier per AZ
- **Routing Flow**
  1. IGW forwards public traffic to Edge Firewall gateway endpoint (per AZ)
  2. Firewall inspects traffic and routes to External DMZ NLB/ALB
  3. NLB/ALB forwards to Cloud WAN attachment in Internal DMZ
  4. Return traffic reverses the same path via AZ-matched NAT Gateway and Edge Firewall

- **Traffic Control**
  - Only ports 80, 443, 6443 allowed through firewall/ACLs
  - All tiers isolated using network ACLs
  - Firewall policy enforces passthrough TLS, logging, and inspection

## Centralized Egress VPC Standards

- **CIDR Sizing**
  - Single `/21` CIDR
  - Each tier is a `/24`, split into `/26` AZ subnets
- **Subnets**
  - AZ-matched NAT Gateways in External DMZ
  - VPC resolvers deployed in External DMZ for public DNS
- **Routing Flow**
  1. Cloud WAN attachment (Internal DMZ) receives traffic from platform
  2. Routes to NAT Gateway in External DMZ (AZ-aligned)
  3. NAT forwards to IGW through Edge Firewall
  4. Edge Firewall enforces egress controls and EIP allocation

- **Return Path**
  1. External site returns to allow-listed EIP (Firewall Tier)
  2. Routed to NAT Gateway (AZ match)
  3. NAT to Internal DMZ
  4. Internal DMZ to originating workload via Cloud WAN

- **Security**
  - Split Horizon DNS resolver IP (fifth IP in each External DMZ subnet) provides public resolution for workloads using private DNS profile
  - ACLs and firewalls isolate all tiers and enforce minimal port access

## Private Connectivity VPC Standards

### Applies To

- VPC Endpoint VPC
- Hybrid VPC (VPN / Direct Connect)
- Utility VPC

- **CIDR Sizing**
  - Standard: `/21` → divided into `/24` (tier) → `/26` per subnet
  - Utility: `/23` → divided into `/26` subnets
- **Tiers**
  - **Internal DMZ**: Contains Cloud WAN attachments or VPN termination
  - **Private**: Contains VPC Endpoints, DX Gateways, or service components
- **Routing**
  - All flow originates or terminates at Cloud WAN (except Utility)
  - Endpoints or VPN tunnels route back to workloads via CWAN
  - Platform DNS resolver endpoints available in each VPC for Split Horizon use

- **Firewall/ACL**
  - Internal tiering and subnet ACLs restrict unauthorized east-west or inbound flow

## Local Account VPC Standards

- **CIDR Sizing**
  - Default: `/22` primary
  - Standard: `/22` primary + `/22` secondary
  - Expanded: `/22` primary + `/22` secondary + `240.0.0.0/16` internal-only NAT
- **Tiers**
  
  | Tier Name    | Description                                                          |
  |--------------|----------------------------------------------------------------------|
  | External DMZ | CWAN attachments                                                     |
  | Private      | Load Balancer Tier (ALB/NLB)                                         |
  | Data Tier    | RDS, Redis, OpenSearch, S3 Gateway access, etc.                      |
  | Compute Tier | General compute workloads (Pods, EC2, Batch). Sizing varies by type. |

- **VPC Types**
  - **Simple**: Uses remaining subnets in `/22`
  - **Standard**: Uses additional `/22` for compute
  - **Expanded**: Adds non-routable CIDR for NATed internal compute + private data

- **Routing**
  - All traffic flows to/from platform via CWAN
  - NAT and firewall enforcement for egress in Expanded mode
  - ACLs and port-based restrictions enforced across all tiers

## Common Standards Across All Three-Tier VPCs

- **Network ACLs**
  - Enforced per tier, allowing only authorized port traffic (80, 443, 6443)
  - No direct cross-tier communication allowed
- **IPAM Integration**
  - CIDRs assigned via centralized IPAM
  - All tiers follow deterministic subnet plans per region and AZ
- **Cloud WAN Attachments**
  - Located in Internal DMZ tiers
  - Governed via segment-based routing contracts
- **Security Enforcement**
  - Edge Firewall and ACLs enforce ingress/egress policies
  - DNS Firewall & Resolver endpoints deployed as needed
- **High Availability**
  - Minimum of 3 AZs required
  - Fault domain isolation for all NAT, NLB, firewall, and CWAN resources

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
