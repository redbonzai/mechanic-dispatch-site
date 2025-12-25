# Standards - Cloud WAN

```bash
Audience: Engineering Teams, Engineering Leadership, Product Owners
Owner: Platform Architecture
Version: 1.0
Date: June 2025
```

[Back to README](../README.md)

---

This standard governs the use of AWS Cloud WAN within the Trusted Environments Global Network. Cloud WAN serves as the routing and segmentation backbone for the AWS Commercial partition, providing centralized control over inter-VPC and inter-region traffic using deterministic constructs.

## Summary

AWS Cloud WAN is the central routing plane for AWS Commercial regions. It enables uniform connectivity across accounts, regions, and workloads by enforcing deterministic segment routing, zero-trust boundaries, and declarative provisioning. This standard defines the required configuration, naming conventions, segment model, and governance controls for operating Cloud WAN in a secure, scalable, and maintainable fashion.

## Cloud WAN Architecture

- **Core Construct**: AWS Cloud WAN Core Network with a deterministic segment model.
- **Routing Control**: Allow Filters are used to govern segment-to-segment routing.
- **Attachment Control**: Tag-based policies are used to restrict which attachments can join a segment.
- **Propagation Control**: Segment sharing rules define routing propagation and attachment visibility.
- **Security Enforcement**: All segment isolation is backed by ACLs and IPAM-based blackhole injection.
- **Operational Model**: Fully declarative provisioning via pipelines.

## Segment Model

| Segment Name          | Description                                                                                       | Workload Class   |
| --------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| SharedServices        | Global platform shared services (DNS, Directory, Security, AD, Shared Tooling)                    | Shared           |
| NetworkServices       | Ingress, Egress, Endpoints, DNS Control Plane                                                     | Shared           |
| AWSUtility            | AWS-managed private service endpoints (e.g., S3, DynamoDB, STS, API Gateway Private Integrations) | Isolated         |
| TenantNonProd[Region] | Non-production tenant workloads                                                                   | Isolated         |
| TenantProd[Region]    | Production tenant workloads                                                                       | Isolated         |
| Inspection[Region]    | Global Firewall Mesh insertion points                                                             | Network Function |

Segment names are regionally expanded using deterministic naming conventions.

## Routing Permissions

Routing between segments is governed using **Allow Filters**. These filters define the only allowed paths between segments:

| Source Segment  | Allowed Routing Destinations                           |
| --------------- | ------------------------------------------------------ |
| SharedServices  | AWSUtility, NetworkServices, TenantNonProd, TenantProd |
| NetworkServices | AWSUtility, SharedServices, TenantNonProd, TenantProd  |
| AWSUtility      | SharedServices, NetworkServices                        |
| TenantNonProd   | SharedServices, NetworkServices                        |
| TenantProd      | SharedServices, NetworkServices                        |

There is **no routing** allowed between:

- TenantProd ↔ TenantNonProd
- Tenant ↔ AWSUtility

## Segment Sharing Rules

These rules define segment sharing behavior across Cloud WAN attachments:

| Segment         | Share Behavior                             |
| --------------- | ------------------------------------------ |
| SharedServices  | Share-All                                  |
| NetworkServices | Share-All                                  |
| AWSUtility      | Share-All Except TenantNonProd, TenantProd |
| TenantNonProd   | Share-All Except AWSUtility, TenantProd    |
| TenantProd      | Share-All Except AWSUtility, TenantNonProd |

## Attachment Policies

All segment attachments are controlled by Cloud WAN's **tag-based policies**. These restrict the ability of a VPC to attach to a specific segment unless explicitly permitted by tags and provisioning pipelines.

- Attachment Tags: `Segment`, `Region`, `Purpose`, `ProvisionedBy`
- Deny-all-by-default strategy

## Blackhole Enforcement

To ensure zero-trust boundaries, Cloud WAN uses segment actions to inject blackhole routes sourced from IPAM:

| Tenant Segment | Blackholed CIDR |
| -------------- | --------------- |
| TenantNonProd  | 10.128.0.0/9    |
| TenantProd     | 10.0.0.0/9      |

These routes prevent unauthorized lateral movement between tenant classes.

## Regional Expansion

All Cloud WAN segments expand regionally based on deterministic naming:

| Region                 | Segment Example      |
| ---------------------- | -------------------- |
| us-east-1 (Commercial) | TenantProdUSEast1    |
| us-west-2 (Commercial) | TenantNonProdUSWest2 |

New regions are added via contract-controlled segment and attachment provisioning. Each region uses **edge-location deployment** to enable Cloud WAN presence.

## Control Plane Enforcement

| Enforcement Area  | Implementation Detail               |
| ----------------- | ----------------------------------- |
| Segments          | Defined in core network schema      |
| Routing Isolation | Allow Filters                       |
| Attachments       | Tag-Based Policies                  |
| Blackholes        | Segment Actions with IPAM CIDRs     |
| Expansion         | Declarative provisioning per region |

## Segment Tagging Standards

All Cloud WAN segments must include the following standardized tags:

| Tag Key           | Description                                       | Example Value                     |
| ----------------- | ------------------------------------------------- | --------------------------------- |
| `Name`            | Human-readable segment name                       | `TenantProdUSEast1`               |
| `Environment`     | Environment classification                        | `prod`, `non-prod`, `shared`      |
| `SegmentType`     | Functional segment category                       | `Tenant`, `Shared`, `Firewall`    |
| `Region`          | AWS Region where the segment is active            | `us-east-1`                       |
| `NetworkBoundary` | Indicates isolation boundary                      | `Tenant`, `Core`, `Platform`      |
| `ManagedBy`       | Owning team or system managing the segment        | `PlatformNetworkingTeam`          |
| `ContractVersion` | Version of the Cloud WAN standards contract       | `v1.0`                            |
| `SegmentScope`    | Whether this segment is global or region-specific | `regional`, `global`              |
| `Lifecycle`       | Lifecycle stage of the segment                    | `active`, `planned`, `deprecated` |

## Contract Compliance

All Cloud WAN configurations must comply with the Global Network Contract. Specifically:

- Only segments listed in the contract may be created.
- Routing filters must follow the approved matrix.
- Segment attachment and sharing must follow policy controls.
- Blackhole routes must always be injected from IPAM pools.

## Operational Requirements

- All segment configuration and attachment logic is version-controlled.
- Changes must go through Contract Review Board (CRB) review.
- No manual attachment or modification of Cloud WAN segments is permitted.
- All automation must validate current contract state before deployment.

## Versioning and Ownership

- This standard is version-controlled and subject to CRB review.
- All changes require coordination with:
  - Platform Networking
  - Platform Engineering
  - Security Engineering

## Compliance

This standard is considered authoritative for all Trusted Environment network enforcement. Any deviation must be explicitly approved, documented, and governed under formal exception review.
