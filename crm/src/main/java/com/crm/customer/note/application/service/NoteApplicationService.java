package com.crm.customer.note.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.crm.customer.note.application.command.CreateNoteCommand;
import com.crm.customer.note.application.command.UpdateNoteCommand;
import com.crm.customer.note.application.dto.NoteDetails;
import com.crm.customer.note.application.dto.NoteSummary;
import com.crm.customer.note.application.port.NoteRepository;
import com.crm.customer.note.application.query.NoteSearchQuery;
import com.crm.customer.note.application.usecase.NoteFacade;
import com.crm.customer.note.domain.Note;
import com.crm.customer.note.domain.NoteErrorCode;
import com.crm.customer.note.domain.NoteId;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NoteApplicationService implements NoteFacade {

	private final NoteRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public NoteApplicationService(
			NoteRepository repository,
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
	public NoteDetails create(CreateNoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		Instant now = timeProvider.now();
		NoteId id = new NoteId(identifierGenerator.nextId());

		Note note = Note.create(
				tenantId,
				id,
				command.title(),
				command.body(),
				command.visibility(),
				command.ownerUserId(),
				command.accountId(),
				command.contactId(),
				command.leadId(),
				command.opportunityId(),
				command.activityId(),
				command.ticketId(),
				actorId,
				now
		);

		repository.insert(note);
		return NoteDetails.from(note);
	}

	@Override
	@Transactional(readOnly = true)
	public NoteDetails get(NoteId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		Note note = repository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(NoteErrorCode.NOTE_NOT_FOUND.code()));

		return NoteDetails.from(note);
	}

	@Override
	@Transactional(readOnly = true)
	public List<NoteSummary> listByTarget(NoteSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		return repository.findByTarget(tenantId, query);
	}

	@Override
	@Transactional
	public NoteDetails update(UpdateNoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		Note note = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(NoteErrorCode.NOTE_NOT_FOUND.code()));

		if (note.version() != command.version()) {
			throw new ResourceConflict(NoteErrorCode.NOTE_VERSION_CONFLICT.code());
		}

		note.update(command.title(), command.body(), command.visibility(), actorId, timeProvider.now());
		repository.update(note);
		return NoteDetails.from(note);
	}

	@Override
	@Transactional
	public void delete(NoteId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		Note note = repository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(NoteErrorCode.NOTE_NOT_FOUND.code()));

		if (note.version() != version) {
			throw new ResourceConflict(NoteErrorCode.NOTE_VERSION_CONFLICT.code());
		}

		note.delete(actorId, timeProvider.now());
		repository.update(note);
	}

}
