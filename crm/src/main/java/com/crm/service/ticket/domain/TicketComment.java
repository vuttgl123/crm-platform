package com.crm.service.ticket.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.contact.domain.ContactId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class TicketComment {

	private final TenantId tenantId;
	private final TicketCommentId id;
	private final TicketId ticketId;
	private final ActorId authorUserId;
	private final ContactId authorContactId;
	private String body;
	private CommentVisibility visibility;
	private String channel;
	private String externalMessageId;
	private final AuditInfo auditInfo;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	public TicketComment(TenantId tenantId, TicketCommentId id, TicketId ticketId,
			ActorId authorUserId, ContactId authorContactId, String body,
			CommentVisibility visibility, String channel, String externalMessageId,
			AuditInfo auditInfo, Instant deletedAt, ActorId deletedBy, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.ticketId = Objects.requireNonNull(ticketId, "ticketId must not be null");
		this.authorUserId = authorUserId;
		this.authorContactId = authorContactId;
		this.body = Objects.requireNonNull(body, "body must not be null");
		this.visibility = visibility != null ? visibility : CommentVisibility.PUBLIC;
		this.channel = channel;
		this.externalMessageId = externalMessageId;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		this.version = version;
	}

	public static TicketComment create(TenantId tenantId, TicketCommentId id, TicketId ticketId,
			ActorId authorUserId, ContactId authorContactId, String body,
			CommentVisibility visibility, String channel, String externalMessageId,
			ActorId actorId, Instant now) {
		return new TicketComment(tenantId, id, ticketId, authorUserId, authorContactId,
				body.trim(), visibility, channel, externalMessageId,
				AuditInfo.create(actorId, now), null, null, 1L);
	}

	public void markDeleted(ActorId actorId, Instant now) {
		this.deletedAt = now;
		this.deletedBy = actorId;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TicketCommentId id() {
		return id;
	}

	public TicketId ticketId() {
		return ticketId;
	}

	public ActorId authorUserId() {
		return authorUserId;
	}

	public ContactId authorContactId() {
		return authorContactId;
	}

	public String body() {
		return body;
	}

	public CommentVisibility visibility() {
		return visibility;
	}

	public String channel() {
		return channel;
	}

	public String externalMessageId() {
		return externalMessageId;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public Instant deletedAt() {
		return deletedAt;
	}

	public ActorId deletedBy() {
		return deletedBy;
	}

	public long version() {
		return version;
	}

}
