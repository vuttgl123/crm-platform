package com.crm.sharedkernel.domain;

import java.time.Instant;
import java.util.Objects;

public final class SoftDeleteInfo {

	private Instant deletedAt;
	private ActorId deletedBy;

	public SoftDeleteInfo(Instant deletedAt, ActorId deletedBy) {
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
	}

	public static SoftDeleteInfo active() {
		return new SoftDeleteInfo(null, null);
	}

	public static SoftDeleteInfo restore(Instant deletedAt, ActorId deletedBy) {
		return new SoftDeleteInfo(deletedAt, deletedBy);
	}

	public void delete(ActorId actorId, Instant now) {
		this.deletedBy = actorId;
		this.deletedAt = Objects.requireNonNull(now, "now must not be null");
	}

	public void restore() {
		this.deletedAt = null;
		this.deletedBy = null;
	}

	public boolean isDeleted() {
		return deletedAt != null;
	}

	public Instant deletedAt() {
		return deletedAt;
	}

	public ActorId deletedBy() {
		return deletedBy;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		SoftDeleteInfo that = (SoftDeleteInfo) o;
		return Objects.equals(deletedAt, that.deletedAt) &&
				Objects.equals(deletedBy, that.deletedBy);
	}

	@Override
	public int hashCode() {
		return Objects.hash(deletedAt, deletedBy);
	}

	@Override
	public String toString() {
		return "SoftDeleteInfo{" +
				"deletedAt=" + deletedAt +
				", deletedBy=" + deletedBy +
				'}';
	}
}
