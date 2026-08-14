package com.crm.customer.opportunity.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.opportunity.application.command.CreateOpportunityCommand;
import com.crm.customer.opportunity.application.command.DeleteOpportunityCommand;
import com.crm.customer.opportunity.application.command.UpdateOpportunityCommand;
import com.crm.customer.opportunity.application.dto.OpportunityDetails;
import com.crm.customer.opportunity.application.dto.OpportunitySummary;
import com.crm.customer.opportunity.application.port.OpportunityRepository;
import com.crm.customer.opportunity.application.query.OpportunitySearchQuery;
import com.crm.customer.opportunity.application.usecase.OpportunityFacade;
import com.crm.customer.opportunity.domain.Opportunity;
import com.crm.customer.opportunity.domain.OpportunityErrorCode;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.DataScopeType;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OpportunityApplicationService implements OpportunityFacade {

	private static final String ENTITY_TYPE = "OPPORTUNITY";

	private final OpportunityRepository opportunityRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public OpportunityApplicationService(
			OpportunityRepository opportunityRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.opportunityRepository = opportunityRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public OpportunityDetails create(CreateOpportunityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_OPPORTUNITY_WRITE, ENTITY_TYPE);
		OpportunityId opportunityId = new OpportunityId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		OpportunityOwner owner = command.owner();
		if (owner == null && !hasTenantScope(access)) {
			owner = resolveDefaultOwner(actorId, access);
		}

		Opportunity opportunity = Opportunity.create(
				tenantId,
				opportunityId,
				command.opportunityNumber(),
				command.name(),
				command.accountId(),
				command.pipelineId(),
				command.currentStageId(),
				owner,
				command.sourceId(),
				command.primaryContactId(),
				command.opportunityType(),
				command.amount(),
				command.probability(),
				command.expectedCloseDate(),
				command.nextStep(),
				command.description(),
				command.campaignId(),
				actorId,
				now);

		validateOwner(tenantId, actorId, opportunity.owner(), access);
		validateAccount(tenantId, actorId, opportunity.accountId(), access);
		validatePipelineAndStage(tenantId, opportunity.pipelineId(), opportunity.currentStageId());
		validateContact(tenantId, actorId, opportunity.primaryContactId(), access);
		validateUniqueOpportunityNumber(tenantId, opportunity.opportunityNumber(), null);

		try {
			opportunityRepository.save(opportunity);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					OpportunityErrorCode.OPPORTUNITY_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(opportunity);
	}

	@Override
	@Transactional(readOnly = true)
	public OpportunityDetails get(OpportunityId opportunityId) {
		Objects.requireNonNull(opportunityId, "opportunityId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_OPPORTUNITY_READ, ENTITY_TYPE);

		Opportunity opportunity = opportunityRepository.findById(
				tenantId, opportunityId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OpportunityErrorCode.OPPORTUNITY_NOT_FOUND));

		return toDetails(opportunity);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<OpportunitySummary> search(OpportunitySearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_OPPORTUNITY_READ, ENTITY_TYPE);

		return opportunityRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public OpportunityDetails update(UpdateOpportunityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_OPPORTUNITY_WRITE, ENTITY_TYPE);

		Opportunity opportunity = opportunityRepository.findById(
				tenantId, command.opportunityId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OpportunityErrorCode.OPPORTUNITY_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			opportunity.update(
					command.name(),
					command.accountId(),
					command.pipelineId(),
					command.currentStageId(),
					command.owner(),
					command.sourceId(),
					command.primaryContactId(),
					command.opportunityType(),
					command.status(),
					command.amount(),
					command.probability(),
					command.expectedCloseDate(),
					command.actualCloseDate(),
					command.nextStep(),
					command.description(),
					command.lostReasonId(),
					command.lostReasonNotes(),
					command.campaignId(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					OpportunityErrorCode.OPPORTUNITY_VERSION_CONFLICT);
		}

		validateOwner(tenantId, actorId, opportunity.owner(), access);
		validateAccount(tenantId, actorId, opportunity.accountId(), access);
		validatePipelineAndStage(tenantId, opportunity.pipelineId(), opportunity.currentStageId());
		validateContact(tenantId, actorId, opportunity.primaryContactId(), access);

		try {
			opportunityRepository.save(opportunity);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					OpportunityErrorCode.OPPORTUNITY_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(opportunity);
	}

	@Override
	@Transactional
	public void delete(DeleteOpportunityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_OPPORTUNITY_WRITE, ENTITY_TYPE);

		Opportunity opportunity = opportunityRepository.findById(
				tenantId, command.opportunityId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OpportunityErrorCode.OPPORTUNITY_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			opportunity.delete(actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					OpportunityErrorCode.OPPORTUNITY_VERSION_CONFLICT);
		}

		opportunityRepository.save(opportunity);
	}

	private void validateAccount(TenantId tenantId, ActorId actorId,
			UUID accountId, AuthorizedDataAccess access) {
		if (accountId == null) {
			return;
		}
		if (!opportunityRepository.existsAccount(tenantId, accountId, actorId, access)) {
			throw new DomainResourceNotFound(
					OpportunityErrorCode.OPPORTUNITY_ACCOUNT_INVALID);
		}
	}

	private void validatePipelineAndStage(TenantId tenantId,
			UUID pipelineId, UUID stageId) {
		if (pipelineId == null || !opportunityRepository.existsPipeline(tenantId, pipelineId)) {
			throw new DomainResourceNotFound(
					OpportunityErrorCode.OPPORTUNITY_PIPELINE_INVALID);
		}
		if (stageId == null || !opportunityRepository.existsStage(tenantId, pipelineId, stageId)) {
			throw new DomainResourceNotFound(
					OpportunityErrorCode.OPPORTUNITY_STAGE_INVALID);
		}
	}

	private void validateContact(TenantId tenantId, ActorId actorId,
			UUID contactId, AuthorizedDataAccess access) {
		if (contactId == null) {
			return;
		}
		if (!opportunityRepository.existsContact(tenantId, contactId, actorId, access)) {
			throw new DomainResourceNotFound(
					OpportunityErrorCode.OPPORTUNITY_CONTACT_INVALID);
		}
	}

	private void validateUniqueOpportunityNumber(TenantId tenantId,
			String opportunityNumber, OpportunityId excludeId) {
		if (opportunityNumber == null || opportunityNumber.trim().isEmpty()) {
			return;
		}
		if (opportunityRepository.existsByOpportunityNumber(
				tenantId, opportunityNumber, excludeId)) {
			throw new ResourceConflict(
					OpportunityErrorCode.OPPORTUNITY_NUMBER_ALREADY_EXISTS);
		}
	}

	private void validateOwner(TenantId tenantId, ActorId actorId,
			OpportunityOwner owner, AuthorizedDataAccess access) {
		if (owner == null) {
			return;
		}
		if (hasTenantScope(access)) {
			return;
		}
		if (owner.type() == AccountOwnerType.USER
				&& owner.id().equals(actorId.value())) {
			return;
		}
		if (owner.type() == AccountOwnerType.TEAM
				&& isTeamInScope(owner.id(), access)) {
			return;
		}
		throw new AccessDeniedException(
				"Assigned opportunity owner is outside the current authorized data scope");
	}

	private boolean isTeamInScope(UUID teamId, AuthorizedDataAccess access) {
		return access.scopes().stream()
				.anyMatch(scope -> scope.teamId() != null
						&& scope.teamId().equals(teamId));
	}

	private boolean hasTenantScope(AuthorizedDataAccess access) {
		return access.scopes().stream()
				.anyMatch(scope -> scope.type() == DataScopeType.TENANT);
	}

	private OpportunityOwner resolveDefaultOwner(ActorId actorId,
			AuthorizedDataAccess access) {
		boolean hasOwnScope = access.scopes().stream()
				.anyMatch(scope -> scope.type() == DataScopeType.OWN);
		if (hasOwnScope) {
			return OpportunityOwner.user(actorId.value());
		}
		return access.scopes().stream()
				.filter(scope -> scope.type() == DataScopeType.TEAM
						|| scope.type() == DataScopeType.TEAM_TREE)
				.map(scope -> OpportunityOwner.team(scope.teamId()))
				.findFirst()
				.orElseGet(() -> OpportunityOwner.user(actorId.value()));
	}

	private OpportunityDetails toDetails(Opportunity opportunity) {
		return new OpportunityDetails(
				opportunity.tenantId(),
				opportunity.id(),
				opportunity.opportunityNumber(),
				opportunity.name(),
				opportunity.accountId(),
				opportunity.pipelineId(),
				opportunity.currentStageId(),
				opportunity.owner(),
				opportunity.sourceId(),
				opportunity.primaryContactId(),
				opportunity.opportunityType(),
				opportunity.status(),
				opportunity.amount(),
				opportunity.probability(),
				opportunity.expectedCloseDate(),
				opportunity.actualCloseDate(),
				opportunity.nextStep(),
				opportunity.description(),
				opportunity.lostReasonId(),
				opportunity.lostReasonNotes(),
				opportunity.campaignId(),
				opportunity.createdAt(),
				opportunity.createdBy(),
				opportunity.updatedAt(),
				opportunity.updatedBy(),
				opportunity.version());
	}

}
