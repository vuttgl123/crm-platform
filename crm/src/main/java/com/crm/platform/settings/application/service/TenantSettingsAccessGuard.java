package com.crm.platform.settings.application.service;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.PermissionChecker;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Component;

@Component
public class TenantSettingsAccessGuard {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final PermissionChecker permissionChecker;

	public TenantSettingsAccessGuard(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			PermissionChecker permissionChecker) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.permissionChecker = permissionChecker;
	}

	AccessContext require(SystemPermission permission) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(permission);
		return new AccessContext(tenantId, actorId);
	}

	AccessContext requireAll(SystemPermission... permissions) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		for (SystemPermission permission : permissions) {
			permissionChecker.requirePermission(permission);
		}
		return new AccessContext(tenantId, actorId);
	}
}
