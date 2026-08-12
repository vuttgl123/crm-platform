# Membership Join Request Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tenant-scoped membership join requests whose approval atomically creates or reactivates a membership and assigns at least one active custom tenant role.

**Architecture:** Add a dedicated `com.crm.platform.membership` vertical slice with a domain aggregate, application facade, JDBC port/adapter, and web contracts. Keep identity global, derive reviewer authority from the selected tenant, keep JWTs identity-only, and persist request resolution, membership activation, and role replacement in one transaction.

**Tech Stack:** Java 21, Spring Boot 4, Spring MVC, Spring Security, Spring JDBC `JdbcClient`, Jakarta Validation, MySQL 8, Maven project conventions, Problem Details error handling.

## Global Constraints

- Do not inspect or modify `crm-fe`.
- Do not run tests, Maven builds, application startup, database connections, browser checks, or manual API calls unless the user gives a new explicit authorization.
- Do not commit, stage, push, create branches, create worktrees, or open pull requests.
- Use `apply_patch` for source and documentation edits.
- Update `docs/api-reference.md` in the same implementation task as every API change.
- Keep current datasource, JWT signing keys, bundled key resources, CORS origins, and environment configuration unchanged.
- Do not add role, permission, membership, or data-scope claims to JWTs.
- All tenant review operations require the validated `X-Tenant-ID` context; submission requires no tenant header.
- Approval requires both `platform_membership.approve` and `platform_role.assign`.
- Approval accepts 1-20 distinct, active, non-deleted, non-system role IDs belonging to the selected tenant.
- A `REMOVED` membership is reactivated rather than inserted because `(tenant_id, user_id)` is the membership primary key.
- Reactivation must clear every prior role assignment before inserting only the newly selected roles so dormant grants cannot revive.
- Every JDBC value must use named parameter binding, and every protected record lookup must include tenant ID.
- All examples must use placeholder tokens and reserved example data, never real credentials or personal information.
- Verification is static only and all changes remain uncommitted.

---

## Planned File Structure

Create the following focused files:

```text
crm/src/main/java/com/crm/platform/membership
├── application
│   ├── command
│   │   ├── ApproveMembershipRequestCommand.java
│   │   ├── RejectMembershipRequestCommand.java
│   │   └── SubmitMembershipRequestCommand.java
│   ├── dto
│   │   ├── ApprovedMembershipDetails.java
│   │   ├── MembershipRequestDetails.java
│   │   ├── RoleReference.java
│   │   ├── TenantReference.java
│   │   └── UserReference.java
│   ├── port
│   │   └── MembershipRequestRepository.java
│   ├── query
│   │   └── MembershipRequestSearchQuery.java
│   ├── service
│   │   └── MembershipRequestApplicationService.java
│   └── usecase
│       └── MembershipRequestFacade.java
├── domain
│   ├── MembershipRequest.java
│   ├── MembershipRequestErrorCode.java
│   ├── MembershipRequestId.java
│   ├── MembershipRequestStatus.java
│   ├── TenantMembershipState.java
│   └── TenantMembershipStatus.java
├── infrastructure
│   └── persistence
│       └── JdbcMembershipRequestRepository.java
└── presentation
    └── web
        ├── ApproveMembershipRequestRequest.java
        ├── ApprovedMembershipResponse.java
        ├── MembershipRequestController.java
        ├── MembershipRequestReviewResponse.java
        ├── MembershipRequestSearchRequest.java
        ├── MembershipRequestSubmissionResponse.java
        ├── MembershipRequestWebMapper.java
        ├── RejectMembershipRequestRequest.java
        └── SubmitMembershipRequestRequest.java
```

Keep aggregate transitions in `MembershipRequest`, orchestration in the
application service, SQL only in the JDBC adapter, and HTTP validation and
shape only in the web package.

---

### Task 1: Add the schema and split administrative permissions

**Files:**

- Modify: `docs/crm_mysql80.sql`
- Modify: `crm/src/main/java/com/crm/platform/tenant/application/service/TenantBootstrapApplicationService.java`
- Modify: `crm/src/main/java/com/crm/platform/access/application/service/RoleManagementApplicationService.java`

**Interfaces:**

- Consumes: existing `platform_users`, `platform_tenants`, `platform_tenant_memberships`, `platform_roles`, `platform_permissions`, `platform_role_permissions`, and `platform_user_roles` tables.
- Produces: `platform_membership_requests`, five fine-grained permission catalogue entries, compatibility grants, and permission constants used by later tasks.

- [ ] **Step 1: Add the membership-request table after `platform_tenant_memberships`**

Add the approved columns and constraints:

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

- [ ] **Step 2: Add review indexes and the standard touch trigger**

Add indexes alongside the existing platform indexes:

```sql
CREATE INDEX idx_membership_requests_review
    ON platform_membership_requests
        (tenant_id, request_status, requested_at DESC, id DESC);

CREATE INDEX idx_membership_requests_requester
    ON platform_membership_requests
        (requester_user_id, request_status);
```

Add the trigger alongside the other `trg_touch_platform_*` triggers:

```sql
CREATE TRIGGER trg_touch_platform_membership_requests
BEFORE UPDATE ON platform_membership_requests
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
END$$
```

- [ ] **Step 3: Seed the fine-grained permission catalogue**

Extend the existing `INSERT IGNORE INTO platform_permissions` values:

```sql
('platform_membership.read',
 'Read tenant membership requests', 'platform', 'SENSITIVE'),
('platform_membership.approve',
 'Approve or reject tenant membership requests', 'platform', 'PRIVILEGED'),
('platform_role.read',
 'Read permission catalogue and tenant roles', 'platform', 'NORMAL'),
('platform_role.assign',
 'Assign tenant roles to members', 'platform', 'PRIVILEGED'),
('platform_role.manage',
 'Create and manage tenant roles', 'platform', 'PRIVILEGED')
```

Keep `platform_user.manage` unchanged.

- [ ] **Step 4: Backfill existing broad administrator roles idempotently**

After the catalogue insert, add an `INSERT IGNORE ... SELECT` that copies all
five fine permissions to every role currently holding
`platform_user.manage`:

```sql
INSERT IGNORE INTO platform_role_permissions (
    tenant_id, role_id, permission_code, granted_at, granted_by
)
SELECT legacy.tenant_id,
       legacy.role_id,
       fine.permission_code,
       CURRENT_TIMESTAMP(6),
       legacy.granted_by
FROM platform_role_permissions legacy
JOIN platform_permissions fine
  ON fine.permission_code IN (
      'platform_membership.read',
      'platform_membership.approve',
      'platform_role.read',
      'platform_role.assign',
      'platform_role.manage'
  )
WHERE legacy.permission_code = 'platform_user.manage';
```

- [ ] **Step 5: Grant the complete administrator permission set during tenant bootstrap**

In `TenantBootstrapApplicationService`, replace the one permission constant
with this immutable list:

```java
private static final List<String> TENANT_ADMIN_PERMISSIONS = List.of(
        "platform_user.manage",
        "platform_membership.read",
        "platform_membership.approve",
        "platform_role.read",
        "platform_role.assign",
        "platform_role.manage");
```

Before inserting tenant records, require every entry through the existing
`repository.permissionExists(permission)`. After creating the system role,
call the existing `repository.grantPermission(...)` once per entry. Preserve
the same transaction and shared timestamp.

- [ ] **Step 6: Split Role Management read and mutation authorization**

In `RoleManagementApplicationService`, introduce:

```java
private static final String READ_PERMISSION = "platform_role.read";
private static final String MANAGE_PERMISSION = "platform_role.manage";
```

Call `authorize(READ_PERMISSION)` from `permissions()`, `roles()`, and `get()`.
Call `authorize(MANAGE_PERMISSION)` from `create()`, `update()`, and `delete()`.
Change the helper signature to:

```java
private AccessContext authorize(String permission) {
    TenantId tenantId = currentTenant.requireTenantId();
    ActorId actorId = currentActor.requireActorId();
    permissionChecker.requirePermission(permission);
    return new AccessContext(tenantId, actorId);
}
```

- [ ] **Step 7: Statically inspect Task 1**

Confirm table definition order satisfies every foreign key, the generated
pending key is nullable for resolved rows, permission values are unique, the
backfill is idempotent, and bootstrap checks permissions before its first
insert. Do not execute the SQL or start a database.

---

### Task 2: Add membership-request domain and application contracts

**Files:**

- Create: `crm/src/main/java/com/crm/platform/membership/domain/MembershipRequestId.java`
- Create: `crm/src/main/java/com/crm/platform/membership/domain/MembershipRequestStatus.java`
- Create: `crm/src/main/java/com/crm/platform/membership/domain/TenantMembershipStatus.java`
- Create: `crm/src/main/java/com/crm/platform/membership/domain/TenantMembershipState.java`
- Create: `crm/src/main/java/com/crm/platform/membership/domain/MembershipRequestErrorCode.java`
- Create: `crm/src/main/java/com/crm/platform/membership/domain/MembershipRequest.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/command/SubmitMembershipRequestCommand.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/command/ApproveMembershipRequestCommand.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/command/RejectMembershipRequestCommand.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/query/MembershipRequestSearchQuery.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/dto/TenantReference.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/dto/UserReference.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/dto/RoleReference.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/dto/MembershipRequestDetails.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/dto/ApprovedMembershipDetails.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/port/MembershipRequestRepository.java`
- Create: `crm/src/main/java/com/crm/platform/membership/application/usecase/MembershipRequestFacade.java`

**Interfaces:**

- Consumes: `ActorId`, `TenantId`, `PageQuery`, and `PageResult` from shared abstractions.
- Produces: stable aggregate methods and repository/facade signatures consumed by Tasks 3-5.

- [ ] **Step 1: Add strongly typed identifiers and statuses**

Implement `MembershipRequestId` as a non-null UUID value object matching
existing `RoleId` conventions:

```java
public record MembershipRequestId(UUID value) {
    public MembershipRequestId {
        Objects.requireNonNull(value, "value must not be null");
    }

    public static MembershipRequestId from(String value) {
        return new MembershipRequestId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
```

Add exact enums:

```java
public enum MembershipRequestStatus {
    PENDING, APPROVED, REJECTED
}

public enum TenantMembershipStatus {
    INVITED, ACTIVE, SUSPENDED, REMOVED
}
```

Add the locked membership projection:

```java
public record TenantMembershipState(
        TenantMembershipStatus status,
        long version) {
    public TenantMembershipState {
        Objects.requireNonNull(status, "status must not be null");
        if (version < 1L) {
            throw new IllegalArgumentException("version must be positive");
        }
    }
}
```

- [ ] **Step 2: Add stable membership error codes**

Implement `MembershipRequestErrorCode implements ErrorCode` with exactly:

```text
TENANT_NOT_AVAILABLE                 membership.tenant_not_available
MEMBERSHIP_REQUEST_NOT_FOUND         membership.request_not_found
MEMBERSHIP_REQUEST_ALREADY_PENDING   membership.request_already_pending
MEMBERSHIP_ALREADY_EXISTS            membership.already_exists
MEMBERSHIP_REQUEST_ALREADY_RESOLVED  membership.request_already_resolved
MEMBERSHIP_REQUEST_VERSION_CONFLICT  membership.request_version_conflict
MEMBERSHIP_ROLE_INVALID              membership.role_invalid
```

- [ ] **Step 3: Implement the aggregate lifecycle**

`MembershipRequest` must contain:

```java
TenantId tenantId;
MembershipRequestId id;
ActorId requesterId;
MembershipRequestStatus status;
String message;
ActorId reviewedBy;
String reviewNote;
Instant requestedAt;
Instant reviewedAt;
Instant updatedAt;
long version;
```

Expose these factories and transitions:

```java
public static MembershipRequest submit(
        TenantId tenantId,
        MembershipRequestId id,
        ActorId requesterId,
        String message,
        Instant now);

public static MembershipRequest rehydrate(
        TenantId tenantId,
        MembershipRequestId id,
        ActorId requesterId,
        MembershipRequestStatus status,
        String message,
        ActorId reviewedBy,
        String reviewNote,
        Instant requestedAt,
        Instant reviewedAt,
        Instant updatedAt,
        long version);

public void approve(ActorId reviewerId, String note, Instant now);

public void reject(ActorId reviewerId, String reason, Instant now);
```

Trim optional `message`, `note`, and `reason`; convert blank values to `null`;
reject lengths above 2,000; require positive versions; increment version once
inside each terminal transition. The service checks submitted version and
pending status before calling a transition so it can emit distinct conflict
codes.

- [ ] **Step 4: Add immutable commands and search query**

Use these exact public shapes:

```java
public record SubmitMembershipRequestCommand(
        String tenantCode,
        String message) {}

public record ApproveMembershipRequestCommand(
        MembershipRequestId requestId,
        long version,
        List<UUID> roleIds,
        String reviewNote) {}

public record RejectMembershipRequestCommand(
        MembershipRequestId requestId,
        long version,
        String reason) {}

public record MembershipRequestSearchQuery(
        MembershipRequestStatus status,
        PageQuery pageQuery) {}
```

Compact constructors must require non-null identifiers/collections, copy role
IDs defensively, and require a non-null status and page query. Web validation
owns HTTP limits; service validation remains authoritative for non-web callers.

- [ ] **Step 5: Add immutable application DTOs**

Use these records:

```java
public record TenantReference(
        TenantId id,
        String tenantCode,
        String displayName) {}

public record UserReference(
        ActorId id,
        String email,
        String displayName) {}

public record RoleReference(
        UUID id,
        String roleCode,
        String name) {}

public record MembershipRequestDetails(
        MembershipRequestId id,
        TenantReference tenant,
        UserReference requester,
        MembershipRequestStatus status,
        String message,
        Instant requestedAt,
        UserReference reviewer,
        Instant reviewedAt,
        String reviewNote,
        long version) {}

public record ApprovedMembershipDetails(
        TenantId tenantId,
        UserReference user,
        TenantMembershipStatus status,
        boolean tenantAdmin,
        Instant joinedAt,
        List<RoleReference> roles,
        long version) {}
```

Defensively copy `roles`; require all mandatory values; permit nullable
reviewer, reviewed time, message, and review note only where the request status
allows them.

- [ ] **Step 6: Define the repository port**

Create this exact boundary:

```java
public interface MembershipRequestRepository {

    Optional<TenantReference> findAvailableTenantByCode(String tenantCode);

    Optional<UserReference> lockActiveUser(ActorId userId);

    boolean hasNonRemovedMembership(TenantId tenantId, ActorId userId);

    boolean hasPendingRequest(TenantId tenantId, ActorId userId);

    void insert(MembershipRequest request);

    PageResult<MembershipRequestDetails> search(
            TenantId tenantId,
            MembershipRequestSearchQuery query);

    Optional<MembershipRequest> findByIdForUpdate(
            TenantId tenantId,
            MembershipRequestId requestId);

    Optional<TenantMembershipState> findMembershipForUpdate(
            TenantId tenantId,
            ActorId userId);

    List<RoleReference> findAssignableRolesForUpdate(
            TenantId tenantId,
            List<UUID> roleIds);

    void insertActiveMembership(
            TenantId tenantId,
            ActorId userId,
            ActorId reviewerId,
            Instant now);

    int reactivateRemovedMembership(
            TenantId tenantId,
            ActorId userId,
            ActorId reviewerId,
            Instant now);

    void deleteRoleAssignments(TenantId tenantId, ActorId userId);

    void insertRoleAssignments(
            TenantId tenantId,
            ActorId userId,
            List<RoleReference> roles,
            ActorId reviewerId,
            Instant now);

    int updateResolution(MembershipRequest request, long expectedVersion);

    Optional<MembershipRequestDetails> findDetails(
            TenantId tenantId,
            MembershipRequestId requestId);

    Optional<ApprovedMembershipDetails> findApprovedMembership(
            TenantId tenantId,
            ActorId userId);
}
```

- [ ] **Step 7: Define the facade**

```java
public interface MembershipRequestFacade {

    MembershipRequestDetails submit(
            SubmitMembershipRequestCommand command);

    PageResult<MembershipRequestDetails> search(
            MembershipRequestSearchQuery query);

    ApprovedMembershipDetails approve(
            ApproveMembershipRequestCommand command);

    MembershipRequestDetails reject(
            RejectMembershipRequestCommand command);
}
```

- [ ] **Step 8: Statically inspect Task 2**

Verify nullability, enum values, version rules, 2,000-character normalization,
defensive copies, and exact signature consistency between commands, DTOs,
repository, and facade. Do not compile.

---

### Task 3: Implement tenant-safe JDBC persistence

**Files:**

- Create: `crm/src/main/java/com/crm/platform/membership/infrastructure/persistence/JdbcMembershipRequestRepository.java`

**Interfaces:**

- Consumes: `MembershipRequestRepository` from Task 2 and the table/permissions from Task 1.
- Produces: all database behavior required by `MembershipRequestApplicationService` in Task 4.

- [ ] **Step 1: Implement available-tenant and active-user lookups**

`findAvailableTenantByCode` must use trimmed input and expose only the minimal
tenant reference:

```sql
SELECT t.id, t.tenant_code, t.display_name
FROM platform_tenants t
WHERE t.tenant_code = :tenantCode
  AND t.status IN ('TRIAL', 'ACTIVE')
FOR SHARE
```

`lockActiveUser` must lock the global user row and return its reference only
when `status='ACTIVE'`:

```sql
SELECT u.id, u.email, u.display_name
FROM platform_users u
WHERE u.id = :userId
  AND u.status = 'ACTIVE'
FOR UPDATE
```

- [ ] **Step 2: Implement submission eligibility and insert**

Use tenant and user parameters for the non-removed membership and pending
request counts. Insert all aggregate fields with named parameters:

```sql
INSERT INTO platform_membership_requests (
    tenant_id, id, requester_user_id, request_status,
    message, requested_at, created_at, updated_at, version
) VALUES (
    :tenantId, :id, :requesterUserId, :status,
    :message, :requestedAt, :createdAt, :updatedAt, :version
)
```

Require exactly one affected row.

- [ ] **Step 3: Implement deterministic paginated review search**

Use one count query and one data query scoped by tenant and status. Join the
requester, tenant, and nullable reviewer, and order exactly:

```sql
ORDER BY mr.requested_at DESC, mr.id DESC
LIMIT :size OFFSET :offset
```

Return `PageResult.of(items, query.pageQuery(), totalElements)`. Reviewer
details come from a `LEFT JOIN platform_users reviewer`; never query request
rows without `mr.tenant_id = :tenantId`.

- [ ] **Step 4: Implement locked request rehydration**

Select all aggregate columns using:

```sql
WHERE mr.tenant_id = :tenantId
  AND mr.id = :requestId
FOR UPDATE
```

Map nullable reviewer and review timestamps safely and call
`MembershipRequest.rehydrate(...)`.

- [ ] **Step 5: Lock membership state and assignable roles**

Lock an existing membership row with:

```sql
SELECT m.membership_status, m.version
FROM platform_tenant_memberships m
WHERE m.tenant_id = :tenantId
  AND m.user_id = :userId
FOR UPDATE
```

For roles, sort UUID strings before binding and lock the complete matching set:

```sql
SELECT r.id, r.role_code, r.name
FROM platform_roles r
WHERE r.tenant_id = :tenantId
  AND r.id IN (:roleIds)
  AND r.status = 'ACTIVE'
  AND r.deleted_at IS NULL
  AND r.is_system = false
ORDER BY r.id
FOR UPDATE
```

The application service compares the returned IDs with the submitted distinct
set; a short result is the generic invalid-role error.

- [ ] **Step 6: Implement membership creation and reactivation**

New membership insert:

```sql
INSERT INTO platform_tenant_memberships (
    tenant_id, user_id, membership_status, joined_at, removed_at,
    is_tenant_admin, created_at, updated_at,
    created_by, updated_by, version
) VALUES (
    :tenantId, :userId, 'ACTIVE', :joinedAt, NULL,
    false, :createdAt, :updatedAt,
    :createdBy, :updatedBy, 1
)
```

Reactivation update must be restricted to the locked removed row:

```sql
UPDATE platform_tenant_memberships
SET membership_status = 'ACTIVE',
    joined_at = :joinedAt,
    removed_at = NULL,
    is_tenant_admin = false,
    updated_at = :updatedAt,
    updated_by = :updatedBy
WHERE tenant_id = :tenantId
  AND user_id = :userId
  AND membership_status = 'REMOVED'
```

Require one affected row. Let the existing membership touch trigger increment
the reactivated membership version.

- [ ] **Step 7: Replace role assignments securely**

Always remove prior assignment rows for the applicant and tenant before
inserting selected roles:

```sql
DELETE FROM platform_user_roles
WHERE tenant_id = :tenantId
  AND user_id = :userId
```

Then insert each already sorted `RoleReference`:

```sql
INSERT INTO platform_user_roles (
    tenant_id, user_id, role_id, valid_from,
    valid_to, assigned_by, created_at
) VALUES (
    :tenantId, :userId, :roleId, :validFrom,
    NULL, :assignedBy, :createdAt
)
```

This prevents old grants from becoming effective when a removed membership is
reactivated.

- [ ] **Step 8: Implement request resolution and response reloads**

Update a locked request using both tenant ID and expected version:

```sql
UPDATE platform_membership_requests
SET request_status = :status,
    reviewed_by = :reviewedBy,
    review_note = :reviewNote,
    reviewed_at = :reviewedAt,
    updated_at = :updatedAt
WHERE tenant_id = :tenantId
  AND id = :requestId
  AND version = :expectedVersion
```

The request touch trigger supplies `OLD.version + 1`; require one affected row.
`findDetails` joins tenant/requester/reviewer for submit and reject responses.
`findApprovedMembership` joins the active membership, user, and active selected
roles, returning membership version and roles ordered by role code then ID.

- [ ] **Step 9: Statically inspect Task 3**

Confirm every parameter is named, every request/role/membership lookup is
tenant scoped, nullable timestamps are safe, locks use deterministic order,
row counts are checked, and SQL column names match `docs/crm_mysql80.sql`. Do
not connect to MySQL.

---

### Task 4: Implement transactional membership-request orchestration

**Files:**

- Create: `crm/src/main/java/com/crm/platform/membership/application/service/MembershipRequestApplicationService.java`

**Interfaces:**

- Consumes: `MembershipRequestFacade`, `MembershipRequestRepository`, domain types, `CurrentActor`, `CurrentTenant`, `PermissionChecker`, `IdentifierGenerator`, and `TimeProvider`.
- Produces: complete submit, search, approve, and reject use cases for the controller.

- [ ] **Step 1: Add service dependencies and permission constants**

Use a non-final Spring service and these exact constants:

```java
private static final String READ_PERMISSION =
        "platform_membership.read";
private static final String APPROVE_PERMISSION =
        "platform_membership.approve";
private static final String ASSIGN_PERMISSION =
        "platform_role.assign";
private static final int MAX_ASSIGNABLE_ROLES = 20;
```

Inject the repository plus existing context, permission, identifier, and time
abstractions through the constructor.

- [ ] **Step 2: Implement authenticated submission without tenant context**

Mark `submit` transactional and execute:

```java
ActorId actorId = currentActor.requireActorId();
UserReference requester = repository.lockActiveUser(actorId)
        .orElseThrow(() -> new AccessDeniedException(
                "Active user is required"));
TenantReference tenant = repository
        .findAvailableTenantByCode(command.tenantCode().trim())
        .orElseThrow(() -> new DomainResourceNotFound(
                MembershipRequestErrorCode.TENANT_NOT_AVAILABLE));
```

Reject a non-removed membership with `MEMBERSHIP_ALREADY_EXISTS`. Reject a
pending request with `MEMBERSHIP_REQUEST_ALREADY_PENDING`. Create the aggregate
with a generated ID and one shared timestamp, then insert and reload details.

If insert raises `DuplicateKeyException`, re-query `hasPendingRequest`. Translate
only a confirmed pending request to `MEMBERSHIP_REQUEST_ALREADY_PENDING`;
otherwise rethrow the database exception.

Do not call `currentTenant` or require any tenant permission in this method.

- [ ] **Step 3: Implement authorized review search**

Mark `search` read-only transactional. Require current tenant and actor, then
call `permissionChecker.requirePermission(READ_PERMISSION)` before delegating
to the repository.

- [ ] **Step 4: Implement approval preconditions in the required order**

Mark `approve` transactional. Require tenant and actor, then both permissions:

```java
permissionChecker.requirePermission(APPROVE_PERMISSION);
permissionChecker.requirePermission(ASSIGN_PERMISSION);
```

Require 1-20 distinct role IDs. Lock the request, return
`MEMBERSHIP_REQUEST_NOT_FOUND` when absent, compare version first, then require
`PENDING`. Lock the active requester. Lock membership state and reject every
status except `REMOVED` with `MEMBERSHIP_ALREADY_EXISTS`.

Sort submitted role IDs, load assignable roles, and compare exact ID sets. Any
missing, cross-tenant, inactive, deleted, duplicate, or system role condition
becomes `BusinessRuleViolation(MEMBERSHIP_ROLE_INVALID)`.

- [ ] **Step 5: Implement atomic approval writes**

Capture one timestamp. Insert membership when no row exists; otherwise require
the locked state to be `REMOVED` and reactivate it. Delete all prior role
assignments, insert only selected roles, call `request.approve(...)`, and update
resolution with the old version.

If membership insertion raises `DuplicateKeyException`, re-query membership;
translate only a confirmed non-removed row to `MEMBERSHIP_ALREADY_EXISTS`, and
otherwise rethrow. Require the resolution update to affect one row, then reload
`ApprovedMembershipDetails`; an absent reload is an internal consistency error.

- [ ] **Step 6: Implement rejection**

Mark `reject` transactional. Require tenant, actor, and only
`APPROVE_PERMISSION`. Lock request by tenant and ID, compare version before
status, require pending, call `request.reject(...)`, persist with the old
version, and reload `MembershipRequestDetails`.

- [ ] **Step 7: Add focused exception helpers**

Map conditions exactly:

```java
new DomainResourceNotFound(MEMBERSHIP_REQUEST_NOT_FOUND)
new ResourceConflict(MEMBERSHIP_REQUEST_ALREADY_PENDING)
new ResourceConflict(MEMBERSHIP_ALREADY_EXISTS)
new ResourceConflict(MEMBERSHIP_REQUEST_ALREADY_RESOLVED)
new ResourceConflict(MEMBERSHIP_REQUEST_VERSION_CONFLICT)
new BusinessRuleViolation(MEMBERSHIP_ROLE_INVALID)
```

Cross-tenant request IDs and role IDs must use the same not-found/invalid codes
as absent IDs.

- [ ] **Step 8: Statically inspect Task 4**

Trace each use case against the design order. Confirm submit never reads
current tenant, review always reads it, approval checks both permissions before
protected data, version precedes status, reactivation clears old assignments,
and all approval writes share one transaction and timestamp. Do not run the
service.

---

### Task 5: Add validated HTTP contracts and localized errors

**Files:**

- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/SubmitMembershipRequestRequest.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/MembershipRequestSearchRequest.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/ApproveMembershipRequestRequest.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/RejectMembershipRequestRequest.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/MembershipRequestSubmissionResponse.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/MembershipRequestReviewResponse.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/ApprovedMembershipResponse.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/MembershipRequestWebMapper.java`
- Create: `crm/src/main/java/com/crm/platform/membership/presentation/web/MembershipRequestController.java`
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`

**Interfaces:**

- Consumes: facade, commands, queries, and DTOs from Tasks 2 and 4.
- Produces: four implemented REST endpoints and bilingual stable errors.

- [ ] **Step 1: Add submission and search request records**

Submission:

```java
public record SubmitMembershipRequestRequest(
        @NotBlank @Size(max = 320) String tenantCode,
        @Size(max = 2000) String message) {
    public SubmitMembershipRequestRequest {
        tenantCode = tenantCode == null ? null : tenantCode.trim();
        message = normalizeOptional(message);
    }
}
```

Search:

```java
public record MembershipRequestSearchRequest(
        MembershipRequestStatus status,
        @Min(0) Integer page,
        @Min(1) @Max(100) Integer size) {}
```

Mapper defaults are `PENDING`, page `0`, and `PageQuery.DEFAULT_SIZE`.

- [ ] **Step 2: Add approval and rejection request records**

Approval:

```java
public record ApproveMembershipRequestRequest(
        @NotNull @Positive Long version,
        @NotEmpty @Size(max = 20)
        List<@NotNull UUID> roleIds,
        @Size(max = 2000) String reviewNote) {

    @AssertTrue
    public boolean isRoleIdsDistinct() {
        return roleIds == null
                || new HashSet<>(roleIds).size() == roleIds.size();
    }
}
```

Copy the list and normalize `reviewNote` in the compact constructor. Rejection
uses `@NotNull @Positive Long version` and optional normalized
`@Size(max=2000) String reason`.

- [ ] **Step 3: Add response records matching the approved JSON**

`MembershipRequestSubmissionResponse` includes request ID, nested tenant,
status, message, request/review timestamps, review note, and version.

`MembershipRequestReviewResponse` includes request ID, nested requester,
status, message, request timestamp, nullable nested reviewer, reviewed time,
review note, and version.

`ApprovedMembershipResponse` includes tenant ID, nested user, `ACTIVE` status,
`tenantAdmin`, joined time, ordered nested roles, and membership version.

Use UUIDs in HTTP responses rather than domain wrappers.

- [ ] **Step 4: Implement the manual mapper**

Create `@Component public final class MembershipRequestWebMapper` with:

```java
SubmitMembershipRequestCommand toSubmitCommand(
        SubmitMembershipRequestRequest request);

MembershipRequestSearchQuery toSearchQuery(
        MembershipRequestSearchRequest request);

ApproveMembershipRequestCommand toApproveCommand(
        MembershipRequestId id,
        ApproveMembershipRequestRequest request);

RejectMembershipRequestCommand toRejectCommand(
        MembershipRequestId id,
        RejectMembershipRequestRequest request);

MembershipRequestSubmissionResponse toSubmissionResponse(
        MembershipRequestDetails details);

MembershipRequestReviewResponse toReviewResponse(
        MembershipRequestDetails details);

ApprovedMembershipResponse toApprovedResponse(
        ApprovedMembershipDetails details);

PageResult<MembershipRequestReviewResponse> toReviewPage(
        PageResult<MembershipRequestDetails> page);
```

Use manual mapping to keep nullable reviewer handling explicit and avoid adding
another generated MapStruct source during this slice.

- [ ] **Step 5: Add the controller**

Create one controller:

```java
@RestController
@RequestMapping("/api/membership-requests")
public final class MembershipRequestController {

    @PostMapping
    public ResponseEntity<MembershipRequestSubmissionResponse> submit(
            @Valid @RequestBody SubmitMembershipRequestRequest request);

    @GetMapping
    public PageResult<MembershipRequestReviewResponse> search(
            @Valid @ModelAttribute MembershipRequestSearchRequest request);

    @PostMapping("/{id}/approve")
    public ApprovedMembershipResponse approve(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveMembershipRequestRequest request);

    @PostMapping("/{id}/reject")
    public MembershipRequestReviewResponse reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectMembershipRequestRequest request);
}
```

Submission returns `201 Created` with the documented body.
Search/approve/reject return `200`. Do not make any route public in
`IdentitySecurityConfiguration`.

- [ ] **Step 6: Add bilingual error messages**

Add all seven message keys from Task 2 to the three bundles. Keep
`messages.properties` aligned with the repository's current Vietnamese default,
add English text to `messages_en.properties`, and Vietnamese text to
`messages_vi.properties`. Stable error codes remain language independent.

- [ ] **Step 7: Statically inspect Task 5**

Compare validation annotations with every limit in the spec, ensure duplicate
role IDs fail request validation, ensure no submit method accepts
`X-Tenant-ID`, ensure review methods rely on the service authorization, verify
response nullability, and compare message-key sets across all bundles. Do not
start Spring or invoke an endpoint.

---

### Task 6: Synchronize API and roadmap documentation

**Files:**

- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`
- Modify: `docs/superpowers/specs/2026-08-10-membership-join-request-design.md` only if source implementation reveals a contract correction that must be recorded.

**Interfaces:**

- Consumes: implemented controllers, request validation, DTOs, service permission checks, SQL behavior, and error codes from Tasks 1-5.
- Produces: the authoritative English API contract and updated delivery roadmap.

- [ ] **Step 1: Correct existing Role Management permission documentation**

Update the endpoint index and Roles/Permissions section:

```text
GET /api/permissions      platform_role.read
GET /api/roles            platform_role.read
GET /api/roles/{id}       platform_role.read
POST /api/roles           platform_role.manage
PUT /api/roles/{id}       platform_role.manage
DELETE /api/roles/{id}    platform_role.manage
```

Keep `platform_user.manage` documented as a legacy compatibility permission,
not as the required permission for these routes.

- [ ] **Step 2: Add all four membership-request endpoints to the index**

Document submission as Bearer-only without tenant header, list with
`platform_membership.read`, approval with both approved permissions, and
rejection with `platform_membership.approve`.

- [ ] **Step 3: Add the complete membership-request API section**

Derive and document from source:

- headers and authentication;
- request/response examples;
- nested object fields and nullability;
- normalization and validation limits;
- default pagination and ordering;
- available-tenant behavior;
- one-pending-request behavior;
- new membership versus removed-membership reactivation;
- mandatory custom roles and system-role prohibition;
- assignment replacement during reactivation;
- transaction and optimistic-concurrency behavior;
- all documented status/error-code pairs; and
- post-approval `GET /api/auth/me` then `GET /api/access/me` flow.

- [ ] **Step 4: Update the technical roadmap**

Mark user-initiated join request submission, tenant review, and atomic initial
role assignment as delivered. Keep invitations, direct assignment management,
membership lifecycle, Tenant Admin promotion, teams, and platform-operator
tenant provisioning explicitly deferred.

- [ ] **Step 5: Statically compare docs to source**

For every route, compare controller mapping, DTO fields, validation,
permission constants, service exceptions, response mapping, and SQL side
effects against the reference. Remove obsolete role examples that do not match
the implemented `PermissionResponse`, `CreateRoleRequest`, or `RoleResponse`.

---

### Task 7: Perform repository-wide static verification and handoff

**Files:**

- Inspect: all files changed by Tasks 1-6
- Do not create test artifacts, build output, generated sources, or commits.

**Interfaces:**

- Consumes: the complete implementation.
- Produces: a factual handoff listing changed behavior and unverified runtime concerns.

- [ ] **Step 1: Inspect the scoped diff**

Use `rtk diff` or `git diff -- <scoped paths>` and verify there are no unrelated
changes. Preserve all pre-existing user modifications.

- [ ] **Step 2: Run whitespace validation only**

Run:

```bash
git diff --check
```

Expected: no whitespace errors. This is not a build or test.

- [ ] **Step 3: Scan for incomplete implementation markers**

Use `rg -n "T[B]D|T[O]DO|F[I]XME"` on the new membership package and changed
documentation, then inspect placeholder bodies, accidental secrets, and
obsolete `platform_user.manage` route requirements. Review every match
manually.

- [ ] **Step 4: Trace authorization end to end**

Statically confirm:

```text
submit: bearer actor -> active user -> tenantCode lookup -> pending request
list: bearer actor + active tenant -> membership.read -> tenant-filtered query
approve: bearer actor + active tenant -> membership.approve + role.assign
         -> locked request/user/membership/roles
         -> membership insert/reactivation
         -> prior assignment deletion + selected assignment inserts
         -> request approval
reject: bearer actor + active tenant -> membership.approve
        -> locked request -> rejection
```

- [ ] **Step 5: Trace schema and permission compatibility**

Confirm the SQL seed contains all permission codes used in Java, bootstrap
grants them, legacy roles are backfilled idempotently, Role Management uses the
new read/manage permissions, and `DatabasePermissionChecker` can resolve them
without any JWT changes.

- [ ] **Step 6: State verification limits in the handoff**

Explicitly report that compilation, annotation processing, Spring context,
SQL execution, constraints, transaction behavior, and runtime API responses
were not executed because the repository forbids tests/build/runtime checks.
Leave all work uncommitted for the user to inspect and test.
