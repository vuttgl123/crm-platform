# Tenant Bootstrap Vertical Slice Design

## Context

The backend currently supports authentication and tenant-aware Account
authorization, but a newly registered user has no tenant membership. Without a
membership, the user cannot supply a valid `X-Tenant-ID`, use tenant-owned
business APIs, or receive an explicit privileged role grant for future access
management APIs.

The database already contains the required tenant, membership, role,
permission, and user-role tables. The authorization foundation already resolves
the current actor from the access token and evaluates permissions from current
database state. The missing capability is a safe, one-time bootstrap path that
creates the first tenant and its initial administrator access atomically.

This design follows the business references for UC-PLT-001, UC-PLT-002, and
UC-PLT-004 where they match the current implementation. The schema and existing
authorization behavior remain the technical source of truth.

## Decision Summary

Add a dedicated `com.crm.platform.tenant` vertical slice with one authenticated
endpoint:

```http
POST /api/tenants
```

Only an active user without any non-removed tenant membership may call this
bootstrap operation successfully. The operation creates, in one transaction:

1. an active tenant;
2. an active Tenant Admin membership for the current actor;
3. an active tenant-scoped system role with code `TENANT_ADMIN`;
4. an explicit `platform_user.manage` grant for that system role; and
5. a non-expiring assignment of the system role to the current actor.

The access token remains identity-only. No role, permission, membership, or
data-scope claim is added to the JWT.

## Goals

- Allow a newly authenticated user to create the first usable tenant without
  manual database changes.
- Make the creator an active tenant administrator immediately.
- Give the creator an explicit active grant for the privileged
  `platform_user.manage` permission required by future access-management APIs.
- Preserve tenant isolation and current database-backed authorization rules.
- Serialize concurrent bootstrap attempts for the same user.
- Roll back every bootstrap record if any part of the operation fails.
- Keep the implementation isolated from the Identity bounded context.
- Add the implemented API contract to `docs/api-reference.md` in the same
  implementation task.

## Non-Goals

This slice does not implement:

- tenant detail, list, update, status-transition, or deletion endpoints;
- creation of a second tenant by a user with a non-removed membership;
- membership invitations, activation, suspension, or removal;
- team or team-tree management;
- role, permission, assignment, or data-scope management endpoints;
- subscription, plan, data-region, retention, or tenant metadata management;
- idempotency-key infrastructure;
- database schema or migration changes;
- JWT, signing-key, datasource, or environment-configuration changes; or
- frontend work.

## Architectural Boundary

The new slice follows the existing pragmatic vertical-slice structure:

```text
com.crm.platform.tenant
├── application
│   ├── command
│   ├── dto
│   ├── port
│   ├── service
│   └── usecase
├── domain
├── infrastructure
│   └── persistence
└── presentation
    └── web
```

### Presentation

`TenantBootstrapController` owns the HTTP endpoint. Request and response types
are web contracts, and `TenantWebMapper` maps them to and from application
types. The controller does not accept an actor ID or tenant ID from the client.

### Application

`TenantBootstrapFacade` is the use-case contract.
`TenantBootstrapApplicationService` owns eligibility checks, domain creation,
transaction boundaries, and persistence orchestration. It uses the existing
`CurrentActor`, `IdentifierGenerator`, and `TimeProvider` abstractions.

`TenantBootstrapRepository` is the application port for locking the actor,
checking membership eligibility, checking the required permission catalogue
entry, and inserting bootstrap records.

### Domain

The domain contains the tenant aggregate and focused types such as `Tenant`,
`TenantStatus`, and `TenantErrorCode`, and it reuses the existing shared-kernel
`TenantId`. The aggregate owns tenant field normalization, required-field
rules, initial status, timestamps, actor audit values, and version
initialization. It does not own authentication or SQL concerns.

### Infrastructure

`JdbcTenantBootstrapRepository` implements the persistence port with
`JdbcClient`. It uses named parameters for every value and keeps every tenant
or role operation explicitly tenant-scoped.

## API Contract

### Create the first tenant

```http
POST /api/tenants
Authorization: Bearer <access-token>
Content-Type: application/json
```

The caller must omit `X-Tenant-ID`. A tenant context does not exist yet, and a
supplied tenant header is still subject to the existing active-membership
filter.

Request example:

```json
{
  "tenantCode": "example-company",
  "legalName": "Example Company Limited",
  "displayName": "Example Company",
  "defaultCurrencyCode": "USD",
  "defaultCountryCode": "VN",
  "defaultLanguageCode": "vi",
  "defaultTimezone": "Asia/Ho_Chi_Minh"
}
```

### Request fields

| Field | Required | Validation and behavior |
|---|---|---|
| `tenantCode` | Yes | Trimmed, non-blank, maximum 320 characters, globally unique under current database uniqueness semantics |
| `legalName` | Yes | Trimmed, non-blank, maximum 255 characters |
| `displayName` | Yes | Trimmed, non-blank, maximum 255 characters |
| `defaultCurrencyCode` | Yes | Exactly three uppercase ASCII letters |
| `defaultCountryCode` | Yes | Exactly two uppercase ASCII letters |
| `defaultLanguageCode` | No | Defaults to `en`; maximum 10 characters and must match `[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*` |
| `defaultTimezone` | No | Defaults to `UTC`; must resolve through Java `ZoneId` and contain at most 255 characters |

The request does not accept `status`, `planCode`, `dataRegion`,
`retentionDays`, or `metadata`. A bootstrap tenant always starts as `ACTIVE`.

### Success

- Status: `201 Created`
- Body: tenant bootstrap response
- Side effects: tenant, membership, system role, permission grant, and role
  assignment are committed together

```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "tenantCode": "example-company",
  "legalName": "Example Company Limited",
  "displayName": "Example Company",
  "status": "ACTIVE",
  "defaultCurrencyCode": "USD",
  "defaultCountryCode": "VN",
  "defaultLanguageCode": "vi",
  "defaultTimezone": "Asia/Ho_Chi_Minh",
  "tenantAdmin": true,
  "createdAt": "2026-08-10T10:00:00Z",
  "version": 1
}
```

The response does not expose internal membership, role, or role-assignment
identifiers. After success, `GET /api/auth/me` returns the new active tenant
membership.

## Authentication and Bootstrap Eligibility

The endpoint requires a valid Bearer access token through the existing
`.anyRequest().authenticated()` security rule. It does not require a tenant
context or a named business permission because those cannot exist before the
first tenant is created.

The application service obtains the actor from `CurrentActor`. The request
cannot choose another user. The repository locks the corresponding
`platform_users` row and verifies that the user is still `ACTIVE` before any
insert.

Bootstrap is allowed only when the user has no membership row whose status is
`INVITED`, `ACTIVE`, or `SUSPENDED`. Historical `REMOVED` memberships do not
block creation of a new first accessible tenant.

This is deliberately a one-time self-service path. Users with an accessible or
pending tenant relationship must use future tenant-administration processes
instead of creating another tenant through this endpoint.

## Initial Administrator Access

Setting `platform_tenant_memberships.is_tenant_admin` to `true` is necessary
but not sufficient. The existing permission checker gives Tenant Admin an
implicit grant only for catalogue permissions with risk level `NORMAL`.
`platform_user.manage` is `PRIVILEGED`, so bootstrap must also create an
explicit role grant.

The initial role has these fixed server-owned values:

| Field | Value |
|---|---|
| `role_code` | `TENANT_ADMIN` |
| `name` | `Tenant Administrator` |
| `is_system` | `true` |
| `status` | `ACTIVE` |
| `version` | `1` |

The role receives `platform_user.manage`. The creator receives the role with
`valid_from` equal to the bootstrap timestamp and `valid_to` equal to `null`.
The permission catalogue entry must already exist in
`platform_permissions`; the existing SQL seed remains responsible for that
catalogue.

No role data scopes are created in this slice. The existing data-scope resolver
already gives a validated active Tenant Admin the `TENANT` scope. Future role
management may add explicit scopes for non-admin roles.

## Atomic Transaction Flow

`TenantBootstrapApplicationService` is transactional and performs this
sequence:

1. Require the current actor ID.
2. Lock the actor's `platform_users` row with `SELECT ... FOR UPDATE`.
3. Require the locked user to be `ACTIVE`.
4. Query for any `INVITED`, `ACTIVE`, or `SUSPENDED` tenant membership and deny
   bootstrap if one exists.
5. Require the `platform_user.manage` catalogue entry to exist.
6. Build the initial tenant and system-role identifiers using
   `IdentifierGenerator` and obtain one shared timestamp from `TimeProvider`.
7. Insert the tenant.
8. Insert the active Tenant Admin membership.
9. Insert the active system role.
10. Insert the role-permission grant.
11. Insert the non-expiring user-role assignment.
12. Return tenant details after all writes succeed.

Any exception rolls back all five inserted records. Audit actor values use the
current actor ID, and all creation/effective timestamps use the same captured
instant.

## Concurrency and Consistency

The user-row lock serializes bootstrap attempts for one user. A concurrent
second request waits for the first transaction, then observes the committed
membership and returns `TENANT_BOOTSTRAP_NOT_ALLOWED` instead of creating a
second tenant.

The database unique constraint on `platform_tenants.tenant_code` remains the
final authority for concurrent requests from different users using the same
code. A `DuplicateKeyException` from that constraint is translated to
`TENANT_CODE_ALREADY_EXISTS` and the transaction rolls back.

All SQL uses named parameter binding. No request field is concatenated into an
SQL statement. Tenant-owned role, grant, membership, and assignment writes all
include the newly created tenant ID explicitly.

## Error Contract

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | A request field is missing or invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing, invalid, expired, or otherwise rejected |
| `403` | `ACCESS_DENIED` | The authenticated user no longer exists as an active user |
| `409` | `TENANT_CODE_ALREADY_EXISTS` | The tenant code already exists |
| `409` | `TENANT_BOOTSTRAP_NOT_ALLOWED` | The user has an `INVITED`, `ACTIVE`, or `SUSPENDED` membership |
| `500` | `INTERNAL_ERROR` | Bootstrap infrastructure is inconsistent, including a missing required permission catalogue entry |

`TenantErrorCode` owns the two stable tenant-specific conflict codes and their
message keys. English and Vietnamese bundles receive synchronized messages.
Existing common error handling continues to own validation, authentication,
access-denied, and unexpected failures.

The endpoint is not idempotent. A repeated call after success returns
`TENANT_BOOTSTRAP_NOT_ALLOWED`. If a client loses the successful response, it
can call `GET /api/auth/me` to discover the committed active membership.

## API Documentation

The implementation task must update `docs/api-reference.md` at the same time as
the endpoint. The reference must document:

- the endpoint index entry;
- the absence of `X-Tenant-ID` during bootstrap;
- every request and response field;
- defaults and validation constraints;
- authentication requirements;
- transaction side effects;
- error codes and status codes; and
- safe examples containing no real tokens, credentials, personal data, or
  signing material.

The API reference must not document future tenant, membership, team, or RBAC
management endpoints until they are implemented.

## Verification Strategy

Repository rules prohibit running tests, builds, the application, database
checks, or manual API calls unless the user explicitly authorizes them in a
later request. Implementation verification therefore remains static:

- inspect the controller, DTO validation, mapper, application flow, and error
  mappings against this contract;
- verify the transaction boundary covers every bootstrap write;
- verify the user lock precedes the membership eligibility query;
- verify every SQL value uses named parameter binding;
- verify tenant IDs are present in all tenant-owned writes;
- verify the permission catalogue check and fixed system-role values;
- verify English and Vietnamese messages remain synchronized;
- verify `docs/api-reference.md` describes only implemented behavior; and
- run `git diff --check` on the scoped changes.

The user-owned runtime checklist is:

1. register or log in as an active user with no memberships;
2. bootstrap a tenant and receive `201 Created`;
3. call `GET /api/auth/me` and observe the active Tenant Admin membership;
4. call bootstrap again and receive `409 TENANT_BOOTSTRAP_NOT_ALLOWED`;
5. use a different eligible user with the same tenant code and receive
   `409 TENANT_CODE_ALREADY_EXISTS`; and
6. use the returned tenant ID as `X-Tenant-ID` for protected tenant APIs.

## Acceptance Criteria

1. A valid authenticated active user with no non-removed membership can create
   one active tenant.
2. The creator receives an active membership with `is_tenant_admin=true`.
3. The creator receives an active non-expiring `TENANT_ADMIN` system role with
   an explicit `platform_user.manage` permission grant.
4. No user ID, actor ID, membership status, role code, permission code, tenant
   status, audit field, or version can be overridden by the request.
5. Concurrent requests by one user cannot create two tenants.
6. Duplicate tenant codes produce a stable conflict response.
7. Any failed write leaves no partial bootstrap data.
8. Existing authentication, JWT claims, Account authorization, configuration,
   signing keys, and database schema remain unchanged.
9. The English API reference and bilingual error messages match the
   implemented contract.

## Follow-Up Delivery Sequence

After Tenant Bootstrap, delivery can proceed through separate reviewed specs:

1. Access Management: permission catalogue reads, role CRUD, permission and
   data-scope configuration, role assignment, and effective-access views.
2. Membership Management: invitation and membership lifecycle operations.
3. Team Management: team hierarchy and membership required by `TEAM` and
   `TEAM_TREE` scopes.
4. Broader Tenant Administration: tenant details, status transitions, plan,
   region, retention, and settings.
