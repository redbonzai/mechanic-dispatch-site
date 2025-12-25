# Standards - Logging

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard defines the required logging and flow monitoring expectations for all Network Services and Global Network VPCs within the Trusted Environments platform. It ensures auditable network observability, facilitates security incident response, supports performance diagnostics, and enforces regulatory compliance across both AWS Commercial and GovCloud environments.

## Purpose

Logging and monitoring of network traffic is a critical control for detecting threats, investigating anomalies, and validating operational correctness. This standard ensures all VPCs and traffic pathways emit consistent, centralized logs with appropriate retention, filtering, and visibility guarantees.

## Scope

Applies to all Network Services VPCs, including:

- Ingress and Egress VPCs
- VPC Endpoint, Utility, and Hybrid Connectivity VPCs
- Local Account VPCs
- Global Transit (CWAN/TGW)
- AWS Firewall tiers
- All subnets, route tables, and gateway-attached resources

## VPC Flow Logs

### Requirements

- **Enabled on all VPCs** with traffic-type set to `ALL`.
- **Retention:** Logs must be retained for **at least 180 days** in Cold Storage (S3 or CloudWatch Logs).
- **Log Destination:** VPC Flow Logs are centralized into a regionally defined **Log Archive account** via a designated IAM role.
- **Aggregation Interval:** 1-minute aggregation for high-fidelity visibility.
- **IAM Role Separation:** Flow log writer roles are managed by the platform team; consumers have read-only roles with scoped queries.

### Filter & Format

- **Traffic Type:** ALL (includes accepted, rejected, and all traffic)
- **Log Format:** Must include `version`, `account-id`, `interface-id`, `srcaddr`, `dstaddr`, `srcport`, `dstport`, `protocol`, `action`, and `log-status`.

### Auditing

- Periodic checks validate Flow Logs are enabled, actively writing, and not misconfigured.
- AWS Config Rules or Security Hub controls must alert if logs are disabled or compromised.

## Gateway Logging

### NAT Gateway

- **Enabled:** NAT Gateway flow logging must be enabled on all gateways.
- **Destination:** Centralized to the same regional log archive.
- **Purpose:** Enables tracing of all internet-bound traffic and return flows through Egress VPCs.

### Transit Gateway

- **Cloud WAN:** Logging must be enabled via **segment actions** into CloudWatch Logs.
- **GovCloud (TGW):** Must use VPC Flow Logs and TGW route table inspection instead of native logging.
- **CloudWatch Metrics:** CWAN and TGW metrics should be emitted for route table hits/misses and propagation changes.

## Firewall Logs

### AWS Network Firewall (Edge & Core)

- **Inspection Logging:** Enabled for both alert and flow log types.
- **Destination:** Sent to centralized S3 or Kinesis Firehose streams for processing.
- **Format:** Suricata-style logs with enriched metadata.
- **Retention:** Minimum 180 days; hot-tier (CloudWatch) retention should match incident response window.

### DNS Firewall

- **Query Logging:** DNS queries blocked or redirected by DNS Firewall must be captured and stored centrally.
- **Correlation:** Logs should include query type, source VPC, and resolver rule ID.

## DNS Resolver Query Logging

- **Enabled on All Outbound Resolvers**
  - Captures both successful and denied resolutions.
  - Logs retained for a minimum of 90 days.
  - Used for detecting suspicious lookups and debugging resolution issues.

## Alerting & Monitoring

### SIEM Integration

- All logs must be forwarded to the organization's Security Information and Event Management (SIEM) platform (e.g., Splunk, Sentinel).
- Must support:
  - **Searchable metadata**
  - **Correlated source IPs and accounts**
  - **Geolocation enrichment** for outbound traffic

### Operational Alerts

- CloudWatch Alarms should monitor for:
  - **Log ingestion failure**
  - **Zero traffic scenarios (blackholes)**
  - **High traffic spikes (DDoS detection)**
  - **Repeated denied connections**

## Logging Standards Enforcement

| Control                            | Enforcement Method                    |
|------------------------------------|----------------------------------------|
| Flow Logs Enabled                  | AWS Config Rule + CI Validation       |
| NAT Gateway Logging                | Terraform Enforcement + CI/CD Checks  |
| DNS Firewall Logging               | Platform Policy Template              |
| AWS Network Firewall Logging       | Platform Pipeline Default              |
| Log Forwarding to SIEM             | Log Archive Integration Enforcement   |

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
