package com.crm.customer.lead.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.application.command.ConvertLeadCommand;
import com.crm.customer.lead.application.command.CreateLeadCommand;
import com.crm.customer.lead.application.command.DeleteLeadCommand;
import com.crm.customer.lead.application.command.UpdateLeadCommand;
import com.crm.customer.lead.application.dto.LeadDetails;
import com.crm.customer.lead.application.dto.LeadSummary;
import com.crm.customer.lead.application.port.LeadRepository;
import com.crm.customer.lead.application.query.LeadSearchQuery;
import com.crm.customer.lead.application.usecase.LeadFacade;
import com.crm.customer.lead.domain.Lead;
import com.crm.customer.lead.domain.LeadErrorCode;
import com.crm.customer.lead.domain.LeadId;
import com.crm.customer.lead.domain.LeadOwner;
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
public class LeadApplicationService implements LeadFacade {

	private static final String ENTITY_TYPE = "LEAD";

	private final LeadRepository leadRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public LeadApplicationService(
			LeadRepository leadRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.leadRepository = leadRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public LeadDetails create(CreateLeadCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_LEAD_WRITE, ENTITY_TYPE);
		LeadId leadId = new LeadId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		LeadOwner owner = command.owner();
		if (owner == null && !hasTenantScope(access)) {
			owner = resolveDefaultOwner(actorId, access);
		}

		Lead lead = Lead.create(
				tenantId,
				leadId,
				command.leadNumber(),
				command.statusId(),
				command.sourceId(),
				owner,
				command.rating(),
				command.accountName(),
				command.companyName(),
				command.honorific(),
				command.givenName(),
				command.familyName(),
				command.displayName(),
				command.email(),
				command.phoneE164(),
				command.jobTitle(),
				command.website(),
				command.countryCode(),
				command.preferredLanguageCode(),
				command.estimatedValue(),
				command.qualificationNotes(),
				actorId,
				now);

		validateOwner(tenantId, actorId, lead.owner(), access);
		validateStatus(tenantId, lead.statusId());
		validateSource(tenantId, lead.sourceId());
		validateUniqueLeadNumber(tenantId, lead.leadNumber(), null);

		try {
			leadRepository.save(lead);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					LeadErrorCode.LEAD_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(lead);
	}

	@Override
	@Transactional(readOnly = true)
	public LeadDetails get(LeadId leadId) {
		Objects.requireNonNull(leadId, "leadId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_LEAD_READ, ENTITY_TYPE);

		Lead lead = leadRepository.findById(
				tenantId, leadId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						LeadErrorCode.LEAD_NOT_FOUND));

		return toDetails(lead);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<LeadSummary> search(LeadSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_LEAD_READ, ENTITY_TYPE);

		return leadRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public LeadDetails update(UpdateLeadCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_LEAD_WRITE, ENTITY_TYPE);

		Lead lead = leadRepository.findById(
				tenantId, command.leadId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						LeadErrorCode.LEAD_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			lead.update(
					command.statusId(),
					command.sourceId(),
					command.owner(),
					command.rating(),
					command.accountName(),
					command.companyName(),
					command.honorific(),
					command.givenName(),
					command.familyName(),
					command.displayName(),
					command.email(),
					command.phoneE164(),
					command.jobTitle(),
					command.website(),
					command.countryCode(),
					command.preferredLanguageCode(),
					command.estimatedValue(),
					command.qualificationNotes(),
					command.disqualificationReason(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					LeadErrorCode.LEAD_VERSION_CONFLICT);
		}

		validateOwner(tenantId, actorId, lead.owner(), access);
		validateStatus(tenantId, lead.statusId());
		validateSource(tenantId, lead.sourceId());

		try {
			leadRepository.save(lead);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					LeadErrorCode.LEAD_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(lead);
	}

	@Override
	@Transactional
	public LeadDetails convert(ConvertLeadCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_LEAD_WRITE, ENTITY_TYPE);

		Lead lead = leadRepository.findById(
				tenantId, command.leadId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						LeadErrorCode.LEAD_NOT_FOUND));

		if (lead.convertedAt() != null) {
			throw new ResourceConflict(LeadErrorCode.LEAD_ALREADY_CONVERTED);
		}

		if (command.convertedAccountId() != null) {
			if (!leadRepository.existsAccount(tenantId, command.convertedAccountId(), actorId, access)) {
				throw new DomainResourceNotFound(LeadErrorCode.LEAD_CONVERSION_INVALID);
			}
		}
		if (command.convertedContactId() != null) {
			if (!leadRepository.existsContact(tenantId, command.convertedContactId(), actorId, access)) {
				throw new DomainResourceNotFound(LeadErrorCode.LEAD_CONVERSION_INVALID);
			}
		}

		Instant now = timeProvider.now();
		try {
			lead.convert(
					command.convertedAccountId(),
					command.convertedContactId(),
					command.convertedOpportunityId(),
					command.convertedStatusId(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(LeadErrorCode.LEAD_VERSION_CONFLICT);
		}

		leadRepository.save(lead);
		return toDetails(lead);
	}

	@Override
	@Transactional
	public void delete(DeleteLeadCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_LEAD_WRITE, ENTITY_TYPE);

		Lead lead = leadRepository.findById(
				tenantId, command.leadId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						LeadErrorCode.LEAD_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			lead.delete(actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					LeadErrorCode.LEAD_VERSION_CONFLICT);
		}

		leadRepository.save(lead);
	}

	private void validateStatus(TenantId tenantId, UUID statusId) {
		if (statusId == null) {
			return;
		}
		if (!leadRepository.existsStatus(tenantId, statusId)) {
			throw new DomainResourceNotFound(LeadErrorCode.LEAD_STATUS_INVALID);
		}
	}

	private void validateSource(TenantId tenantId, UUID sourceId) {
		if (sourceId == null) {
			return;
		}
		if (!leadRepository.existsSource(tenantId, sourceId)) {
			throw new DomainResourceNotFound(LeadErrorCode.LEAD_SOURCE_INVALID);
		}
	}

	private void validateUniqueLeadNumber(TenantId tenantId,
			String leadNumber, LeadId excludeId) {
		if (leadNumber == null || leadNumber.trim().isEmpty()) {
			return;
		}
		if (leadRepository.existsByLeadNumber(tenantId, leadNumber, excludeId)) {
			throw new ResourceConflict(
					LeadErrorCode.LEAD_NUMBER_ALREADY_EXISTS);
		}
	}

	private void validateOwner(TenantId tenantId, ActorId actorId,
			LeadOwner owner, AuthorizedDataAccess access) {
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
				"Assigned lead owner is outside the current authorized data scope");
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

	private LeadOwner resolveDefaultOwner(ActorId actorId,
			AuthorizedDataAccess access) {
		boolean hasOwnScope = access.scopes().stream()
				.anyMatch(scope -> scope.type() == DataScopeType.OWN);
		if (hasOwnScope) {
			return LeadOwner.user(actorId.value());
		}
		return access.scopes().stream()
				.filter(scope -> scope.type() == DataScopeType.TEAM
						|| scope.type() == DataScopeType.TEAM_TREE)
				.map(scope -> LeadOwner.team(scope.teamId()))
				.findFirst()
				.orElseGet(() -> LeadOwner.user(actorId.value()));
	}

	private LeadDetails toDetails(Lead lead) {
		return new LeadDetails(
				lead.tenantId(),
				lead.id(),
				lead.leadNumber(),
				lead.statusId(),
				lead.sourceId(),
				lead.owner(),
				lead.rating(),
				lead.accountName(),
				lead.companyName(),
				lead.honorific(),
				lead.givenName(),
				lead.familyName(),
				lead.displayName(),
				lead.email(),
				lead.phoneE164(),
				lead.jobTitle(),
				lead.website(),
				lead.countryCode(),
				lead.preferredLanguageCode(),
				lead.estimatedValue(),
				lead.qualificationNotes(),
				lead.disqualificationReason(),
				lead.convertedAt(),
				lead.convertedBy(),
				lead.convertedAccountId(),
				lead.convertedContactId(),
				lead.convertedOpportunityId(),
				lead.createdAt(),
				lead.createdBy(),
				lead.updatedAt(),
				lead.updatedBy(),
				lead.version());
	}

}
