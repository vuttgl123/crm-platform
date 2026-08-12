# Effective Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Use subagents only if the user explicitly authorizes multi-agent execution in a later request. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated, tenant-specific `GET /api/access/me` endpoint that returns the caller's current effective permissions and global-or-entity data scopes directly from the database.

**Architecture:** Implement a dedicated read-only `com.crm.platform.access` vertical slice. A transactional application service reads actor and tenant contexts, a focused JDBC adapter loads the validated access snapshot in bulk, and a manual web mapper handles the dynamic entity-to-scopes response without changing the existing authorization-enforcement interfaces.

**Tech Stack:** Java 21, Spring Boot 4, Spring MVC, Spring Security resource server, Spring JDBC `JdbcClient`, Spring transactions, MySQL 8.

## Global Constraints

- Treat `docs/superpowers/specs/2026-08-10-effective-access-design.md` as the approved feature contract.
- Do not read or modify `crm-fe`.
- Do not modify JWT claims, signing keys, datasource configuration, `application.yaml`, database schema files, or current key locations.
- Do not change `DatabasePermissionChecker`, `DatabaseDataScopeResolver`, `PermissionChecker`, `DataScopeResolver`, Tenant Bootstrap, or Account behavior.
- Do not add role, permission-catalogue, membership, team, or tenant-administration endpoints.
- Do not run tests, Maven builds, the application, database checks, browser checks, or manual API calls unless the user gives a new explicit authorization.
- Do not create, stage, or push commits. Leave every change uncommitted for user review.
- Use `apply_patch` for file edits.
- Keep `docs/api-reference.md` synchronized with the implemented endpoint in the same task.
- Use named JDBC parameters for every value. Never concatenate request or context values into SQL.
- Preserve the existing user-owned CORS and self-registration documentation changes in `docs/api-reference.md`.
- Return no assigned role IDs, role codes, role names, permission metadata, or grant sources.
- Return deterministic permission, entity-key, and scope ordering.
- Send `Cache-Control: no-store` on every successful response.
- Keep examples free of real tokens, credentials, signing material, connection values, and personal data.
- Static verification commands may inspect source, diffs, Markdown structure, and Git status only.

---

## File Map

### Application read model and contracts

- Create `crm/src/main/java/com/crm/platform/access/application/dto/EffectiveAccessDetails.java`: immutable, normalized application read model.
- Create `crm/src/main/java/com/crm/platform/access/application/port/EffectiveAccessRepository.java`: active-context and bulk effective-access read port.
- Create `crm/src/main/java/com/crm/platform/access/application/usecase/EffectiveAccessFacade.java`: public current-access use case.

### Persistence and orchestration

- Create `crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcEffectiveAccessRepository.java`: context, permissions, and data-scope SQL.
- Create `crm/src/main/java/com/crm/platform/access/application/service/EffectiveAccessApplicationService.java`: read-only orchestration and access-denial behavior.

### HTTP contract

- Create `crm/src/main/java/com/crm/platform/access/presentation/web/EffectiveAccessResponse.java`: nested JSON response contract.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/EffectiveAccessWebMapper.java`: manual mapping for nested dynamic maps.
- Create `crm/src/main/java/com/crm/platform/access/presentation/web/EffectiveAccessController.java`: `GET /api/access/me` and no-store response.

### Documentation

- Modify `docs/api-reference.md`: endpoint index, request, response, semantics, caching, and errors.
- Modify `docs/technical-roadmap.md`: mark Current Tenant Access Context as delivered without advertising future APIs.

---

### Task 1: Add the Effective Access Read Model and Ports

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/application/dto/EffectiveAccessDetails.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/port/EffectiveAccessRepository.java`
- Create: `crm/src/main/java/com/crm/platform/access/application/usecase/EffectiveAccessFacade.java`

**Interfaces:**

- Consumes: existing `ActorId`, `TenantId`, and `DataScopeType` types.
- Produces: `EffectiveAccessDetails`, `EffectiveAccessRepository.findActiveContext`, `findEffectivePermissions`, `findEffectiveScopeGrants`, and `EffectiveAccessFacade.current()`.

- [ ] **Step 1: Create the immutable application read model**

Create `EffectiveAccessDetails.java`:

```java
package com.crm.platform.access.application.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;

public record EffectiveAccessDetails(
		TenantSummary tenant,
		MembershipSummary membership,
		List<String> permissions,
		DataAccessDetails dataAccess) {

	public EffectiveAccessDetails {
		tenant = Objects.requireNonNull(tenant, "tenant must not be null");
		membership = Objects.requireNonNull(
				membership, "membership must not be null");
		permissions = Objects.requireNonNull(
				permissions, "permissions must not be null")
				.stream()
				.map(EffectiveAccessDetails::requiredText)
				.distinct()
				.sorted()
				.toList();
		dataAccess = Objects.requireNonNull(
				dataAccess, "dataAccess must not be null");
	}

	private static String requiredText(String value) {
		String normalized = Objects.requireNonNull(
				value, "value must not be null").trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException("value must not be blank");
		}
		return normalized;
	}

	public record TenantSummary(
			UUID id,
			String tenantCode,
			String displayName) {

		public TenantSummary {
			id = Objects.requireNonNull(id, "id must not be null");
			tenantCode = requiredText(tenantCode);
			displayName = requiredText(displayName);
		}

	}

	public record MembershipSummary(
			String status,
			boolean tenantAdmin) {

		public MembershipSummary {
			status = requiredText(status);
		}

	}

	public record DataAccessDetails(
			DataScopeType defaultScope,
			Map<String, List<ScopeDetails>> entities) {

		private static final Comparator<ScopeDetails> SCOPE_ORDER =
				Comparator.comparing(ScopeDetails::type)
						.thenComparing(scope -> scope.teamId() == null
								? "" : scope.teamId().toString());

		public DataAccessDetails {
			Objects.requireNonNull(entities, "entities must not be null");
			if (defaultScope != null && defaultScope != DataScopeType.TENANT) {
				throw new IllegalArgumentException(
						"defaultScope must be TENANT or null");
			}
			if (defaultScope != null && !entities.isEmpty()) {
				throw new IllegalArgumentException(
						"global data access must not contain entity scopes");
			}

			Map<String, List<ScopeDetails>> sorted = new TreeMap<>();
			entities.forEach((entityType, scopes) -> {
				String normalizedEntityType = requiredText(entityType);
				List<ScopeDetails> normalizedScopes = new ArrayList<>(
						Objects.requireNonNull(
								scopes, "scopes must not be null"));
				normalizedScopes.forEach(scope -> Objects.requireNonNull(
						scope, "scope must not be null"));
				normalizedScopes = normalizedScopes.stream()
						.distinct()
						.sorted(SCOPE_ORDER)
						.toList();
				sorted.put(normalizedEntityType, normalizedScopes);
			});
			entities = Collections.unmodifiableMap(
					new LinkedHashMap<>(sorted));
		}

	}

	public record ScopeDetails(
			DataScopeType type,
			UUID teamId) {

		public ScopeDetails {
			type = Objects.requireNonNull(type, "type must not be null");
			boolean teamScope = type == DataScopeType.TEAM
					|| type == DataScopeType.TEAM_TREE;
			if (teamScope != (teamId != null)) {
				throw new IllegalArgumentException(
						"teamId presence does not match scope type");
			}
		}

	}

}
```

- [ ] **Step 2: Create the repository port**

Create `EffectiveAccessRepository.java`:

```java
package com.crm.platform.access.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface EffectiveAccessRepository {

	Optional<ActiveAccessContext> findActiveContext(
			ActorId actorId, TenantId tenantId);

	List<String> findEffectivePermissions(
			ActorId actorId, TenantId tenantId);

	List<EffectiveScopeGrant> findEffectiveScopeGrants(
			ActorId actorId, TenantId tenantId);

	record ActiveAccessContext(
			TenantId tenantId,
			String tenantCode,
			String displayName,
			String membershipStatus,
			boolean tenantAdmin) {
	}

	record EffectiveScopeGrant(
			String entityType,
			DataScopeType type,
			UUID teamId) {
	}

}
```

- [ ] **Step 3: Create the use-case facade**

Create `EffectiveAccessFacade.java`:

```java
package com.crm.platform.access.application.usecase;

import com.crm.platform.access.application.dto.EffectiveAccessDetails;

public interface EffectiveAccessFacade {

	EffectiveAccessDetails current();

}
```

- [ ] **Step 4: Perform Task 1 static checks**

Run only read-only checks:

```bash
rg -n "record EffectiveAccessDetails|record DataAccessDetails|record ScopeDetails|interface EffectiveAccessRepository|interface EffectiveAccessFacade" crm/src/main/java/com/crm/platform/access
rg -n "distinct\(\)|sorted\(|unmodifiableMap|defaultScope must be TENANT|teamId presence" crm/src/main/java/com/crm/platform/access/application/dto/EffectiveAccessDetails.java
```

Inspect the records and confirm permissions, entity keys, and scopes become
immutable and deterministic. Do not compile or run tests.

---

### Task 2: Implement the Bulk JDBC Effective-Access Reader

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcEffectiveAccessRepository.java`

**Interfaces:**

- Consumes: every method and nested record from `EffectiveAccessRepository`.
- Produces: three named-parameter read queries matching existing permission and data-scope predicates.

- [ ] **Step 1: Add active context and effective-permission queries**

Create `JdbcEffectiveAccessRepository.java` with the class, constructor, context
query, and permission query:

```java
package com.crm.platform.access.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;
import com.crm.platform.access.application.port.EffectiveAccessRepository;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcEffectiveAccessRepository
		implements EffectiveAccessRepository {

	private final JdbcClient jdbcClient;

	public JdbcEffectiveAccessRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<ActiveAccessContext> findActiveContext(
			ActorId actorId, TenantId tenantId) {
		return jdbcClient.sql("""
				SELECT t.id, t.tenant_code, t.display_name,
				       m.membership_status, m.is_tenant_admin
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				JOIN platform_tenants t ON t.id = m.tenant_id
				WHERE m.tenant_id = :tenantId
				  AND m.user_id = :userId
				  AND m.membership_status = 'ACTIVE'
				  AND u.status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", actorId.toString())
				.query((resultSet, rowNumber) -> new ActiveAccessContext(
						TenantId.from(resultSet.getString("id")),
						resultSet.getString("tenant_code"),
						resultSet.getString("display_name"),
						resultSet.getString("membership_status"),
						resultSet.getBoolean("is_tenant_admin")))
				.optional();
	}

	@Override
	public List<String> findEffectivePermissions(
			ActorId actorId, TenantId tenantId) {
		return jdbcClient.sql("""
				SELECT DISTINCT p.permission_code
				FROM platform_permissions p
				JOIN platform_tenant_memberships m
				  ON m.tenant_id = :tenantId
				 AND m.user_id = :userId
				JOIN platform_users u ON u.id = m.user_id
				JOIN platform_tenants t ON t.id = m.tenant_id
				WHERE m.membership_status = 'ACTIVE'
				  AND u.status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				  AND (
				      (m.is_tenant_admin = true AND p.risk_level = 'NORMAL')
				      OR EXISTS (
				          SELECT 1
				          FROM platform_user_roles ur
				          JOIN platform_roles r
				            ON r.tenant_id = ur.tenant_id
				           AND r.id = ur.role_id
				          JOIN platform_role_permissions rp
				            ON rp.tenant_id = r.tenant_id
				           AND rp.role_id = r.id
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
				ORDER BY p.permission_code
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", actorId.toString())
				.query(String.class)
				.list();
	}
```

Keep the class open for Task 2 Step 2.

- [ ] **Step 2: Add the bulk entity-scope query and close the class**

Add this method and helper inside `JdbcEffectiveAccessRepository`:

```java
	@Override
	public List<EffectiveScopeGrant> findEffectiveScopeGrants(
			ActorId actorId, TenantId tenantId) {
		return jdbcClient.sql("""
				SELECT DISTINCT ds.entity_type, ds.scope_type, ds.team_id
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				JOIN platform_tenants t ON t.id = m.tenant_id
				JOIN platform_user_roles ur
				  ON ur.tenant_id = m.tenant_id
				 AND ur.user_id = m.user_id
				JOIN platform_roles r
				  ON r.tenant_id = ur.tenant_id
				 AND r.id = ur.role_id
				JOIN platform_role_data_scopes ds
				  ON ds.tenant_id = r.tenant_id
				 AND ds.role_id = r.id
				WHERE m.tenant_id = :tenantId
				  AND m.user_id = :userId
				  AND m.membership_status = 'ACTIVE'
				  AND u.status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				  AND r.status = 'ACTIVE'
				  AND r.deleted_at IS NULL
				  AND ur.valid_from <= CURRENT_TIMESTAMP(6)
				  AND (ur.valid_to IS NULL
				       OR ur.valid_to > CURRENT_TIMESTAMP(6))
				ORDER BY ds.entity_type, ds.scope_type, ds.team_id
				""")
				.param("tenantId", tenantId.toString())
				.param("userId", actorId.toString())
				.query((resultSet, rowNumber) -> new EffectiveScopeGrant(
						resultSet.getString("entity_type"),
						DataScopeType.valueOf(
								resultSet.getString("scope_type")),
						teamId(resultSet.getString("team_id"))))
				.list();
	}

	private static UUID teamId(String value) {
		return value == null ? null : UUID.fromString(value);
	}

}
```

- [ ] **Step 3: Compare the permission query with the enforcement query**

Inspect these files side by side:

```bash
rtk read crm/src/main/java/com/crm/foundation/security/DatabasePermissionChecker.java
rtk read crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcEffectiveAccessRepository.java
```

Confirm both permission queries enforce:

1. active membership;
2. active user;
3. tenant status `TRIAL` or `ACTIVE`;
4. Tenant Admin implicit access only for `NORMAL` risk;
5. active and non-deleted roles;
6. effective `valid_from` and `valid_to`; and
7. matching role-permission code.

- [ ] **Step 4: Compare the scope query with the enforcement resolver**

Inspect:

```bash
rtk read crm/src/main/java/com/crm/foundation/security/DatabaseDataScopeResolver.java
rtk read crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcEffectiveAccessRepository.java
```

Confirm the non-admin scope query applies the same actor, tenant, membership,
user, tenant, role, deletion, and validity predicates. The read model omits the
single-entity predicate intentionally because it returns every effective entity
scope in one call.

- [ ] **Step 5: Perform Task 2 static checks**

Run:

```bash
rg -n "SELECT DISTINCT|membership_status = 'ACTIVE'|risk_level = 'NORMAL'|r.status = 'ACTIVE'|r.deleted_at IS NULL|valid_from|valid_to|ORDER BY|\.param\(" crm/src/main/java/com/crm/platform/access/infrastructure/persistence/JdbcEffectiveAccessRepository.java
```

Inspect every SQL statement and confirm it contains only named parameters and
no context-value concatenation. Do not execute SQL.

---

### Task 3: Implement Read-Only Effective-Access Orchestration

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/application/service/EffectiveAccessApplicationService.java`

**Interfaces:**

- Consumes: `EffectiveAccessRepository`, `CurrentActor`, `CurrentTenant`, and the Task 1 records.
- Produces: transactional implementation of `EffectiveAccessFacade.current()`.

- [ ] **Step 1: Create the application service**

Create `EffectiveAccessApplicationService.java`:

```java
package com.crm.platform.access.application.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.DataScopeType;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.platform.access.application.dto.EffectiveAccessDetails;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.DataAccessDetails;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.MembershipSummary;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.ScopeDetails;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.TenantSummary;
import com.crm.platform.access.application.port.EffectiveAccessRepository;
import com.crm.platform.access.application.port.EffectiveAccessRepository.ActiveAccessContext;
import com.crm.platform.access.application.usecase.EffectiveAccessFacade;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EffectiveAccessApplicationService
		implements EffectiveAccessFacade {

	private final EffectiveAccessRepository repository;
	private final CurrentActor currentActor;
	private final CurrentTenant currentTenant;

	public EffectiveAccessApplicationService(
			EffectiveAccessRepository repository,
			CurrentActor currentActor,
			CurrentTenant currentTenant) {
		this.repository = repository;
		this.currentActor = currentActor;
		this.currentTenant = currentTenant;
	}

	@Override
	@Transactional(readOnly = true)
	public EffectiveAccessDetails current() {
		ActorId actorId = currentActor.requireActorId();
		TenantId tenantId = currentTenant.tenantId()
				.orElseThrow(() -> new AccessDeniedException(
						"Active tenant context is required"));
		ActiveAccessContext context = repository
				.findActiveContext(actorId, tenantId)
				.orElseThrow(() -> new AccessDeniedException(
						"Active tenant membership is required"));

		List<String> permissions = repository
				.findEffectivePermissions(actorId, tenantId);
		DataAccessDetails dataAccess = context.tenantAdmin()
				? new DataAccessDetails(DataScopeType.TENANT, Map.of())
				: entityDataAccess(actorId, tenantId);

		return new EffectiveAccessDetails(
				new TenantSummary(
						context.tenantId().value(),
						context.tenantCode(),
						context.displayName()),
				new MembershipSummary(
						context.membershipStatus(),
						context.tenantAdmin()),
				permissions,
				dataAccess);
	}

	private DataAccessDetails entityDataAccess(
			ActorId actorId, TenantId tenantId) {
		Map<String, List<ScopeDetails>> entities = new LinkedHashMap<>();
		repository.findEffectiveScopeGrants(actorId, tenantId)
				.forEach(grant -> entities
						.computeIfAbsent(
								grant.entityType(), ignored -> new ArrayList<>())
						.add(new ScopeDetails(
								grant.type(), grant.teamId())));
		return new DataAccessDetails(null, entities);
	}

}
```

Keep this Spring-managed transactional class non-final so class-based proxies
remain valid under the current AOP configuration.

- [ ] **Step 2: Inspect context and query ordering**

Confirm the service performs this exact order:

1. require actor context;
2. require tenant context with `AccessDeniedException` on absence;
3. defensively load active context;
4. load all effective permissions;
5. skip the role-scope query for Tenant Admin and return global `TENANT`; or
6. load and group all effective non-admin entity scopes; and
7. construct the immutable read model.

- [ ] **Step 3: Perform Task 3 static checks**

Run:

```bash
rg -n "@Transactional\(readOnly = true\)|requireActorId|currentTenant\.tenantId|AccessDeniedException|findActiveContext|findEffectivePermissions|tenantAdmin|DataScopeType.TENANT|findEffectiveScopeGrants" crm/src/main/java/com/crm/platform/access/application/service/EffectiveAccessApplicationService.java
```

Confirm the service contains no write method, cache, role exposure, or JWT
dependency. Do not invoke the service.

---

### Task 4: Expose the Effective Access HTTP Endpoint

**Files:**

- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/EffectiveAccessResponse.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/EffectiveAccessWebMapper.java`
- Create: `crm/src/main/java/com/crm/platform/access/presentation/web/EffectiveAccessController.java`

**Interfaces:**

- Consumes: `EffectiveAccessFacade` and `EffectiveAccessDetails`.
- Produces: authenticated `GET /api/access/me` with the approved nested response and `Cache-Control: no-store`.

- [ ] **Step 1: Create the HTTP response records**

Create `EffectiveAccessResponse.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;

public record EffectiveAccessResponse(
		Tenant tenant,
		Membership membership,
		List<String> permissions,
		DataAccess dataAccess) {

	public EffectiveAccessResponse {
		tenant = Objects.requireNonNull(tenant, "tenant must not be null");
		membership = Objects.requireNonNull(
				membership, "membership must not be null");
		permissions = List.copyOf(
				Objects.requireNonNull(
						permissions, "permissions must not be null"));
		dataAccess = Objects.requireNonNull(
				dataAccess, "dataAccess must not be null");
	}

	public record Tenant(
			UUID id,
			String tenantCode,
			String displayName) {
	}

	public record Membership(
			String status,
			boolean tenantAdmin) {
	}

	public record DataAccess(
			DataScopeType defaultScope,
			Map<String, List<Scope>> entities) {

		public DataAccess {
			Objects.requireNonNull(entities, "entities must not be null");
			Map<String, List<Scope>> copy = new LinkedHashMap<>();
			entities.forEach((entityType, scopes) -> copy.put(
					entityType,
					List.copyOf(scopes)));
			entities = Collections.unmodifiableMap(copy);
		}

	}

	public record Scope(
			DataScopeType type,
			UUID teamId) {
	}

}
```

- [ ] **Step 2: Create the manual web mapper**

Create `EffectiveAccessWebMapper.java`:

```java
package com.crm.platform.access.presentation.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.crm.platform.access.application.dto.EffectiveAccessDetails;
import org.springframework.stereotype.Component;

@Component
public final class EffectiveAccessWebMapper {

	public EffectiveAccessResponse toResponse(EffectiveAccessDetails details) {
		EffectiveAccessResponse.Tenant tenant =
				new EffectiveAccessResponse.Tenant(
						details.tenant().id(),
						details.tenant().tenantCode(),
						details.tenant().displayName());
		EffectiveAccessResponse.Membership membership =
				new EffectiveAccessResponse.Membership(
						details.membership().status(),
						details.membership().tenantAdmin());
		Map<String, List<EffectiveAccessResponse.Scope>> entities =
				new LinkedHashMap<>();
		details.dataAccess().entities().forEach((entityType, scopes) ->
				entities.put(entityType, scopes.stream()
						.map(scope -> new EffectiveAccessResponse.Scope(
								scope.type(), scope.teamId()))
						.toList()));
		EffectiveAccessResponse.DataAccess dataAccess =
				new EffectiveAccessResponse.DataAccess(
						details.dataAccess().defaultScope(),
						entities);
		return new EffectiveAccessResponse(
				tenant,
				membership,
				details.permissions(),
				dataAccess);
	}

}
```

Use a manual Spring component because mapping
`Map<String, List<ScopeDetails>>` to a different nested scope type is explicit,
small, and avoids unnecessary annotation-processor customization.

- [ ] **Step 3: Create the no-store controller**

Create `EffectiveAccessController.java`:

```java
package com.crm.platform.access.presentation.web;

import com.crm.platform.access.application.dto.EffectiveAccessDetails;
import com.crm.platform.access.application.usecase.EffectiveAccessFacade;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/access")
public final class EffectiveAccessController {

	private final EffectiveAccessFacade access;
	private final EffectiveAccessWebMapper mapper;

	public EffectiveAccessController(
			EffectiveAccessFacade access,
			EffectiveAccessWebMapper mapper) {
		this.access = access;
		this.mapper = mapper;
	}

	@GetMapping("/me")
	public ResponseEntity<EffectiveAccessResponse> current() {
		EffectiveAccessDetails details = access.current();
		return ResponseEntity.ok()
				.cacheControl(CacheControl.noStore())
				.body(mapper.toResponse(details));
	}

}
```

Do not add a public route matcher to
`IdentitySecurityConfiguration`. The existing
`anyRequest().authenticated()` rule protects this endpoint, and
`CurrentIdentityContextFilter` validates a supplied `X-Tenant-ID` before the
controller runs.

- [ ] **Step 4: Perform Task 4 static checks**

Run:

```bash
rg -n "@RequestMapping\(\"/api/access\"\)|@GetMapping\(\"/me\"\)|CacheControl.noStore|ResponseEntity.ok|EffectiveAccessFacade" crm/src/main/java/com/crm/platform/access/presentation/web
```

Then confirm no public matcher was added:

```bash
rg -n "api/access" crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java
```

The second command must return no match. Do not start the application.

---

### Task 5: Synchronize the API Reference and Roadmap

**Files:**

- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`

**Interfaces:**

- Consumes: the Task 4 route and response plus the Task 2 permission/scope semantics.
- Produces: an English client contract that documents only implemented behavior.

- [ ] **Step 1: Add the endpoint-index row**

In `docs/api-reference.md`, add this row after `POST /api/tenants` and before
the Account rows:

```markdown
| `GET` | `/api/access/me` | Bearer token and active tenant | `200 OK` |
```

- [ ] **Step 2: Add the complete Effective Access section**

Insert this section after Tenant Bootstrap and before Account Management:

````markdown
## Effective Access

### Get current tenant access

```http
GET /api/access/me
Authorization: Bearer <access-token>
X-Tenant-ID: 22222222-2222-2222-2222-222222222222
```

This endpoint returns the authenticated user's current effective access for
one selected active tenant. It reads authorization from the database and does
not read roles, permissions, or data scopes from JWT claims.

No named business permission is required because the user can inspect only
their own access. Both the Bearer token and `X-Tenant-ID` are required.

The response is intended for frontend rendering. Clients can hide or disable
controls using the returned permission codes, but every business endpoint
still enforces permission and data scope independently on the server.

#### Example call

```bash
curl --request GET \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "X-Tenant-ID: 22222222-2222-2222-2222-222222222222" \
  http://localhost:8080/api/access/me
```

#### Tenant Admin success

- Status: `200 OK`
- Cache header: `Cache-Control: no-store`

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

An active Tenant Admin receives every `NORMAL` catalogue permission plus
permissions granted through currently effective roles. The bootstrap
`platform_user.manage` permission is `PRIVILEGED`, so it appears through the
explicit `TENANT_ADMIN` role grant. Global `defaultScope: TENANT` applies to
every entity type; no entity keys are fabricated.

#### Non-admin data access

A non-admin response has `defaultScope: null`. Its `entities` object groups
distinct effective role data scopes by entity type:

```json
{
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
```

Scope types are `OWN`, `TEAM`, `TEAM_TREE`, and `TENANT`. `teamId` is present
for `TEAM` and `TEAM_TREE` and is `null` for `OWN` and `TENANT`. An explicitly
granted entity-level `TENANT` scope remains under that entity instead of
becoming the global default.

Permission codes, entity keys, and scope arrays have deterministic ordering.
Assigned role information and permission catalogue metadata are not returned.

#### Errors

| Status | `errorCode` | When |
|---|---|---|
| `401` | `AUTHENTICATION_REQUIRED` | The Bearer token is missing or invalid |
| `403` | `ACCESS_DENIED` | `X-Tenant-ID` is missing, malformed, inactive, cross-tenant, or not an active membership for the caller |
| `500` | `INTERNAL_ERROR` | An unexpected database or server failure occurs |

The endpoint does not return `404` for an inaccessible tenant and does not
reveal whether another tenant exists. The response is not server-cached or
versioned; committed authorization changes are read again on the next call.
````

- [ ] **Step 3: Mark Current Tenant Access Context as delivered**

Replace the body of `### 2. Current tenant access context` in
`docs/technical-roadmap.md` with:

```markdown
Current Tenant Access Context is delivered through `GET /api/access/me`. It
returns the selected active membership, effective permission codes, and global
or entity-specific data scopes directly from current database authorization
state. JWTs remain identity and session tokens and do not carry access lists.

Administrative role, permission, scope, assignment, membership, and team APIs
remain future Tenant Administration slices.
```

- [ ] **Step 4: Perform Task 5 static checks**

Run:

```bash
rg -n "GET.*api/access/me|^## Effective Access|Cache-Control: no-store|defaultScope|platform_user.manage|AUTHENTICATION_REQUIRED|ACCESS_DENIED" docs/api-reference.md
rg -n "Current Tenant Access Context is delivered|GET /api/access/me|remain future" docs/technical-roadmap.md
```

Confirm the API reference contains no role, permission-catalogue, membership,
team, or tenant-administration route that does not exist.

---

## Final Static Verification and Handoff

- [ ] Inspect the complete package tree:

```bash
rtk tree crm/src/main/java/com/crm/platform/access -L 6
```

- [ ] Confirm the controller-to-SQL flow and critical semantics:

```bash
rg -n "api/access|current\(\)|@Transactional\(readOnly = true\)|findActiveContext|findEffectivePermissions|findEffectiveScopeGrants|risk_level = 'NORMAL'|valid_from|valid_to|defaultScope|DataScopeType.TENANT|CacheControl.noStore" crm/src/main/java/com/crm/platform/access
```

- [ ] Confirm Spring-managed AOP classes are non-final:

```bash
rg -n "public final class (JdbcEffectiveAccessRepository|EffectiveAccessApplicationService)" crm/src/main/java/com/crm/platform/access
```

Expected: no match.

- [ ] Confirm no route was made public and no JWT claim was added:

```bash
git diff -- crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java crm/src/main/java/com/crm/identity/infrastructure/security/JwtAccessTokenIssuer.java
```

Review only the pre-existing user changes. The Effective Access implementation
must add no `api/access` matcher or access-list JWT claim.

- [ ] Confirm the protected configuration and schema remain unchanged by this
task:

```bash
git status --short -- crm/src/main/resources/application.yaml docs/crm_mysql80.sql docs/crm_postgresql18.sql
rg -n "api/access|EffectiveAccess|defaultScope" crm/src/main/resources/application.yaml docs/crm_mysql80.sql docs/crm_postgresql18.sql
```

The status command may show pre-existing user changes; the marker search must
show no Effective Access-specific addition. Never print secret configuration
values.

- [ ] Run final whitespace, Markdown, and scoped status checks:

```bash
rg -n "[[:blank:]]+$" crm/src/main/java/com/crm/platform/access docs/api-reference.md docs/technical-roadmap.md docs/superpowers/specs/2026-08-10-effective-access-design.md docs/superpowers/plans/2026-08-10-effective-access.md
awk '/^```/{count++} END { print count; exit count % 2 }' docs/api-reference.md
git diff --check -- docs/api-reference.md docs/technical-roadmap.md
git status --short -- crm/src/main/java/com/crm/platform/access docs/api-reference.md docs/technical-roadmap.md docs/superpowers/specs/2026-08-10-effective-access-design.md docs/superpowers/plans/2026-08-10-effective-access.md
```

The trailing-whitespace search must return no match, the Markdown fence count
must be even, and tracked diffs must have no whitespace error.

- [ ] Report that tests, builds, application startup, database calls, browser
checks, and runtime API calls were not run because repository rules prohibit
them. Do not claim compile or runtime success. Leave all changes uncommitted for
the user to review and use the manual checklist in the approved design spec.
