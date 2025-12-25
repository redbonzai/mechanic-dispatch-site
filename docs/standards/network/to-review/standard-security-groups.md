# Standards - Security Groups and Rules

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard defines the authoritative rules, patterns, and enforcement mechanisms for Security Groups (SGs) within the Trusted Environments platform. Security Groups serve as the **stateful, instance-level firewall**, complementing the stateless subnet-level enforcement provided by Network ACLs. Together, these mechanisms ensure tier isolation, least-privilege communication, and defense-in-depth within and across VPCs.

## Summary

Security Groups enforce **zero-trust** access by default and only permit explicitly allowed protocols and ports for inbound and outbound communication. This standard governs:

- Tier-based traffic segmentation
- Port/protocol scoping by workload type
- Rules for ingress, egress, and hybrid traffic
- Cloud WAN attachment policies
- Enforcement patterns across IPv4 and IPv6
- Automation and lifecycle governance

All Security Group rules must follow infrastructure-as-code patterns and are enforced via pipeline provisioning.

## Enforcement Principles

| Principle                     | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| **Deny by Default**           | No ingress or egress traffic is permitted unless explicitly allowed.       |
| **Stateful Inspection**       | Return traffic for allowed connections is automatically permitted.         |
| **Tier Isolation**            | Rules must be defined per VPC tier to prevent lateral movement.            |
| **Protocol Scoping**          | Only required ports and protocols may be opened.                           |
| **Dual-Stack Compliance**     | All rules must be mirrored for IPv4 and IPv6 workloads.                    |
| **Per-Workload Targeting**    | Security Groups must be applied to individual interfaces or groups of like workloads. |

## Tier-Based Rule Patterns

| Tier            | Ingress Rules                                  | Egress Rules                                   |
|-----------------|--------------------------------------------------|------------------------------------------------|
| **External DMZ** | Allow: HTTP (80), HTTPS (443), Kube API (6443)  | Allow: Local VPC, CGNAT, RFC1918, public DNS   |
| **Internal DMZ** | Allow: Load Balancer traffic from DMZ           | Allow: CWAN attachments, NAT Gateway, egress   |
| **Data Tier**    | Allow: Internal app/service ports only          | Allow: AWS-managed services (e.g., RDS, S3)    |
| **Compute Tier** | Allow: Ingress from Load Balancers              | Allow: Egress to app tier, DNS, control plane  |

> Note: All inter-tier security group rules must be scoped to CIDRs or security group references for enforceable boundaries.

## Standard Ports & Protocols

| Service Type       | Protocol | Port(s)     | Direction | Notes                                        |
|--------------------|----------|-------------|-----------|----------------------------------------------|
| HTTP               | TCP      | 80          | Ingress   | External Load Balancer                       |
| HTTPS              | TCP      | 443         | Ingress   | TLS passthrough to internal workloads        |
| Kubernetes API     | TCP      | 6443        | Ingress   | From centralized ingress to cluster endpoint |
| DNS                | TCP/UDP  | 53          | Egress    | To VPC resolver or external DNS              |
| Ephemeral Response | TCP      | 1024-65535  | Egress    | For service responses                        |
| AWS Metadata (IMDS)| TCP      | 80/443      | Egress    | Block unless explicitly needed (optional)    |

## Special Use Rules

### 1. **Cloud WAN Attachments**

- Attachments must be restricted to **Network Services VPCs** only.
- Propagation and association must be controlled via CWAN policies.
- Security Groups should allow only traffic from known CIDRs or trusted Security Group references.

### 2. **PrivateLink / VPC Endpoint**

- Endpoint Security Groups must allow connections on endpoint service ports (443, 80, 3306, etc.).
- Access must be scoped to consuming VPC CIDRs or Security Groups.

### 3. **Hybrid Connectivity (VPN, DX)**

- Limit ingress/egress to on-prem ranges only.
- Only required ports per use-case may be opened (e.g., SSH, RDP, JDBC).
- Consider placing SGs behind additional firewall tiers for inspection.

## Governance & Review

| Category           | Rule                                             |
|--------------------|--------------------------------------------------|
| **Naming**          | `sg-${purpose}-${vpc-tier}-${env}`              |
| **Tags**            | Must include: `Name`, `Environment`, `Owner`    |
| **Limitations**     | Max 60 inbound and 60 outbound rules per SG     |
| **Automation**      | SGs must be provisioned and modified via pipeline |
| **Review Process**  | All changes must go through Infrastructure or Security review gates |
| **Audit Logging**   | All Security Group changes must be tracked in IaC repo PR history |

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
