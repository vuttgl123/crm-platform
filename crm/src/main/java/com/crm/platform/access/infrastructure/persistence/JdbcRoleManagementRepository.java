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

	private static final String ROLE_ROW_SELECT = """
			SELECT r.tenant_id, r.id, r.role_code, r.name, r.description,
			       r.is_system, r.status, r.created_at, r.created_by,
			       r.updated_at, r.updated_by, r.deleted_at, r.deleted_by,
			       r.version
			FROM platform_roles r
			""";

	private final JdbcClient jdbcClient;

	public JdbcRoleManagementRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

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

	@Override
	public Optional<Role> findById(TenantId tenantId, RoleId roleId) {
		return findRoleRow(tenantId, roleId).map(this::toRole);
	}

	@Override
	public Optional<Role> findByIdForUpdate(
			TenantId tenantId, RoleId roleId) {
		return findRoleRowForUpdate(tenantId, roleId).map(this::toRole);
	}

	@Override
	public boolean existsNonDeletedRoleCode(
			TenantId tenantId, String roleCode) {
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
				.param("teamIds", teamIds.stream()
						.map(UUID::toString)
						.toList())
				.query(Long.class)
				.single();
		return count == teamIds.size();
	}

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

	private Optional<RoleRow> findRoleRow(
			TenantId tenantId, RoleId roleId) {
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
						DataScopeType.valueOf(
								resultSet.getString("scope_type")),
						nullableUuid(resultSet.getString("team_id"))))
				.list();
		return Role.rehydrate(
				row.tenantId(), row.id(), row.roleCode(), row.name(),
				row.description(), row.system(), row.status(), permissions, scopes,
				row.createdAt(), row.createdBy(), row.updatedAt(), row.updatedBy(),
				row.deletedAt(), row.deletedBy(), row.version());
	}

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

	private static Timestamp timestamp(Instant value) {
		return value == null ? null : Timestamp.from(value);
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

}
