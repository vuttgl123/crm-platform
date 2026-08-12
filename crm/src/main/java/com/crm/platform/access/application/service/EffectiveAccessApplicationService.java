package com.crm.platform.access.application.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.DataScopeType;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.platform.access.application.dto.EffectiveAccessDetails;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.DataAccessDetails;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.MembershipSummary;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.ScopeDetails;
import com.crm.platform.access.application.dto.EffectiveAccessDetails.TenantSummary;
import com.crm.platform.access.application.port.EffectiveAccessRepository;
import com.crm.platform.access.application.port.EffectiveAccessRepository.ActiveAccessContext;
import com.crm.platform.access.application.usecase.EffectiveAccessFacade;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EffectiveAccessApplicationService
		implements EffectiveAccessFacade {

	private final EffectiveAccessRepository repository;
	private final CurrentActor currentActor;
	private final CurrentTenant currentTenant;

	public EffectiveAccessApplicationService(
			EffectiveAccessRepository repository,
			CurrentActor currentActor,
			CurrentTenant currentTenant) {
		this.repository = repository;
		this.currentActor = currentActor;
		this.currentTenant = currentTenant;
	}

	@Override
	@Transactional(readOnly = true)
	public EffectiveAccessDetails current() {
		ActorId actorId = currentActor.requireActorId();
		TenantId tenantId = currentTenant.tenantId()
				.orElseThrow(() -> new AccessDeniedException(
						"Active tenant context is required"));
		ActiveAccessContext context = repository
				.findActiveContext(actorId, tenantId)
				.orElseThrow(() -> new AccessDeniedException(
						"Active tenant membership is required"));

		List<String> permissions = repository
				.findEffectivePermissions(actorId, tenantId);
		DataAccessDetails dataAccess = context.tenantAdmin()
				? new DataAccessDetails(DataScopeType.TENANT, Map.of())
				: entityDataAccess(actorId, tenantId);

		return new EffectiveAccessDetails(
				new TenantSummary(
						context.tenantId().value(),
						context.tenantCode(),
						context.displayName()),
				new MembershipSummary(
						context.membershipStatus(),
						context.tenantAdmin()),
				permissions,
				dataAccess);
	}

	private DataAccessDetails entityDataAccess(
			ActorId actorId, TenantId tenantId) {
		Map<String, List<ScopeDetails>> entities = new LinkedHashMap<>();
		repository.findEffectiveScopeGrants(actorId, tenantId)
				.forEach(grant -> entities
						.computeIfAbsent(
								grant.entityType(), ignored -> new ArrayList<>())
						.add(new ScopeDetails(
								grant.type(), grant.teamId())));
		return new DataAccessDetails(null, entities);
	}

}
