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
grant. Keep the remaining order:

1. Access Management for role, permission, data-scope, assignment, and
   effective-access administration.
2. Membership Management for invitation and membership lifecycle operations.
3. Team Management for team hierarchy and `TEAM` or `TEAM_TREE` scopes.
4. Broader Tenant Administration for details, status, plan, region, retention,
   and settings.

These roadmap items are planning references, not implemented API contracts.

### 2. Current tenant access context

Expose the authenticated user's effective tenant membership, capabilities, and
data scopes for frontend rendering. Resolve this information from current
authorization data instead of embedding permission lists in JWTs, so role
changes take effect without waiting for token expiry.

### 3. Account vertical slice

Build the first tenant-owned CRM module using the complete access pattern:
mandatory tenant context, functional permission, data scope, tenant-filtered
queries, optimistic concurrency, and soft-delete filtering. Use this slice to
establish the reusable application and repository conventions for later CRM
modules.

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
