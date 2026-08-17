package com.crm.customer.tag.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.tag.application.command.AssignTagCommand;
import com.crm.customer.tag.application.command.CreateTagCommand;
import com.crm.customer.tag.application.command.UpdateTagCommand;
import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.application.port.TagRepository;
import com.crm.customer.tag.application.usecase.TagFacade;
import com.crm.customer.tag.domain.EntityTag;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.Tag;
import com.crm.customer.tag.domain.TagErrorCode;
import com.crm.customer.tag.domain.TagId;
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
public class TagApplicationService implements TagFacade {

	private final TagRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TagApplicationService(
			TagRepository repository,
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
	public TagDetails create(CreateTagCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		if (repository.existsByKey(tenantId, command.tagKey())) {
			throw new ResourceConflict(TagErrorCode.TAG_KEY_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		TagId id = new TagId(identifierGenerator.nextId());

		Tag tag = Tag.create(
				tenantId,
				id,
				command.tagKey(),
				command.name(),
				command.description(),
				command.colorHex(),
				actorId,
				now
		);

		try {
			repository.insert(tag);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(TagErrorCode.TAG_KEY_ALREADY_EXISTS.code());
		}

		return TagDetails.from(tag);
	}

	@Override
	@Transactional(readOnly = true)
	public TagDetails get(TagId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		Tag tag = repository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(TagErrorCode.TAG_NOT_FOUND.code()));

		return TagDetails.from(tag);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TagDetails> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		return repository.findAll(tenantId);
	}

	@Override
	@Transactional
	public TagDetails update(UpdateTagCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		Tag tag = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(TagErrorCode.TAG_NOT_FOUND.code()));

		if (tag.version() != command.version()) {
			throw new ResourceConflict(TagErrorCode.TAG_VERSION_CONFLICT.code());
		}

		tag.update(command.name(), command.description(), command.colorHex(), command.active(), actorId, timeProvider.now());
		repository.update(tag);
		return TagDetails.from(tag);
	}

	@Override
	@Transactional
	public EntityTagDetails assign(AssignTagCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		Tag tag = repository.findById(tenantId, command.tagId())
				.orElseThrow(() -> new DomainResourceNotFound(TagErrorCode.TAG_NOT_FOUND.code()));

		if (repository.existsEntityTag(tenantId, command.tagId(), command.accountId(), command.contactId(), command.leadId(), command.opportunityId(), command.activityId(), command.ticketId())) {
			throw new ResourceConflict(TagErrorCode.TAG_ALREADY_ASSIGNED.code());
		}

		Instant now = timeProvider.now();
		EntityTagId id = new EntityTagId(identifierGenerator.nextId());

		EntityTag entityTag = EntityTag.create(
				tenantId,
				command.tagId(),
				id,
				command.accountId(),
				command.contactId(),
				command.leadId(),
				command.opportunityId(),
				command.activityId(),
				command.ticketId(),
				actorId,
				now
		);

		repository.insertEntityTag(entityTag);

		return new EntityTagDetails(
				id.value(),
				tag.id().value(),
				tag.tagKey(),
				tag.name(),
				tag.colorHex(),
				command.accountId(),
				command.contactId(),
				command.leadId(),
				command.opportunityId(),
				command.activityId(),
				command.ticketId(),
				now,
				actorId.value()
		);
	}

	@Override
	@Transactional
	public void removeAssignment(EntityTagId entityTagId) {
		Objects.requireNonNull(entityTagId, "entityTagId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_WRITE);

		repository.findEntityTag(tenantId, entityTagId)
				.orElseThrow(() -> new DomainResourceNotFound(TagErrorCode.ENTITY_TAG_NOT_FOUND.code()));

		repository.deleteEntityTag(tenantId, entityTagId);
	}

	@Override
	@Transactional(readOnly = true)
	public List<EntityTagDetails> listByTarget(
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		return repository.findEntityTagsByTarget(tenantId, accountId, contactId, leadId, opportunityId, activityId, ticketId);
	}

}
