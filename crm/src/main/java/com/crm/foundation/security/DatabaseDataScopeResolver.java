package com.crm.foundation.security;

import java.util.Set;
import java.util.UUID;

import com.crm.foundation.tenancy.CurrentTenant;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
public final class DatabaseDataScopeResolver implements DataScopeResolver {

	private final JdbcClient jdbcClient;
	private final CurrentActor currentActor;
	private final CurrentTenant currentTenant;

	public DatabaseDataScopeResolver(JdbcClient jdbcClient,
			CurrentActor currentActor, CurrentTenant currentTenant) {
		this.jdbcClient = jdbcClient;
		this.currentActor = currentActor;
		this.currentTenant = currentTenant;
	}

	@Override
	public Set<ResolvedDataScope> resolve(String entityType) {
		if (entityType == null || entityType.isBlank()) {
			return Set.of();
		}
		var actorId = currentActor.actorId();
		var tenantId = currentTenant.tenantId();
		if (actorId.isEmpty() || tenantId.isEmpty()) {
			return Set.of();
		}
		String userId = actorId.get().toString();
		String currentTenantId = tenantId.get().toString();
		if (isTenantAdmin(currentTenantId, userId)) {
			return Set.of(new ResolvedDataScope(DataScopeType.TENANT, null));
		}
		return jdbcClient.sql("""
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
				""")
				.param("tenantId", currentTenantId)
				.param("userId", userId)
				.param("entityType", entityType)
				.query((resultSet, rowNumber) -> new ResolvedDataScope(
						DataScopeType.valueOf(resultSet.getString("scope_type")),
						teamId(resultSet.getString("team_id"))))
				.set();
	}

	private boolean isTenantAdmin(String tenantId, String userId) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				JOIN platform_tenants t ON t.id = m.tenant_id
				WHERE m.tenant_id = :tenantId AND m.user_id = :userId
				  AND m.membership_status = 'ACTIVE'
				  AND m.is_tenant_admin = true
				  AND u.status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				""")
				.param("tenantId", tenantId)
				.param("userId", userId)
				.query(Long.class)
				.single() > 0L;
	}

	private static UUID teamId(String value) {
		return value == null ? null : UUID.fromString(value);
	}

}
