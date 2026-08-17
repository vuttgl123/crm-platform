package com.crm.service.category.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.service.category.application.command.CreateTicketCategoryCommand;
import com.crm.service.category.application.command.UpdateTicketCategoryCommand;
import com.crm.service.category.application.dto.TicketCategoryDetails;
import com.crm.service.category.application.dto.TicketCategorySummary;
import com.crm.service.category.application.port.TicketCategoryRepository;
import com.crm.service.category.application.usecase.TicketCategoryFacade;
import com.crm.service.category.domain.ServiceErrorCode;
import com.crm.service.category.domain.TicketCategory;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketCategoryApplicationService implements TicketCategoryFacade {

	private final TicketCategoryRepository categoryRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TicketCategoryApplicationService(
			TicketCategoryRepository categoryRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.categoryRepository = categoryRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public TicketCategoryDetails create(CreateTicketCategoryCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		String code = command.categoryCode().trim().toUpperCase();
		if (categoryRepository.existsByCode(tenantId, code)) {
			throw new ResourceConflict(ServiceErrorCode.TICKET_CATEGORY_CODE_ALREADY_EXISTS.code());
		}

		TicketCategoryId parentId = command.parentCategoryId() != null ? new TicketCategoryId(command.parentCategoryId()) : null;
		if (parentId != null && categoryRepository.findById(tenantId, parentId).isEmpty()) {
			throw new DomainResourceNotFound(ServiceErrorCode.PARENT_CATEGORY_NOT_FOUND.code());
		}

		Instant now = timeProvider.now();
		TicketCategoryId id = new TicketCategoryId(identifierGenerator.nextId());
		boolean isActive = command.isActive() == null || command.isActive();

		TicketCategory category = TicketCategory.create(
				tenantId,
				id,
				code,
				command.name(),
				parentId,
				command.defaultTeamId(),
				command.description(),
				isActive,
				actorId,
				now
		);

		try {
			categoryRepository.insert(category);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(ServiceErrorCode.TICKET_CATEGORY_CODE_ALREADY_EXISTS.code());
		}

		return TicketCategoryDetails.from(category);
	}

	@Override
	@Transactional(readOnly = true)
	public TicketCategoryDetails get(TicketCategoryId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_READ);

		TicketCategory category = categoryRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_CATEGORY_NOT_FOUND.code()));

		return TicketCategoryDetails.from(category);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TicketCategorySummary> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_READ);
		return categoryRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public TicketCategoryDetails update(UpdateTicketCategoryCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		TicketCategory category = categoryRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_CATEGORY_NOT_FOUND.code()));

		if (category.version() != command.version()) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		TicketCategoryId parentId = command.parentCategoryId() != null ? new TicketCategoryId(command.parentCategoryId()) : null;
		if (parentId != null) {
			if (parentId.equals(command.id())) {
				throw new ResourceConflict(ServiceErrorCode.CYCLIC_CATEGORY_HIERARCHY.code());
			}
			if (categoryRepository.findById(tenantId, parentId).isEmpty()) {
				throw new DomainResourceNotFound(ServiceErrorCode.PARENT_CATEGORY_NOT_FOUND.code());
			}
		}

		Instant now = timeProvider.now();
		boolean isActive = command.isActive() != null ? command.isActive() : category.isActive();

		category.update(
				command.name(),
				parentId,
				command.defaultTeamId(),
				command.description(),
				isActive,
				actorId,
				now
		);

		categoryRepository.update(category);
		return TicketCategoryDetails.from(category);
	}

	@Override
	@Transactional
	public void delete(TicketCategoryId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		TicketCategory category = categoryRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_CATEGORY_NOT_FOUND.code()));

		if (category.version() != version) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		categoryRepository.delete(tenantId, id, version);
	}

}
