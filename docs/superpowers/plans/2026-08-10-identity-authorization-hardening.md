# Identity and Authorization Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan task-by-task. Execute
> inline and do not dispatch subagents. Steps use checkbox (`- [ ]`) syntax
> for tracking.

**Goal:** Strengthen authentication-state semantics and provide fail-closed,
tenant-aware permission and data-scope authorization for future CRM business
operations.

**Architecture:** Keep account-state decisions in the identity domain, keep
database-backed permission and scope evaluation as separate low-level
components, and combine both through one foundation authorization boundary.
Existing authentication endpoints remain tenant-optional because only future
tenant-owned application services will call the new boundary.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring Security, Spring JDBC,
MySQL 8.0.

## Global Constraints

- Keep `crm/src/main/resources/application.yaml` unchanged.
- Keep the existing JWT key files and key-loading behavior unchanged.
- Keep `docs/crm_mysql80.sql` and `docs/crm_mysql80_auth.sql` unchanged.
- Do not introduce Flyway, Liquibase, or another migration mechanism.
- Do not add or modify HTTP routes, DTOs, cookies, JWT claims, or response
  contracts.
- Do not add Account, Lead, Tenant Administration, or other business APIs.
- Do not run tests, builds, the application, API requests, or database
  requests; the user performs runtime verification.
- Do not stage or commit files.
- Preserve unrelated user changes, including IDE and generated-source files.

---

### Task 1: Express Account and Credential Lock Semantics in the Domain

**Files:**

- Modify:
  `crm/src/main/java/com/crm/identity/domain/UserAccount.java`
- Modify:
  `crm/src/main/java/com/crm/identity/application/service/AuthenticationApplicationService.java`
- Modify:
  `crm/src/main/java/com/crm/identity/application/service/AuthenticationSessionService.java`

**Interfaces:**

- Produces `UserAccount.permitsAuthentication(): boolean` for persistent
  lifecycle state.
- Produces
  `UserAccount.isTemporaryCredentialLockActiveAt(Instant now): boolean` for
  the credential-level lockout window.
- Produces
  `UserAccount.permitsPasswordAuthenticationAt(Instant now): boolean` as the
  combined password-login decision.
- Removes the ambiguous `isActive()` and `isTemporarilyLocked(Instant)`
  decision methods after all consumers migrate.

- [x] **Step 1: Replace ambiguous account-state methods with explicit domain
  decisions**

  Add the following behavior to `UserAccount`:

  ```java
  public boolean permitsAuthentication() {
      return status == UserStatus.ACTIVE;
  }

  public boolean isTemporaryCredentialLockActiveAt(Instant now) {
      Objects.requireNonNull(now, "now must not be null");
      return lockedUntil != null && lockedUntil.isAfter(now);
  }

  public boolean permitsPasswordAuthenticationAt(Instant now) {
      return permitsAuthentication()
              && !isTemporaryCredentialLockActiveAt(now);
  }
  ```

  `UserStatus.LOCKED` remains a persistent administrative state. The
  `lockedUntil` value remains a temporary local-credential lockout and does
  not mutate `UserStatus`.

- [x] **Step 2: Route local password login through the domain decisions**

  Keep the existing timing protections and failure audit behavior. Reject a
  non-authenticatable lifecycle state with the dummy hash, then reject an
  active credential lock with the real stored hash:

  ```java
  if (!user.permitsAuthentication() || user.passwordHash() == null) {
      passwordHasher.matches(command.password(), dummyPasswordHash);
      auditRecorder.recordLoginFailure(
              user.id(), normalizedEmail, metadata, now);
      throw invalidCredentials();
  }
  if (!user.permitsPasswordAuthenticationAt(now)) {
      passwordHasher.matches(command.password(), user.passwordHash());
      auditRecorder.recordLoginFailure(
              user.id(), normalizedEmail, metadata, now);
      throw invalidCredentials();
  }
  ```

- [x] **Step 3: Route non-password authentication checks through lifecycle
  semantics**

  Use `permitsAuthentication()` for external login, refresh-token account
  loading, and current-identity account loading. Temporary local-password
  lockout must not invalidate an already-issued refresh session or a verified
  external identity; the persistent `LOCKED` or `DISABLED` status denies all
  three paths.

- [x] **Step 4: Perform static task verification**

  Use `rtk grep` to confirm no Java consumer references `isActive()` or
  `isTemporarilyLocked(Instant)`. Inspect the three modified files and confirm
  failed-login persistence still writes only `failedAttempts` and
  `lockedUntil`.

### Task 2: Make Permission Evaluation Fail Closed

**Files:**

- Modify:
  `crm/src/main/java/com/crm/foundation/security/DatabasePermissionChecker.java`
- Inspect: `crm/src/main/java/com/crm/foundation/security/PermissionChecker.java`

**Interfaces:**

- Preserves `PermissionChecker.hasPermission(String permission): boolean`.
- Preserves `PermissionChecker.requirePermission(String permission): void`.
- `hasPermission` returns `false`, rather than throwing a missing-context
  exception, for absent actor context, absent tenant context, null input, or
  blank input.
- `requirePermission` continues to throw `AccessDeniedException` whenever
  `hasPermission` returns `false`.

- [x] **Step 1: Add fail-closed input and context guards**

  Check the permission string before reading context, then use the optional
  context accessors:

  ```java
  if (permission == null || permission.isBlank()) {
      return false;
  }
  var actorId = currentActor.actorId();
  var tenantId = currentTenant.tenantId();
  if (actorId.isEmpty() || tenantId.isEmpty()) {
      return false;
  }
  ```

  Bind `actorId.get().toString()` and `tenantId.get().toString()` to preserve
  the existing JDBC UUID-string behavior.

- [x] **Step 2: Require a catalogued permission and constrain Tenant Admin
  bypass by risk**

  Change the query so `platform_permissions` is part of the outer authorized
  row and use its risk level in the tenant-admin branch:

  ```sql
  SELECT COUNT(*)
  FROM platform_permissions p
  JOIN platform_tenant_memberships m
    ON m.tenant_id = :tenantId
   AND m.user_id = :userId
  JOIN platform_users u ON u.id = m.user_id
  JOIN platform_tenants t ON t.id = m.tenant_id
  WHERE p.permission_code = :permission
    AND m.membership_status = 'ACTIVE'
    AND u.status = 'ACTIVE'
    AND t.status IN ('TRIAL', 'ACTIVE')
    AND (
        (m.is_tenant_admin = true AND p.risk_level = 'NORMAL')
        OR EXISTS (
            SELECT 1
            FROM platform_user_roles ur
            JOIN platform_roles r
              ON r.tenant_id = ur.tenant_id AND r.id = ur.role_id
            JOIN platform_role_permissions rp
              ON rp.tenant_id = r.tenant_id AND rp.role_id = r.id
            WHERE ur.tenant_id = m.tenant_id
              AND ur.user_id = m.user_id
              AND r.status = 'ACTIVE'
              AND r.deleted_at IS NULL
              AND ur.valid_from <= CURRENT_TIMESTAMP(6)
              AND (ur.valid_to IS NULL
                   OR ur.valid_to > CURRENT_TIMESTAMP(6))
              AND rp.permission_code = p.permission_code
        )
    )
  ```

  An explicit active role grant authorizes all catalogued risk levels. The
  implicit Tenant Admin path authorizes only `NORMAL`. Unknown permission
  codes produce no outer row.

- [x] **Step 3: Preserve the public denial behavior**

  Keep the current implementation shape:

  ```java
  if (!hasPermission(permission)) {
      throw new AccessDeniedException("Required permission is missing");
  }
  ```

  This continues through the existing global `403 ACCESS_DENIED` mapping.

- [x] **Step 4: Perform static task verification**

  Inspect the final query and confirm it contains the permission catalog,
  `risk_level = 'NORMAL'`, active user/membership/tenant predicates, active
  role predicates, and role-assignment validity predicates. Confirm no
  `requireActorId()` or `requireTenantId()` call remains in this checker.

### Task 3: Make Data-Scope Resolution Fail Closed

**Files:**

- Modify:
  `crm/src/main/java/com/crm/foundation/security/DatabaseDataScopeResolver.java`
- Inspect: `crm/src/main/java/com/crm/foundation/security/DataScopeResolver.java`
- Inspect: `crm/src/main/java/com/crm/foundation/security/ResolvedDataScope.java`

**Interfaces:**

- Preserves
  `DataScopeResolver.resolve(String entityType): Set<ResolvedDataScope>`.
- Returns `Set.of()` for absent actor context, absent tenant context, null
  entity type, or blank entity type.
- Preserves the `OWN`, `TEAM`, `TEAM_TREE`, and `TENANT` scope model.

- [x] **Step 1: Add fail-closed input and context guards**

  Apply the same optional-context pattern as permission evaluation:

  ```java
  if (entityType == null || entityType.isBlank()) {
      return Set.of();
  }
  var actorId = currentActor.actorId();
  var tenantId = currentTenant.tenantId();
  if (actorId.isEmpty() || tenantId.isEmpty()) {
      return Set.of();
  }
  ```

- [x] **Step 2: Validate the complete active context for Tenant Admin scope**

  Replace the membership-only administrator query with a query joining
  `platform_users` and `platform_tenants`:

  ```sql
  SELECT COUNT(*)
  FROM platform_tenant_memberships m
  JOIN platform_users u ON u.id = m.user_id
  JOIN platform_tenants t ON t.id = m.tenant_id
  WHERE m.tenant_id = :tenantId
    AND m.user_id = :userId
    AND m.membership_status = 'ACTIVE'
    AND m.is_tenant_admin = true
    AND u.status = 'ACTIVE'
    AND t.status IN ('TRIAL', 'ACTIVE')
  ```

  Only this result grants `Set.of(new ResolvedDataScope(TENANT, null))`.

- [x] **Step 3: Validate the complete active context for role-derived scopes**

  Start the scope query from the active membership and join the user, tenant,
  role assignment, role, and data-scope rows:

  ```sql
  SELECT DISTINCT ds.scope_type, ds.team_id
  FROM platform_tenant_memberships m
  JOIN platform_users u ON u.id = m.user_id
  JOIN platform_tenants t ON t.id = m.tenant_id
  JOIN platform_user_roles ur
    ON ur.tenant_id = m.tenant_id AND ur.user_id = m.user_id
  JOIN platform_roles r
    ON r.tenant_id = ur.tenant_id AND r.id = ur.role_id
  JOIN platform_role_data_scopes ds
    ON ds.tenant_id = r.tenant_id AND ds.role_id = r.id
  WHERE m.tenant_id = :tenantId
    AND m.user_id = :userId
    AND m.membership_status = 'ACTIVE'
    AND u.status = 'ACTIVE'
    AND t.status IN ('TRIAL', 'ACTIVE')
    AND r.status = 'ACTIVE'
    AND r.deleted_at IS NULL
    AND ur.valid_from <= CURRENT_TIMESTAMP(6)
    AND (ur.valid_to IS NULL OR ur.valid_to > CURRENT_TIMESTAMP(6))
    AND ds.entity_type = :entityType
  ```

- [x] **Step 4: Perform static task verification**

  Confirm every resolution path validates actor, tenant, user, membership,
  and tenant state. Confirm an empty query result remains an empty set and no
  missing-context exception is thrown by this resolver.

### Task 4: Add the Combined Tenant Authorization Boundary

**Files:**

- Create:
  `crm/src/main/java/com/crm/foundation/security/AuthorizedDataAccess.java`
- Create:
  `crm/src/main/java/com/crm/foundation/security/TenantAccessAuthorizer.java`

**Interfaces:**

- Produces immutable record
  `AuthorizedDataAccess(String permission, String entityType, Set<ResolvedDataScope> scopes)`.
- Produces
  `TenantAccessAuthorizer.authorize(String permission, String entityType): AuthorizedDataAccess`.
- Consumes `PermissionChecker.requirePermission(String)` and
  `DataScopeResolver.resolve(String)` in that order.

- [x] **Step 1: Add an immutable authorized-access result**

  Implement the record with defensive copying and invariants:

  ```java
  public record AuthorizedDataAccess(
          String permission,
          String entityType,
          Set<ResolvedDataScope> scopes) {

      public AuthorizedDataAccess {
          Objects.requireNonNull(permission, "permission must not be null");
          Objects.requireNonNull(entityType, "entityType must not be null");
          Objects.requireNonNull(scopes, "scopes must not be null");
          scopes = Set.copyOf(scopes);
          if (scopes.isEmpty()) {
              throw new IllegalArgumentException("scopes must not be empty");
          }
      }
  }
  ```

  The authorization service is responsible for converting an empty resolved
  set into access denial before this record is created.

- [x] **Step 2: Add the single business authorization entry point**

  Implement a Spring component with constructor injection:

  ```java
  @Component
  public final class TenantAccessAuthorizer {

      private final PermissionChecker permissionChecker;
      private final DataScopeResolver dataScopeResolver;

      public TenantAccessAuthorizer(PermissionChecker permissionChecker,
              DataScopeResolver dataScopeResolver) {
          this.permissionChecker = permissionChecker;
          this.dataScopeResolver = dataScopeResolver;
      }

      public AuthorizedDataAccess authorize(String permission,
              String entityType) {
          permissionChecker.requirePermission(permission);
          Set<ResolvedDataScope> scopes = dataScopeResolver.resolve(entityType);
          if (scopes.isEmpty()) {
              throw new AccessDeniedException(
                      "Required data scope is missing");
          }
          return new AuthorizedDataAccess(permission, entityType, scopes);
      }
  }
  ```

  Permission denial occurs before scope resolution. Missing context, invalid
  values, unknown permission codes, or empty scopes all fail closed as
  `AccessDeniedException`.

- [x] **Step 3: Perform static task verification**

  Confirm the record copies its set and cannot represent empty authorization.
  Confirm the authorizer calls permission evaluation before data-scope
  resolution and returns only a non-empty authorized result.

### Task 5: Record the Durable Technical Roadmap

**Files:**

- Create: `docs/technical-roadmap.md`
- Inspect: `docs/api-reference.md`

**Interfaces:**

- Produces a durable distinction between user-deferred infrastructure work
  and recommended product milestones.
- Does not change the implemented HTTP contract, so it does not modify the API
  reference.

- [x] **Step 1: Record explicitly deferred infrastructure work**

  Document these items as approved future work, with a statement that they
  are intentionally untouched by the current milestone:

  1. externalize database credentials from `application.yaml`;
  2. externalize the JWT private key and remove production fallback keys from
     main resources;
  3. convert the base and authentication SQL scripts into versioned
     migrations;
  4. configure and verify database-session UTC behavior.

- [x] **Step 2: Record recommended product and platform milestones in order**

  Document this sequence and the reason for each dependency:

  1. Tenant Administration vertical slice;
  2. current tenant access-context query for frontend capability rendering,
     without embedding permissions in JWTs;
  3. Account vertical slice using tenant context, permission, data scope,
     optimistic concurrency, and soft-delete filtering;
  4. generic audit execution context;
  5. transactional outbox before Lead Conversion or Opportunity Stage
     Change;
  6. reconciliation of legacy identity columns with
     `platform_user_identities` when schema changes are authorized.

- [x] **Step 3: Confirm the API reference remains synchronized**

  Inspect controllers and the diff. Because this milestone adds no route or
  DTO and changes no response, leave `docs/api-reference.md` unchanged.

### Task 6: Perform Static Verification and Prepare User Handoff

**Files:**

- Inspect: all files changed by Tasks 1-5.
- Verify unchanged: `crm/src/main/resources/application.yaml`.
- Verify unchanged: JWT key resources and key-loading classes.
- Verify unchanged: `docs/crm_mysql80.sql`.
- Verify unchanged: `docs/crm_mysql80_auth.sql`.
- Verify unchanged: identity controllers, DTOs, and `docs/api-reference.md`.

**Interfaces:**

- Produces an evidence-based static handoff without claiming runtime success.
- Produces a user-run verification checklist.

- [x] **Step 1: Inspect the scoped diff and whitespace**

  Run read-only `rtk diff`/`git diff` inspection and `git diff --check` for
  the exact Java and documentation files owned by this milestone. Ignore and
  preserve unrelated workspace changes.

- [x] **Step 2: Verify protected files were not modified by this milestone**

  Compare the final touched-file list with the global constraints. Confirm no
  key, configuration, SQL, controller, DTO, or API-reference file was edited.

- [x] **Step 3: Verify source-level invariants**

  Use `rtk grep` and file inspection to confirm:

  - authentication services use the explicit domain decisions;
  - permission evaluation requires a catalogued permission and applies risk
    rules;
  - permission and scope checks return denial for missing context;
  - scope evaluation validates active user, membership, tenant, role, and
    role-assignment validity;
  - `TenantAccessAuthorizer` is the combined entry point;
  - no placeholder markers or stale method names remain.

- [x] **Step 4: Hand runtime verification to the user**

  State explicitly that Codex did not run tests or build. Ask the user to run
  their Maven verification and cover normal-role grants, Tenant Admin risk
  behavior, unknown permissions, missing tenant context, inactive records,
  expired role assignments, all four data scopes, temporary password lockout,
  and persistent `LOCKED` status.
