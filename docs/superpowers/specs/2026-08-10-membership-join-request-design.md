# Membership Join Request Design

**Status:** Approved

**Date:** 2026-08-10

## Purpose

Allow an authenticated platform user to request access to an existing tenant
and allow authorized members of that tenant to review the request. Approval
creates an active tenant membership and at least one tenant role assignment in
one transaction.

This slice keeps platform identity separate from tenant access:

- `platform_users` identifies a person across the platform;
- `platform_tenant_memberships` records that person's relationship with one
  tenant;
- `platform_roles` defines tenant-owned roles;
- `platform_user_roles` assigns tenant roles to a member; and
- permissions and data scopes are resolved from current database state.

For a customer organization such as a corporate group, the organization is a
tenant. A chairman, administrator, or employee is a platform user whose
authority inside that organization comes only from the membership and roles
owned by that tenant.

## Scope

Implement these authenticated APIs:

```http
POST /api/membership-requests
GET /api/membership-requests
POST /api/membership-requests/{id}/approve
POST /api/membership-requests/{id}/reject
```

The slice includes:

- user-initiated requests to join an existing active tenant;
- a dedicated membership-request persistence model and history;
- paginated tenant review of pending or resolved requests;
- atomic approval with one or more initial custom role assignments;
- rejection with an optional review reason;
- optimistic concurrency for approval and rejection;
- fine-grained membership and role permissions;
- compatibility backfill for roles that hold the legacy broad permission;
- updated Tenant Admin bootstrap grants;
- synchronized API and roadmap documentation; and
- bilingual stable error messages.

The slice does not include:

- platform-operator tenant provisioning;
- tenant invitations;
- applicant self-list, request detail, or cancellation APIs;
- direct role-assignment management after onboarding;
- membership suspension, reactivation, removal, or Tenant Admin promotion;
- team or team-membership management;
- email or notification delivery;
- approval workflow levels, quorum, or delegation;
- generic audit events or transactional outbox publication;
- permission claims in JWTs; or
- frontend work.

Platform-operator tenant provisioning remains a separate future vertical
slice. It requires a platform-level authorization boundary and must not be
mixed with tenant-owned membership authority.

## Chosen Approach

Create a dedicated `platform_membership_requests` table. A request is not a
membership. The membership and role assignments exist only after approval.

This was selected over reusing `platform_tenant_memberships` with `INVITED`
because an invitation originates from a tenant while a join request originates
from an applicant. Reusing the membership row would mix those workflows and
would not preserve rejected request history cleanly. Storing workflow state in
membership JSON metadata was rejected because it weakens validation,
queryability, uniqueness, and concurrency control.

## Architecture

Add a focused vertical slice:

```text
com.crm.platform.membership
├── application
│   ├── command
│   ├── dto
│   ├── port
│   ├── query
│   ├── service
│   └── usecase
├── domain
├── infrastructure
│   └── persistence
└── presentation
    └── web
```

### Presentation

The controller owns the four HTTP routes. Web request and response records
remain separate from application commands and DTOs. A mapper performs the
conversion without exposing persistence models.

The submit route does not accept or require `X-Tenant-ID`; the applicant does
not yet have a membership. The list, approve, and reject routes require an
active tenant context through the existing `X-Tenant-ID` filter.

### Application

The application service owns authentication context, permission checks,
transaction boundaries, request eligibility, role validation, concurrency,
and persistence orchestration. It uses the existing `CurrentActor`,
`CurrentTenant`, `PermissionChecker`, `IdentifierGenerator`, and
`TimeProvider` abstractions.

### Domain

The `MembershipRequest` aggregate owns normalization, request status,
resolution transitions, timestamps, reviewer state, and version changes.
`MembershipRequestStatus` has exactly `PENDING`, `APPROVED`, and `REJECTED`.
Approval and rejection are terminal for one request record.

### Infrastructure

A JDBC repository implements tenant lookup, request reads and locks,
eligibility checks, role validation, request writes, membership insertion, and
role-assignment insertion. Every SQL value is bound through named parameters.
Tenant-owned reads and writes include tenant ID explicitly.

Spring-managed transactional services and repository adapters remain
non-final so the current class-based proxy configuration can advise them.

## Database Design

Add this logical table to `docs/crm_mysql80.sql`:

```sql
CREATE TABLE platform_membership_requests (
    tenant_id CHAR(36) NOT NULL,
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    requester_user_id CHAR(36) NOT NULL,
    request_status VARCHAR(191) NOT NULL DEFAULT 'PENDING'
        CHECK (request_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    message VARCHAR(2000),
    reviewed_by CHAR(36),
    review_note VARCHAR(2000),
    requested_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    reviewed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
    pending_requester_user_id CHAR(36)
        GENERATED ALWAYS AS (
            CASE WHEN request_status = 'PENDING'
                 THEN requester_user_id ELSE NULL END
        ) STORED,
    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id)
        REFERENCES platform_tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_user_id)
        REFERENCES platform_users(id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id, reviewed_by)
        REFERENCES platform_tenant_memberships(tenant_id, user_id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_membership_requests_pending
        UNIQUE (tenant_id, pending_requester_user_id),
    CHECK (
        (request_status = 'PENDING'
            AND reviewed_by IS NULL
            AND reviewed_at IS NULL)
        OR
        (request_status IN ('APPROVED', 'REJECTED')
            AND reviewed_by IS NOT NULL
            AND reviewed_at IS NOT NULL)
    )
) ENGINE=InnoDB;
```

The implementation may adjust constraint and index names to match the schema's
existing naming style, but the semantics above are fixed.

The generated nullable key permits only one `PENDING` request for the same
tenant and applicant while retaining any number of resolved historical
requests. A rejected applicant may submit a new request later. The request
primary key includes tenant ID so repository access is naturally tenant
scoped.

Add indexes for deterministic review queries:

```text
(tenant_id, request_status, requested_at DESC, id DESC)
(requester_user_id, request_status)
```

Add a touch trigger consistent with other versioned tables so direct database
updates preserve `updated_at`. Application resolution updates increment
`version` explicitly once.

## Permission Model

Add these system-owned catalogue permissions:

| Permission | Risk | Purpose |
|---|---|---|
| `platform_membership.read` | `SENSITIVE` | Read tenant membership requests and applicant identity data |
| `platform_membership.approve` | `PRIVILEGED` | Approve or reject a membership request |
| `platform_role.read` | `NORMAL` | Read permission catalogue and tenant roles |
| `platform_role.assign` | `PRIVILEGED` | Assign tenant roles during membership approval |
| `platform_role.manage` | `PRIVILEGED` | Create, replace, inactivate, reactivate, or delete custom roles |

The existing `platform_user.manage` permission remains in the catalogue for
compatibility. It is not removed or renamed.

To preserve access for existing administrator roles, the SQL update includes
an idempotent backfill: every role currently granted `platform_user.manage`
also receives all five fine-grained permissions. The legacy grant remains.
This preserves current behavior while allowing future roles such as
`CHAIRMAN` to receive only `platform_membership.read`,
`platform_membership.approve`, `platform_role.read`, and
`platform_role.assign` without role-mutation authority.

Tenant Bootstrap grants the legacy permission and all five fine-grained
permissions to a newly created `TENANT_ADMIN` system role. Existing tenant
admin roles receive the same permission set through the idempotent backfill.

Update the existing Role Management authorization contract:

- `GET /api/permissions`, `GET /api/roles`, and `GET /api/roles/{id}` require
  `platform_role.read`;
- `POST /api/roles`, `PUT /api/roles/{id}`, and
  `DELETE /api/roles/{id}` require `platform_role.manage`.

Role Management remains tenant scoped. Permission catalogue rows remain
global and read-only.

JWTs remain identity and session tokens. They do not contain membership,
role, permission, or data-scope lists.

## API Contract

All examples use reserved example data and placeholder credentials.

### Submit a membership request

```http
POST /api/membership-requests
Authorization: Bearer <access-token>
Content-Type: application/json
```

Do not send `X-Tenant-ID`.

Request:

```json
{
  "tenantCode": "example-corporation",
  "message": "Requesting access as a corporate employee"
}
```

Validation:

| Field | Rule |
|---|---|
| `tenantCode` | Required; trimmed; non-blank; maximum 320 characters |
| `message` | Optional; trimmed; blank becomes `null`; maximum 2,000 characters |

The target tenant must have status `TRIAL` or `ACTIVE`. An absent, suspended,
or closed tenant returns the same `404 TENANT_NOT_AVAILABLE` response.

The current actor must reference an active platform user and must not have an
`INVITED`, `ACTIVE`, or `SUSPENDED` membership in the target tenant. A
historical `REMOVED` membership does not prevent a new request.

Success:

- Status: `201 Created`
- Initial status: `PENDING`
- Initial version: `1`

```json
{
  "id": "66666666-6666-6666-6666-666666666666",
  "tenant": {
    "id": "22222222-2222-2222-2222-222222222222",
    "tenantCode": "example-corporation",
    "displayName": "Example Corporation"
  },
  "status": "PENDING",
  "message": "Requesting access as a corporate employee",
  "requestedAt": "2026-08-10T10:00:00Z",
  "reviewedAt": null,
  "reviewNote": null,
  "version": 1
}
```

Tenant discovery by code is deliberate for this first slice. The response
does not expose tenant plan, region, retention, metadata, administrators, or
member counts.

### List tenant membership requests

```http
GET /api/membership-requests?status=PENDING&page=0&size=20
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

Requirements:

- active membership in the selected tenant;
- `platform_membership.read`;
- `status` defaults to `PENDING` and accepts `PENDING`, `APPROVED`, or
  `REJECTED`;
- `page` defaults to `0` and must be non-negative;
- `size` defaults to `20` and must be between `1` and `100` inclusive; and
- results order by `requested_at DESC`, then request ID descending.

Success: `200 OK`

```json
{
  "items": [
    {
      "id": "66666666-6666-6666-6666-666666666666",
      "requester": {
        "id": "77777777-7777-7777-7777-777777777777",
        "email": "applicant@example.test",
        "displayName": "Example Applicant"
      },
      "status": "PENDING",
      "message": "Requesting access as a corporate employee",
      "requestedAt": "2026-08-10T10:00:00Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "reviewNote": null,
      "version": 1
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Resolved rows include reviewer ID and display name. Applicant email is
available only through this tenant-authorized administrative route.

### Approve a membership request

```http
POST /api/membership-requests/66666666-6666-6666-6666-666666666666/approve
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

Requirements:

- `platform_membership.approve`;
- `platform_role.assign`; and
- both permissions must be effective in the selected tenant.

Request:

```json
{
  "version": 1,
  "roleIds": [
    "55555555-5555-5555-5555-555555555555"
  ],
  "reviewNote": "Employment verified"
}
```

Validation:

| Field | Rule |
|---|---|
| `version` | Required positive signed long |
| `roleIds` | Required; 1 to 20 distinct UUIDs |
| `reviewNote` | Optional; trimmed; blank becomes `null`; maximum 2,000 characters |

Every selected role must belong to the selected tenant, be `ACTIVE`, not be
soft deleted, and have `is_system=false`. System roles, including
`TENANT_ADMIN`, cannot be assigned through this workflow. Tenant Admin
promotion requires a future dedicated operation with stronger policy.

Success: `200 OK`

```json
{
  "tenantId": "22222222-2222-2222-2222-222222222222",
  "user": {
    "id": "77777777-7777-7777-7777-777777777777",
    "email": "applicant@example.test",
    "displayName": "Example Applicant"
  },
  "status": "ACTIVE",
  "tenantAdmin": false,
  "joinedAt": "2026-08-10T10:05:00Z",
  "roles": [
    {
      "id": "55555555-5555-5555-5555-555555555555",
      "roleCode": "EMPLOYEE",
      "name": "Employee"
    }
  ],
  "version": 1
}
```

### Reject a membership request

```http
POST /api/membership-requests/66666666-6666-6666-6666-666666666666/reject
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
Content-Type: application/json
```

Requirement: `platform_membership.approve`.

Request:

```json
{
  "version": 1,
  "reason": "Unable to verify employment"
}
```

Validation:

| Field | Rule |
|---|---|
| `version` | Required positive signed long |
| `reason` | Optional; trimmed; blank becomes `null`; maximum 2,000 characters |

Success: `200 OK` with the request response, status `REJECTED`, reviewer,
review time, reason as `reviewNote`, and incremented version.

## Submission Transaction and Concurrency

Submission is transactional:

1. require the current actor;
2. lock and require the actor's platform user to be `ACTIVE`;
3. resolve a `TRIAL` or `ACTIVE` tenant by normalized tenant code;
4. reject an existing `INVITED`, `ACTIVE`, or `SUSPENDED` membership;
5. reject an existing pending request;
6. create the pending request; and
7. return the persisted result.

The generated unique key is the final guard for concurrent duplicate
submissions. A duplicate-key failure is translated to
`MEMBERSHIP_REQUEST_ALREADY_PENDING`.

## Approval Transaction and Concurrency

Approval is transactional and executes this sequence:

1. require actor, tenant, `platform_membership.approve`, and
   `platform_role.assign`;
2. lock the tenant-scoped request row with `SELECT ... FOR UPDATE`;
3. compare the submitted version with the locked row;
4. require status `PENDING`;
5. lock and require the requester platform user to remain `ACTIVE`;
6. lock the `(tenant_id, requester_user_id)` membership row when it exists;
7. reject an `INVITED`, `ACTIVE`, or `SUSPENDED` membership, while retaining a
   `REMOVED` row as the reactivation target;
8. sort selected role IDs, then lock every matching role in that deterministic
   order with tenant-scoped `SELECT ... FOR UPDATE` queries;
9. require every role to be active, custom, non-deleted, and owned by the
   selected tenant;
10. insert a new `ACTIVE` membership, or reactivate the locked `REMOVED` row by
    setting status to `ACTIVE`, clearing `removed_at`, resetting
    `is_tenant_admin=false`, and recording the shared transaction timestamp as
    the new `joined_at`;
11. delete any role-assignment rows retained from a removed membership, then
    insert only the selected non-expiring assignments with the shared timestamp
    and current actor as `assigned_by`;
12. transition the request to `APPROVED`, record reviewer and review note, and
    increment version exactly once; and
13. return the created or reactivated membership and assigned roles.

Clearing old assignment rows during reactivation prevents dormant grants from
becoming effective again merely because the membership returns to `ACTIVE`.
The current schema does not model assignment history independently; a future
audit/outbox slice can record those lifecycle events without weakening current
authorization.

Any failure rolls back the membership insert or reactivation, assignment
replacement, and request transition. A concurrent reviewer submitting the old version receives
`MEMBERSHIP_REQUEST_VERSION_CONFLICT`. A request using the current version of
an already resolved row receives `MEMBERSHIP_REQUEST_ALREADY_RESOLVED`.

## Rejection Transaction and Concurrency

Rejection requires actor, tenant, and `platform_membership.approve`. It locks
the tenant-scoped request, checks version before status, requires `PENDING`,
records the reviewer and normalized reason, changes status to `REJECTED`, and
increments version exactly once. It creates no membership or role assignment.

## Tenant Isolation and Information Disclosure

- Review routes derive tenant ID only from the validated current tenant
  context.
- Request IDs are always queried with tenant ID.
- A request from another tenant is indistinguishable from an absent request.
- Role validation never reveals whether an invalid role belongs to another
  tenant.
- Tenant lookup for applicant submission returns one generic
  `TENANT_NOT_AVAILABLE` response for absent and inactive tenants.
- The applicant cannot choose a requester user ID, membership status,
  reviewer, role assignment timestamps, audit actor, or version.

## Error Contract

| Status | `errorCode` | Condition |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | Invalid body, UUID, enum, page, size, duplicate role ID, empty role list, or field constraint |
| `401` | `AUTHENTICATION_REQUIRED` | Bearer authentication is missing or invalid |
| `403` | `ACCESS_DENIED` | Current user is inactive, tenant context is invalid, or an administrative permission is missing |
| `404` | `TENANT_NOT_AVAILABLE` | Tenant code is absent or tenant is not `TRIAL` or `ACTIVE` |
| `404` | `MEMBERSHIP_REQUEST_NOT_FOUND` | Request is absent or belongs to another tenant |
| `409` | `MEMBERSHIP_REQUEST_ALREADY_PENDING` | Applicant already has a pending request for the tenant |
| `409` | `MEMBERSHIP_ALREADY_EXISTS` | Applicant has an `INVITED`, `ACTIVE`, or `SUSPENDED` membership |
| `409` | `MEMBERSHIP_REQUEST_ALREADY_RESOLVED` | The current request version is no longer `PENDING` |
| `409` | `MEMBERSHIP_REQUEST_VERSION_CONFLICT` | Submitted version differs from the locked row |
| `422` | `MEMBERSHIP_ROLE_INVALID` | A selected role is absent, cross-tenant, inactive, deleted, or system-owned |
| `500` | `INTERNAL_ERROR` | Unexpected infrastructure or server failure |

Database constraint violations are translated only when the violated
constraint is known. Unknown integrity failures remain internal errors rather
than being mislabeled as business conflicts.

## Post-Approval Client Flow

Approval changes database authorization immediately; no authorization cache is
introduced. The applicant does not need to log in again:

1. call `GET /api/auth/me` to discover the new active membership;
2. select the tenant and send its ID in `X-Tenant-ID`; and
3. call `GET /api/access/me` to read effective permissions and data scopes.

The assigned roles become effective on the next request because permission and
scope evaluation reads current database state rather than JWT access lists.

## Documentation Changes

The implementation task updates `docs/api-reference.md` in the same change.
It must document:

- all four new endpoints;
- authentication and tenant-header differences;
- fine-grained permission requirements;
- every request and response field;
- validation and normalization;
- pagination and deterministic ordering;
- approval atomicity and assignable-role restrictions;
- optimistic concurrency;
- status codes and stable error codes;
- the post-approval client flow; and
- safe examples with no real credentials, tokens, signing keys, or personal
  data.

The implementation also updates existing Role Management API permission
requirements in the reference. Only implemented behavior is documented.

`docs/technical-roadmap.md` marks user-initiated join request review and atomic
initial role assignment as delivered while retaining invitations, direct role
assignment management, membership lifecycle, Team Management, and broader
tenant administration as future work.

## Verification Strategy

Repository rules prohibit tests, builds, application startup, database
connections, and manual API calls unless the user explicitly authorizes them
in a later request. Verification is therefore static:

- inspect the complete controller-to-repository flow;
- compare table, column, foreign-key, index, and trigger definitions with
  `docs/crm_mysql80.sql`;
- verify all SQL values use named parameter binding;
- verify submission does not require a tenant context;
- verify review operations always require a tenant context;
- verify approval checks both required permissions;
- verify role validation excludes system, inactive, deleted, and cross-tenant
  roles;
- verify one transaction covers membership creation, all assignments, and
  request resolution;
- verify version is checked before resolved status;
- verify permission seed, compatibility backfill, and Tenant Bootstrap grants
  remain consistent;
- verify the updated Role Management permission contract in source and API
  documentation;
- inspect the scoped diff and run `git diff --check`; and
- leave every change uncommitted for user review.

Compile and runtime behavior will remain unverified under the repository rule.

## Manual Runtime Checklist for the User

When the user chooses to test later:

1. an active user submits a request to an active tenant and receives `201`;
2. a duplicate pending request receives the documented conflict;
3. a user with an existing non-removed membership cannot request again;
4. a reviewer with read permission lists requests only for the selected
   tenant;
5. a reviewer missing either approval or assignment permission cannot approve;
6. approval with one or more active custom roles creates or reactivates one
   active membership and replaces its assignments atomically;
7. system, inactive, deleted, and cross-tenant roles are rejected without data
   leakage;
8. rejection creates no membership;
9. concurrent review attempts permit only one successful resolution;
10. the approved user sees the membership in `GET /api/auth/me` and effective
    access in `GET /api/access/me` without logging in again; and
11. existing Tenant Admin access continues after applying the permission
    backfill.

## Acceptance Criteria

1. Identity remains global while memberships, roles, and assignments remain
   tenant scoped.
2. An authenticated active user can request access to one active tenant by
   tenant code without `X-Tenant-ID`.
3. At most one pending request exists per applicant and tenant.
4. Rejected request history remains stored and the applicant may request again.
5. Tenant reviewers see only requests belonging to the selected tenant.
6. Approval requires both membership approval and role assignment permission.
7. Approval requires between one and twenty distinct active custom roles from
   the selected tenant.
8. Membership creation or reactivation, role-assignment replacement, and
   approval resolution commit or roll back together.
9. Join approval cannot grant a system role or Tenant Admin authority.
10. Concurrency produces stable version or resolved-state conflicts and never
    creates duplicate memberships.
11. Existing broad administrator roles retain equivalent authority through an
    idempotent permission backfill.
12. JWT, signing keys, datasource configuration, and current local key/config
    setup remain unchanged.
13. API reference, roadmap, SQL schema, permission catalogue, bootstrap grants,
    and bilingual messages match the implemented behavior.

## Follow-Up Delivery Sequence

After this slice, separate reviewed designs should cover:

1. tenant invitations;
2. direct role assignment and assignment validity management;
3. membership suspension, reactivation, and removal;
4. controlled Tenant Admin promotion and demotion;
5. Team Management and team membership;
6. platform-operator tenant provisioning; and
7. notification delivery plus transactional outbox integration.
