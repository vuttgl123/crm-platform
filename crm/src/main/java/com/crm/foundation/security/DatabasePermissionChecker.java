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
	public boolean hasPermission(SystemPermission permission) {
		if (permission == null) {
			return false;
		}
		var actorId = currentActor.actorId();
		var tenantId = currentTenant.tenantId();
		if (actorId.isEmpty() || tenantId.isEmpty()) {
			return false;
		}
		return jdbcClient.sql("""
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
				""")
				.param("tenantId", tenantId.get().toString())
				.param("userId", actorId.get().toString())
				.param("permission", permission.code())
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public void requirePermission(SystemPermission permission) {
		if (!hasPermission(permission)) {
			throw new AccessDeniedException("Required permission is missing");
		}
	}

}
