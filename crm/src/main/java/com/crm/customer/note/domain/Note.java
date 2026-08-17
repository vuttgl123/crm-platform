package com.crm.customer.note.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.SoftDeleteInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Note {

	private final TenantId tenantId;
	private final NoteId id;
	private String title;
	private String body;
	private NoteVisibility visibility;
	private UUID ownerUserId;
	private final UUID accountId;
	private final UUID contactId;
	private final UUID leadId;
	private final UUID opportunityId;
	private final UUID activityId;
	private final UUID ticketId;
	private final AuditInfo auditInfo;
	private final SoftDeleteInfo softDeleteInfo;
	private long version;

	public Note(
			TenantId tenantId,
			NoteId id,
			String title,
			String body,
			NoteVisibility visibility,
			UUID ownerUserId,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId,
			AuditInfo auditInfo,
			SoftDeleteInfo softDeleteInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.title = title;
		this.body = Objects.requireNonNull(body, "body must not be null").trim();
		this.visibility = visibility != null ? visibility : NoteVisibility.TENANT;
		this.ownerUserId = ownerUserId;

		long nonNullCount = Stream.of(accountId, contactId, leadId, opportunityId, activityId, ticketId)
				.filter(Objects::nonNull)
				.count();
		if (nonNullCount != 1) {
			throw new IllegalArgumentException("Exactly one target (accountId, contactId, leadId, opportunityId, activityId, ticketId) must be provided");
		}

		this.accountId = accountId;
		this.contactId = contactId;
		this.leadId = leadId;
		this.opportunityId = opportunityId;
		this.activityId = activityId;
		this.ticketId = ticketId;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.softDeleteInfo = softDeleteInfo != null ? softDeleteInfo : SoftDeleteInfo.active();
		this.version = version;
	}

	public static Note create(
			TenantId tenantId,
			NoteId id,
			String title,
			String body,
			NoteVisibility visibility,
			UUID ownerUserId,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId,
			ActorId actorId,
			Instant now) {
		return new Note(
				tenantId,
				id,
				title,
				body,
				visibility,
				ownerUserId != null ? ownerUserId : (actorId != null ? actorId.value() : null),
				accountId,
				contactId,
				leadId,
				opportunityId,
				activityId,
				ticketId,
				AuditInfo.create(actorId, now),
				SoftDeleteInfo.active(),
				1L
		);
	}

	public void update(String title, String body, NoteVisibility visibility, ActorId actorId, Instant now) {
		this.title = title;
		this.body = Objects.requireNonNull(body, "body must not be null").trim();
		this.visibility = visibility != null ? visibility : this.visibility;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void delete(ActorId actorId, Instant now) {
		this.softDeleteInfo.delete(actorId, now);
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public boolean isDeleted() {
		return softDeleteInfo.isDeleted();
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public NoteId id() {
		return id;
	}

	public String title() {
		return title;
	}

	public String body() {
		return body;
	}

	public NoteVisibility visibility() {
		return visibility;
	}

	public UUID ownerUserId() {
		return ownerUserId;
	}

	public UUID accountId() {
		return accountId;
	}

	public UUID contactId() {
		return contactId;
	}

	public UUID leadId() {
		return leadId;
	}

	public UUID opportunityId() {
		return opportunityId;
	}

	public UUID activityId() {
		return activityId;
	}

	public UUID ticketId() {
		return ticketId;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public SoftDeleteInfo softDeleteInfo() {
		return softDeleteInfo;
	}

	public long version() {
		return version;
	}

}
