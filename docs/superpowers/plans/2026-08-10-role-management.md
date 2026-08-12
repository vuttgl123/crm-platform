# Role Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Do not use subagents unless the user explicitly authorizes multi-agent execution in a later request. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tenant-scoped Role Management APIs for a read-only system permission catalogue and atomic custom-role metadata, permission, and data-scope administration.

**Architecture:** Extend the existing `com.crm.platform.access` vertical slice with a Role aggregate, application contracts, a transactional service, a focused JDBC adapter, and two HTTP controllers. Treat role metadata and both grant collections as one write aggregate while keeping system roles immutable and the permission catalogue system-owned.

**Tech Stack:** Java 21, Spring Boot 4, Spring MVC, Jakarta Bean Validation, Spring JDBC `JdbcClient`, Spring transactions, MySQL 8.

## Global Constraints

- Treat `docs/superpowers/specs/2026-08-10-role-management-design.md` as the approved feature contract.
- Do not read or modify `crm-fe`.
- Do not modify JWT claims, signing keys, datasource configuration, `application.yaml`, database schema files, or current key locations.
- Do not modify Effective Access, Tenant Bootstrap, Account behavior, `DatabasePermissionChecker`, or `DatabaseDataScopeResolver`.
- Do not add member, invitation, membership-lifecycle, role-assignment, team-management, or permission-mutation APIs.
- Do not run tests, Maven builds, the application, database checks, browser checks, or manual API calls unless the user gives a new explicit authorization.
- Do not create, stage, or push commits. Leave every change uncommitted for user review.
- Use `apply_patch` for file edits.
- Keep `docs/api-reference.md` synchronized with every implemented endpoint in the same task.
- Use named JDBC parameters for every request, actor, tenant, role, permission, team, timestamp, and version value.
- Require Bearer authentication, active `X-Tenant-ID`, and `platform_user.manage` for all six endpoints.
- Keep system roles visible but immutable.
- Keep `roleCode` immutable after creation and normalize it to uppercase.
- Replace permission and data-scope grants atomically on update.
- Preserve deterministic collection ordering and defensive copies.
- Keep examples free of real tokens, credentials, signing material, connection values, and personal data.
- Static verification may inspect source, schema definitions, diffs, Markdown structure, and Git status only.

---

## File Map

### Domain

- Create `crm/src/main/java/com/crm/platform/access/domain/RoleId.java`: role identity value object.
- Create `crm/src/main/java/com/crm/platform/access/domain/RoleStatus.java`: `ACTIVE` and `INACTIVE`.
- Create `crm/src/main/java/com/crm/platform/access/domain/RoleDataScope.java`: normalized entity scope with team invariant.
- Create `crm/src/main/java/com/crm/platform/access/domain/Role.java`: role aggregate, immutable code/system flag, replace and soft-delete transitions.
- Create `crm/src/main/java/com/crm/platform/access/domain/RoleErrorCode.java`: documented domain error codes.

### Application

- Create `crm/src/main/java/com/crm/platform/access/application/command/RoleScopeInput.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/command/CreateRoleCommand.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/command/UpdateRoleCommand.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/command/DeleteRoleCommand.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/dto/PermissionCatalogueItem.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/dto/RoleSummary.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/dto/RoleDetails.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/port/RoleManagementRepository.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/usecase/RoleManagementFacade.java`.
- Create `crm/src/main/java/com/crm/platform/access/application/service/RoleManagementApplicationService.java`.

### Persistence

- Create `crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcRoleManagementRepository.java`.

### HTTP

- Create `crm/src/main/java/com/crm/platform/access/presentation/web/PermissionResponse.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/RoleSummaryResponse.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/RoleResponse.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/RoleDataScopeRequest.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/RoleRequestCollections.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/CreateRoleRequest.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/UpdateRoleRequest.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/RoleWebMapper.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/PermissionCatalogueController.java`.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/RoleController.java`.
- Modify `crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java`: allow browser clients to send `If-Match`.

### Messages and documentation

- Modify `crm/src/main/resources/messages.properties`.
- Modify `crm/src/main/resources/messages_en.properties`.
- Modify `crm/src/main/resources/messages_vi.properties`.
- Modify `docs/api-reference.md`.
- Modify `docs/technical-roadmap.md`.

---

### Task 1: Add the Role Domain Model

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/domain/RoleId.java`
- Create: `crm/src/main/java/com/crm/platform/access/domain/RoleStatus.java`
- Create: `crm/src/main/java/com/crm/platform/access/domain/RoleDataScope.java`
- Create: `crm/src/main/java/com/crm/platform/access/domain/RoleErrorCode.java`
- Create: `crm/src/main/java/com/crm/platform/access/domain/Role.java`

**Interfaces:**

- Consumes: `ActorId`, `TenantId`, and `DataScopeType`.
- Produces: normalized `Role`, `RoleId`, `RoleStatus`, `RoleDataScope`, and `RoleErrorCode` used by every later task.

- [x] **Step 1: Create identity, status, scope, and error types**

Create `RoleId.java`:

```java
package com.crm.platform.access.domain;

import java.util.Objects;
import java.util.UUID;

public record RoleId(UUID value) {

	public RoleId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static RoleId from(String value) {
		return new RoleId(UUID.fromString(Objects.requireNonNull(
				value, "value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
```

Create `RoleStatus.java`:

```java
package com.crm.platform.access.domain;

public enum RoleStatus {

	ACTIVE,
	INACTIVE

}
```

Create `RoleDataScope.java`:

```java
package com.crm.platform.access.domain;

import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

import com.crm.foundation.security.DataScopeType;

public record RoleDataScope(
		String entityType,
		DataScopeType type,
		UUID teamId) implements Comparable<RoleDataScope> {

	private static final int ENTITY_TYPE_MAX_LENGTH = 191;
	private static final Pattern ENTITY_TYPE_PATTERN =
			Pattern.compile("^[A-Z][A-Z0-9_]*$");

	public RoleDataScope {
		entityType = normalizeEntityType(entityType);
		type = Objects.requireNonNull(type, "type must not be null");
		boolean teamScope = type == DataScopeType.TEAM
				|| type == DataScopeType.TEAM_TREE;
		if (teamScope != (teamId != null)) {
			throw new IllegalArgumentException(
					"teamId presence does not match scope type");
		}
	}

	private static String normalizeEntityType(String value) {
		String normalized = Objects.requireNonNull(
				value, "entityType must not be null")
				.trim()
				.toUpperCase(Locale.ROOT);
		if (normalized.length() > ENTITY_TYPE_MAX_LENGTH
				|| !ENTITY_TYPE_PATTERN.matcher(normalized).matches()) {
			throw new IllegalArgumentException("entityType has an invalid format");
		}
		return normalized;
	}

	@Override
	public int compareTo(RoleDataScope other) {
		int entityComparison = entityType.compareTo(other.entityType);
		if (entityComparison != 0) {
			return entityComparison;
		}
		int typeComparison = type.compareTo(other.type);
		if (typeComparison != 0) {
			return typeComparison;
		}
		String currentTeam = teamId == null ? "" : teamId.toString();
		String otherTeam = other.teamId == null ? "" : other.teamId.toString();
		return currentTeam.compareTo(otherTeam);
	}

}
```

Create `RoleErrorCode.java`:

```java
package com.crm.platform.access.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum RoleErrorCode implements ErrorCode {

	ROLE_NOT_FOUND("ROLE_NOT_FOUND", "role.not_found"),
	ROLE_CODE_ALREADY_EXISTS(
			"ROLE_CODE_ALREADY_EXISTS", "role.code_already_exists"),
	SYSTEM_ROLE_IMMUTABLE(
			"SYSTEM_ROLE_IMMUTABLE", "role.system_immutable"),
	ROLE_VERSION_CONFLICT(
			"ROLE_VERSION_CONFLICT", "role.version_conflict"),
	ROLE_PERMISSION_UNKNOWN(
			"ROLE_PERMISSION_UNKNOWN", "role.permission_unknown"),
	ROLE_DATA_SCOPE_INVALID(
			"ROLE_DATA_SCOPE_INVALID", "role.data_scope_invalid");

	private final String value;
	private final String messageKey;

	RoleErrorCode(String value, String messageKey) {
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

- [x] **Step 2: Create the aggregate**

Create `Role.java`:

```java
package com.crm.platform.access.domain;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Role {

	private static final int ROLE_CODE_MAX_LENGTH = 191;
	private static final int NAME_MAX_LENGTH = 255;
	private static final int DESCRIPTION_MAX_LENGTH = 4_000;
	private static final Pattern ROLE_CODE_PATTERN =
			Pattern.compile("^[A-Z][A-Z0-9_]*$");

	private final TenantId tenantId;
	private final RoleId id;
	private final String roleCode;
	private String name;
	private String description;
	private final boolean system;
	private RoleStatus status;
	private List<String> permissionCodes;
	private List<RoleDataScope> dataScopes;
	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private Role(TenantId tenantId, RoleId id, String roleCode, String name,
			String description, boolean system, RoleStatus status,
			List<String> permissionCodes, List<RoleDataScope> dataScopes,
			Instant createdAt, ActorId createdBy, Instant updatedAt,
			ActorId updatedBy, Instant deletedAt, ActorId deletedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(
				tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.roleCode = normalizeRoleCode(roleCode);
		this.name = requiredText(name, NAME_MAX_LENGTH, "name");
		this.description = optionalText(
				description, DESCRIPTION_MAX_LENGTH, "description");
		this.system = system;
		this.status = Objects.requireNonNull(status, "status must not be null");
		this.permissionCodes = normalizePermissionCodes(permissionCodes);
		this.dataScopes = normalizeDataScopes(dataScopes);
		this.createdAt = Objects.requireNonNull(
				createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(
				updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		if ((deletedAt == null) != (deletedBy == null)) {
			throw new IllegalArgumentException(
					"deletedAt and deletedBy must be provided together");
		}
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
	}

	public static Role create(TenantId tenantId, RoleId id, String roleCode,
			String name, String description, List<String> permissionCodes,
			List<RoleDataScope> dataScopes, ActorId actorId, Instant now) {
		ActorId requiredActor = Objects.requireNonNull(
				actorId, "actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		return new Role(tenantId, id, roleCode, name, description, false,
				RoleStatus.ACTIVE, permissionCodes, dataScopes, requiredNow,
				requiredActor, requiredNow, requiredActor, null, null, 1L);
	}

	public static Role rehydrate(TenantId tenantId, RoleId id, String roleCode,
			String name, String description, boolean system, RoleStatus status,
			List<String> permissionCodes, List<RoleDataScope> dataScopes,
			Instant createdAt, ActorId createdBy, Instant updatedAt,
			ActorId updatedBy, Instant deletedAt, ActorId deletedBy,
			long version) {
		return new Role(tenantId, id, roleCode, name, description, system,
				status, permissionCodes, dataScopes, createdAt, createdBy,
				updatedAt, updatedBy, deletedAt, deletedBy, version);
	}

	public void replace(String name, String description, RoleStatus status,
			List<String> permissionCodes, List<RoleDataScope> dataScopes,
			ActorId actorId, Instant now) {
		this.name = requiredText(name, NAME_MAX_LENGTH, "name");
		this.description = optionalText(
				description, DESCRIPTION_MAX_LENGTH, "description");
		this.status = Objects.requireNonNull(status, "status must not be null");
		this.permissionCodes = normalizePermissionCodes(permissionCodes);
		this.dataScopes = normalizeDataScopes(dataScopes);
		this.updatedBy = Objects.requireNonNull(actorId,
				"actorId must not be null");
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.version = Math.incrementExact(version);
	}

	public void softDelete(ActorId actorId, Instant now) {
		ActorId requiredActor = Objects.requireNonNull(
				actorId, "actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		deletedAt = requiredNow;
		deletedBy = requiredActor;
		updatedAt = requiredNow;
		updatedBy = requiredActor;
		version = Math.incrementExact(version);
	}

	public static String normalizeRoleCode(String value) {
		String normalized = Objects.requireNonNull(
				value, "roleCode must not be null")
				.trim()
				.toUpperCase(Locale.ROOT);
		if (normalized.length() > ROLE_CODE_MAX_LENGTH
				|| !ROLE_CODE_PATTERN.matcher(normalized).matches()) {
			throw new IllegalArgumentException("roleCode has an invalid format");
		}
		return normalized;
	}

	private static List<String> normalizePermissionCodes(List<String> values) {
		return Objects.requireNonNull(values,
				"permissionCodes must not be null")
				.stream()
				.map(value -> requiredText(
						value, ROLE_CODE_MAX_LENGTH, "permissionCode"))
				.distinct()
				.sorted()
				.toList();
	}

	private static List<RoleDataScope> normalizeDataScopes(
			List<RoleDataScope> values) {
		return Objects.requireNonNull(values, "dataScopes must not be null")
				.stream()
				.map(value -> Objects.requireNonNull(
						value, "dataScope must not be null"))
				.distinct()
				.sorted()
				.toList();
	}

	private static String requiredText(String value, int maxLength,
			String fieldName) {
		String normalized = Objects.requireNonNull(
				value, fieldName + " must not be null").trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return normalized;
	}

	private static String optionalText(String value, int maxLength,
			String fieldName) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return normalized;
	}

	public TenantId tenantId() { return tenantId; }
	public RoleId id() { return id; }
	public String roleCode() { return roleCode; }
	public String name() { return name; }
	public String description() { return description; }
	public boolean system() { return system; }
	public RoleStatus status() { return status; }
	public List<String> permissionCodes() { return permissionCodes; }
	public List<RoleDataScope> dataScopes() { return dataScopes; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public Instant deletedAt() { return deletedAt; }
	public ActorId deletedBy() { return deletedBy; }
	public long version() { return version; }

}
```

- [x] **Step 3: Perform Task 1 static checks**

```bash
rg -n "record RoleId|enum RoleStatus|record RoleDataScope|enum RoleErrorCode|class Role|normalizeRoleCode|void replace|void softDelete" crm/src/main/java/com/crm/platform/access/domain
rg -n "ROLE_NOT_FOUND|ROLE_CODE_ALREADY_EXISTS|SYSTEM_ROLE_IMMUTABLE|ROLE_VERSION_CONFLICT|ROLE_PERMISSION_UNKNOWN|ROLE_DATA_SCOPE_INVALID" crm/src/main/java/com/crm/platform/access/domain/RoleErrorCode.java
```

Inspect collection accessors and confirm every stored permission/scope list is
immutable and deterministic. Do not compile or run tests.

---

### Task 2: Add Application Commands, DTOs, Port, and Facade

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/application/command/RoleScopeInput.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/command/CreateRoleCommand.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/command/UpdateRoleCommand.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/command/DeleteRoleCommand.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/dto/PermissionCatalogueItem.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/dto/RoleSummary.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/dto/RoleDetails.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/port/RoleManagementRepository.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/usecase/RoleManagementFacade.java`

**Interfaces:**

- Consumes: Task 1 domain types.
- Produces: exact service and repository contracts used by Tasks 3-5.

- [x] **Step 1: Create commands**

Create `RoleScopeInput.java`:

```java
package com.crm.platform.access.application.command;

import java.util.UUID;

import com.crm.foundation.security.DataScopeType;

public record RoleScopeInput(
		String entityType,
		DataScopeType type,
		UUID teamId) {
}
```

Create `CreateRoleCommand.java`:

```java
package com.crm.platform.access.application.command;

import java.util.List;
import java.util.Objects;

public record CreateRoleCommand(
		String roleCode,
		String name,
		String description,
		List<String> permissionCodes,
		List<RoleScopeInput> dataScopes) {

	public CreateRoleCommand {
		permissionCodes = List.copyOf(Objects.requireNonNull(
				permissionCodes, "permissionCodes must not be null"));
		dataScopes = List.copyOf(Objects.requireNonNull(
				dataScopes, "dataScopes must not be null"));
	}

}
```

Create `UpdateRoleCommand.java`:

```java
package com.crm.platform.access.application.command;

import java.util.List;
import java.util.Objects;

import com.crm.platform.access.domain.RoleId;
import com.crm.platform.access.domain.RoleStatus;

public record UpdateRoleCommand(
		RoleId roleId,
		long version,
		String name,
		String description,
		RoleStatus status,
		List<String> permissionCodes,
		List<RoleScopeInput> dataScopes) {

	public UpdateRoleCommand {
		Objects.requireNonNull(roleId, "roleId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
		permissionCodes = List.copyOf(Objects.requireNonNull(
				permissionCodes, "permissionCodes must not be null"));
		dataScopes = List.copyOf(Objects.requireNonNull(
				dataScopes, "dataScopes must not be null"));
	}

}
```

Create `DeleteRoleCommand.java`:

```java
package com.crm.platform.access.application.command;

import java.util.Objects;

import com.crm.platform.access.domain.RoleId;

public record DeleteRoleCommand(RoleId roleId, long version) {

	public DeleteRoleCommand {
		Objects.requireNonNull(roleId, "roleId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
```

- [x] **Step 2: Create application DTOs**

Create `PermissionCatalogueItem.java`:

```java
package com.crm.platform.access.application.dto;

public record PermissionCatalogueItem(
		String permissionCode,
		String description,
		String moduleCode,
		String riskLevel) {
}
```

Create `RoleSummary.java`:

```java
package com.crm.platform.access.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.access.domain.RoleStatus;

public record RoleSummary(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		long permissionCount,
		long dataScopeCount,
		Instant updatedAt,
		long version) {
}
```

Create `RoleDetails.java`:

```java
package com.crm.platform.access.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleStatus;

public record RoleDetails(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		List<String> permissionCodes,
		List<DataScopeDetails> dataScopes,
		Instant createdAt,
		Instant updatedAt,
		long version) {

	public RoleDetails {
		permissionCodes = List.copyOf(permissionCodes);
		dataScopes = List.copyOf(dataScopes);
	}

	public static RoleDetails from(Role role) {
		return new RoleDetails(
				role.id().value(), role.roleCode(), role.name(),
				role.description(), role.system(), role.status(),
				role.permissionCodes(),
				role.dataScopes().stream()
						.map(scope -> new DataScopeDetails(
								scope.entityType(), scope.type(), scope.teamId()))
						.toList(),
				role.createdAt(), role.updatedAt(), role.version());
	}

	public record DataScopeDetails(
			String entityType,
			DataScopeType type,
			UUID teamId) {
	}

}
```

- [x] **Step 3: Create repository port and facade**

Create `RoleManagementRepository.java`:

```java
package com.crm.platform.access.application.port;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleId;
import com.crm.sharedkernel.domain.TenantId;

public interface RoleManagementRepository {

	List<PermissionCatalogueItem> findPermissions();

	List<RoleSummary> findRoleSummaries(TenantId tenantId);

	Optional<Role> findById(TenantId tenantId, RoleId roleId);

	Optional<Role> findByIdForUpdate(TenantId tenantId, RoleId roleId);

	boolean existsNonDeletedRoleCode(TenantId tenantId, String roleCode);

	Set<String> findKnownPermissionCodes(Set<String> permissionCodes);

	boolean allTeamsAreActive(TenantId tenantId, Set<UUID> teamIds);

	void insert(Role role);

	int update(Role role, long expectedVersion);

	int softDelete(Role role, long expectedVersion);

	void replacePermissionGrants(Role role);

	void replaceDataScopeGrants(Role role);

}
```

Create `RoleManagementFacade.java`:

```java
package com.crm.platform.access.application.usecase;

import java.util.List;

import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.domain.RoleId;

public interface RoleManagementFacade {

	List<PermissionCatalogueItem> permissions();

	List<RoleSummary> roles();

	RoleDetails get(RoleId roleId);

	RoleDetails create(CreateRoleCommand command);

	RoleDetails update(UpdateRoleCommand command);

	void delete(DeleteRoleCommand command);

}
```

- [x] **Step 4: Perform Task 2 static checks**

```bash
rg -n "record (CreateRoleCommand|UpdateRoleCommand|DeleteRoleCommand|RoleScopeInput|PermissionCatalogueItem|RoleSummary|RoleDetails)|interface (RoleManagementRepository|RoleManagementFacade)" crm/src/main/java/com/crm/platform/access/application
rg -n "findByIdForUpdate|findKnownPermissionCodes|allTeamsAreActive|replacePermissionGrants|replaceDataScopeGrants" crm/src/main/java/com/crm/platform/access/application/port/RoleManagementRepository.java
```

Confirm every command and DTO collection is copied and every later-task method
signature matches this task. Do not compile or run tests.

---

### Task 3: Implement the JDBC Role Management Adapter

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcRoleManagementRepository.java`

**Interfaces:**

- Consumes: every `RoleManagementRepository` method and Task 1 domain type.
- Produces: deterministic catalogue/role reads, row locking, reference validation, aggregate mutation, and grant replacement.

- [x] **Step 1: Add deterministic read queries and aggregate loading**

Create `JdbcRoleManagementRepository.java` with this package, dependency set,
and non-final Spring repository shell. Place every method in this task inside
the class:

```java
package com.crm.platform.access.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.application.port.RoleManagementRepository;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleDataScope;
import com.crm.platform.access.domain.RoleId;
import com.crm.platform.access.domain.RoleStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcRoleManagementRepository
		implements RoleManagementRepository {

	private final JdbcClient jdbcClient;

	public JdbcRoleManagementRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

}
```

Insert the constants, methods, helpers, and `RoleRow` record from the following
steps before that final class brace. Implement these exact queries:

```java
private static final String ROLE_ROW_SELECT = """
		SELECT r.tenant_id, r.id, r.role_code, r.name, r.description,
		       r.is_system, r.status, r.created_at, r.created_by,
		       r.updated_at, r.updated_by, r.deleted_at, r.deleted_by,
		       r.version
		FROM platform_roles r
		""";

@Override
public List<PermissionCatalogueItem> findPermissions() {
	return jdbcClient.sql("""
			SELECT p.permission_code, p.description,
			       p.module_code, p.risk_level
			FROM platform_permissions p
			ORDER BY p.module_code, p.permission_code
			""")
			.query((resultSet, rowNumber) -> new PermissionCatalogueItem(
					resultSet.getString("permission_code"),
					resultSet.getString("description"),
					resultSet.getString("module_code"),
					resultSet.getString("risk_level")))
			.list();
}

@Override
public List<RoleSummary> findRoleSummaries(TenantId tenantId) {
	return jdbcClient.sql("""
			SELECT r.id, r.role_code, r.name, r.description,
			       r.is_system, r.status,
			       (SELECT COUNT(*)
			        FROM platform_role_permissions rp
			        WHERE rp.tenant_id = r.tenant_id
			          AND rp.role_id = r.id) AS permission_count,
			       (SELECT COUNT(*)
			        FROM platform_role_data_scopes ds
			        WHERE ds.tenant_id = r.tenant_id
			          AND ds.role_id = r.id) AS data_scope_count,
			       r.updated_at, r.version
			FROM platform_roles r
			WHERE r.tenant_id = :tenantId
			  AND r.deleted_at IS NULL
			ORDER BY r.role_code, r.id
			""")
			.param("tenantId", tenantId.toString())
			.query((resultSet, rowNumber) -> new RoleSummary(
					UUID.fromString(resultSet.getString("id")),
					resultSet.getString("role_code"),
					resultSet.getString("name"),
					resultSet.getString("description"),
					resultSet.getBoolean("is_system"),
					RoleStatus.valueOf(resultSet.getString("status")),
					resultSet.getLong("permission_count"),
					resultSet.getLong("data_scope_count"),
					resultSet.getTimestamp("updated_at").toInstant(),
					resultSet.getLong("version")))
			.list();
}
```

Use two private role-row loaders so locking is explicit and static:

```java
private Optional<RoleRow> findRoleRow(TenantId tenantId, RoleId roleId) {
	return jdbcClient.sql(ROLE_ROW_SELECT + """
			WHERE r.tenant_id = :tenantId
			  AND r.id = :roleId
			  AND r.deleted_at IS NULL
			""")
			.param("tenantId", tenantId.toString())
			.param("roleId", roleId.toString())
			.query(JdbcRoleManagementRepository::mapRoleRow)
			.optional();
}

private Optional<RoleRow> findRoleRowForUpdate(
		TenantId tenantId, RoleId roleId) {
	return jdbcClient.sql(ROLE_ROW_SELECT + """
			WHERE r.tenant_id = :tenantId
			  AND r.id = :roleId
			  AND r.deleted_at IS NULL
			FOR UPDATE
			""")
			.param("tenantId", tenantId.toString())
			.param("roleId", roleId.toString())
			.query(JdbcRoleManagementRepository::mapRoleRow)
			.optional();
}
```

Both public methods map the row to a complete aggregate with two additional
queries:

```java
@Override
public Optional<Role> findById(TenantId tenantId, RoleId roleId) {
	return findRoleRow(tenantId, roleId).map(this::toRole);
}

@Override
public Optional<Role> findByIdForUpdate(TenantId tenantId, RoleId roleId) {
	return findRoleRowForUpdate(tenantId, roleId).map(this::toRole);
}

private Role toRole(RoleRow row) {
	List<String> permissions = jdbcClient.sql("""
			SELECT rp.permission_code
			FROM platform_role_permissions rp
			WHERE rp.tenant_id = :tenantId
			  AND rp.role_id = :roleId
			ORDER BY rp.permission_code
			""")
			.param("tenantId", row.tenantId().toString())
			.param("roleId", row.id().toString())
			.query(String.class)
			.list();
	List<RoleDataScope> scopes = jdbcClient.sql("""
			SELECT DISTINCT ds.entity_type, ds.scope_type, ds.team_id
			FROM platform_role_data_scopes ds
			WHERE ds.tenant_id = :tenantId
			  AND ds.role_id = :roleId
			ORDER BY ds.entity_type, ds.scope_type, ds.team_id
			""")
			.param("tenantId", row.tenantId().toString())
			.param("roleId", row.id().toString())
			.query((resultSet, rowNumber) -> new RoleDataScope(
					resultSet.getString("entity_type"),
					DataScopeType.valueOf(resultSet.getString("scope_type")),
					nullableUuid(resultSet.getString("team_id"))))
			.list();
	return Role.rehydrate(
			row.tenantId(), row.id(), row.roleCode(), row.name(),
			row.description(), row.system(), row.status(), permissions, scopes,
			row.createdAt(), row.createdBy(), row.updatedAt(), row.updatedBy(),
			row.deletedAt(), row.deletedBy(), row.version());
}
```

Add these exact row-mapping types and helpers inside the repository:

```java
private static RoleRow mapRoleRow(ResultSet resultSet, int rowNumber)
		throws SQLException {
	return new RoleRow(
			TenantId.from(resultSet.getString("tenant_id")),
			RoleId.from(resultSet.getString("id")),
			resultSet.getString("role_code"),
			resultSet.getString("name"),
			resultSet.getString("description"),
			resultSet.getBoolean("is_system"),
			RoleStatus.valueOf(resultSet.getString("status")),
			resultSet.getTimestamp("created_at").toInstant(),
			nullableActorId(resultSet.getString("created_by")),
			resultSet.getTimestamp("updated_at").toInstant(),
			nullableActorId(resultSet.getString("updated_by")),
			nullableInstant(resultSet.getTimestamp("deleted_at")),
			nullableActorId(resultSet.getString("deleted_by")),
			resultSet.getLong("version"));
}

private static UUID nullableUuid(String value) {
	return value == null ? null : UUID.fromString(value);
}

private static String nullableUuidValue(UUID value) {
	return value == null ? null : value.toString();
}

private static ActorId nullableActorId(String value) {
	return value == null ? null : ActorId.from(value);
}

private static Instant nullableInstant(Timestamp value) {
	return value == null ? null : value.toInstant();
}

private static String actorId(ActorId value) {
	return value == null ? null : value.toString();
}

private record RoleRow(
		TenantId tenantId,
		RoleId id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		Instant createdAt,
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		Instant deletedAt,
		ActorId deletedBy,
		long version) {
}
```

- [x] **Step 2: Add reference and uniqueness checks**

```java
@Override
public boolean existsNonDeletedRoleCode(TenantId tenantId, String roleCode) {
	return jdbcClient.sql("""
			SELECT COUNT(*)
			FROM platform_roles r
			WHERE r.tenant_id = :tenantId
			  AND LOWER(r.role_code) = LOWER(:roleCode)
			  AND r.deleted_at IS NULL
			""")
			.param("tenantId", tenantId.toString())
			.param("roleCode", roleCode)
			.query(Long.class)
			.single() > 0L;
}

@Override
public Set<String> findKnownPermissionCodes(Set<String> permissionCodes) {
	if (permissionCodes.isEmpty()) {
		return Set.of();
	}
	return jdbcClient.sql("""
			SELECT p.permission_code
			FROM platform_permissions p
			WHERE p.permission_code IN (:permissionCodes)
			""")
			.param("permissionCodes", permissionCodes)
			.query(String.class)
			.set();
}

@Override
public boolean allTeamsAreActive(TenantId tenantId, Set<UUID> teamIds) {
	if (teamIds.isEmpty()) {
		return true;
	}
	long count = jdbcClient.sql("""
			SELECT COUNT(DISTINCT t.id)
			FROM platform_teams t
			WHERE t.tenant_id = :tenantId
			  AND t.id IN (:teamIds)
			  AND t.status = 'ACTIVE'
			  AND t.deleted_at IS NULL
			""")
			.param("tenantId", tenantId.toString())
			.param("teamIds", teamIds.stream().map(UUID::toString).toList())
			.query(Long.class)
			.single();
	return count == teamIds.size();
}
```

- [x] **Step 3: Add role row mutations**

Implement insert, optimistic update, and optimistic soft delete:

```java
@Override
public void insert(Role role) {
	int affected = jdbcClient.sql("""
			INSERT INTO platform_roles (
			    tenant_id, id, role_code, name, description,
			    is_system, status, created_at, updated_at,
			    created_by, updated_by, version
			) VALUES (
			    :tenantId, :id, :roleCode, :name, :description,
			    :system, :status, :createdAt, :updatedAt,
			    :createdBy, :updatedBy, :version
			)
			""")
			.params(roleParameters(role))
			.update();
	if (affected != 1) {
		throw new IllegalStateException(
				"Role insert must affect exactly one row");
	}
}

@Override
public int update(Role role, long expectedVersion) {
	Map<String, Object> parameters = roleParameters(role);
	parameters.put("expectedVersion", expectedVersion);
	return jdbcClient.sql("""
			UPDATE platform_roles
			SET name = :name,
			    description = :description,
			    status = :status,
			    updated_at = :updatedAt,
			    updated_by = :updatedBy,
			    version = :version
			WHERE tenant_id = :tenantId
			  AND id = :id
			  AND version = :expectedVersion
			  AND is_system = false
			  AND deleted_at IS NULL
			""")
			.params(parameters)
			.update();
}

@Override
public int softDelete(Role role, long expectedVersion) {
	Map<String, Object> parameters = roleParameters(role);
	parameters.put("expectedVersion", expectedVersion);
	return jdbcClient.sql("""
			UPDATE platform_roles
			SET deleted_at = :deletedAt,
			    deleted_by = :deletedBy,
			    updated_at = :updatedAt,
			    updated_by = :updatedBy,
			    version = :version
			WHERE tenant_id = :tenantId
			  AND id = :id
			  AND version = :expectedVersion
			  AND is_system = false
			  AND deleted_at IS NULL
			""")
			.params(parameters)
			.update();
}
```

Add this exact mutable parameter builder and timestamp helper:

```java
private static Map<String, Object> roleParameters(Role role) {
	Map<String, Object> parameters = new HashMap<>();
	parameters.put("tenantId", role.tenantId().toString());
	parameters.put("id", role.id().toString());
	parameters.put("roleCode", role.roleCode());
	parameters.put("name", role.name());
	parameters.put("description", role.description());
	parameters.put("system", role.system());
	parameters.put("status", role.status().name());
	parameters.put("createdAt", timestamp(role.createdAt()));
	parameters.put("createdBy", actorId(role.createdBy()));
	parameters.put("updatedAt", timestamp(role.updatedAt()));
	parameters.put("updatedBy", actorId(role.updatedBy()));
	parameters.put("deletedAt", timestamp(role.deletedAt()));
	parameters.put("deletedBy", actorId(role.deletedBy()));
	parameters.put("version", role.version());
	return parameters;
}

private static Timestamp timestamp(Instant value) {
	return value == null ? null : Timestamp.from(value);
}
```

Do not depend on string concatenation for request, tenant, actor, role,
permission, team, timestamp, or version values.

- [x] **Step 4: Add complete grant replacement**

```java
@Override
public void replacePermissionGrants(Role role) {
	jdbcClient.sql("""
			DELETE FROM platform_role_permissions
			WHERE tenant_id = :tenantId
			  AND role_id = :roleId
			""")
			.param("tenantId", role.tenantId().toString())
			.param("roleId", role.id().toString())
			.update();
	for (String permissionCode : role.permissionCodes()) {
		jdbcClient.sql("""
				INSERT INTO platform_role_permissions (
				    tenant_id, role_id, permission_code,
				    granted_at, granted_by
				) VALUES (
				    :tenantId, :roleId, :permissionCode,
				    :grantedAt, :grantedBy
				)
				""")
				.param("tenantId", role.tenantId().toString())
				.param("roleId", role.id().toString())
				.param("permissionCode", permissionCode)
				.param("grantedAt", Timestamp.from(role.updatedAt()))
				.param("grantedBy", actorId(role.updatedBy()))
				.update();
	}
}

@Override
public void replaceDataScopeGrants(Role role) {
	jdbcClient.sql("""
			DELETE FROM platform_role_data_scopes
			WHERE tenant_id = :tenantId
			  AND role_id = :roleId
			""")
			.param("tenantId", role.tenantId().toString())
			.param("roleId", role.id().toString())
			.update();
	for (RoleDataScope scope : role.dataScopes()) {
		jdbcClient.sql("""
				INSERT INTO platform_role_data_scopes (
				    tenant_id, id, role_id, entity_type,
				    scope_type, team_id, created_at, created_by
				) VALUES (
				    :tenantId, UUID(), :roleId, :entityType,
				    :scopeType, :teamId, :createdAt, :createdBy
				)
				""")
				.param("tenantId", role.tenantId().toString())
				.param("roleId", role.id().toString())
				.param("entityType", scope.entityType())
				.param("scopeType", scope.type().name())
				.param("teamId", nullableUuidValue(scope.teamId()))
				.param("createdAt", Timestamp.from(role.updatedAt()))
				.param("createdBy", actorId(role.updatedBy()))
				.update();
	}
}
```

The SQL function `UUID()` creates the internal grant-row identity; it is not a
request/context value and is never exposed through the API.

- [x] **Step 5: Perform Task 3 static checks**

```bash
rg -n "ORDER BY p.module_code|ORDER BY r.role_code|FOR UPDATE|LOWER\(r.role_code\)|IN \(:permissionCodes\)|COUNT\(DISTINCT t.id\)|INSERT INTO platform_roles|UPDATE platform_roles|DELETE FROM platform_role_permissions|DELETE FROM platform_role_data_scopes|UUID\(\)" crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcRoleManagementRepository.java
rg -n "\.param\(|\.params\(" crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcRoleManagementRepository.java
```

Compare every table and column with `docs/crm_mysql80.sql`. Confirm the only
concatenated SQL fragment is the static `ROLE_ROW_SELECT`, not request/context
data. Do not execute SQL.

---

### Task 4: Implement Transactional Role Management Orchestration

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/application/service/RoleManagementApplicationService.java`

**Interfaces:**

- Consumes: Tasks 1-3, `CurrentActor`, `CurrentTenant`, `PermissionChecker`, `IdentifierGenerator`, and `TimeProvider`.
- Produces: non-final transactional implementation of all `RoleManagementFacade` methods.

- [x] **Step 1: Create the service shell and authorized read methods**

Use this class shape and permission constant:

```java
package com.crm.platform.access.application.service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.stream.Collectors;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.PermissionChecker;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.command.RoleScopeInput;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.application.port.RoleManagementRepository;
import com.crm.platform.access.application.usecase.RoleManagementFacade;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleDataScope;
import com.crm.platform.access.domain.RoleErrorCode;
import com.crm.platform.access.domain.RoleId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleManagementApplicationService
		implements RoleManagementFacade {

	private static final String MANAGE_PERMISSION = "platform_user.manage";

	private final RoleManagementRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final PermissionChecker permissionChecker;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public RoleManagementApplicationService(
			RoleManagementRepository repository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			PermissionChecker permissionChecker,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.permissionChecker = permissionChecker;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional(readOnly = true)
	public List<PermissionCatalogueItem> permissions() {
		authorize();
		return repository.findPermissions();
	}

	@Override
	@Transactional(readOnly = true)
	public List<RoleSummary> roles() {
		AccessContext context = authorize();
		return repository.findRoleSummaries(context.tenantId());
	}

	@Override
	@Transactional(readOnly = true)
	public RoleDetails get(RoleId roleId) {
		Objects.requireNonNull(roleId, "roleId must not be null");
		AccessContext context = authorize();
		return repository.findById(context.tenantId(), roleId)
				.map(RoleDetails::from)
				.orElseThrow(RoleManagementApplicationService::roleNotFound);
	}
```

The private authorization helper is:

```java
private AccessContext authorize() {
	TenantId tenantId = currentTenant.requireTenantId();
	ActorId actorId = currentActor.requireActorId();
	permissionChecker.requirePermission(MANAGE_PERMISSION);
	return new AccessContext(tenantId, actorId);
}

private record AccessContext(TenantId tenantId, ActorId actorId) {
}
```

- [x] **Step 2: Implement create**

```java
@Override
@Transactional
public RoleDetails create(CreateRoleCommand command) {
	Objects.requireNonNull(command, "command must not be null");
	AccessContext context = authorize();
	String roleCode = Role.normalizeRoleCode(command.roleCode());
	if (repository.existsNonDeletedRoleCode(context.tenantId(), roleCode)) {
		throw roleCodeConflict();
	}

	List<RoleDataScope> scopes = validatedScopes(
			context.tenantId(), command.dataScopes());
	validatePermissions(command.permissionCodes());
	Role role = Role.create(
			context.tenantId(),
			new RoleId(identifierGenerator.nextId()),
			roleCode,
			command.name(),
			command.description(),
			command.permissionCodes(),
			scopes,
			context.actorId(),
			timeProvider.now());
	try {
		repository.insert(role);
	}
	catch (DuplicateKeyException exception) {
		throw roleCodeConflict();
	}
	repository.replacePermissionGrants(role);
	repository.replaceDataScopeGrants(role);
	return reload(context.tenantId(), role.id());
}
```

- [x] **Step 3: Implement replace and delete**

```java
@Override
@Transactional
public RoleDetails update(UpdateRoleCommand command) {
	Objects.requireNonNull(command, "command must not be null");
	AccessContext context = authorize();
	Role role = findForUpdate(context.tenantId(), command.roleId());
	requireMutable(role);
	requireVersion(role, command.version());

	List<RoleDataScope> scopes = validatedScopes(
			context.tenantId(), command.dataScopes());
	validatePermissions(command.permissionCodes());
	long expectedVersion = role.version();
	role.replace(
			command.name(), command.description(), command.status(),
			command.permissionCodes(), scopes,
			context.actorId(), timeProvider.now());
	if (repository.update(role, expectedVersion) != 1) {
		throw versionConflict();
	}
	repository.replacePermissionGrants(role);
	repository.replaceDataScopeGrants(role);
	return reload(context.tenantId(), role.id());
}

@Override
@Transactional
public void delete(DeleteRoleCommand command) {
	Objects.requireNonNull(command, "command must not be null");
	AccessContext context = authorize();
	Role role = findForUpdate(context.tenantId(), command.roleId());
	requireMutable(role);
	requireVersion(role, command.version());
	long expectedVersion = role.version();
	role.softDelete(context.actorId(), timeProvider.now());
	if (repository.softDelete(role, expectedVersion) != 1) {
		throw versionConflict();
	}
}
```

- [x] **Step 4: Add validation and exception helpers**

```java
private void validatePermissions(List<String> permissionCodes) {
	Set<String> requested = permissionCodes.stream()
			.map(String::trim)
			.collect(Collectors.toCollection(TreeSet::new));
	if (!repository.findKnownPermissionCodes(requested).equals(requested)) {
		throw new BusinessRuleViolation(
				RoleErrorCode.ROLE_PERMISSION_UNKNOWN);
	}
}

private List<RoleDataScope> validatedScopes(
		TenantId tenantId, List<RoleScopeInput> inputs) {
	List<RoleDataScope> scopes;
	try {
		scopes = inputs.stream()
				.map(input -> new RoleDataScope(
						input.entityType(), input.type(), input.teamId()))
				.sorted()
				.toList();
	}
	catch (IllegalArgumentException exception) {
		throw new BusinessRuleViolation(
				RoleErrorCode.ROLE_DATA_SCOPE_INVALID);
	}
	Set<UUID> teamIds = scopes.stream()
			.map(RoleDataScope::teamId)
			.filter(Objects::nonNull)
			.collect(Collectors.toSet());
	if (!repository.allTeamsAreActive(tenantId, teamIds)) {
		throw new BusinessRuleViolation(
				RoleErrorCode.ROLE_DATA_SCOPE_INVALID);
	}
	return scopes;
}

private Role findForUpdate(TenantId tenantId, RoleId roleId) {
	return repository.findByIdForUpdate(tenantId, roleId)
			.orElseThrow(RoleManagementApplicationService::roleNotFound);
}

private RoleDetails reload(TenantId tenantId, RoleId roleId) {
	return repository.findById(tenantId, roleId)
			.map(RoleDetails::from)
			.orElseThrow(() -> new IllegalStateException(
					"Committed Role must remain readable"));
}

private static void requireMutable(Role role) {
	if (role.system()) {
		throw new ResourceConflict(RoleErrorCode.SYSTEM_ROLE_IMMUTABLE);
	}
}

private static void requireVersion(Role role, long version) {
	if (role.version() != version) {
		throw versionConflict();
	}
}

private static DomainResourceNotFound roleNotFound() {
	return new DomainResourceNotFound(RoleErrorCode.ROLE_NOT_FOUND);
}

private static ResourceConflict roleCodeConflict() {
	return new ResourceConflict(RoleErrorCode.ROLE_CODE_ALREADY_EXISTS);
}

private static ResourceConflict versionConflict() {
	return new ResourceConflict(RoleErrorCode.ROLE_VERSION_CONFLICT);
}
```

Import `Collectors`, `TreeSet`, and every referenced exception explicitly.
Do not catch broad database exceptions on update/delete; the row lock and
optimistic predicate must remain authoritative.

- [x] **Step 5: Perform Task 4 static checks**

```bash
rg -n "platform_user.manage|@Transactional|@Transactional\(readOnly = true\)|findByIdForUpdate|requireMutable|requireVersion|ROLE_PERMISSION_UNKNOWN|ROLE_DATA_SCOPE_INVALID|replacePermissionGrants|replaceDataScopeGrants|DuplicateKeyException" crm/src/main/java/com/crm/platform/access/application/service/RoleManagementApplicationService.java
if rg -n "public final class RoleManagementApplicationService" crm/src/main/java/com/crm/platform/access/application/service/RoleManagementApplicationService.java; then exit 1; fi
```

Confirm authorization precedes every repository read/write and all mutation
paths are transactional. Do not invoke the service.

---

### Task 5: Expose Permission and Role HTTP APIs

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/PermissionResponse.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/RoleSummaryResponse.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/RoleResponse.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/RoleDataScopeRequest.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/RoleRequestCollections.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/CreateRoleRequest.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/UpdateRoleRequest.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/RoleWebMapper.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/PermissionCatalogueController.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/RoleController.java`
- Modify: `crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java`

**Interfaces:**

- Consumes: `RoleManagementFacade`, application DTOs, commands, and role domain enums.
- Produces: the six approved routes and exact nested JSON contracts.

- [x] **Step 1: Create request normalization and request records**

Create package-private `RoleRequestCollections.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.HashSet;
import java.util.List;

final class RoleRequestCollections {

	private RoleRequestCollections() {
	}

	static List<String> permissionCodes(List<String> values) {
		if (values == null) {
			return List.of();
		}
		List<String> normalized = values.stream()
				.map(value -> value == null ? null : value.trim())
				.toList();
		if (new HashSet<>(normalized).size() != normalized.size()) {
			throw new IllegalArgumentException(
					"permissionCodes must not contain duplicates");
		}
		return List.copyOf(normalized);
	}

	static List<RoleDataScopeRequest> dataScopes(
			List<RoleDataScopeRequest> values) {
		if (values == null) {
			return List.of();
		}
		List<RoleDataScopeRequest> copy = List.copyOf(values);
		if (new HashSet<>(copy).size() != copy.size()) {
			throw new IllegalArgumentException(
					"dataScopes must not contain duplicates");
		}
		return copy;
	}

}
```

Create `RoleDataScopeRequest.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.Locale;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.foundation.security.DataScopeType;

public record RoleDataScopeRequest(
		@NotBlank @Size(max = 191)
		@Pattern(regexp = "^[A-Z][A-Z0-9_]*$")
		String entityType,
		@NotNull DataScopeType type,
		UUID teamId) {

	public RoleDataScopeRequest {
		if (entityType != null) {
			entityType = entityType.trim().toUpperCase(Locale.ROOT);
		}
	}

}
```

Create `CreateRoleRequest.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.List;
import java.util.Locale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRoleRequest(
		@NotBlank @Size(max = 191)
		@Pattern(regexp = "^[A-Z][A-Z0-9_]*$")
		String roleCode,
		@NotBlank @Size(max = 255) String name,
		@Size(max = 4000) String description,
		List<@NotBlank @Size(max = 191) String> permissionCodes,
		List<@Valid RoleDataScopeRequest> dataScopes) {

	public CreateRoleRequest {
		if (roleCode != null) {
			roleCode = roleCode.trim().toUpperCase(Locale.ROOT);
		}
		permissionCodes = RoleRequestCollections.permissionCodes(permissionCodes);
		dataScopes = RoleRequestCollections.dataScopes(dataScopes);
	}

}
```

Create `UpdateRoleRequest.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.platform.access.domain.RoleStatus;

public record UpdateRoleRequest(
		@NotNull @Positive Long version,
		@NotBlank @Size(max = 255) String name,
		@Size(max = 4000) String description,
		@NotNull RoleStatus status,
		List<@NotBlank @Size(max = 191) String> permissionCodes,
		List<@Valid RoleDataScopeRequest> dataScopes) {

	public UpdateRoleRequest {
		permissionCodes = RoleRequestCollections.permissionCodes(permissionCodes);
		dataScopes = RoleRequestCollections.dataScopes(dataScopes);
	}

}
```

Constructor exceptions occur during JSON construction and are handled by the
existing `HttpMessageNotReadableException` path as `400` validation failures.
Do not validate the scope/team presence relationship here; Task 4 must return
the approved `422 ROLE_DATA_SCOPE_INVALID` business error.

- [x] **Step 2: Create response records**

Create `PermissionResponse.java`, `RoleSummaryResponse.java`, and
`RoleResponse.java` with these exact shapes:

```java
public record PermissionResponse(
		String permissionCode,
		String description,
		String moduleCode,
		String riskLevel) {
}

public record RoleSummaryResponse(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		long permissionCount,
		long dataScopeCount,
		Instant updatedAt,
		long version) {
}

public record RoleResponse(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		List<String> permissionCodes,
		List<DataScope> dataScopes,
		Instant createdAt,
		Instant updatedAt,
		long version) {

	public RoleResponse {
		permissionCodes = List.copyOf(permissionCodes);
		dataScopes = List.copyOf(dataScopes);
	}

	public record DataScope(
			String entityType,
			DataScopeType type,
			UUID teamId) {
	}
}
```

Each public record must be placed in its own same-named file with the imports
required by its own shape.

- [x] **Step 3: Create a manual web mapper**

Create `RoleWebMapper.java` as this complete final component:

```java
package com.crm.platform.access.presentation.web;

import java.util.List;

import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.RoleScopeInput;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.domain.RoleId;
import org.springframework.stereotype.Component;

@Component
public final class RoleWebMapper {

public CreateRoleCommand toCreateCommand(CreateRoleRequest request) {
	return new CreateRoleCommand(
			request.roleCode(), request.name(), request.description(),
			request.permissionCodes(), scopeInputs(request.dataScopes()));
}

public UpdateRoleCommand toUpdateCommand(
		RoleId roleId, UpdateRoleRequest request) {
	return new UpdateRoleCommand(
			roleId, request.version(), request.name(), request.description(),
			request.status(), request.permissionCodes(),
			scopeInputs(request.dataScopes()));
}

public PermissionResponse toPermissionResponse(
		PermissionCatalogueItem item) {
	return new PermissionResponse(
			item.permissionCode(), item.description(),
			item.moduleCode(), item.riskLevel());
}

public RoleSummaryResponse toSummaryResponse(RoleSummary summary) {
	return new RoleSummaryResponse(
			summary.id(), summary.roleCode(), summary.name(),
			summary.description(), summary.system(), summary.status(),
			summary.permissionCount(), summary.dataScopeCount(),
			summary.updatedAt(), summary.version());
}

public RoleResponse toResponse(RoleDetails details) {
	return new RoleResponse(
			details.id(), details.roleCode(), details.name(),
			details.description(), details.system(), details.status(),
			details.permissionCodes(),
			details.dataScopes().stream()
					.map(scope -> new RoleResponse.DataScope(
							scope.entityType(), scope.type(), scope.teamId()))
					.toList(),
			details.createdAt(), details.updatedAt(), details.version());
}

private static List<RoleScopeInput> scopeInputs(
		List<RoleDataScopeRequest> scopes) {
	return scopes.stream()
			.map(scope -> new RoleScopeInput(
					scope.entityType(), scope.type(), scope.teamId()))
			.toList();
}

}
```

Use a manual mapper because the nested aggregate collections and request
normalization are small and explicit; this avoids annotation-processor changes.

- [x] **Step 4: Create the permission controller**

Create `PermissionCatalogueController.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.List;

import com.crm.platform.access.application.usecase.RoleManagementFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/permissions")
public final class PermissionCatalogueController {

	private final RoleManagementFacade roles;
	private final RoleWebMapper mapper;

	public PermissionCatalogueController(
			RoleManagementFacade roles, RoleWebMapper mapper) {
		this.roles = roles;
		this.mapper = mapper;
	}

	@GetMapping
	public List<PermissionResponse> list() {
		return roles.permissions().stream()
				.map(mapper::toPermissionResponse)
				.toList();
	}

}
```

- [x] **Step 5: Create the role controller and `If-Match` validator**

Create `RoleController.java` using the Account controller's strong ETag parser
semantics:

```java
package com.crm.platform.access.presentation.web;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.Valid;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.usecase.RoleManagementFacade;
import com.crm.platform.access.domain.RoleId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
public final class RoleController {

	private final RoleManagementFacade roles;
	private final RoleWebMapper mapper;

	public RoleController(RoleManagementFacade roles, RoleWebMapper mapper) {
		this.roles = roles;
		this.mapper = mapper;
	}

	@GetMapping
	public List<RoleSummaryResponse> list() {
		return roles.roles().stream()
				.map(mapper::toSummaryResponse)
				.toList();
	}

	@GetMapping("/{id}")
	public RoleResponse get(@PathVariable UUID id) {
		return mapper.toResponse(roles.get(new RoleId(id)));
	}

	@PostMapping
	public ResponseEntity<RoleResponse> create(
			@Valid @RequestBody CreateRoleRequest request) {
		RoleDetails created = roles.create(mapper.toCreateCommand(request));
		return ResponseEntity.created(
				URI.create("/api/roles/" + created.id()))
				.body(mapper.toResponse(created));
	}

	@PutMapping("/{id}")
	public RoleResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateRoleRequest request) {
		return mapper.toResponse(roles.update(
				mapper.toUpdateCommand(new RoleId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		long version = Long.parseLong(
				ifMatch.substring(1, ifMatch.length() - 1));
		roles.delete(new DeleteRoleCommand(new RoleId(id), version));
		return ResponseEntity.noContent().build();
	}

	@Target(ElementType.PARAMETER)
	@Retention(RetentionPolicy.RUNTIME)
	@Constraint(validatedBy = IfMatchVersionValidator.class)
	public @interface ValidIfMatchVersion {

		String message() default "{validation.invalid}";
		Class<?>[] groups() default {};
		Class<? extends Payload>[] payload() default {};
	}

	public static final class IfMatchVersionValidator
			implements ConstraintValidator<ValidIfMatchVersion, String> {

		@Override
		public boolean isValid(String value,
				ConstraintValidatorContext context) {
			if (value == null || !value.matches("^\"[1-9][0-9]*\"$")) {
				return false;
			}
			try {
				Long.parseLong(value.substring(1, value.length() - 1));
				return true;
			}
			catch (NumberFormatException exception) {
				return false;
			}
		}
	}
}
```

Keep the controller final; it is not transaction-advised.

- [x] **Step 6: Allow `If-Match` through CORS**

Add `HttpHeaders.IF_MATCH` to the existing `CorsConfiguration` allowed-header
list in `IdentitySecurityConfiguration`. Do not add role or permission route
matchers; authenticated fallback and the service permission check remain the
authorization boundary. This header also makes the existing Account delete
contract callable by an allowed cross-origin browser client.

- [x] **Step 7: Perform Task 5 static checks**

```bash
rg -n "@RequestMapping\(\"/api/permissions\"\)|@RequestMapping\(\"/api/roles\"\)|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping|If-Match|ResponseEntity.created|RoleRequestCollections|platform_user.manage" crm/src/main/java/com/crm/platform/access/presentation/web crm/src/main/java/com/crm/platform/access/application/service/RoleManagementApplicationService.java
rg -n "HttpHeaders.IF_MATCH" crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java
if rg -n "api/(roles|permissions)" crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java; then exit 1; fi
```

The security-config search must return no match. The existing authenticated
fallback protects both routes; the service enforces the named permission.

---

### Task 6: Add Messages and Synchronize API/Roadmap Documentation

**Files:**

- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`
- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`

**Interfaces:**

- Consumes: all Task 1 error codes and Task 5 routes/contracts.
- Produces: localized problem messages and an English client reference containing only implemented behavior.

- [x] **Step 1: Add error messages**

Append these entries to `messages_en.properties`:

```properties
role.not_found=The role was not found
role.code_already_exists=This role code already exists
role.system_immutable=System roles cannot be changed
role.version_conflict=The role was changed by another operation
role.permission_unknown=One or more permission codes are unknown
role.data_scope_invalid=One or more role data scopes are invalid
```

Append these entries to both `messages.properties` (the configured Vietnamese
default) and `messages_vi.properties`:

```properties
role.not_found=Không tìm thấy vai trò
role.code_already_exists=Mã vai trò đã tồn tại
role.system_immutable=Không thể thay đổi vai trò hệ thống
role.version_conflict=Vai trò đã được thay đổi bởi thao tác khác
role.permission_unknown=Một hoặc nhiều mã quyền không tồn tại
role.data_scope_invalid=Một hoặc nhiều phạm vi dữ liệu của vai trò không hợp lệ
```

- [x] **Step 2: Add all six endpoint-index rows**

In `docs/api-reference.md`, add after `GET /api/access/me`:

```markdown
| `GET` | `/api/permissions` | Bearer token, tenant, `platform_user.manage` | `200 OK` |
| `GET` | `/api/roles` | Bearer token, tenant, `platform_user.manage` | `200 OK` |
| `GET` | `/api/roles/{id}` | Bearer token, tenant, `platform_user.manage` | `200 OK` |
| `POST` | `/api/roles` | Bearer token, tenant, `platform_user.manage` | `201 Created` |
| `PUT` | `/api/roles/{id}` | Bearer token, tenant, `platform_user.manage` | `200 OK` |
| `DELETE` | `/api/roles/{id}` | Bearer token, tenant, `platform_user.manage` | `204 No Content` |
```

- [x] **Step 3: Add the complete Role Management reference section**

Insert `## Role Management` after Effective Access and before Account
Management. It must include these exact subsections and contracts from the
approved spec:

Also update `Cross-origin browser calls` so its allowed-header list includes
`If-Match`; remove the obsolete warning that browser clients cannot call the
Account delete endpoint with that header.

```markdown
## Role Management

Every endpoint requires a Bearer token, `X-Tenant-ID`, and
`platform_user.manage`. Permissions are system-owned and read-only. System
roles are visible but cannot be replaced or deleted.

### List the permission catalogue
`GET /api/permissions`; `200 OK`; array fields `permissionCode`, `description`,
`moduleCode`, and `riskLevel`; ordered by module and code; not paginated.

### List roles
`GET /api/roles`; `200 OK`; array summary fields `id`, `roleCode`, `name`,
`description`, `system`, `status`, `permissionCount`, `dataScopeCount`,
`updatedAt`, and `version`; includes active/inactive non-deleted system/custom
roles; ordered by role code and ID; not paginated.

### Get a role
`GET /api/roles/{id}`; `200 OK`; fields `id`, `roleCode`, `name`, `description`,
`system`, `status`, `permissionCodes`, `dataScopes`, `createdAt`, `updatedAt`,
and `version`; sorted `permissionCodes` and `dataScopes`.

### Create a role
`POST /api/roles`; request fields `roleCode`, `name`, `description`,
`permissionCodes`, and `dataScopes`; `201 Created`;
`Location: /api/roles/{id}`; custom, active, version 1; omitted grant arrays
become empty.

### Replace a role
`PUT /api/roles/{id}`; request fields `version`, `name`, `description`,
`status`, `permissionCodes`, and `dataScopes`; immutable `roleCode`; required
positive `version`, required `name` and `status`; complete atomic grant
replacement; `200 OK`; version increments once.

### Soft-delete a role
`DELETE /api/roles/{id}` with strong quoted `If-Match`; `204 No Content`;
grants and assignments retained; effects removed immediately; code reusable.

### Validation and errors
Document all field limits, role/status formats, duplicate rejection,
permission existence, scope/team invariants, deterministic ordering, system
role immutability, and the exact error table below.
```

Include these exact create and replace request examples:

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

Use this complete detail response for get, create, and replace examples (with
values adjusted only where the operation changes them):

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

Retain the permission-list and role-summary examples from the approved design
spec without adding or advertising any future endpoint.

The section's exact error table is:

```markdown
| Status | `errorCode` | When |
|---|---|---|
| `400` | `REQUEST_VALIDATION_FAILED` | JSON, UUID, enum, field constraint, duplicate grant, or `If-Match` is invalid |
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | Tenant context is invalid or `platform_user.manage` is missing |
| `404` | `ROLE_NOT_FOUND` | The role is absent, deleted, or belongs to another tenant |
| `409` | `ROLE_CODE_ALREADY_EXISTS` | A non-deleted role already uses the normalized code |
| `409` | `SYSTEM_ROLE_IMMUTABLE` | Replace or delete targets a system role |
| `409` | `ROLE_VERSION_CONFLICT` | Replace or delete uses a stale version |
| `422` | `ROLE_PERMISSION_UNKNOWN` | A submitted permission is absent from the catalogue |
| `422` | `ROLE_DATA_SCOPE_INVALID` | Scope/team presence or the referenced team is invalid |
| `500` | `INTERNAL_ERROR` | An unexpected database or server failure occurs |
```

- [x] **Step 4: Update the roadmap**

Change Tenant Administration delivery sequence so it states:

```markdown
Role Management and the read-only permission catalogue are delivered. They
provide custom-role lifecycle, atomic permission grants, and role data scopes.
Effective Access reads these database-backed grants without JWT access lists.

Keep the remaining order:

1. Membership Management for invitation, role assignment, and membership
   lifecycle operations.
2. Team Management for team hierarchy and `TEAM` or `TEAM_TREE` scopes.
3. Broader Tenant Administration for details, status, plan, region, retention,
   and settings.
```

Do not mark user-role assignment, member invitation, or teams as delivered.

- [x] **Step 5: Perform Task 6 static checks**

```bash
rg -n "role\.(not_found|code_already_exists|system_immutable|version_conflict|permission_unknown|data_scope_invalid)" crm/src/main/resources/messages.properties crm/src/main/resources/messages_en.properties crm/src/main/resources/messages_vi.properties
rg -n "GET.*api/permissions|GET.*api/roles|POST.*api/roles|PUT.*api/roles|DELETE.*api/roles|^## Role Management|platform_user.manage|SYSTEM_ROLE_IMMUTABLE|ROLE_VERSION_CONFLICT|ROLE_PERMISSION_UNKNOWN|ROLE_DATA_SCOPE_INVALID" docs/api-reference.md
rg -n "Role Management and the read-only permission catalogue are delivered|Membership Management|Team Management" docs/technical-roadmap.md
```

Confirm the API reference contains no role-assignment, membership, team, or
permission-mutation route.

---

### Task 7: Final Static Verification and Handoff

**Files:**

- Inspect all files from Tasks 1-6.
- Do not modify unrelated files during verification.

**Interfaces:**

- Consumes: the complete Role Management implementation.
- Produces: evidence-backed static handoff without compile/runtime claims.

- [x] **Step 1: Inspect the complete package tree**

```bash
rtk tree crm/src/main/java/com/crm/platform/access -L 6
```

Confirm existing Effective Access files remain and every planned Role
Management file is present.

- [x] **Step 2: Confirm controller-to-SQL and authorization flow**

```bash
rg -n "api/(permissions|roles)|platform_user.manage|RoleManagementFacade|@Transactional|findByIdForUpdate|FOR UPDATE|replacePermissionGrants|replaceDataScopeGrants|is_system = false|deleted_at IS NULL|expectedVersion|ROLE_" crm/src/main/java/com/crm/platform/access
```

Review create, replace, and delete end-to-end. Confirm system-role checks occur
before mutation and role ID/tenant ID are paired in every role query.

- [x] **Step 3: Confirm AOP and security boundaries**

```bash
if rg -n "public final class (JdbcRoleManagementRepository|RoleManagementApplicationService)" crm/src/main/java/com/crm/platform/access; then exit 1; fi
if rg -n "api/(roles|permissions)" crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java; then exit 1; fi
```

Both commands must produce no match.

- [x] **Step 4: Confirm protected files were not changed for this feature**

```bash
git status --short -- crm/src/main/resources/application.yaml docs/crm_mysql80.sql docs/crm_postgresql18.sql crm/src/main/resources/keys
rg -n "api/roles|api/permissions|RoleManagement|ROLE_" crm/src/main/resources/application.yaml docs/crm_mysql80.sql docs/crm_postgresql18.sql
```

The marker search must produce no match. Never print key contents or secret
configuration values.

- [x] **Step 5: Confirm SQL and request contracts**

```bash
rg -n "INSERT INTO platform_permissions|UPDATE platform_permissions|DELETE FROM platform_permissions" crm/src/main/java/com/crm/platform/access
rg -n "String\.format|formatted\(|\+.*tenantId|\+.*roleId|\+.*permission|\+.*teamId" crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcRoleManagementRepository.java
rg -n "roleCode.*UpdateRoleRequest|system.*(CreateRoleRequest|UpdateRoleRequest)" crm/src/main/java/com/crm/platform/access/presentation/web
```

All three searches must produce no match. Static `ROLE_ROW_SELECT` composition
is allowed; no request/context value may be concatenated into SQL.

- [x] **Step 6: Run whitespace, Markdown, and scoped status checks**

```bash
rg -n "[[:blank:]]+$" crm/src/main/java/com/crm/platform/access crm/src/main/resources/messages.properties crm/src/main/resources/messages_en.properties crm/src/main/resources/messages_vi.properties docs/api-reference.md docs/technical-roadmap.md docs/superpowers/specs/2026-08-10-role-management-design.md docs/superpowers/plans/2026-08-10-role-management.md
awk '/^```/{count++} END { print count; exit count % 2 }' docs/api-reference.md
git diff --check -- crm/src/main/resources/messages.properties crm/src/main/resources/messages_en.properties crm/src/main/resources/messages_vi.properties docs/api-reference.md docs/technical-roadmap.md
git status --short -- crm/src/main/java/com/crm/platform/access crm/src/main/resources/messages.properties crm/src/main/resources/messages_en.properties crm/src/main/resources/messages_vi.properties docs/api-reference.md docs/technical-roadmap.md docs/superpowers/specs/2026-08-10-role-management-design.md docs/superpowers/plans/2026-08-10-role-management.md
```

The trailing-whitespace search must return no match, the Markdown fence count
must be even, and tracked diffs must have no whitespace errors.

- [x] **Step 7: Report verification limits and preserve workspace**

Report that tests, builds, application startup, database calls, browser checks,
and runtime API calls were not run because repository rules prohibit them. Do
not claim compile or runtime success. Leave all files uncommitted and use the
manual checklist in the approved design spec for the user's later testing.
