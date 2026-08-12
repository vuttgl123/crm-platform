# Effective Access Read Model Design

**Status:** Approved for implementation planning

**Date:** 2026-08-10

## Purpose

Expose the authenticated user's current, tenant-specific effective access to
frontend clients without placing roles, permissions, or data scopes in JWTs.
The endpoint is a read model for user-interface decisions; existing backend
authorization remains the authority for every protected business operation.

This slice follows Tenant Bootstrap and gives a newly created Tenant Admin an
immediate way to discover the permissions and data-access model that the server
will apply.

## Scope

Implement one authenticated endpoint:

```http
GET /api/access/me
Authorization: Bearer <access-token>
X-Tenant-ID: <tenant-id>
```

The endpoint returns:

- the selected tenant summary;
- the caller's active membership summary;
- sorted effective permission codes;
- global or entity-specific effective data scopes; and
- cache-prevention headers.

This slice does not expose assigned roles, role configuration, the complete
permission catalogue, or administrative mutations.

## Context and Existing Behavior

The current security model already resolves authorization from the database:

- `DatabasePermissionChecker` checks one permission for the current actor and
  tenant;
- `DatabaseDataScopeResolver` resolves scopes for one entity type;
- `CurrentIdentityContextFilter` creates actor and tenant contexts from the JWT
  subject and `X-Tenant-ID`;
- Tenant Admin receives implicit access to catalogue permissions whose risk
  level is `NORMAL`;
- `SENSITIVE` and `PRIVILEGED` permissions require an explicit active role
  grant; and
- Tenant Admin receives implicit `TENANT` data scope.

The frontend cannot currently obtain these effective values. It must not infer
them from JWT claims or hard-code Tenant Admin behavior.

## Chosen Architecture

Create a dedicated `com.crm.platform.access` vertical slice rather than
extending authentication responses or turning the enforcement interfaces into
presentation APIs.

The slice contains:

- an application-facing effective-access use case;
- immutable application read-model records;
- a focused repository port;
- a JDBC read adapter;
- a read-only application service; and
- a controller, response records, and web mapper.

There is no domain aggregate because the feature reads an authorization
projection and performs no state transition.

### Alternatives rejected

#### Extend `GET /api/auth/me`

This would save one request but would couple identity discovery to a selected
tenant context. The existing authentication response intentionally lists all
active memberships and allows no tenant header, while effective access is
meaningful for exactly one selected tenant.

#### Extend `PermissionChecker` and `DataScopeResolver` with bulk response methods

This would avoid a separate read port but would mix enforcement contracts with
frontend projection concerns. The current interfaces remain small and focused
on authorizing operations.

#### Call the existing single-value checkers repeatedly

Enumerating the catalogue and calling `hasPermission` for every code would
produce an avoidable query-per-permission pattern. Resolving each entity type
separately would have the same scaling problem.

## API Contract

### Request

```http
GET /api/access/me
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Both headers are required. The endpoint has no request body, path parameters,
or query parameters.

No named business permission is required because a user may inspect only their
own access within an already validated active tenant membership.

### Success

- Status: `200 OK`
- Header: `Cache-Control: no-store`
- Body: effective-access response

Tenant Admin example:

```json
{
  "tenant": {
    "id": "22222222-2222-2222-2222-222222222222",
    "tenantCode": "example-company",
    "displayName": "Example Company"
  },
  "membership": {
    "status": "ACTIVE",
    "tenantAdmin": true
  },
  "permissions": [
    "crm_account.read",
    "crm_account.write",
    "platform_user.manage"
  ],
  "dataAccess": {
    "defaultScope": "TENANT",
    "entities": {}
  }
}
```

Non-admin example:

```json
{
  "tenant": {
    "id": "22222222-2222-2222-2222-222222222222",
    "tenantCode": "example-company",
    "displayName": "Example Company"
  },
  "membership": {
    "status": "ACTIVE",
    "tenantAdmin": false
  },
  "permissions": [
    "crm_account.read"
  ],
  "dataAccess": {
    "defaultScope": null,
    "entities": {
      "ACCOUNT": [
        {
          "type": "TEAM",
          "teamId": "33333333-3333-3333-3333-333333333333"
        }
      ]
    }
  }
}
```

## Response Semantics

### Tenant

`tenant` contains only the selected tenant ID, tenant code, and display name.
Broader tenant settings, plan, region, retention, and administrative fields
remain outside this endpoint.

### Membership

`membership.status` is `ACTIVE` for every successful response because inactive,
removed, suspended, or missing membership is denied. `tenantAdmin` reflects the
current membership row and is informational; clients still use permissions for
feature authorization.

### Permissions

`permissions` contains only effective permission codes. It does not include
descriptions, modules, risk levels, grant sources, or roles.

The list is distinct and sorted lexicographically so clients receive stable
output independent of SQL row order. An empty list is valid.

### Data access

`dataAccess.defaultScope` is:

- `TENANT` for an active Tenant Admin; or
- `null` for a non-admin user.

When `defaultScope` is `TENANT`, it applies to every entity type and `entities`
is empty. This avoids manufacturing entity keys for current and future modules.

For a non-admin user, `entities` maps each database `entity_type` to a distinct,
stably sorted list of scopes. Each scope contains:

- `type`: `OWN`, `TEAM`, `TEAM_TREE`, or `TENANT`; and
- `teamId`: required for `TEAM` and `TEAM_TREE`, otherwise `null`.

An explicitly assigned entity-level `TENANT` scope remains inside that entity's
list; it does not become the global `defaultScope`.

An empty `entities` object is valid and means that no role-based data scopes
are currently effective.

## Effective Permission Rules

The JDBC adapter performs a bulk permission query using the same predicates as
the existing permission checker.

A permission is effective when the actor, tenant, and membership are active and
either:

1. the membership is Tenant Admin and the catalogue permission has risk level
   `NORMAL`; or
2. an active, non-deleted role has the permission, and the actor has a role
   assignment whose `valid_from` has passed and whose `valid_to` is absent or in
   the future.

The first rule automatically exposes newly catalogued `NORMAL` permissions to
Tenant Admin. The second rule exposes explicit grants at any risk level,
including the bootstrap `platform_user.manage` grant.

Duplicate grants collapse into one permission code.

## Effective Data-Scope Rules

The context query reads `is_tenant_admin` from the validated active membership.
If it is true, the service returns global `TENANT` data access without querying
role data scopes.

For a non-admin user, the JDBC adapter reads all data-scope rows reached through
active, non-deleted roles and currently valid user-role assignments. It applies
the same actor, tenant, membership, user, and tenant status predicates as the
existing data-scope resolver.

Duplicate `(entity_type, scope_type, team_id)` rows collapse before response
mapping.

## Read Flow and Consistency

The application service runs in a read-only transaction and performs this flow:

1. require the current actor;
2. require a current tenant, translating a missing context to access denial;
3. load and validate the active tenant-membership context defensively;
4. load all effective permission codes;
5. return global Tenant Admin data access or load all effective entity scopes;
6. normalize immutable, sorted collections; and
7. map the read model to the HTTP response.

The defensive context query is required even though
`CurrentIdentityContextFilter` already validates the header. A membership or
tenant can change after the filter check, and the read model must not disclose
access for an invalid context.

The read-only transaction keeps the context, permission, and scope reads in one
database snapshot. No server-side cache is introduced, so committed role,
grant, assignment, membership, or tenant changes are visible on the next call.

## Security Boundary

The endpoint is protected by the existing
`.anyRequest().authenticated()` rule. No public matcher is added.

The request cannot select another user. Actor ID comes only from the current
authenticated context, and tenant ID comes only from the validated tenant
context established by `X-Tenant-ID`.

The response is advisory for frontend rendering. A client may use permissions
to hide or disable controls, but every business endpoint continues to call the
backend permission and data-scope enforcement boundary. Possessing a value in
this response never bypasses server authorization.

Role identifiers and role names are intentionally excluded. Frontend feature
checks depend on permission codes rather than role naming conventions.

## Error Contract

| Status | `errorCode` | When |
|---|---|---|
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing, invalid, expired, or otherwise rejected |
| `403` | `ACCESS_DENIED` | `X-Tenant-ID` is missing, malformed, or does not resolve to an active membership and tenant for the caller |
| `500` | `INTERNAL_ERROR` | An unexpected database or server failure occurs |

Cross-tenant, inactive, and absent contexts all use `ACCESS_DENIED`; the
endpoint does not return `404` and does not reveal whether another tenant
exists.

No new stable error code or message-bundle entry is required.

## Caching and Ordering

The controller returns `Cache-Control: no-store` because the response contains
security-sensitive, time-dependent access data.

Permission codes, entity keys, and scope lists use deterministic ordering.
This makes frontend state comparison predictable without implying that the
response is cacheable or versioned.

No ETag, server cache, permission snapshot version, or conditional request is
introduced in this slice.

## API and Roadmap Documentation

Implementation must update `docs/api-reference.md` in the same task with:

- the endpoint-index entry;
- both required headers;
- the complete nested response contract;
- effective permission and data-scope semantics;
- the frontend-advisory warning;
- caching behavior;
- all status and error codes; and
- safe Tenant Admin and non-admin examples.

`docs/technical-roadmap.md` must record Current Tenant Access Context as
delivered while keeping role administration, membership management, team
management, and broader tenant administration as future work.

Documentation must not advertise unimplemented role, permission-catalogue,
membership, team, or tenant-management endpoints.

## Verification Strategy

Repository rules prohibit tests, builds, application startup, database calls,
browser checks, and manual API calls unless the user explicitly authorizes them
later. Implementation verification is therefore static:

- inspect the controller, response records, mapper, service, port, and JDBC
  adapter against this contract;
- verify that the route remains authenticated and requires tenant context;
- verify that the bulk permission predicates match
  `DatabasePermissionChecker`;
- verify that the non-admin scope predicates match
  `DatabaseDataScopeResolver`;
- verify that Tenant Admin receives global `TENANT` scope and no fabricated
  entity keys;
- verify stable distinct ordering for permissions, entity keys, and scopes;
- verify all SQL values use named parameter binding;
- verify `Cache-Control: no-store`;
- verify `docs/api-reference.md` documents only implemented behavior; and
- run whitespace and scoped diff checks.

The user-owned runtime checklist is:

1. bootstrap a tenant and obtain its ID through `GET /api/auth/me`;
2. call `GET /api/access/me` with that tenant ID and receive `200 OK`;
3. confirm the bootstrap Tenant Admin sees `crm_account.read`,
   `crm_account.write`, and the explicit `platform_user.manage` grant;
4. confirm the Tenant Admin response has `defaultScope: TENANT` and an empty
   `entities` object;
5. omit or invalidate `X-Tenant-ID` and receive `403 ACCESS_DENIED`;
6. when non-admin membership and role data are available, confirm only active,
   non-expired grants and scopes are returned; and
7. revoke or expire a grant, call the endpoint again, and confirm the committed
   change is reflected without issuing a new access token.

## Acceptance Criteria

1. An authenticated user with an active selected membership can retrieve their
   effective tenant access through `GET /api/access/me`.
2. The response contains tenant and membership summaries, effective permission
   codes, and the approved global-or-entity data-access shape.
3. Tenant Admin receives implicit `NORMAL` permissions, explicit higher-risk
   grants, and global `TENANT` data access.
4. A non-admin user receives only permissions and entity scopes reached through
   active roles and currently valid assignments.
5. Permission and scope collections are distinct, immutable, and deterministically
   ordered.
6. Missing, invalid, inactive, or cross-tenant context returns
   `403 ACCESS_DENIED` without tenant-existence disclosure.
7. The response contains no roles and no permission catalogue metadata.
8. The endpoint sends `Cache-Control: no-store` and introduces no server cache.
9. Existing JWT claims, authorization enforcement, Tenant Bootstrap, Account
   behavior, key/config files, and database schema remain unchanged.
10. The English API reference and technical roadmap match the implemented
    behavior and do not present future APIs as available.

## Deferred Work

The following remain separate reviewed slices:

- permission-catalogue reads;
- role CRUD and role status transitions;
- permission grants and revocations;
- role data-scope management;
- membership invitation and lifecycle management;
- role assignment and validity management;
- team hierarchy management;
- authorization cache/version design if scale later requires it; and
- broader tenant settings and lifecycle administration.
