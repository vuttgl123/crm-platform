package com.crm.platform.tenant.application.port;

import java.time.Instant;
import java.util.UUID;

import com.crm.foundation.security.SystemPermission;
import com.crm.platform.tenant.domain.Tenant;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface TenantBootstrapRepository {

	boolean lockActiveActor(ActorId actorId);

	boolean hasNonRemovedMembership(ActorId actorId);

	boolean permissionExists(SystemPermission permission);

	void insertTenant(Tenant tenant);

	void insertTenantAdminMembership(Tenant tenant, ActorId actorId);

	void insertSystemRole(TenantId tenantId, UUID roleId,
			ActorId actorId, Instant now);

	void grantPermission(TenantId tenantId, UUID roleId,
			SystemPermission permission, ActorId actorId, Instant now);

	void assignRole(TenantId tenantId, UUID roleId,
			ActorId actorId, Instant now);

}
