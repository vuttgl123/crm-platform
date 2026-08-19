package com.crm.sharedkernel.domain;

import java.time.Instant;
import java.util.Objects;

public final class AuditInfo {

	private final ActorId createdBy;
	private final Instant createdAt;
	private ActorId updatedBy;
	private Instant updatedAt;

	public AuditInfo(ActorId createdBy, Instant createdAt, ActorId updatedBy, Instant updatedAt) {
		this.createdBy = createdBy;
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.updatedBy = updatedBy != null ? updatedBy : createdBy;
		this.updatedAt = updatedAt != null ? updatedAt : createdAt;
	}

	public static AuditInfo create(ActorId actorId, Instant now) {
		Objects.requireNonNull(now, "now must not be null");
		return new AuditInfo(actorId, now, actorId, now);
	}

	public static AuditInfo restore(ActorId createdBy, Instant createdAt, ActorId updatedBy, Instant updatedAt) {
		return new AuditInfo(createdBy, createdAt, updatedBy, updatedAt);
	}

	public void update(ActorId actorId, Instant now) {
		this.updatedBy = actorId;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
	}

	public ActorId createdBy() {
		return createdBy;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId updatedBy() {
		return updatedBy;
	}

	public Instant updatedAt() {
		return updatedAt;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		AuditInfo auditInfo = (AuditInfo) o;
		return Objects.equals(createdBy, auditInfo.createdBy) &&
				Objects.equals(createdAt, auditInfo.createdAt) &&
				Objects.equals(updatedBy, auditInfo.updatedBy) &&
				Objects.equals(updatedAt, auditInfo.updatedAt);
	}

	@Override
	public int hashCode() {
		return Objects.hash(createdBy, createdAt, updatedBy, updatedAt);
	}

	@Override
	public String toString() {
		return "AuditInfo{" +
				"createdBy=" + createdBy +
				", createdAt=" + createdAt +
				", updatedBy=" + updatedBy +
				", updatedAt=" + updatedAt +
				'}';
	}
}
