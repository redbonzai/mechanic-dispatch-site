# Standards: ACL Rules

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard governs the design and enforcement of **Network Access Control Lists (ACLs)** within all Trusted Environments VPCs. ACLs are applied at the subnet level to enforce east-west and north-south traffic isolation between VPC tiers and ensure platform safety, protocol-level control, and compliance with zero-trust principles.

All ACL rules in this standard are implemented bidirectionally where applicable and apply uniformly to both IPv4 and IPv6 traffic. The structure prioritizes *deny-first* logic, followed by *explicit allow rules*, to maintain predictable and auditable behavior across environments.

## Summary

ACLs enforce the following core principles:

- **Tier Isolation**: Prevent unauthorized cross-tier communication.
- **Zero-Trust Posture**: Deny by default, explicitly allow required traffic.
- **Service Port Control**: Only essential application, control, and DNS ports are permitted.
- **Protocol Enforcement**: Specific protocol-level rules ensure audit clarity and intrusion resistance.
- **Ephemeral Port Allowance**: Egress traffic supports AWS services using ephemeral ports.
- **Dual-Stack Compliance**: Both IPv4 and IPv6 are fully enforced with mirrored rules.

## Standard ACL Rule Table

| Rule # | Action | Direction | CIDR           | Protocol | Port       | Description                         |
|--------|--------|-----------|----------------|----------|------------|-------------------------------------|
| 100    | DENY   | BOTH      | Tier 3         | -1       | N/A        | Deny traffic from Tier 1 to Tier 3  |
| 102    | DENY   | BOTH      | Tier 3 (IPv6)  | -1       | N/A        | Deny traffic from Tier 1 to Tier 3  |
| 200    | DENY   | BOTH      | Tier 1         | -1       | N/A        | Deny traffic from Tier 3 to Tier 1  |
| 202    | DENY   | BOTH      | Tier 1 (IPv6)  | -1       | N/A        | Deny traffic from Tier 3 to Tier 1  |
| 1000   | ALLOW  | BOTH      | Local VPC      | -1       | N/A        | Allow intra-VPC traffic             |
| 1000   | ALLOW  | BOTH      | Local VPC IPv6 | -1       | N/A        | Allow intra-VPC traffic (IPv6)      |
| 1010   | ALLOW  | BOTH      | 0.0.0.0/0      | 6        | 80         | Allow HTTP traffic                  |
| 1012   | ALLOW  | BOTH      | ::/0           | 6        | 80         | Allow HTTP traffic (IPv6)           |
| 1020   | ALLOW  | BOTH      | 0.0.0.0/0      | 6        | 443        | Allow HTTPS traffic                 |
| 1022   | ALLOW  | BOTH      | ::/0           | 6        | 443        | Allow HTTPS traffic (IPv6)          |
| 1030   | ALLOW  | BOTH      | 0.0.0.0/0      | 6        | 53         | Allow DNS TCP requests              |
| 1032   | ALLOW  | BOTH      | 0.0.0.0/0      | 17       | 53         | Allow DNS UDP requests              |
| 1034   | ALLOW  | BOTH      | ::/0           | 6        | 53         | Allow DNS TCP requests (IPv6)       |
| 1036   | ALLOW  | BOTH      | ::/0           | 17       | 53         | Allow DNS UDP requests (IPv6)       |
| 2000   | ALLOW  | BOTH      | 0.0.0.0/0      | 6        | 6443       | Allow Kubernetes API traffic        |
| 2002   | ALLOW  | BOTH      | ::/0           | 6        | 6443       | Allow Kubernetes API traffic (IPv6) |
| 3000   | ALLOW  | BOTH      | 10.0.0.0/8     | -1       | N/A        | Allow RFC1918 (Class A) traffic     |
| 3002   | ALLOW  | BOTH      | fc00::/7       | -1       | N/A        | Allow local-use address (IPv6)      |
| 3010   | ALLOW  | BOTH      | 172.16.0.0/12  | -1       | N/A        | Allow RFC1918 (Class B) traffic     |
| 3020   | ALLOW  | BOTH      | 192.168.0.0/16 | -1       | N/A        | Allow RFC1918 (Class C) traffic     |
| 3030   | ALLOW  | BOTH      | 100.64.0.0/10  | -1       | N/A        | Allow CGNAT source range traffic    |
| 5000   | ALLOW  | EGRESS    | 0.0.0.0/0      | 6        | 1024-65535 | Allow TCP ephemeral ports           |
| 5002   | ALLOW  | EGRESS    | ::/0           | 6        | 1024-65535 | Allow TCP ephemeral ports (IPv6)    |

## Tier Definitions

Each Trusted Environment VPC uses tier-based subnetting, which this ACL standard references:

- **Tier 1**: Compute or Internal Workload tier
- **Tier 2**: Data and Service tier
- **Tier 3**: External-facing Load Balancer tier (DMZ)

ACLs enforce strict directionality and isolation between these tiers. No tier may bypass the expected communication flow.

## Protocol Reference

| Name | Code | Description                                       |
|------|------|---------------------------------------------------|
| ALL  | -1   | Match all protocols                               |
| ICMP | 1    | Internet Control Message Protocol (ping, trace)   |
| TCP  | 6    | Transmission Control Protocol (HTTP, HTTPS, etc.) |
| UDP  | 17   | User Datagram Protocol (DNS, DHCP, etc.)          |

## Enforcement & Automation

- All ACL rules are provisioned via pipeline automation using infrastructure-as-code.
- Rule numbers are reserved and must not be altered without a change request.
- IPv4 and IPv6 rules are required in parallel to meet dual-stack requirements.
- ACLs are applied to all subnet tiers in **both directions**.
- Ingress and Egress VPCs follow the same enforcement model, but include additional firewall rules for deep inspection.

## Governance & Change Control

| Change Type     | Review Process                 | Examples                                 |
|-----------------|--------------------------------|------------------------------------------|
| Structural      | Contract Review Board (CRB)    | Adding or removing rule sets             |
| Protocol Update | Security & Architecture Review | Adding new protocol or port              |
| Documentation   | Standard Review Process        | Improving clarity, updating descriptions |

Changes to ACL definitions must undergo peer review and impact analysis to ensure continued security posture and regulatory compliance.

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
