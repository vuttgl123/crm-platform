package com.crm.platform.membership.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class MembershipRequest {

	private static final int OPTIONAL_TEXT_MAX_LENGTH = 2_000;

	private final TenantId tenantId;
	private final MembershipRequestId id;
	private final ActorId requesterId;
	private MembershipRequestStatus status;
	private final String message;
	private ActorId reviewedBy;
	private String reviewNote;
	private final Instant requestedAt;
	private Instant reviewedAt;
	private Instant updatedAt;
	private long version;

	private MembershipRequest(TenantId tenantId, MembershipRequestId id,
			ActorId requesterId, MembershipRequestStatus status, String message,
			ActorId reviewedBy, String reviewNote, Instant requestedAt,
			Instant reviewedAt, Instant updatedAt, long version) {
		this.tenantId = Objects.requireNonNull(
				tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.requesterId = Objects.requireNonNull(
				requesterId, "requesterId must not be null");
		this.status = Objects.requireNonNull(status, "status must not be null");
		this.message = optionalText(message, "message");
		this.reviewedBy = reviewedBy;
		this.reviewNote = optionalText(reviewNote, "reviewNote");
		this.requestedAt = Objects.requireNonNull(
				requestedAt, "requestedAt must not be null");
		this.reviewedAt = reviewedAt;
		this.updatedAt = Objects.requireNonNull(
				updatedAt, "updatedAt must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
		validateReviewState();
	}

	public static MembershipRequest submit(TenantId tenantId,
			MembershipRequestId id, ActorId requesterId, String message,
			Instant now) {
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		return new MembershipRequest(tenantId, id, requesterId,
				MembershipRequestStatus.PENDING, message, null, null,
				requiredNow, null, requiredNow, 1L);
	}

	public static MembershipRequest rehydrate(TenantId tenantId,
			MembershipRequestId id, ActorId requesterId,
			MembershipRequestStatus status, String message, ActorId reviewedBy,
			String reviewNote, Instant requestedAt, Instant reviewedAt,
			Instant updatedAt, long version) {
		return new MembershipRequest(tenantId, id, requesterId, status, message,
				reviewedBy, reviewNote, requestedAt, reviewedAt, updatedAt, version);
	}

	public void approve(ActorId reviewerId, String note, Instant now) {
		resolve(MembershipRequestStatus.APPROVED, reviewerId, note, now);
	}

	public void reject(ActorId reviewerId, String reason, Instant now) {
		resolve(MembershipRequestStatus.REJECTED, reviewerId, reason, now);
	}

	private void resolve(MembershipRequestStatus resolution, ActorId reviewerId,
			String note, Instant now) {
		if (status != MembershipRequestStatus.PENDING) {
			throw new IllegalStateException("membership request must be pending");
		}
		ActorId requiredReviewer = Objects.requireNonNull(
				reviewerId, "reviewerId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		String normalizedNote = optionalText(note, "reviewNote");

		status = resolution;
		reviewedBy = requiredReviewer;
		reviewNote = normalizedNote;
		reviewedAt = requiredNow;
		updatedAt = requiredNow;
		version = Math.incrementExact(version);
	}

	private void validateReviewState() {
		if (status == MembershipRequestStatus.PENDING) {
			if (reviewedBy != null || reviewedAt != null || reviewNote != null) {
				throw new IllegalArgumentException("pending membership request must not be reviewed");
			}
			return;
		}
		if (reviewedBy == null || reviewedAt == null) {
			throw new IllegalArgumentException("resolved membership request must be reviewed");
		}
	}

	private static String optionalText(String value, String fieldName) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > OPTIONAL_TEXT_MAX_LENGTH) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + OPTIONAL_TEXT_MAX_LENGTH
					+ " characters");
		}
		return normalized;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public MembershipRequestId id() {
		return id;
	}

	public ActorId requesterId() {
		return requesterId;
	}

	public MembershipRequestStatus status() {
		return status;
	}

	public String message() {
		return message;
	}

	public ActorId reviewedBy() {
		return reviewedBy;
	}

	public String reviewNote() {
		return reviewNote;
	}

	public Instant requestedAt() {
		return requestedAt;
	}

	public Instant reviewedAt() {
		return reviewedAt;
	}

	public Instant updatedAt() {
		return updatedAt;
	}

	public long version() {
		return version;
	}

}
