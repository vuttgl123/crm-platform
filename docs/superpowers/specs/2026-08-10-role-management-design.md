# Role Management Design

**Status:** Approved

**Date:** 2026-08-10

## Purpose

Give authorized tenant administrators a stable API for defining custom roles
before membership onboarding is implemented. A role groups functional
permissions and entity-specific data scopes so a later member-assignment slice
can grant useful access atomically by role ID.

Permissions remain a system-owned catalogue. Tenants may inspect permission
metadata and attach permission codes to roles, but they cannot create, update,
or delete permission definitions.

## Scope

Implement these authenticated tenant APIs:

```http
GET /api/permissions
GET /api/roles
GET /api/roles/{id}
POST /api/roles
PUT /api/roles/{id}
DELETE /api/roles/{id}
```

Every endpoint requires:

- a valid Bearer access token;
- an active `X-Tenant-ID` context; and
- effective permission `platform_user.manage`.

The slice includes:

- read-only permission-catalogue access;
- custom-role creation, listing, detail, replacement, inactivation, reactivation,
  and soft deletion;
- complete replacement of a custom role's permission grants;
- complete replacement of a custom role's entity data scopes;
- system-role visibility with immutable mutation behavior;
- optimistic concurrency for update and delete; and
- synchronized API documentation.

The slice does not include member invitation, membership lifecycle, user-role
assignment APIs, team administration, permission mutation, role hierarchy,
role cloning, bulk operations, JWT authorization claims, or schema migration.

## Existing Authorization Model

The current database and authorization foundation already provide:

- a global `platform_permissions` catalogue;
- tenant-owned `platform_roles`;
- role permission grants in `platform_role_permissions`;
- time-bounded user-role assignments in `platform_user_roles`;
- role data scopes in `platform_role_data_scopes`;
- permission enforcement through `DatabasePermissionChecker`;
- data-scope enforcement through `DatabaseDataScopeResolver`; and
- current actor and tenant contexts populated from authentication and
  `X-Tenant-ID`.

Tenant Bootstrap creates an immutable `TENANT_ADMIN` system role and grants it
the privileged `platform_user.manage` permission. The membership's
`is_tenant_admin` flag, rather than a role data-scope row, provides implicit
global `TENANT` data access to a Tenant Admin.

The schema already provides active-role uniqueness for `role_code` through the
functional unique index on tenant ID and the lowercase code of non-deleted
roles. A soft-deleted code can therefore be reused without a schema change.

## Chosen Architecture

Extend the existing `com.crm.platform.access` vertical slice with focused Role
Management components. Keep Effective Access behavior unchanged.

The Role Management components consist of:

- domain types for role identity, status, aggregate state, scope grants, and
  error codes;
- application commands, queries, DTOs, a repository port, and a facade;
- a transactional application service using `CurrentActor`, `CurrentTenant`,
  `PermissionChecker`, `IdentifierGenerator`, and `TimeProvider`;
- a JDBC adapter for permission catalogue reads, role reads, validation reads,
  aggregate writes, grant replacement, and soft deletion; and
- request/response records, a manual web mapper, and controllers.

The role is treated as one aggregate for writes. Role metadata, permission
grants, and data scopes are committed or rolled back together.

Spring-managed transactional and repository classes remain non-final so the
current class-based proxy configuration can advise them.

### Alternatives rejected

#### Separate permission and data-scope sub-resources

Creating a role and then modifying grants through separate HTTP calls permits
partial frontend saves. It also increases client orchestration and complicates
version semantics.

#### Individual grant and revoke commands

Fine-grained commands offer detailed mutation audit events, but they are
unnecessarily complex before the project has generic audit execution context
and transactional outbox support.

#### Tenant-owned permission definitions

Allowing arbitrary permission CRUD would create codes that no backend
operation enforces. Permission definitions remain tied to deployed application
capabilities and are therefore system-owned.

## Permission Catalogue API

### List permissions

```http
GET /api/permissions
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Success:

- Status: `200 OK`
- Body: JSON array
- Ordering: `moduleCode`, then `permissionCode`, both ascending

```json
[
  {
    "permissionCode": "crm_account.read",
    "description": "Read customer accounts",
    "moduleCode": "crm",
    "riskLevel": "NORMAL"
  },
  {
    "permissionCode": "platform_user.manage",
    "description": "Manage tenant memberships and roles",
    "moduleCode": "platform",
    "riskLevel": "PRIVILEGED"
  }
]
```

`riskLevel` is `NORMAL`, `SENSITIVE`, or `PRIVILEGED`. The endpoint is not
paginated because the permission catalogue is a bounded application
configuration set, not tenant-generated business data.

The endpoint is read-only. It exposes no creation, replacement, or deletion
operation for permission definitions.

## Role List API

### List roles

```http
GET /api/roles
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Success:

- Status: `200 OK`
- Body: JSON array
- Includes: non-deleted custom and system roles, both active and inactive
- Ordering: `roleCode`, then role ID, ascending

```json
[
  {
    "id": "55555555-5555-5555-5555-555555555555",
    "roleCode": "SALES_MANAGER",
    "name": "Sales Manager",
    "description": "Manages sales accounts",
    "system": false,
    "status": "ACTIVE",
    "permissionCount": 2,
    "dataScopeCount": 1,
    "updatedAt": "2026-08-10T10:00:00Z",
    "version": 1
  }
]
```

An empty result is `[]`. The list is not paginated because each tenant is
expected to own a small administrative role set. Search and pagination remain
future optimizations if measured usage requires them.

## Role Detail API

### Get a role

```http
GET /api/roles/55555555-5555-5555-5555-555555555555
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Success:

- Status: `200 OK`
- Body: complete role aggregate

```json
{
  "id": "55555555-5555-5555-5555-555555555555",
  "roleCode": "SALES_MANAGER",
  "name": "Sales Manager",
  "description": "Manages sales accounts",
  "system": false,
  "status": "ACTIVE",
  "permissionCodes": [
    "crm_account.read",
    "crm_account.write"
  ],
  "dataScopes": [
    {
      "entityType": "ACCOUNT",
      "type": "TEAM",
      "teamId": "33333333-3333-3333-3333-333333333333"
    }
  ],
  "createdAt": "2026-08-10T10:00:00Z",
  "updatedAt": "2026-08-10T10:00:00Z",
  "version": 1
}
```

Permission codes are distinct and sorted lexicographically. Data scopes are
distinct and sorted by entity type, scope type, and team ID.

A system role uses the same response. The bootstrap `TENANT_ADMIN` role may
have an empty `dataScopes` array because Tenant Admin global scope comes from
the active membership flag.

Soft-deleted and cross-tenant roles are returned as `404 ROLE_NOT_FOUND`.

## Create Role API

### Request

```http
POST /api/roles
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

```json
{
  "roleCode": "SALES_MANAGER",
  "name": "Sales Manager",
  "description": "Manages sales accounts",
  "permissionCodes": [
    "crm_account.read",
    "crm_account.write"
  ],
  "dataScopes": [
    {
      "entityType": "ACCOUNT",
      "type": "TEAM",
      "teamId": "33333333-3333-3333-3333-333333333333"
    }
  ]
}
```

Create behavior:

- `roleCode` is trimmed, normalized to uppercase, and stored as the immutable
  business code;
- the role is always created as a custom role with `system: false`;
- the initial status is `ACTIVE`;
- omitted `description` becomes `null`;
- omitted `permissionCodes` or `dataScopes` becomes an empty list; and
- successful creation commits role metadata and all grants in one transaction.

Success:

- Status: `201 Created`
- `Location`: `/api/roles/{id}`
- Body: complete role detail
- Initial version: `1`

The request cannot set role ID, tenant ID, system-role state, status, audit
fields, timestamps, or version.

## Replace Role API

### Request

```http
PUT /api/roles/55555555-5555-5555-5555-555555555555
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

```json
{
  "version": 1,
  "name": "Regional Sales Manager",
  "description": "Manages regional sales accounts",
  "status": "ACTIVE",
  "permissionCodes": [
    "crm_account.read",
    "crm_account.write"
  ],
  "dataScopes": [
    {
      "entityType": "ACCOUNT",
      "type": "TEAM_TREE",
      "teamId": "33333333-3333-3333-3333-333333333333"
    }
  ]
}
```

Replace behavior:

- `roleCode` remains immutable and is not accepted in the request;
- `version`, `name`, and `status` are required;
- omitted `description` becomes `null`;
- omitted `permissionCodes` or `dataScopes` becomes an empty list;
- `ACTIVE` and `INACTIVE` are the only statuses;
- existing permission and scope rows are replaced by the submitted sets;
- metadata and grants are written in one transaction; and
- the role version increments exactly once.

An inactive role is ignored immediately by effective permission and data-scope
resolution, while existing user-role assignment rows remain intact. A later
reactivation makes still-valid assignments effective again.

Success:

- Status: `200 OK`
- Body: updated role detail

## Delete Role API

### Request

```http
DELETE /api/roles/55555555-5555-5555-5555-555555555555
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
If-Match: "2"
```

`If-Match` follows the existing Account delete contract: exactly one strong,
quoted, positive signed-long version. Missing, wildcard, weak, unquoted,
nonnumeric, zero, negative, or overflow values are request validation errors.
The CORS request-header allowlist includes `If-Match`, so cross-origin browser
clients from an allowed origin can call both Role and Account delete routes.

Delete behavior:

- only custom roles may be deleted;
- `deleted_at`, `deleted_by`, `updated_at`, and `updated_by` are recorded;
- version increments exactly once;
- permission grants, data scopes, and assignments remain for history;
- permission and data-scope enforcement ignores the deleted role immediately;
  and
- the role code may be reused by a new role after deletion.

Success:

- Status: `204 No Content`
- Body: empty

## Validation and Normalization

### Role fields

| Field | Rule |
|---|---|
| `roleCode` | Required on create; trimmed; uppercased; 1-191 characters; matches `^[A-Z][A-Z0-9_]*$`; unique among non-deleted roles in the tenant |
| `name` | Required; trimmed; non-blank; maximum 255 characters |
| `description` | Optional; trimmed; blank becomes `null`; maximum 4,000 characters |
| `status` | Required on update; `ACTIVE` or `INACTIVE` |
| `version` | Required on update; positive signed long |

### Permission grants

- Each code is trimmed, non-blank, and at most 191 characters.
- Duplicate codes in one request are rejected rather than silently collapsed.
- Every code must exist in `platform_permissions`.
- Any catalogue risk level may be granted because the caller already holds the
  privileged `platform_user.manage` permission.
- Empty permission lists are valid.
- Responses return distinct permission codes in lexical order.

### Data scopes

Each data-scope item contains:

- `entityType`: trimmed, uppercased, 1-191 characters, matching
  `^[A-Z][A-Z0-9_]*$`;
- `type`: `OWN`, `TEAM`, `TEAM_TREE`, or `TENANT`; and
- `teamId`: a UUID or `null`.

Rules:

- `TEAM` and `TEAM_TREE` require a non-null team ID;
- `OWN` and `TENANT` require a null team ID;
- a referenced team must be active, non-deleted, and owned by the current
  tenant;
- duplicate `(entityType, type, teamId)` tuples are rejected;
- empty scope lists are valid; and
- responses sort scopes by entity type, scope type, and team ID.

The API does not maintain a separate entity-type catalogue in this slice.
Uppercase identifiers allow current `ACCOUNT` enforcement and future modules
without creating permission-like entity definitions that the database does not
currently model.

## System-Role Protection

System roles are visible through list and detail APIs so administrative clients
can explain current access. The API never accepts `system` as a mutable field.

Update and delete reject any role whose `is_system` column is true. This keeps
the bootstrap `TENANT_ADMIN` code, permission grant, and role lifecycle under
system control.

System-role protection applies even if the caller is a Tenant Admin or holds
`platform_user.manage` through another role.

## Authorization and Tenant Isolation

All six endpoints require current actor and tenant contexts and call
`PermissionChecker.requirePermission("platform_user.manage")` in the
application boundary.

Role reads and writes include tenant ID in every query. A role from another
tenant is indistinguishable from a missing role and returns
`404 ROLE_NOT_FOUND` after the caller has passed tenant authorization.

Permission catalogue rows are global, but catalogue access still requires an
active tenant context and `platform_user.manage` because the endpoint exists
solely to configure a role in the selected tenant.

No Role Management route is made public in Spring Security. No data scope is
required to administer roles; functional permission is the administrative
boundary.

## Transaction and Concurrency Model

Create, replace, and delete operations are transactional.

For replace and delete, the persistence adapter locks the non-deleted role row
for the current tenant before checking system state and version. This
serializes concurrent grant replacement and prevents two successful updates
from the same version.

Replace executes this logical sequence:

1. require actor, tenant, and `platform_user.manage`;
2. lock and load the role aggregate;
3. reject system roles and stale versions;
4. validate every permission and team reference;
5. update mutable role metadata once;
6. replace permission grants;
7. replace data-scope grants; and
8. reload and return the committed aggregate.

If any metadata update or grant write fails, the transaction rolls back. The
current database-backed Effective Access endpoint and enforcement queries see
the new authorization on the next request because no authorization cache is
introduced.

Create uses the existing non-deleted role-code unique index as the final race
guard. Duplicate-key failures are translated to the domain conflict code.

## Error Contract

| Status | `errorCode` | Condition |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Invalid JSON, UUID, enum, field constraint, duplicate request grant, or invalid `If-Match` |
| `401` | `AUTHENTICATION_REQUIRED` | Bearer authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant context is invalid or `platform_user.manage` is missing |
| `404` | `ROLE_NOT_FOUND` | The role is absent, deleted, or belongs to another tenant |
| `409` | `ROLE_CODE_ALREADY_EXISTS` | A non-deleted role already uses the normalized code in the tenant |
| `409` | `SYSTEM_ROLE_IMMUTABLE` | An update or delete targets a system role |
| `409` | `ROLE_VERSION_CONFLICT` | Update or delete uses a stale version |
| `422` | `ROLE_PERMISSION_UNKNOWN` | At least one submitted permission code is absent from the system catalogue |
| `422` | `ROLE_DATA_SCOPE_INVALID` | Scope/team presence is inconsistent or a team is inactive, deleted, missing, or belongs to another tenant |
| `500` | `INTERNAL_ERROR` | An unexpected database or server failure occurs |

Malformed UUIDs and unknown enum values are request-shape failures and return
`400`. A syntactically valid scope whose type and team presence conflict is a
role business-rule failure and returns `422 ROLE_DATA_SCOPE_INVALID`.

Reference-validation errors do not reveal whether a team exists in another
tenant. The API reports only that the submitted role data scope is invalid.

## Deterministic Output

All collection output is deterministic:

- permissions: module code then permission code for the catalogue, and
  permission code for role detail;
- role list: role code then role ID;
- role detail scopes: entity type, scope type, then nullable team ID.

Application DTOs and response records defensively copy collections. Clients do
not receive mutable internal collections or SQL-dependent ordering.

## API Documentation

Implementation must update `docs/api-reference.md` in the same task. The
reference must include all six routes, headers, permission requirements,
validation constraints, examples, response fields, optimistic-locking
behavior, system-role rules, status codes, and error codes.

`docs/technical-roadmap.md` must mark Role Management and read-only permission
catalogue as delivered while leaving member invitation, role assignment,
membership lifecycle, and Team Management as future work.

Only implemented behavior may be documented as available.

## Verification Strategy

Repository rules prohibit automated tests, Maven builds, application startup,
database calls, browser checks, and manual API calls unless the user gives a
new explicit authorization. Implementation therefore uses read-only static
verification only:

- inspect the package tree and complete controller-to-repository flow;
- compare permission checks with the existing authorization foundation;
- compare SQL table and column names with `docs/crm_mysql80.sql`;
- confirm every SQL value uses a named parameter;
- confirm all write services are transactional and Spring-advised classes are
  non-final;
- confirm no Role Management route is public;
- confirm the only security-configuration change is adding `If-Match` to the
  CORS request-header allowlist;
- confirm no JWT, key, datasource, application YAML, or schema change was made;
- inspect the full scoped diff and run whitespace/Markdown checks; and
- leave all changes uncommitted for user review.

The handoff must state explicitly that compile and runtime behavior were not
verified. The user will perform runtime testing independently.

## Manual Runtime Checklist for the User

When the user elects to test later, the minimum behavior checklist is:

1. an authorized caller lists the permission catalogue;
2. an authorized caller creates and reads a custom role;
3. replace atomically changes metadata, permissions, scopes, and version;
4. Effective Access changes after role configuration and later assignment;
5. duplicate role codes return the documented conflict;
6. unknown permissions and invalid team scopes roll back the entire write;
7. stale update and delete versions are rejected;
8. system roles cannot be replaced or deleted;
9. inactivation and soft deletion remove role effects immediately; and
10. missing permission, invalid tenant, and cross-tenant role IDs do not leak
    protected data.

## Future Work

After Role Management, the recommended sequence is:

1. member invitation or existing-user membership onboarding;
2. role assignment and assignment validity windows;
3. membership suspension, reactivation, and removal;
4. Team Management and team membership; and
5. generic audit execution context and transactional outbox integration.

These items are design direction only and do not define implemented endpoints
in this slice.
