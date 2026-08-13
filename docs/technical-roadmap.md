# Technical Roadmap

## Purpose

This document records technical and product work that is intentionally outside
the current implementation scope. It is a durable planning reference, not a
statement that every item must be implemented exactly as written.

## Deferred Infrastructure Work

The following items are explicitly deferred to preserve the current local
testing setup. They must remain unchanged until a separate change is approved.

### Externalize database credentials

Move database credentials out of `application.yaml` and supply them through an
environment-specific secret mechanism. Keep the current values unchanged until
the deployment environments and secret source are defined.

### Externalize JWT signing keys

Move the JWT private key out of main application resources and remove any
production fallback to a bundled private key. Define key distribution,
rotation, and recovery procedures before making this change.

### Introduce versioned database migrations

Convert the base and authentication SQL scripts into an ordered Flyway,
Liquibase, or equivalent migration history. Decide how existing local and
shared databases will be baselined before enabling automatic migration.

### Standardize database-session UTC

Configure the database session and JDBC behavior to use UTC consistently, then
verify timestamp reads, writes, comparisons, and audit data across supported
environments.

## Recommended Delivery Sequence

### 1. Tenant Administration vertical slices

Tenant Administration is delivered incrementally instead of as one large
change. Tenant Bootstrap provides the authenticated first-tenant creation path,
the initial active Tenant Admin membership, and its privileged system-role
grant. Role Management and the read-only permission catalogue are also
delivered. They provide custom-role lifecycle, atomic permission grants, and
role data scopes. Effective Access reads these database-backed grants without
JWT access lists.

The Membership Join Request slice is delivered. It includes authenticated
user-initiated submission to an available tenant, tenant-scoped request review,
approval and rejection, and atomic initial custom-role assignment. Approval
creates an active membership or reactivates a previously removed membership,
replaces any retained role assignments, and resolves the request in the same
transaction.

The following Tenant Administration capabilities remain explicitly deferred:

1. Tenant-originated invitations.
2. Direct role-assignment management after onboarding, including adding,
   replacing, expiring, or removing assignments independently of approval.
3. General membership lifecycle operations such as suspension, explicit
   reactivation, and removal.
4. Tenant Admin promotion or demotion through a dedicated privileged policy.
5. Team Management, including team hierarchy, team membership, and `TEAM` or
   `TEAM_TREE` scope administration.
6. Platform-operator tenant provisioning under a platform-level authorization
   boundary.
7. Broader tenant details, status, plan, region, retention, and settings
   administration.

These roadmap items are planning references, not implemented API contracts.

### 2. Current tenant access context

Current Tenant Access Context is delivered through `GET /api/access/me`. It
returns the selected active membership, effective permission codes, and global
or entity-specific data scopes directly from current database authorization
state. JWTs remain identity and session tokens and do not carry access lists.

Invitation, direct post-onboarding role-assignment, membership-lifecycle, and
team APIs remain future Tenant Administration slices. Atomic initial
custom-role assignment is delivered only as part of user-initiated membership
approval; it is not a general role-assignment API.

### 3. Account vertical slice

The core Account vertical slice is delivered. It establishes the tenant-owned
CRM access pattern: mandatory tenant context, functional permission, data
scope, tenant-filtered queries, optimistic concurrency, and soft-delete
filtering.

Account Relationship is delivered after core Account. It manages directed,
history-preserving relationships between scoped active Accounts and reuses the
same Account read/write permission and data-scope model.

Account Communication Channel is delivered after Account Relationship. It
manages scoped Account-owned email, phone, social, and other communication
values with normalization, optimistic concurrency, and soft-delete filtering.

The following Account-adjacent capabilities remain deferred, in this order:

1. Account Address.
2. Contact management, then Contact Communication Channel and Address.
3. Duplicate detection/merge and lifecycle history after concrete rules exist.

### 4. Generic audit execution context

Provide a reusable audit context containing tenant ID, actor ID, trace or
request ID, IP address, and user agent. Introduce it before audit requirements
are duplicated across multiple business modules.

### 5. Transactional outbox

Add a transactional outbox before implementing workflows whose state changes
must reliably publish integration events, especially Lead Conversion and
Opportunity Stage Change.

### 6. Identity schema reconciliation

Reconcile the legacy `identity_provider` and `external_subject` columns with
`platform_user_identities` after schema migration work is authorized. Define a
single source of truth and a safe data-migration path before removing or
deprecating columns.

## Current Authorization Direction

- JWTs identify the user and session; they do not carry permission lists.
- Tenant-owned operations use the current actor and `X-Tenant-ID` context.
- Functional permission and data scope are evaluated together through the
  foundation authorization boundary.
- Repository queries must still filter records by tenant and the authorized
  scopes returned by that boundary.
