# Identity and Authorization Hardening Design

## Status

Approved direction. This design deliberately treats the BA package as a
reference for possible product direction rather than a mandatory
implementation specification.

## Objective

Strengthen the existing Java identity and authorization foundation before
adding tenant-owned CRM APIs. The milestone must make authentication state,
permission evaluation, data-scope evaluation, and tenant-dependent access
fail closed and easy for future modules to consume.

The work favors correctness and clear boundaries over feature throughput.

## Explicit Constraints

- Keep `crm/src/main/resources/application.yaml` unchanged.
- Keep the existing JWT key files and key-loading behavior unchanged.
- Keep `docs/crm_mysql80.sql` and `docs/crm_mysql80_auth.sql` unchanged.
- Do not introduce Flyway, Liquibase, or another migration mechanism in this
  milestone.
- Do not add Account, Lead, Tenant Administration, or other business APIs.
- Do not change existing HTTP routes or response contracts.
- Do not run tests, builds, the application, API requests, or database
  requests. The user will perform runtime verification.
- Do not stage or commit files.

## Current Problems Being Addressed

### Authentication state has two different lock concepts

`platform_users.status = LOCKED` and
`platform_user_credentials.locked_until` currently look like competing sources
of truth. The intended distinction is not expressed by the domain API.

### Tenant administrators bypass every permission code

The current permission query succeeds for an active tenant administrator even
when the requested permission is unknown, sensitive, or privileged. This can
make a misspelled permission fail open for tenant administrators.

### Permission and data scope can be evaluated independently

Business access is the intersection of a functional permission and an allowed
data scope. The current `PermissionChecker` and `DataScopeResolver` APIs make it
easy for a future service to call only one side.

### Tenant context is optional at the HTTP identity layer

Authentication endpoints legitimately work without `X-Tenant-ID`, so the
current filter allows an authenticated request to continue without tenant
context. Future tenant-owned operations need a reusable boundary that denies
access when actor or tenant context is absent without forcing tenant context on
login, refresh, logout, or `me`.

## Chosen Design

### 1. Make authentication-state semantics explicit

Keep the existing database values and Java enum unchanged, but define two
different concepts in `UserAccount`:

- `UserStatus.LOCKED` is a persistent administrative account state.
- `lockedUntil` is a temporary credential lockout caused by failed login
  attempts.

Add domain methods with explicit names for these decisions:

- whether the user lifecycle permits authentication;
- whether a temporary credential lockout is active at a supplied instant;
- whether password authentication is currently allowed.

Password login uses the combined lifecycle and temporary-credential decision.
External login, refresh, and current-identity loading use the lifecycle
decision, so a temporary local-password lockout does not invalidate a valid
external identity or an already-issued refresh session. Failed-login handling
continues to update `lockedUntil`; it does not automatically change the
persistent user status.

No database enum or column changes are required.

### 2. Make permission checks fail closed

Refactor `DatabasePermissionChecker` so that:

- missing actor context returns no permission;
- missing tenant context returns no permission;
- null or blank permission codes return no permission;
- the requested permission must exist in `platform_permissions`;
- explicit active role grants continue to authorize the permission;
- a tenant administrator receives an implicit grant only for permissions with
  `risk_level = NORMAL`;
- `SENSITIVE` and `PRIVILEGED` permissions always require an explicit active
  role grant;
- inactive users, memberships, tenants, and roles remain denied;
- expired role assignments remain denied.

`requirePermission` continues to throw Spring Security
`AccessDeniedException`, which the existing exception handler maps to
`403 ACCESS_DENIED`.

Unknown permission codes therefore fail closed for every user, including
tenant administrators.

### 3. Make data-scope resolution fail closed

Refactor `DatabaseDataScopeResolver` so that:

- missing actor or tenant context returns an empty scope set;
- null or blank entity types return an empty scope set;
- tenant-admin scope is granted only when the user, membership, and tenant are
  active;
- role-derived scopes continue to require active roles and effective role
  assignments;
- the existing `OWN`, `TEAM`, `TEAM_TREE`, and `TENANT` model remains intact.

An empty scope set means no data access.

### 4. Introduce one authorization boundary

Add a small foundation service that combines permission and scope evaluation.
Its public operation accepts:

- a functional permission code;
- an entity type used for data-scope resolution.

It performs these actions in order:

1. require the functional permission;
2. resolve effective data scopes;
3. deny access when the resolved scope set is empty;
4. return an immutable authorized-scope result to the caller.

This service becomes the required entry point for future tenant-owned business
operations. Direct `PermissionChecker` and `DataScopeResolver` access remains
available as low-level infrastructure but must not be used independently by
new business application services.

Because both low-level implementations fail closed without actor or tenant
context, calling the authorization boundary without `X-Tenant-ID` results in
`403 ACCESS_DENIED`. Existing authentication endpoints remain unchanged
because they do not call this boundary.

### 5. Preserve existing API contracts

This milestone adds no controller and changes no route, DTO, cookie, JWT claim,
or HTTP response. `docs/api-reference.md` therefore requires no endpoint
contract changes.

## Components and Responsibilities

### `UserAccount`

Owns lifecycle and temporary-lockout decisions. It must not query persistence
or know HTTP details.

### `DatabasePermissionChecker`

Answers only whether the current actor has a functional permission in the
current tenant. It owns the permission-catalog, membership, tenant, role, risk,
and validity SQL rules.

### `DatabaseDataScopeResolver`

Resolves the current actor's allowed record scopes for one entity type in the
current tenant. It does not decide functional permission.

### Authorization boundary

Combines the two low-level decisions and exposes one result that future
application services can safely consume.

### Identity context filter

Continues to establish actor context for authenticated JWT requests and tenant
context only when a valid `X-Tenant-ID` is supplied. It is not changed into a
global tenant requirement because identity endpoints must work without a
tenant.

## Data Flow

For a future tenant-owned operation:

1. Spring Security validates the access token.
2. `CurrentIdentityContextFilter` opens actor context.
3. The filter validates `X-Tenant-ID` and opens tenant context when supplied.
4. The application service calls the authorization boundary.
5. Permission evaluation denies missing/invalid context or unauthorized
   permission.
6. Data-scope evaluation returns the allowed record scopes.
7. The application service passes those scopes to its repository query.
8. The repository additionally filters every query by the current tenant.

This milestone implements steps 4-6. Tenant-owned controllers and repositories
will implement steps 7-8 in later vertical slices.

## Error Handling

- Missing or invalid permission: `403 ACCESS_DENIED`.
- Missing effective data scope: `403 ACCESS_DENIED`.
- Missing actor or tenant context at the authorization boundary:
  `403 ACCESS_DENIED`.
- Existing authentication errors and API responses remain unchanged.
- Unexpected persistence or programming failures continue through the existing
  global error handler.

## Static Verification and User Test Handoff

Codex will perform only read-only static verification:

- inspect the final diff;
- verify no configuration, key, or SQL files changed;
- verify permission SQL requires a known permission and handles risk level;
- verify data-scope SQL validates active user, tenant, and membership;
- verify future business authorization has one combined entry point;
- verify authentication endpoints and API documentation remain unchanged.

The handoff will ask the user to run their preferred Maven build/tests and to
cover at least these scenarios:

- normal user with an explicit active permission grant;
- normal user without the permission;
- tenant administrator requesting a `NORMAL` permission;
- tenant administrator requesting `SENSITIVE` or `PRIVILEGED` permission with
  and without an explicit role grant;
- unknown permission code;
- missing tenant header;
- inactive tenant, user, or membership;
- expired role assignment;
- explicit `OWN`, `TEAM`, `TEAM_TREE`, and `TENANT` scopes;
- temporary credential lockout and persistent `LOCKED` user status.

## Durable Future Roadmap

Create `docs/technical-roadmap.md` during implementation and record these
deferred items so they remain visible after this milestone.

### Explicitly deferred by the user

- Externalize database credentials from `application.yaml`.
- Externalize the JWT private key and remove production key fallback from main
  resources.
- Convert the base and authentication SQL scripts into versioned migrations.
- Configure and verify database-session UTC behavior.

These items must not be changed in the current milestone.

### Recommended next milestones

1. Tenant Administration vertical slice: tenant details, memberships, roles,
   permission assignments, and role validity.
2. Current tenant access-context query for frontend capability rendering,
   without putting permissions in the JWT.
3. Account vertical slice using mandatory tenant context, functional
   permission, data scope, optimistic concurrency, and soft-delete filtering.
4. Generic audit execution context containing tenant, actor, trace/request ID,
   IP address, and user agent.
5. Transactional outbox implementation before Lead Conversion or Opportunity
   Stage Change.
6. Reconcile legacy `identity_provider` and `external_subject` columns with
   `platform_user_identities` when schema migration work is authorized.

## Non-Goals

- Implementing BA-inferred state machines.
- Adding permission claims to access tokens.
- Building platform-administration or CRM CRUD APIs.
- Implementing generic audit or transactional outbox behavior.
- Changing database objects, configuration profiles, secrets, or keys.
