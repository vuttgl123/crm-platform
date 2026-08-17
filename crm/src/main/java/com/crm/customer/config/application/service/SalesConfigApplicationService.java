package com.crm.customer.config.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.crm.customer.config.application.command.CreateLeadSourceCommand;
import com.crm.customer.config.application.command.CreateLeadStatusCommand;
import com.crm.customer.config.application.command.CreateOpportunityLostReasonCommand;
import com.crm.customer.config.application.command.UpdateLeadSourceCommand;
import com.crm.customer.config.application.command.UpdateLeadStatusCommand;
import com.crm.customer.config.application.command.UpdateOpportunityLostReasonCommand;
import com.crm.customer.config.application.dto.LeadSourceDetails;
import com.crm.customer.config.application.dto.LeadStatusDetails;
import com.crm.customer.config.application.dto.OpportunityLostReasonDetails;
import com.crm.customer.config.application.port.SalesConfigRepository;
import com.crm.customer.config.application.usecase.SalesConfigFacade;
import com.crm.customer.config.domain.LeadSource;
import com.crm.customer.config.domain.LeadSourceId;
import com.crm.customer.config.domain.LeadStatus;
import com.crm.customer.config.domain.LeadStatusId;
import com.crm.customer.config.domain.OpportunityLostReason;
import com.crm.customer.config.domain.OpportunityLostReasonId;
import com.crm.customer.config.domain.SalesConfigErrorCode;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesConfigApplicationService implements SalesConfigFacade {

	private final SalesConfigRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public SalesConfigApplicationService(
			SalesConfigRepository repository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public LeadSourceDetails createLeadSource(CreateLeadSourceCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_WRITE);

		if (repository.existsLeadSourceByCode(tenantId, command.sourceCode())) {
			throw new ResourceConflict(SalesConfigErrorCode.LEAD_SOURCE_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		LeadSourceId id = new LeadSourceId(identifierGenerator.nextId());

		LeadSource source = LeadSource.create(
				tenantId,
				id,
				command.sourceCode(),
				command.name(),
				command.description(),
				actorId,
				now
		);

		try {
			repository.insertLeadSource(source);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(SalesConfigErrorCode.LEAD_SOURCE_CODE_ALREADY_EXISTS.code());
		}

		return LeadSourceDetails.from(source);
	}

	@Override
	@Transactional(readOnly = true)
	public LeadSourceDetails getLeadSource(LeadSourceId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_READ);

		LeadSource source = repository.findLeadSourceById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(SalesConfigErrorCode.LEAD_SOURCE_NOT_FOUND.code()));

		return LeadSourceDetails.from(source);
	}

	@Override
	@Transactional(readOnly = true)
	public List<LeadSourceDetails> listLeadSources() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_READ);

		return repository.findAllLeadSources(tenantId);
	}

	@Override
	@Transactional
	public LeadSourceDetails updateLeadSource(UpdateLeadSourceCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_WRITE);

		LeadSource source = repository.findLeadSourceById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(SalesConfigErrorCode.LEAD_SOURCE_NOT_FOUND.code()));

		if (source.version() != command.version()) {
			throw new ResourceConflict(SalesConfigErrorCode.CONFIG_VERSION_CONFLICT.code());
		}

		source.update(command.name(), command.description(), command.active(), actorId, timeProvider.now());
		repository.updateLeadSource(source);
		return LeadSourceDetails.from(source);
	}

	@Override
	@Transactional
	public LeadStatusDetails createLeadStatus(CreateLeadStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_WRITE);

		if (repository.existsLeadStatusByCode(tenantId, command.statusCode())) {
			throw new ResourceConflict(SalesConfigErrorCode.LEAD_STATUS_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		LeadStatusId id = new LeadStatusId(identifierGenerator.nextId());

		LeadStatus status = LeadStatus.create(
				tenantId,
				id,
				command.statusCode(),
				command.name(),
				command.statusCategory(),
				command.displayOrder(),
				command.defaultStatus(),
				command.terminal(),
				actorId,
				now
		);

		try {
			repository.insertLeadStatus(status);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(SalesConfigErrorCode.LEAD_STATUS_CODE_ALREADY_EXISTS.code());
		}

		return LeadStatusDetails.from(status);
	}

	@Override
	@Transactional(readOnly = true)
	public LeadStatusDetails getLeadStatus(LeadStatusId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_READ);

		LeadStatus status = repository.findLeadStatusById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(SalesConfigErrorCode.LEAD_STATUS_NOT_FOUND.code()));

		return LeadStatusDetails.from(status);
	}

	@Override
	@Transactional(readOnly = true)
	public List<LeadStatusDetails> listLeadStatuses() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_READ);

		return repository.findAllLeadStatuses(tenantId);
	}

	@Override
	@Transactional
	public LeadStatusDetails updateLeadStatus(UpdateLeadStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_LEAD_WRITE);

		LeadStatus status = repository.findLeadStatusById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(SalesConfigErrorCode.LEAD_STATUS_NOT_FOUND.code()));

		if (status.version() != command.version()) {
			throw new ResourceConflict(SalesConfigErrorCode.CONFIG_VERSION_CONFLICT.code());
		}

		status.update(
				command.name(),
				command.statusCategory(),
				command.displayOrder(),
				command.defaultStatus(),
				command.terminal(),
				command.active(),
				actorId,
				timeProvider.now()
		);

		repository.updateLeadStatus(status);
		return LeadStatusDetails.from(status);
	}

	@Override
	@Transactional
	public OpportunityLostReasonDetails createLostReason(CreateOpportunityLostReasonCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		if (repository.existsLostReasonByCode(tenantId, command.reasonCode())) {
			throw new ResourceConflict(SalesConfigErrorCode.LOST_REASON_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		OpportunityLostReasonId id = new OpportunityLostReasonId(identifierGenerator.nextId());

		OpportunityLostReason reason = OpportunityLostReason.create(
				tenantId,
				id,
				command.reasonCode(),
				command.name(),
				command.description(),
				actorId,
				now
		);

		try {
			repository.insertLostReason(reason);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(SalesConfigErrorCode.LOST_REASON_CODE_ALREADY_EXISTS.code());
		}

		return OpportunityLostReasonDetails.from(reason);
	}

	@Override
	@Transactional(readOnly = true)
	public OpportunityLostReasonDetails getLostReason(OpportunityLostReasonId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_READ);

		OpportunityLostReason reason = repository.findLostReasonById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(SalesConfigErrorCode.LOST_REASON_NOT_FOUND.code()));

		return OpportunityLostReasonDetails.from(reason);
	}

	@Override
	@Transactional(readOnly = true)
	public List<OpportunityLostReasonDetails> listLostReasons() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_READ);

		return repository.findAllLostReasons(tenantId);
	}

	@Override
	@Transactional
	public OpportunityLostReasonDetails updateLostReason(UpdateOpportunityLostReasonCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		OpportunityLostReason reason = repository.findLostReasonById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(SalesConfigErrorCode.LOST_REASON_NOT_FOUND.code()));

		if (reason.version() != command.version()) {
			throw new ResourceConflict(SalesConfigErrorCode.CONFIG_VERSION_CONFLICT.code());
		}

		reason.update(command.name(), command.description(), command.active(), actorId, timeProvider.now());
		repository.updateLostReason(reason);
		return OpportunityLostReasonDetails.from(reason);
	}

}
