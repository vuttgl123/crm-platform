package com.crm.foundation.security;

import com.crm.foundation.tenancy.CurrentTenant;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component("permissionChecker")
public final class DatabasePermissionChecker implements PermissionChecker {

	private final JdbcClient jdbcClient;
	private final CurrentActor currentActor;
	private final CurrentTenant currentTenant;

	public DatabasePermissionChecker(JdbcClient jdbcClient,
			CurrentActor currentActor, CurrentTenant currentTenant) {
		this.jdbcClient = jdbcClient;
		this.currentActor = currentActor;
		this.currentTenant = currentTenant;
	}

	@Override
	public boolean hasPermission(String permission) {
		String actorId = currentActor.requireActorId().toString();
		String tenantId = currentTenant.requireTenantId().toString();
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				JOIN platform_tenants t ON t.id = m.tenant_id
				WHERE m.tenant_id = :tenantId
				  AND m.user_id = :userId
				  AND m.membership_status = 'ACTIVE'
				  AND u.status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				  AND (
				      m.is_tenant_admin = true
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
				            AND rp.permission_code = :permission
				      )
				  )
				""")
				.param("tenantId", tenantId)
				.param("userId", actorId)
				.param("permission", permission)
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public void requirePermission(String permission) {
		if (!hasPermission(permission)) {
			throw new AccessDeniedException("Required permission is missing");
		}
	}

}
