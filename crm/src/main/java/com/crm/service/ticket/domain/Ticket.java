package com.crm.service.ticket.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Ticket {

	private final TenantId tenantId;
	private final TicketId id;
	private String ticketNumber;
	private AccountId accountId;
	private ContactId contactId;
	private String subject;
	private String description;
	private TicketChannel channel;
	private TicketCategoryId categoryId;
	private TicketPriority priority;
	private String severity;
	private TicketStatus status;
	private ActorId assignedUserId;
	private UUID assignedTeamId;
	private ActorId ownerUserId;
	private UUID slaPolicyId;
	private String externalReference;
	private Instant firstResponseDueAt;
	private Instant resolutionDueAt;
	private Instant firstRespondedAt;
	private Instant resolvedAt;
	private Instant closedAt;
	private Integer satisfactionScore;
	private String satisfactionComment;
	private final AuditInfo auditInfo;
	private long version;

	public Ticket(TenantId tenantId, TicketId id, String ticketNumber,
			AccountId accountId, ContactId contactId, String subject,
			String description, TicketChannel channel, TicketCategoryId categoryId,
			TicketPriority priority, String severity, TicketStatus status,
			ActorId assignedUserId, UUID assignedTeamId, ActorId ownerUserId,
			UUID slaPolicyId, String externalReference, Instant firstResponseDueAt,
			Instant resolutionDueAt, Instant firstRespondedAt, Instant resolvedAt,
			Instant closedAt, Integer satisfactionScore, String satisfactionComment,
			AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.ticketNumber = Objects.requireNonNull(ticketNumber, "ticketNumber must not be null");
		if (accountId == null && contactId == null) {
			throw new IllegalArgumentException("Either accountId or contactId must be provided");
		}
		this.accountId = accountId;
		this.contactId = contactId;
		this.subject = Objects.requireNonNull(subject, "subject must not be null");
		this.description = description;
		this.channel = channel != null ? channel : TicketChannel.WEB;
		this.categoryId = categoryId;
		this.priority = priority != null ? priority : TicketPriority.NORMAL;
		this.severity = severity;
		this.status = status != null ? status : TicketStatus.NEW;
		this.assignedUserId = assignedUserId;
		this.assignedTeamId = assignedTeamId;
		this.ownerUserId = ownerUserId;
		this.slaPolicyId = slaPolicyId;
		this.externalReference = externalReference;
		this.firstResponseDueAt = firstResponseDueAt;
		this.resolutionDueAt = resolutionDueAt;
		this.firstRespondedAt = firstRespondedAt;
		this.resolvedAt = resolvedAt;
		this.closedAt = closedAt;
		this.satisfactionScore = satisfactionScore;
		this.satisfactionComment = satisfactionComment;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static Ticket create(TenantId tenantId, TicketId id, String ticketNumber,
			AccountId accountId, ContactId contactId, String subject,
			String description, TicketChannel channel, TicketCategoryId categoryId,
			TicketPriority priority, String severity, ActorId assignedUserId,
			UUID assignedTeamId, ActorId ownerUserId, UUID slaPolicyId,
			String externalReference, Instant firstResponseDueAt,
			Instant resolutionDueAt, ActorId actorId, Instant now) {
		return new Ticket(tenantId, id, ticketNumber.trim().toUpperCase(),
				accountId, contactId, subject.trim(), description,
				channel != null ? channel : TicketChannel.WEB,
				categoryId, priority != null ? priority : TicketPriority.NORMAL,
				severity, TicketStatus.NEW, assignedUserId, assignedTeamId,
				ownerUserId != null ? ownerUserId : actorId, slaPolicyId,
				externalReference, firstResponseDueAt, resolutionDueAt,
				null, null, null, null, null,
				AuditInfo.create(actorId, now), 1L);
	}

	public void update(AccountId accountId, ContactId contactId, String subject,
			String description, TicketChannel channel, TicketCategoryId categoryId,
			TicketPriority priority, String severity, String externalReference,
			ActorId actorId, Instant now) {
		if (this.status == TicketStatus.CLOSED || this.status == TicketStatus.CANCELLED) {
			throw new IllegalStateException("Closed or cancelled tickets cannot be edited");
		}
		if (accountId == null && contactId == null) {
			throw new IllegalArgumentException("Either accountId or contactId must be provided");
		}
		this.accountId = accountId;
		this.contactId = contactId;
		this.subject = Objects.requireNonNull(subject, "subject must not be null").trim();
		this.description = description;
		this.channel = channel != null ? channel : this.channel;
		this.categoryId = categoryId;
		this.priority = priority != null ? priority : this.priority;
		this.severity = severity;
		this.externalReference = externalReference;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void assign(ActorId assignedUserId, UUID assignedTeamId, ActorId actorId, Instant now) {
		this.assignedUserId = assignedUserId;
		this.assignedTeamId = assignedTeamId;
		if (this.status == TicketStatus.NEW) {
			this.status = TicketStatus.OPEN;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void recordFirstResponse(Instant now) {
		if (this.firstRespondedAt == null) {
			this.firstRespondedAt = now;
		}
	}

	public void resolve(ActorId actorId, Instant now) {
		if (this.status == TicketStatus.CLOSED || this.status == TicketStatus.CANCELLED) {
			throw new IllegalStateException("Ticket is already closed or cancelled");
		}
		this.status = TicketStatus.RESOLVED;
		this.resolvedAt = now;
		if (this.firstRespondedAt == null) {
			this.firstRespondedAt = now;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void close(Integer satisfactionScore, String satisfactionComment, ActorId actorId, Instant now) {
		if (this.status == TicketStatus.CLOSED) {
			throw new IllegalStateException("Ticket is already closed");
		}
		this.status = TicketStatus.CLOSED;
		this.closedAt = now;
		if (this.resolvedAt == null) {
			this.resolvedAt = now;
		}
		if (satisfactionScore != null) {
			if (satisfactionScore < 1 || satisfactionScore > 5) {
				throw new IllegalArgumentException("Satisfaction score must be between 1 and 5");
			}
			this.satisfactionScore = satisfactionScore;
			this.satisfactionComment = satisfactionComment;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void reopen(ActorId actorId, Instant now) {
		if (this.status != TicketStatus.RESOLVED && this.status != TicketStatus.CLOSED) {
			throw new IllegalStateException("Only resolved or closed tickets can be reopened");
		}
		this.status = TicketStatus.OPEN;
		this.resolvedAt = null;
		this.closedAt = null;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void cancel(ActorId actorId, Instant now) {
		if (this.status == TicketStatus.CLOSED) {
			throw new IllegalStateException("Closed tickets cannot be cancelled");
		}
		this.status = TicketStatus.CANCELLED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TicketId id() {
		return id;
	}

	public String ticketNumber() {
		return ticketNumber;
	}

	public AccountId accountId() {
		return accountId;
	}

	public ContactId contactId() {
		return contactId;
	}

	public String subject() {
		return subject;
	}

	public String description() {
		return description;
	}

	public TicketChannel channel() {
		return channel;
	}

	public TicketCategoryId categoryId() {
		return categoryId;
	}

	public TicketPriority priority() {
		return priority;
	}

	public String severity() {
		return severity;
	}

	public TicketStatus status() {
		return status;
	}

	public ActorId assignedUserId() {
		return assignedUserId;
	}

	public UUID assignedTeamId() {
		return assignedTeamId;
	}

	public ActorId ownerUserId() {
		return ownerUserId;
	}

	public UUID slaPolicyId() {
		return slaPolicyId;
	}

	public String externalReference() {
		return externalReference;
	}

	public Instant firstResponseDueAt() {
		return firstResponseDueAt;
	}

	public Instant resolutionDueAt() {
		return resolutionDueAt;
	}

	public Instant firstRespondedAt() {
		return firstRespondedAt;
	}

	public Instant resolvedAt() {
		return resolvedAt;
	}

	public Instant closedAt() {
		return closedAt;
	}

	public Integer satisfactionScore() {
		return satisfactionScore;
	}

	public String satisfactionComment() {
		return satisfactionComment;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
