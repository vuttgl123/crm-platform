package com.crm.privacy.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class LegalHold {

	private final TenantId tenantId;
	private final LegalHoldId id;
	private final String holdCode;
	private final String name;
	private final String entityType;
	private final UUID entityId;
	private final String scopeFilter;
	private final String reason;
	private final Instant effectiveFrom;
	private Instant releasedAt;
	private ActorId releasedBy;
	private final Instant createdAt;
	private final ActorId createdBy;

	public LegalHold(TenantId tenantId, LegalHoldId id, String holdCode, String name,
			String entityType, UUID entityId, String scopeFilter, String reason,
			Instant effectiveFrom, Instant releasedAt, ActorId releasedBy,
			Instant createdAt, ActorId createdBy) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.holdCode = Objects.requireNonNull(holdCode, "holdCode must not be null").trim();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null").trim().toUpperCase();
		this.entityId = entityId;
		this.scopeFilter = scopeFilter != null ? scopeFilter : "{}";
		this.reason = Objects.requireNonNull(reason, "reason must not be null").trim();
		this.effectiveFrom = effectiveFrom != null ? effectiveFrom : Instant.now();
		this.releasedAt = releasedAt;
		this.releasedBy = releasedBy;
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.createdBy = createdBy;
	}

	public static LegalHold create(TenantId tenantId, LegalHoldId id, String holdCode,
			String name, String entityType, UUID entityId, String scopeFilter,
			String reason, ActorId actorId, Instant now) {
		return new LegalHold(tenantId, id, holdCode, name, entityType, entityId,
				scopeFilter != null ? scopeFilter : "{}", reason, now, null, null, now, actorId);
	}

	public void release(ActorId actorId, Instant now) {
		if (this.releasedAt != null) {
			throw new IllegalStateException("LegalHold is already released");
		}
		this.releasedAt = now;
		this.releasedBy = actorId;
	}

	public boolean isReleased() {
		return this.releasedAt != null;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public LegalHoldId id() {
		return id;
	}

	public String holdCode() {
		return holdCode;
	}

	public String name() {
		return name;
	}

	public String entityType() {
		return entityType;
	}

	public UUID entityId() {
		return entityId;
	}

	public String scopeFilter() {
		return scopeFilter;
	}

	public String reason() {
		return reason;
	}

	public Instant effectiveFrom() {
		return effectiveFrom;
	}

	public Instant releasedAt() {
		return releasedAt;
	}

	public ActorId releasedBy() {
		return releasedBy;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

}
