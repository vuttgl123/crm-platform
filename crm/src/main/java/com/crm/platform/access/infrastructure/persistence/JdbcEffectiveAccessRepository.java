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
