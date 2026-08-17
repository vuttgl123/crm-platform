package com.crm.integration.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.TenantId;

public final class OutboxEvent {

	private final TenantId tenantId;
	private final Instant createdAt;
	private final OutboxEventId id;
	private final String aggregateType;
	private final UUID aggregateId;
	private final String eventType;
	private final int eventVersion;
	private final String payload;
	private final String headers;
	private final UUID correlationId;
	private final UUID causationId;
	private final String deduplicationKey;
	private OutboxEventStatus status;
	private Instant availableAt;
	private Instant lockedAt;
	private String lockedBy;
	private Instant publishedAt;
	private int retryCount;
	private String lastError;

	public OutboxEvent(TenantId tenantId, Instant createdAt, OutboxEventId id,
			String aggregateType, UUID aggregateId, String eventType, int eventVersion,
			String payload, String headers, UUID correlationId, UUID causationId,
			String deduplicationKey, OutboxEventStatus status, Instant availableAt,
			Instant lockedAt, String lockedBy, Instant publishedAt, int retryCount,
			String lastError) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.aggregateType = Objects.requireNonNull(aggregateType, "aggregateType must not be null");
		this.aggregateId = Objects.requireNonNull(aggregateId, "aggregateId must not be null");
		this.eventType = Objects.requireNonNull(eventType, "eventType must not be null");
		this.eventVersion = eventVersion > 0 ? eventVersion : 1;
		this.payload = Objects.requireNonNull(payload, "payload must not be null");
		this.headers = headers != null ? headers : "{}";
		this.correlationId = correlationId;
		this.causationId = causationId;
		this.deduplicationKey = deduplicationKey;
		this.status = status != null ? status : OutboxEventStatus.PENDING;
		this.availableAt = availableAt != null ? availableAt : this.createdAt;
		this.lockedAt = lockedAt;
		this.lockedBy = lockedBy;
		this.publishedAt = publishedAt;
		this.retryCount = retryCount >= 0 ? retryCount : 0;
		this.lastError = lastError;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public OutboxEventId id() {
		return id;
	}

	public String aggregateType() {
		return aggregateType;
	}

	public UUID aggregateId() {
		return aggregateId;
	}

	public String eventType() {
		return eventType;
	}

	public int eventVersion() {
		return eventVersion;
	}

	public String payload() {
		return payload;
	}

	public String headers() {
		return headers;
	}

	public UUID correlationId() {
		return correlationId;
	}

	public UUID causationId() {
		return causationId;
	}

	public String deduplicationKey() {
		return deduplicationKey;
	}

	public OutboxEventStatus status() {
		return status;
	}

	public Instant availableAt() {
		return availableAt;
	}

	public Instant lockedAt() {
		return lockedAt;
	}

	public String lockedBy() {
		return lockedBy;
	}

	public Instant publishedAt() {
		return publishedAt;
	}

	public int retryCount() {
		return retryCount;
	}

	public String lastError() {
		return lastError;
	}

}
