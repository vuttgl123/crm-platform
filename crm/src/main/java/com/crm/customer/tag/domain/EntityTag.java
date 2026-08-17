package com.crm.customer.tag.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class EntityTag {

	private final TenantId tenantId;
	private final TagId tagId;
	private final EntityTagId id;
	private final UUID accountId;
	private final UUID contactId;
	private final UUID leadId;
	private final UUID opportunityId;
	private final UUID activityId;
	private final UUID ticketId;
	private final Instant createdAt;
	private final ActorId createdBy;

	public EntityTag(
			TenantId tenantId,
			TagId tagId,
			EntityTagId id,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId,
			Instant createdAt,
			ActorId createdBy) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.tagId = Objects.requireNonNull(tagId, "tagId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");

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
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.createdBy = createdBy;
	}

	public static EntityTag create(
			TenantId tenantId,
			TagId tagId,
			EntityTagId id,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId,
			ActorId actorId,
			Instant now) {
		return new EntityTag(tenantId, tagId, id, accountId, contactId, leadId, opportunityId, activityId, ticketId, now, actorId);
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TagId tagId() {
		return tagId;
	}

	public EntityTagId id() {
		return id;
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

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

}
