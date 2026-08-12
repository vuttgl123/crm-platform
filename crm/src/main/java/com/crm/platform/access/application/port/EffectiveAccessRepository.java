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
