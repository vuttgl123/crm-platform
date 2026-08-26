package com.crm.platform.team.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.application.port.RoleDataScopeRepository;
import com.crm.platform.team.domain.RoleDataScope;
import com.crm.platform.team.domain.RoleDataScopeId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcRoleDataScopeRepository implements RoleDataScopeRepository {

	private static final String SCOPE_SELECT = """
			SELECT rds.tenant_id, rds.id, rds.role_id, rds.entity_type,
			       rds.scope_type, rds.team_id, rds.created_at, rds.created_by
			FROM platform_role_data_scopes rds
			""";

	private static final String DETAILS_SELECT = """
			SELECT rds.id, rds.role_id, rds.entity_type, rds.scope_type,
			       rds.team_id, t.name AS team_name, rds.created_at, rds.created_by
			FROM platform_role_data_scopes rds
			LEFT JOIN platform_teams t ON t.tenant_id = rds.tenant_id AND t.id = rds.team_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcRoleDataScopeRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<RoleDataScope> findById(TenantId tenantId, RoleDataScopeId id) {
		String sql = SCOPE_SELECT + """
				WHERE rds.tenant_id = :tenantId
				  AND rds.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(RoleDataScopeJdbcMapper::mapScope)
				.optional();
	}

	@Override
	public List<RoleDataScopeDetails> findByRoleId(TenantId tenantId, UUID roleId) {
		String sql = DETAILS_SELECT + """
				WHERE rds.tenant_id = :tenantId
				  AND rds.role_id = :roleId
				ORDER BY rds.entity_type, rds.scope_type
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("roleId", roleId)
				.query(RoleDataScopeJdbcMapper::mapDetails)
				.list();
	}

	@Override
	public void insert(RoleDataScope scope) {
		String sql = """
				INSERT INTO platform_role_data_scopes (
				    tenant_id, id, role_id, entity_type,
				    scope_type, team_id, created_at, created_by
				) VALUES (
				    :tenantId, :id, :roleId, :entityType,
				    :scopeType, :teamId, :createdAt, :createdBy
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", scope.tenantId().value())
				.param("id", scope.id().value())
				.param("roleId", scope.roleId())
				.param("entityType", scope.entityType())
				.param("scopeType", scope.scopeType().name())
				.param("teamId", scope.teamId() != null ? scope.teamId().value() : null)
				.param("createdAt", Timestamp.from(scope.createdAt()))
				.param("createdBy", scope.createdBy() != null ? scope.createdBy().value() : null)
				.update();
	}

	@Override
	public void delete(TenantId tenantId, RoleDataScopeId id) {
		String sql = """
				DELETE FROM platform_role_data_scopes
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.update();
	}

}
