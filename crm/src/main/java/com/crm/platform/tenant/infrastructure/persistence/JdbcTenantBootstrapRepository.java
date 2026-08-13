package com.crm.platform.tenant.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.foundation.security.SystemPermission;
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
	public boolean permissionExists(SystemPermission permission) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_permissions
				WHERE permission_code = :permissionCode
				""")
				.param("permissionCode", permission.code())
				.query(Long.class)
				.single() > 0L;
	}

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
			SystemPermission permission, ActorId actorId, Instant now) {
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
				.param("permissionCode", permission.code())
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
