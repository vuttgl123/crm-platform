package com.crm.service.ticket.application.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.service.category.application.port.TicketCategoryRepository;
import com.crm.service.category.domain.ServiceErrorCode;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.service.ticket.application.command.AddTicketCommentCommand;
import com.crm.service.ticket.application.command.AssignTicketCommand;
import com.crm.service.ticket.application.command.CloseTicketCommand;
import com.crm.service.ticket.application.command.CreateTicketCommand;
import com.crm.service.ticket.application.command.UpdateTicketCommand;
import com.crm.service.ticket.application.dto.TicketCommentDetails;
import com.crm.service.ticket.application.dto.TicketDetails;
import com.crm.service.ticket.application.dto.TicketSummary;
import com.crm.service.ticket.application.port.TicketRepository;
import com.crm.service.ticket.application.query.TicketSearchQuery;
import com.crm.service.ticket.application.usecase.TicketFacade;
import com.crm.service.ticket.domain.CommentVisibility;
import com.crm.service.ticket.domain.Ticket;
import com.crm.service.ticket.domain.TicketComment;
import com.crm.service.ticket.domain.TicketCommentId;
import com.crm.service.ticket.domain.TicketId;
import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketApplicationService implements TicketFacade {

	private final TicketRepository ticketRepository;
	private final TicketCategoryRepository categoryRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TicketApplicationService(
			TicketRepository ticketRepository,
			TicketCategoryRepository categoryRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.ticketRepository = ticketRepository;
		this.categoryRepository = categoryRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public TicketDetails create(CreateTicketCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		String number = command.ticketNumber().trim().toUpperCase();
		if (ticketRepository.existsByTicketNumber(tenantId, number)) {
			throw new ResourceConflict(ServiceErrorCode.TICKET_NUMBER_ALREADY_EXISTS.code());
		}

		if (command.accountId() == null && command.contactId() == null) {
			throw new ResourceConflict(ServiceErrorCode.TICKET_ACCOUNT_REQUIRED.code());
		}

		TicketCategoryId catId = command.categoryId() != null ? new TicketCategoryId(command.categoryId()) : null;
		if (catId != null && categoryRepository.findById(tenantId, catId).isEmpty()) {
			throw new DomainResourceNotFound(ServiceErrorCode.TICKET_CATEGORY_NOT_FOUND.code());
		}

		Instant now = timeProvider.now();
		TicketId id = new TicketId(identifierGenerator.nextId());
		AccountId accountId = command.accountId() != null ? new AccountId(command.accountId()) : null;
		ContactId contactId = command.contactId() != null ? new ContactId(command.contactId()) : null;
		ActorId assignedUserId = command.assignedUserId() != null ? new ActorId(command.assignedUserId()) : null;
		ActorId ownerUserId = command.ownerUserId() != null ? new ActorId(command.ownerUserId()) : actorId;
		TicketPriority priority = command.priority() != null ? command.priority() : TicketPriority.NORMAL;

		Instant firstResponseDueAt = calculateFirstResponseDue(now, priority);
		Instant resolutionDueAt = calculateResolutionDue(now, priority);

		Ticket ticket = Ticket.create(
				tenantId,
				id,
				number,
				accountId,
				contactId,
				command.subject(),
				command.description(),
				command.channel(),
				catId,
				priority,
				command.severity(),
				assignedUserId,
				command.assignedTeamId(),
				ownerUserId,
				command.slaPolicyId(),
				command.externalReference(),
				firstResponseDueAt,
				resolutionDueAt,
				actorId,
				now
		);

		try {
			ticketRepository.insert(ticket);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(ServiceErrorCode.TICKET_NUMBER_ALREADY_EXISTS.code());
		}

		return TicketDetails.from(ticket, List.of());
	}

	@Override
	@Transactional(readOnly = true)
	public TicketDetails get(TicketId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_READ);

		Ticket ticket = ticketRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		List<TicketCommentDetails> comments = ticketRepository.findCommentsByTicketId(tenantId, id);
		return TicketDetails.from(ticket, comments);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<TicketSummary> search(TicketSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_READ);
		return ticketRepository.search(tenantId, query != null ? query : new TicketSearchQuery(null, null, null, null, null, null, null, null, null));
	}

	@Override
	@Transactional
	public TicketDetails update(UpdateTicketCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		if (ticket.version() != command.version()) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		TicketCategoryId catId = command.categoryId() != null ? new TicketCategoryId(command.categoryId()) : null;
		if (catId != null && categoryRepository.findById(tenantId, catId).isEmpty()) {
			throw new DomainResourceNotFound(ServiceErrorCode.TICKET_CATEGORY_NOT_FOUND.code());
		}

		AccountId accountId = command.accountId() != null ? new AccountId(command.accountId()) : null;
		ContactId contactId = command.contactId() != null ? new ContactId(command.contactId()) : null;

		ticket.update(
				accountId,
				contactId,
				command.subject(),
				command.description(),
				command.channel(),
				catId,
				command.priority(),
				command.severity(),
				command.externalReference(),
				actorId,
				timeProvider.now()
		);

		ticketRepository.update(ticket);
		List<TicketCommentDetails> comments = ticketRepository.findCommentsByTicketId(tenantId, command.id());
		return TicketDetails.from(ticket, comments);
	}

	@Override
	@Transactional
	public TicketDetails assign(AssignTicketCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		if (ticket.version() != command.version()) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		ActorId assignedUser = command.assignedUserId() != null ? new ActorId(command.assignedUserId()) : null;
		ticket.assign(assignedUser, command.assignedTeamId(), actorId, timeProvider.now());

		ticketRepository.update(ticket);
		List<TicketCommentDetails> comments = ticketRepository.findCommentsByTicketId(tenantId, command.id());
		return TicketDetails.from(ticket, comments);
	}

	@Override
	@Transactional
	public TicketDetails resolve(TicketId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		if (ticket.version() != version) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		ticket.resolve(actorId, timeProvider.now());
		ticketRepository.update(ticket);
		List<TicketCommentDetails> comments = ticketRepository.findCommentsByTicketId(tenantId, id);
		return TicketDetails.from(ticket, comments);
	}

	@Override
	@Transactional
	public TicketDetails close(CloseTicketCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		if (ticket.version() != command.version()) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		ticket.close(command.satisfactionScore(), command.satisfactionComment(), actorId, timeProvider.now());
		ticketRepository.update(ticket);
		List<TicketCommentDetails> comments = ticketRepository.findCommentsByTicketId(tenantId, command.id());
		return TicketDetails.from(ticket, comments);
	}

	@Override
	@Transactional
	public TicketDetails reopen(TicketId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		if (ticket.version() != version) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		ticket.reopen(actorId, timeProvider.now());
		ticketRepository.update(ticket);
		List<TicketCommentDetails> comments = ticketRepository.findCommentsByTicketId(tenantId, id);
		return TicketDetails.from(ticket, comments);
	}

	@Override
	@Transactional
	public void delete(TicketId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		if (ticket.version() != version) {
			throw new ResourceConflict(ServiceErrorCode.SERVICE_VERSION_CONFLICT.code());
		}

		if (ticket.status() != TicketStatus.NEW && ticket.status() != TicketStatus.CANCELLED) {
			throw new ResourceConflict(ServiceErrorCode.INVALID_TICKET_STATUS_TRANSITION.code());
		}

		ticketRepository.delete(tenantId, id, version);
	}

	@Override
	@Transactional
	public TicketCommentDetails addComment(AddTicketCommentCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		Ticket ticket = ticketRepository.findById(tenantId, command.ticketId())
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_NOT_FOUND.code()));

		Instant now = timeProvider.now();
		TicketCommentId commentId = new TicketCommentId(identifierGenerator.nextId());
		ActorId authorUser = command.authorUserId() != null ? new ActorId(command.authorUserId()) : actorId;
		ContactId authorContact = command.authorContactId() != null ? new ContactId(command.authorContactId()) : null;
		CommentVisibility visibility = command.visibility() != null ? command.visibility() : CommentVisibility.PUBLIC;

		TicketComment comment = TicketComment.create(
				tenantId,
				commentId,
				command.ticketId(),
				authorUser,
				authorContact,
				command.body(),
				visibility,
				command.channel(),
				command.externalMessageId(),
				actorId,
				now
		);

		ticketRepository.insertComment(comment);

		if (visibility == CommentVisibility.PUBLIC && ticket.firstRespondedAt() == null) {
			ticket.recordFirstResponse(now);
			ticketRepository.update(ticket);
		}

		return new TicketCommentDetails(
				comment.id().value(),
				comment.ticketId().value(),
				authorUser.value(),
				null,
				authorContact != null ? authorContact.value() : null,
				null,
				comment.body(),
				comment.visibility(),
				comment.channel(),
				comment.externalMessageId(),
				actorId.value(),
				now,
				actorId.value(),
				now,
				comment.version()
		);
	}

	@Override
	@Transactional
	public void deleteComment(TicketId ticketId, TicketCommentId commentId) {
		Objects.requireNonNull(ticketId, "ticketId must not be null");
		Objects.requireNonNull(commentId, "commentId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SERVICE_TICKET_WRITE);

		TicketComment comment = ticketRepository.findCommentById(tenantId, commentId)
				.orElseThrow(() -> new DomainResourceNotFound(ServiceErrorCode.TICKET_COMMENT_NOT_FOUND.code()));

		if (!comment.ticketId().equals(ticketId)) {
			throw new DomainResourceNotFound(ServiceErrorCode.TICKET_COMMENT_NOT_FOUND.code());
		}

		comment.markDeleted(actorId, timeProvider.now());
		ticketRepository.updateComment(comment);
	}

	private Instant calculateFirstResponseDue(Instant now, TicketPriority priority) {
		return switch (priority) {
			case URGENT -> now.plus(1, ChronoUnit.HOURS);
			case HIGH -> now.plus(4, ChronoUnit.HOURS);
			case NORMAL -> now.plus(8, ChronoUnit.HOURS);
			case LOW -> now.plus(24, ChronoUnit.HOURS);
		};
	}

	private Instant calculateResolutionDue(Instant now, TicketPriority priority) {
		return switch (priority) {
			case URGENT -> now.plus(4, ChronoUnit.HOURS);
			case HIGH -> now.plus(24, ChronoUnit.HOURS);
			case NORMAL -> now.plus(48, ChronoUnit.HOURS);
			case LOW -> now.plus(120, ChronoUnit.HOURS);
		};
	}

}
