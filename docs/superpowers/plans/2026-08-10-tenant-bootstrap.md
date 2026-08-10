# Tenant Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Use subagents only if the user explicitly authorizes multi-agent execution in a later request. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated, one-time `POST /api/tenants` bootstrap endpoint that atomically creates an active tenant, its initial Tenant Admin membership, a privileged system role grant, and the creator's non-expiring role assignment.

**Architecture:** Implement a dedicated `com.crm.platform.tenant` vertical slice. The application service owns the transaction and bootstrap policy, a focused JDBC port owns locking and writes, the web layer owns request defaults and validation, and the existing JWT/current-actor foundation remains unchanged.

**Tech Stack:** Java 21, Spring Boot 4, Spring MVC, Spring Security resource server, Spring JDBC `JdbcClient`, Jakarta Validation, MapStruct 1.6.3, MySQL 8.

## Global Constraints

- Treat `docs/superpowers/specs/2026-08-10-tenant-bootstrap-design.md` as the approved feature contract.
- Do not read or modify `crm-fe`.
- Do not modify JWT claims, signing keys, datasource configuration, `application.yaml`, or database schema files.
- Do not add tenant-management, membership-management, team-management, or general RBAC endpoints.
- Do not run tests, Maven builds, the application, database checks, browser checks, or manual API calls unless the user gives a new explicit authorization.
- Do not create, stage, or push commits. Leave every change uncommitted for user review.
- Use `apply_patch` for file edits.
- Keep `docs/api-reference.md` synchronized with the implemented endpoint in the same task.
- Use named JDBC parameters for every value. Never concatenate request values into SQL.
- Capture one `Instant` per bootstrap and use it for all creation, audit, and role-validity timestamps.
- Generate tenant and role UUIDs server-side through `IdentifierGenerator`.
- Keep examples free of real tokens, credentials, signing material, connection values, and personal data.
- Static verification commands may inspect source, diffs, YAML/XML/Markdown structure, and Git status only.

## File Map

### Domain and application contracts

- Create `crm/src/main/java/com/crm/platform/tenant/domain/TenantStatus.java`: schema-aligned tenant status enum.
- Create `crm/src/main/java/com/crm/platform/tenant/domain/TenantErrorCode.java`: stable tenant bootstrap conflict codes.
- Create `crm/src/main/java/com/crm/platform/tenant/domain/Tenant.java`: immutable initial tenant aggregate and normalization rules.
- Create `crm/src/main/java/com/crm/platform/tenant/application/command/BootstrapTenantCommand.java`: application input.
- Create `crm/src/main/java/com/crm/platform/tenant/application/dto/TenantDetails.java`: application output.
- Create `crm/src/main/java/com/crm/platform/tenant/application/port/TenantBootstrapRepository.java`: locking, eligibility, catalogue, and bootstrap-write port.
- Create `crm/src/main/java/com/crm/platform/tenant/application/usecase/TenantBootstrapFacade.java`: public application use case.

### Application and persistence

- Create `crm/src/main/java/com/crm/platform/tenant/infrastructure/persistence/JdbcTenantBootstrapRepository.java`: MySQL-compatible named-parameter SQL implementation.
- Create `crm/src/main/java/com/crm/platform/tenant/application/service/TenantBootstrapApplicationService.java`: atomic bootstrap orchestration.

### HTTP contract

- Create `crm/src/main/java/com/crm/platform/tenant/presentation/web/ValidZoneId.java`: timezone validation annotation.
- Create `crm/src/main/java/com/crm/platform/tenant/presentation/web/ZoneIdValidator.java`: Java `ZoneId` validator.
- Create `crm/src/main/java/com/crm/platform/tenant/presentation/web/BootstrapTenantRequest.java`: validated request and HTTP defaults.
- Create `crm/src/main/java/com/crm/platform/tenant/presentation/web/TenantResponse.java`: `201` response contract.
- Create `crm/src/main/java/com/crm/platform/tenant/presentation/web/TenantWebMapper.java`: MapStruct web/application mapping.
- Create `crm/src/main/java/com/crm/platform/tenant/presentation/web/TenantBootstrapController.java`: `POST /api/tenants`.

### Messages and documentation

- Modify `crm/src/main/resources/messages.properties`: English tenant conflicts.
- Modify `crm/src/main/resources/messages_vi.properties`: Vietnamese tenant conflicts.
- Modify `docs/api-reference.md`: endpoint index, complete tenant bootstrap contract, examples, and errors.
- Modify `docs/technical-roadmap.md`: record Tenant Bootstrap as the first delivered Tenant Administration slice and preserve later slices.

---

### Task 1: Add the Tenant Domain and Application Contracts

**Files:**

- Create: `crm/src/main/java/com/crm/platform/tenant/domain/TenantStatus.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/domain/TenantErrorCode.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/domain/Tenant.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/application/command/BootstrapTenantCommand.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/application/dto/TenantDetails.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/application/port/TenantBootstrapRepository.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/application/usecase/TenantBootstrapFacade.java`

**Interfaces:**

- Consumes: existing `com.crm.sharedkernel.domain.TenantId`, `ActorId`, `IdentifierGenerator`, and `TimeProvider` types in later tasks.
- Produces: `Tenant.bootstrap(...)`, `TenantDetails.from(Tenant)`, `TenantBootstrapRepository`, and `TenantBootstrapFacade.bootstrap(BootstrapTenantCommand)`.

- [ ] **Step 1: Create the tenant status and error catalogues**

Create `TenantStatus.java`:

```java
package com.crm.platform.tenant.domain;

public enum TenantStatus {

	TRIAL,
	ACTIVE,
	SUSPENDED,
	CLOSED

}
```

Create `TenantErrorCode.java`:

```java
package com.crm.platform.tenant.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum TenantErrorCode implements ErrorCode {

	TENANT_CODE_ALREADY_EXISTS(
			"TENANT_CODE_ALREADY_EXISTS",
			"tenant.code_already_exists"),
	TENANT_BOOTSTRAP_NOT_ALLOWED(
			"TENANT_BOOTSTRAP_NOT_ALLOWED",
			"tenant.bootstrap_not_allowed");

	private final String value;
	private final String messageKey;

	TenantErrorCode(String value, String messageKey) {
		this.value = value;
		this.messageKey = messageKey;
	}

	@Override
	public String value() {
		return value;
	}

	@Override
	public String messageKey() {
		return messageKey;
	}

}
```

- [ ] **Step 2: Create the immutable initial Tenant aggregate**

Create `Tenant.java` with complete normalization and invariant checks:

```java
package com.crm.platform.tenant.domain;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;
import java.util.regex.Pattern;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Tenant {

	private static final int TENANT_CODE_MAX_LENGTH = 320;
	private static final int NAME_MAX_LENGTH = 255;
	private static final int LANGUAGE_CODE_MAX_LENGTH = 10;
	private static final int TIMEZONE_MAX_LENGTH = 255;
	private static final Pattern CURRENCY_CODE_PATTERN =
			Pattern.compile("^[A-Z]{3}$");
	private static final Pattern COUNTRY_CODE_PATTERN =
			Pattern.compile("^[A-Z]{2}$");
	private static final Pattern LANGUAGE_CODE_PATTERN = Pattern.compile(
			"^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");

	private final TenantId id;
	private final String tenantCode;
	private final String legalName;
	private final String displayName;
	private final String defaultCurrencyCode;
	private final String defaultCountryCode;
	private final String defaultLanguageCode;
	private final String defaultTimezone;
	private final TenantStatus status;
	private final Instant createdAt;
	private final ActorId createdBy;
	private final Instant updatedAt;
	private final ActorId updatedBy;
	private final long version;

	private Tenant(TenantId id, String tenantCode, String legalName,
			String displayName, String defaultCurrencyCode,
			String defaultCountryCode, String defaultLanguageCode,
			String defaultTimezone, TenantStatus status, Instant createdAt,
			ActorId createdBy, Instant updatedAt, ActorId updatedBy,
			long version) {
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.tenantCode = requiredText(
				tenantCode, TENANT_CODE_MAX_LENGTH, "tenantCode");
		this.legalName = requiredText(
				legalName, NAME_MAX_LENGTH, "legalName");
		this.displayName = requiredText(
				displayName, NAME_MAX_LENGTH, "displayName");
		this.defaultCurrencyCode = requiredPattern(
				defaultCurrencyCode, CURRENCY_CODE_PATTERN,
				"defaultCurrencyCode");
		this.defaultCountryCode = requiredPattern(
				defaultCountryCode, COUNTRY_CODE_PATTERN,
				"defaultCountryCode");
		this.defaultLanguageCode = languageCode(defaultLanguageCode);
		this.defaultTimezone = timezone(defaultTimezone);
		this.status = Objects.requireNonNull(status,
				"status must not be null");
		this.createdAt = Objects.requireNonNull(createdAt,
				"createdAt must not be null");
		this.createdBy = Objects.requireNonNull(createdBy,
				"createdBy must not be null");
		this.updatedAt = Objects.requireNonNull(updatedAt,
				"updatedAt must not be null");
		this.updatedBy = Objects.requireNonNull(updatedBy,
				"updatedBy must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
	}

	public static Tenant bootstrap(TenantId id, String tenantCode,
			String legalName, String displayName,
			String defaultCurrencyCode, String defaultCountryCode,
			String defaultLanguageCode, String defaultTimezone,
			ActorId actorId, Instant now) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now,
				"now must not be null");
		return new Tenant(id, tenantCode, legalName, displayName,
				defaultCurrencyCode, defaultCountryCode,
				defaultLanguageCode, defaultTimezone, TenantStatus.ACTIVE,
				requiredNow, requiredActorId, requiredNow, requiredActorId,
				1L);
	}

	private static String requiredText(String value, int maxLength,
			String fieldName) {
		String normalized = Objects.requireNonNull(value,
				fieldName + " must not be null").trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return normalized;
	}

	private static String requiredPattern(String value, Pattern pattern,
			String fieldName) {
		String normalized = requiredText(value, NAME_MAX_LENGTH, fieldName);
		if (!pattern.matcher(normalized).matches()) {
			throw new IllegalArgumentException(
					fieldName + " has an invalid format");
		}
		return normalized;
	}

	private static String languageCode(String value) {
		String normalized = requiredText(
				value, LANGUAGE_CODE_MAX_LENGTH, "defaultLanguageCode");
		if (!LANGUAGE_CODE_PATTERN.matcher(normalized).matches()) {
			throw new IllegalArgumentException(
					"defaultLanguageCode has an invalid format");
		}
		return normalized;
	}

	private static String timezone(String value) {
		String normalized = requiredText(
				value, TIMEZONE_MAX_LENGTH, "defaultTimezone");
		try {
			ZoneId.of(normalized);
			return normalized;
		}
		catch (DateTimeException exception) {
			throw new IllegalArgumentException(
					"defaultTimezone has an invalid value", exception);
		}
	}

	public TenantId id() {
		return id;
	}

	public String tenantCode() {
		return tenantCode;
	}

	public String legalName() {
		return legalName;
	}

	public String displayName() {
		return displayName;
	}

	public String defaultCurrencyCode() {
		return defaultCurrencyCode;
	}

	public String defaultCountryCode() {
		return defaultCountryCode;
	}

	public String defaultLanguageCode() {
		return defaultLanguageCode;
	}

	public String defaultTimezone() {
		return defaultTimezone;
	}

	public TenantStatus status() {
		return status;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

	public Instant updatedAt() {
		return updatedAt;
	}

	public ActorId updatedBy() {
		return updatedBy;
	}

	public long version() {
		return version;
	}

}
```

- [ ] **Step 3: Create command and details records**

Create `BootstrapTenantCommand.java`:

```java
package com.crm.platform.tenant.application.command;

public record BootstrapTenantCommand(
		String tenantCode,
		String legalName,
		String displayName,
		String defaultCurrencyCode,
		String defaultCountryCode,
		String defaultLanguageCode,
		String defaultTimezone) {
}
```

Create `TenantDetails.java`:

```java
package com.crm.platform.tenant.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.tenant.domain.Tenant;
import com.crm.platform.tenant.domain.TenantStatus;

public record TenantDetails(
		UUID id,
		String tenantCode,
		String legalName,
		String displayName,
		TenantStatus status,
		String defaultCurrencyCode,
		String defaultCountryCode,
		String defaultLanguageCode,
		String defaultTimezone,
		boolean tenantAdmin,
		Instant createdAt,
		long version) {

	public static TenantDetails from(Tenant tenant) {
		return new TenantDetails(
				tenant.id().value(),
				tenant.tenantCode(),
				tenant.legalName(),
				tenant.displayName(),
				tenant.status(),
				tenant.defaultCurrencyCode(),
				tenant.defaultCountryCode(),
				tenant.defaultLanguageCode(),
				tenant.defaultTimezone(),
				true,
				tenant.createdAt(),
				tenant.version());
	}

}
```

- [ ] **Step 4: Create repository and use-case contracts**

Create `TenantBootstrapRepository.java`:

```java
package com.crm.platform.tenant.application.port;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.tenant.domain.Tenant;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface TenantBootstrapRepository {

	boolean lockActiveActor(ActorId actorId);

	boolean hasNonRemovedMembership(ActorId actorId);

	boolean permissionExists(String permissionCode);

	void insertTenant(Tenant tenant);

	void insertTenantAdminMembership(Tenant tenant, ActorId actorId);

	void insertSystemRole(TenantId tenantId, UUID roleId,
			ActorId actorId, Instant now);

	void grantPermission(TenantId tenantId, UUID roleId,
			String permissionCode, ActorId actorId, Instant now);

	void assignRole(TenantId tenantId, UUID roleId,
			ActorId actorId, Instant now);

}
```

Create `TenantBootstrapFacade.java`:

```java
package com.crm.platform.tenant.application.usecase;

import com.crm.platform.tenant.application.command.BootstrapTenantCommand;
import com.crm.platform.tenant.application.dto.TenantDetails;

public interface TenantBootstrapFacade {

	TenantDetails bootstrap(BootstrapTenantCommand command);

}
```

- [ ] **Step 5: Perform Task 1 static checks**

Run only read-only checks:

```bash
rg -n "class Tenant|enum TenantStatus|enum TenantErrorCode|interface TenantBootstrapRepository|interface TenantBootstrapFacade" crm/src/main/java/com/crm/platform/tenant
git diff --check -- crm/src/main/java/com/crm/platform/tenant
```

Confirm the slice reuses `com.crm.sharedkernel.domain.TenantId` and does not
create a second tenant ID type. Do not compile or run tests.

---

### Task 2: Implement the Atomic JDBC Bootstrap Adapter

**Files:**

- Create: `crm/src/main/java/com/crm/platform/tenant/infrastructure/persistence/JdbcTenantBootstrapRepository.java`

**Interfaces:**

- Consumes: every method from `TenantBootstrapRepository` created in Task 1.
- Produces: a Spring `@Repository` adapter with actor locking, membership and permission checks, and five one-row inserts.

- [ ] **Step 1: Create the repository class and read-side checks**

Start `JdbcTenantBootstrapRepository.java` with the constructor and three
read-side methods:

```java
package com.crm.platform.tenant.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.platform.tenant.application.port.TenantBootstrapRepository;
import com.crm.platform.tenant.domain.Tenant;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTenantBootstrapRepository
		implements TenantBootstrapRepository {

	private static final String ADMIN_ROLE_CODE = "TENANT_ADMIN";
	private static final String ADMIN_ROLE_NAME = "Tenant Administrator";
	private static final String ADMIN_ROLE_DESCRIPTION =
			"System role for the initial tenant administrator";

	private final JdbcClient jdbcClient;

	public JdbcTenantBootstrapRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public boolean lockActiveActor(ActorId actorId) {
		return jdbcClient.sql("""
				SELECT status
				FROM platform_users
				WHERE id = :userId
				FOR UPDATE
				""")
				.param("userId", actorId.toString())
				.query(String.class)
				.optional()
				.filter("ACTIVE"::equals)
				.isPresent();
	}

	@Override
	public boolean hasNonRemovedMembership(ActorId actorId) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_tenant_memberships
				WHERE user_id = :userId
				  AND membership_status <> 'REMOVED'
				""")
				.param("userId", actorId.toString())
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public boolean permissionExists(String permissionCode) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_permissions
				WHERE permission_code = :permissionCode
				""")
				.param("permissionCode", permissionCode)
				.query(Long.class)
				.single() > 0L;
	}
```

Keep the class open for the write methods in the next steps.

- [ ] **Step 2: Add tenant and membership inserts**

Add these methods inside the repository class:

```java
	@Override
	public void insertTenant(Tenant tenant) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_tenants (
				    id, tenant_code, legal_name, display_name,
				    default_currency_code, default_country_code,
				    default_language_code, default_timezone, status,
				    created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :id, :tenantCode, :legalName, :displayName,
				    :defaultCurrencyCode, :defaultCountryCode,
				    :defaultLanguageCode, :defaultTimezone, :status,
				    :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""")
				.param("id", tenant.id().toString())
				.param("tenantCode", tenant.tenantCode())
				.param("legalName", tenant.legalName())
				.param("displayName", tenant.displayName())
				.param("defaultCurrencyCode", tenant.defaultCurrencyCode())
				.param("defaultCountryCode", tenant.defaultCountryCode())
				.param("defaultLanguageCode", tenant.defaultLanguageCode())
				.param("defaultTimezone", tenant.defaultTimezone())
				.param("status", tenant.status().name())
				.param("createdAt", timestamp(tenant.createdAt()))
				.param("updatedAt", timestamp(tenant.updatedAt()))
				.param("createdBy", tenant.createdBy().toString())
				.param("updatedBy", tenant.updatedBy().toString())
				.param("version", tenant.version())
				.update();
		requireSingleRow(affectedRows, "Tenant insert");
	}

	@Override
	public void insertTenantAdminMembership(Tenant tenant, ActorId actorId) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_tenant_memberships (
				    tenant_id, user_id, membership_status, joined_at,
				    is_tenant_admin, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :userId, 'ACTIVE', :joinedAt,
				    true, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, 1
				)
				""")
				.param("tenantId", tenant.id().toString())
				.param("userId", actorId.toString())
				.param("joinedAt", timestamp(tenant.createdAt()))
				.param("createdAt", timestamp(tenant.createdAt()))
				.param("updatedAt", timestamp(tenant.updatedAt()))
				.param("createdBy", actorId.toString())
				.param("updatedBy", actorId.toString())
				.update();
		requireSingleRow(affectedRows, "Tenant membership insert");
	}
```

- [ ] **Step 3: Add system-role, permission-grant, and assignment inserts**

Add these methods inside the repository class:

```java
	@Override
	public void insertSystemRole(TenantId tenantId, UUID roleId,
			ActorId actorId, Instant now) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_roles (
				    tenant_id, id, role_code, name, description,
				    is_system, status, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :roleId, :roleCode, :name, :description,
				    true, 'ACTIVE', :createdAt, :updatedAt,
				    :createdBy, :updatedBy, 1
				)
				""")
				.param("tenantId", tenantId.toString())
				.param("roleId", roleId.toString())
				.param("roleCode", ADMIN_ROLE_CODE)
				.param("name", ADMIN_ROLE_NAME)
				.param("description", ADMIN_ROLE_DESCRIPTION)
				.param("createdAt", timestamp(now))
				.param("updatedAt", timestamp(now))
				.param("createdBy", actorId.toString())
				.param("updatedBy", actorId.toString())
				.update();
		requireSingleRow(affectedRows, "System role insert");
	}

	@Override
	public void grantPermission(TenantId tenantId, UUID roleId,
			String permissionCode, ActorId actorId, Instant now) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_role_permissions (
				    tenant_id, role_id, permission_code,
				    granted_at, granted_by
				) VALUES (
				    :tenantId, :roleId, :permissionCode,
				    :grantedAt, :grantedBy
				)
				""")
				.param("tenantId", tenantId.toString())
				.param("roleId", roleId.toString())
				.param("permissionCode", permissionCode)
				.param("grantedAt", timestamp(now))
				.param("grantedBy", actorId.toString())
				.update();
		requireSingleRow(affectedRows, "Role permission insert");
	}

	@Override
	public void assignRole(TenantId tenantId, UUID roleId,
			ActorId actorId, Instant now) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO platform_user_roles (
				    tenant_id, user_id, role_id, valid_from,
				    valid_to, assigned_by, created_at
				) VALUES (
				    :tenantId, :userId, :roleId, :validFrom,
				    NULL, :assignedBy, :createdAt
				)
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", actorId.toString())
				.param("roleId", roleId.toString())
				.param("validFrom", timestamp(now))
				.param("assignedBy", actorId.toString())
				.param("createdAt", timestamp(now))
				.update();
		requireSingleRow(affectedRows, "User role insert");
	}
```

- [ ] **Step 4: Close the repository with strict helpers**

Append these helpers and the closing brace:

```java
	private static Timestamp timestamp(Instant value) {
		return Timestamp.from(value);
	}

	private static void requireSingleRow(int affectedRows,
			String operation) {
		if (affectedRows != 1) {
			throw new IllegalStateException(
					operation + " must affect exactly one row");
		}
	}

}
```

- [ ] **Step 5: Perform Task 2 static checks**

Run:

```bash
rg -n "FOR UPDATE|membership_status <> 'REMOVED'|platform_user.manage|INSERT INTO platform_tenants|INSERT INTO platform_tenant_memberships|INSERT INTO platform_roles|INSERT INTO platform_role_permissions|INSERT INTO platform_user_roles" crm/src/main/java/com/crm/platform/tenant/infrastructure/persistence/JdbcTenantBootstrapRepository.java
rg -n "\.param\(" crm/src/main/java/com/crm/platform/tenant/infrastructure/persistence/JdbcTenantBootstrapRepository.java
git diff --check -- crm/src/main/java/com/crm/platform/tenant/infrastructure/persistence/JdbcTenantBootstrapRepository.java
```

Inspect the final file and confirm there is no string concatenation in SQL and
every insert calls `requireSingleRow`. Do not execute SQL.

---

### Task 3: Implement Transactional Bootstrap Orchestration

**Files:**

- Create: `crm/src/main/java/com/crm/platform/tenant/application/service/TenantBootstrapApplicationService.java`

**Interfaces:**

- Consumes: `TenantBootstrapRepository`, `CurrentActor`, `IdentifierGenerator`, `TimeProvider`, `BootstrapTenantCommand`, and `TenantDetails`.
- Produces: transactional implementation of `TenantBootstrapFacade.bootstrap(BootstrapTenantCommand)`.

- [ ] **Step 1: Create the application service with fixed bootstrap constants**

Create `TenantBootstrapApplicationService.java`:

```java
package com.crm.platform.tenant.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.tenant.application.command.BootstrapTenantCommand;
import com.crm.platform.tenant.application.dto.TenantDetails;
import com.crm.platform.tenant.application.port.TenantBootstrapRepository;
import com.crm.platform.tenant.application.usecase.TenantBootstrapFacade;
import com.crm.platform.tenant.domain.Tenant;
import com.crm.platform.tenant.domain.TenantErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantBootstrapApplicationService
		implements TenantBootstrapFacade {

	private static final String PLATFORM_USER_MANAGE =
			"platform_user.manage";

	private final TenantBootstrapRepository repository;
	private final CurrentActor currentActor;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TenantBootstrapApplicationService(
			TenantBootstrapRepository repository,
			CurrentActor currentActor,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentActor = currentActor;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public TenantDetails bootstrap(BootstrapTenantCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		ActorId actorId = currentActor.requireActorId();

		if (!repository.lockActiveActor(actorId)) {
			throw new AccessDeniedException(
					"Active user is required for tenant bootstrap");
		}
		if (repository.hasNonRemovedMembership(actorId)) {
			throw new ResourceConflict(
					TenantErrorCode.TENANT_BOOTSTRAP_NOT_ALLOWED);
		}
		if (!repository.permissionExists(PLATFORM_USER_MANAGE)) {
			throw new IllegalStateException(
					"Required permission platform_user.manage is missing");
		}

		Instant now = timeProvider.now();
		Tenant tenant = Tenant.bootstrap(
				new TenantId(identifierGenerator.nextId()),
				command.tenantCode(),
				command.legalName(),
				command.displayName(),
				command.defaultCurrencyCode(),
				command.defaultCountryCode(),
				command.defaultLanguageCode(),
				command.defaultTimezone(),
				actorId,
				now);
		UUID roleId = identifierGenerator.nextId();

		try {
			repository.insertTenant(tenant);
		}
		catch (DuplicateKeyException exception) {
			throw new ResourceConflict(
					TenantErrorCode.TENANT_CODE_ALREADY_EXISTS);
		}

		repository.insertTenantAdminMembership(tenant, actorId);
		repository.insertSystemRole(tenant.id(), roleId, actorId, now);
		repository.grantPermission(
				tenant.id(), roleId, PLATFORM_USER_MANAGE, actorId, now);
		repository.assignRole(tenant.id(), roleId, actorId, now);

		return TenantDetails.from(tenant);
	}

}
```

- [ ] **Step 2: Inspect transaction and failure ordering**

Confirm the source has this exact ordering:

1. actor lock;
2. membership denial;
3. permission catalogue check;
4. one captured `Instant`;
5. tenant insert with duplicate translation;
6. membership insert;
7. system-role insert;
8. permission grant;
9. role assignment; and
10. response mapping.

The `@Transactional` annotation must be on the public implementation method,
not on the controller or repository.

- [ ] **Step 3: Perform Task 3 static checks**

Run:

```bash
rg -n "@Transactional|lockActiveActor|hasNonRemovedMembership|permissionExists|insertTenant\(|insertTenantAdminMembership|insertSystemRole|grantPermission|assignRole|TENANT_CODE_ALREADY_EXISTS|TENANT_BOOTSTRAP_NOT_ALLOWED" crm/src/main/java/com/crm/platform/tenant/application/service/TenantBootstrapApplicationService.java
git diff --check -- crm/src/main/java/com/crm/platform/tenant/application/service/TenantBootstrapApplicationService.java
```

Do not compile, build, or invoke the service.

---

### Task 4: Expose the Validated Tenant Bootstrap HTTP API

**Files:**

- Create: `crm/src/main/java/com/crm/platform/tenant/presentation/web/ValidZoneId.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/presentation/web/ZoneIdValidator.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/presentation/web/BootstrapTenantRequest.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/presentation/web/TenantResponse.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/presentation/web/TenantWebMapper.java`
- Create: `crm/src/main/java/com/crm/platform/tenant/presentation/web/TenantBootstrapController.java`

**Interfaces:**

- Consumes: `TenantBootstrapFacade`, `BootstrapTenantCommand`, `TenantDetails`, and `CrmMapperConfig`.
- Produces: authenticated `POST /api/tenants` returning `ResponseEntity<TenantResponse>` with status `201`.

- [ ] **Step 1: Add focused timezone validation**

Create `ValidZoneId.java`:

```java
package com.crm.platform.tenant.presentation.web;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = ZoneIdValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER,
		ElementType.RECORD_COMPONENT, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidZoneId {

	String message() default "{validation.invalid}";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
```

Create `ZoneIdValidator.java`:

```java
package com.crm.platform.tenant.presentation.web;

import java.time.DateTimeException;
import java.time.ZoneId;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public final class ZoneIdValidator
		implements ConstraintValidator<ValidZoneId, String> {

	@Override
	public boolean isValid(String value,
			ConstraintValidatorContext context) {
		if (value == null) {
			return true;
		}
		try {
			ZoneId.of(value);
			return true;
		}
		catch (DateTimeException exception) {
			return false;
		}
	}

}
```

- [ ] **Step 2: Add request defaults and validation**

Create `BootstrapTenantRequest.java`:

```java
package com.crm.platform.tenant.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BootstrapTenantRequest(
		@NotBlank @Size(max = 320) String tenantCode,
		@NotBlank @Size(max = 255) String legalName,
		@NotBlank @Size(max = 255) String displayName,
		@NotBlank @Pattern(regexp = "^[A-Z]{3}$")
		String defaultCurrencyCode,
		@NotBlank @Pattern(regexp = "^[A-Z]{2}$")
		String defaultCountryCode,
		@Size(max = 10)
		@Pattern(regexp = "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$")
		String defaultLanguageCode,
		@Size(max = 255) @ValidZoneId String defaultTimezone) {

	public BootstrapTenantRequest {
		if (defaultLanguageCode == null) {
			defaultLanguageCode = "en";
		}
		if (defaultTimezone == null) {
			defaultTimezone = "UTC";
		}
	}

}
```

Missing optional fields become `en` and `UTC`. Explicit blank values remain
invalid because the pattern or `ZoneId` constraint rejects them.

- [ ] **Step 3: Add response and MapStruct mapper**

Create `TenantResponse.java`:

```java
package com.crm.platform.tenant.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.tenant.domain.TenantStatus;

public record TenantResponse(
		UUID id,
		String tenantCode,
		String legalName,
		String displayName,
		TenantStatus status,
		String defaultCurrencyCode,
		String defaultCountryCode,
		String defaultLanguageCode,
		String defaultTimezone,
		boolean tenantAdmin,
		Instant createdAt,
		long version) {
}
```

Create `TenantWebMapper.java`:

```java
package com.crm.platform.tenant.presentation.web;

import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.platform.tenant.application.command.BootstrapTenantCommand;
import com.crm.platform.tenant.application.dto.TenantDetails;
import org.mapstruct.Mapper;

@Mapper(config = CrmMapperConfig.class)
public interface TenantWebMapper {

	BootstrapTenantCommand toCommand(BootstrapTenantRequest request);

	TenantResponse toResponse(TenantDetails details);

}
```

- [ ] **Step 4: Add the controller**

Create `TenantBootstrapController.java`:

```java
package com.crm.platform.tenant.presentation.web;

import jakarta.validation.Valid;
import com.crm.platform.tenant.application.dto.TenantDetails;
import com.crm.platform.tenant.application.usecase.TenantBootstrapFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tenants")
public final class TenantBootstrapController {

	private final TenantBootstrapFacade tenants;
	private final TenantWebMapper mapper;

	public TenantBootstrapController(TenantBootstrapFacade tenants,
			TenantWebMapper mapper) {
		this.tenants = tenants;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<TenantResponse> bootstrap(
			@Valid @RequestBody BootstrapTenantRequest request) {
		TenantDetails created = tenants.bootstrap(mapper.toCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

}
```

Do not add a public route matcher to `IdentitySecurityConfiguration`. The
existing `anyRequest().authenticated()` rule must protect this endpoint.

- [ ] **Step 5: Perform Task 4 static checks**

Run:

```bash
rg -n "@RequestMapping\(\"/api/tenants\"\)|@PostMapping|@Valid|HttpStatus.CREATED|defaultLanguageCode = \"en\"|defaultTimezone = \"UTC\"|ValidZoneId" crm/src/main/java/com/crm/platform/tenant/presentation/web
rg -n "api/tenants" crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java
git diff --check -- crm/src/main/java/com/crm/platform/tenant/presentation/web
```

The second search should find no route-specific security exception. Do not run
MapStruct generation, compilation, Maven, or the application.

---

### Task 5: Synchronize Messages, API Reference, and Roadmap

**Files:**

- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`
- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`

**Interfaces:**

- Consumes: `TenantErrorCode`, `BootstrapTenantRequest`, `TenantResponse`, and controller behavior from Tasks 1-4.
- Produces: bilingual errors and an English API contract matching only implemented behavior.

- [ ] **Step 1: Add bilingual tenant conflict messages**

Append these exact entries to `messages.properties` in the domain-error area:

```properties
tenant.code_already_exists=Tenant code already exists
tenant.bootstrap_not_allowed=Tenant bootstrap is not allowed for this user
```

Append these exact entries to `messages_vi.properties` in the matching area:

```properties
tenant.code_already_exists=Mã tenant đã tồn tại
tenant.bootstrap_not_allowed=Người dùng này không được phép khởi tạo tenant
```

Do not change existing authentication, Account, validation, key, or datasource
messages.

- [ ] **Step 2: Add the endpoint-index entry**

In `docs/api-reference.md`, add this row after `GET /api/auth/me` and before the
Account rows:

```markdown
| `POST` | `/api/tenants` | Bearer access token; no tenant header | `201 Created` |
```

- [ ] **Step 3: Add the complete Tenant Bootstrap section**

Insert this section after Authentication Endpoints and before the Account API:

````markdown
## Tenant Bootstrap

### Create the first tenant

```http
POST /api/tenants
Authorization: Bearer <access-token>
Content-Type: application/json
```

This authenticated endpoint is available only to an active user without an
`INVITED`, `ACTIVE`, or `SUSPENDED` tenant membership. Do not send
`X-Tenant-ID`; the tenant context does not exist until this operation succeeds.

The operation creates the tenant, an active Tenant Admin membership, the
tenant-scoped `TENANT_ADMIN` system role, an explicit `platform_user.manage`
grant, and a non-expiring role assignment in one transaction.

#### Request body

| Field | Required | Validation and behavior |
|---|---|---|
| `tenantCode` | Yes | Trimmed, non-blank, maximum 320 characters, globally unique |
| `legalName` | Yes | Trimmed, non-blank, maximum 255 characters |
| `displayName` | Yes | Trimmed, non-blank, maximum 255 characters |
| `defaultCurrencyCode` | Yes | Exactly three uppercase letters |
| `defaultCountryCode` | Yes | Exactly two uppercase letters |
| `defaultLanguageCode` | No | Defaults to `en`; maximum 10 characters and must match a language tag |
| `defaultTimezone` | No | Defaults to `UTC`; maximum 255 characters and must be a Java `ZoneId` |

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

#### Example call

```bash
curl --request POST \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"tenantCode":"example-company","legalName":"Example Company Limited","displayName":"Example Company","defaultCurrencyCode":"USD","defaultCountryCode":"VN","defaultLanguageCode":"vi","defaultTimezone":"Asia/Ho_Chi_Minh"}' \
  http://localhost:8080/api/tenants
```

#### Success

- Status: `201 Created`
- Tenant status: `ACTIVE`
- Membership status: `ACTIVE`
- Initial tenant and role version: `1`

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

Internal membership, role, grant, and assignment identifiers are not exposed.
Call `GET /api/auth/me` after success to obtain the new active membership and
use its tenant ID as `X-Tenant-ID` on tenant-owned APIs.

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | One or more request fields are invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | The authenticated user is no longer active |
| `409` | `TENANT_CODE_ALREADY_EXISTS` | The tenant code already exists |
| `409` | `TENANT_BOOTSTRAP_NOT_ALLOWED` | The user already has a non-removed membership |
| `500` | `INTERNAL_ERROR` | Required bootstrap infrastructure is inconsistent, including a missing `platform_user.manage` catalogue entry |

This endpoint is not idempotent. A repeated call after success returns
`TENANT_BOOTSTRAP_NOT_ALLOWED`; use `GET /api/auth/me` to recover the committed
membership if the original success response was lost.
````

- [ ] **Step 4: Extend the stable error catalogue**

In the stable error-code catalogue within `docs/api-reference.md`, add:

```markdown
| `TENANT_CODE_ALREADY_EXISTS` | A tenant already uses the requested tenant code |
| `TENANT_BOOTSTRAP_NOT_ALLOWED` | The current user already has a non-removed tenant membership |
```

Do not add entries for unimplemented tenant, membership, team, role, or
data-scope APIs.

- [ ] **Step 5: Update the durable roadmap without advertising future APIs**

Replace the current `### 1. Tenant Administration vertical slice` subsection
in `docs/technical-roadmap.md` with:

```markdown
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
```

- [ ] **Step 6: Perform Task 5 static checks**

Run:

```bash
rg -n "tenant.code_already_exists|tenant.bootstrap_not_allowed" crm/src/main/resources/messages.properties crm/src/main/resources/messages_vi.properties
rg -n "POST.*api/tenants|Tenant Bootstrap|TENANT_CODE_ALREADY_EXISTS|TENANT_BOOTSTRAP_NOT_ALLOWED|platform_user.manage" docs/api-reference.md
rg -n "Tenant Administration vertical slices|Access Management|Membership Management|Team Management" docs/technical-roadmap.md
git diff --check -- crm/src/main/resources/messages.properties crm/src/main/resources/messages_vi.properties docs/api-reference.md docs/technical-roadmap.md
```

Confirm English and Vietnamese bundles contain the same two keys and the API
reference contains no unimplemented RBAC route.

---

## Final Static Verification and Handoff

- [ ] Inspect the complete package tree:

```bash
rtk tree crm/src/main/java/com/crm/platform/tenant -L 6
```

- [ ] Confirm controller-to-repository flow and fixed security values:

```bash
rg -n "POST|/api/tenants|bootstrap\(|@Transactional|FOR UPDATE|membership_status <> 'REMOVED'|TENANT_ADMIN|platform_user.manage|valid_to|is_tenant_admin" crm/src/main/java/com/crm/platform/tenant
```

- [ ] Confirm no route was made public and no JWT claim was added:

```bash
git diff -- crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java crm/src/main/java/com/crm/identity/infrastructure/security/JwtAccessTokenIssuer.java
```

Expected: no Tenant Bootstrap-specific change in either file.

- [ ] Confirm the protected configuration and schema remain unchanged:

```bash
git diff -- crm/src/main/resources/application.yaml docs/crm_mysql80.sql docs/crm_postgresql18.sql
```

Review only the diff attributable to the current task. The Tenant Bootstrap
implementation must not add changes to these files; preserve pre-existing user
changes if any.

- [ ] Run the final whitespace and scope checks:

```bash
git diff --check -- crm/src/main/java/com/crm/platform/tenant crm/src/main/resources/messages.properties crm/src/main/resources/messages_vi.properties docs/api-reference.md docs/technical-roadmap.md docs/superpowers/specs/2026-08-10-tenant-bootstrap-design.md docs/superpowers/plans/2026-08-10-tenant-bootstrap.md
rtk git status --short
```

- [ ] Report that tests, builds, application startup, database calls, and
runtime API calls were not run because repository rules prohibit them. Do not
claim runtime success; hand the documented manual checklist to the user.
