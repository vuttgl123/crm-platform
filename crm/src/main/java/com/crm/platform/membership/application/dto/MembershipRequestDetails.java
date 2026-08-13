package com.crm.platform.membership.application.dto;

import java.time.Instant;
import java.util.Objects;

import com.crm.platform.membership.domain.MembershipRequestId;
import com.crm.platform.membership.domain.MembershipRequestStatus;

public record MembershipRequestDetails(
		MembershipRequestId id,
		TenantReference tenant,
		UserReference requester,
		MembershipRequestStatus status,
		String message,
		Instant requestedAt,
		UserReference reviewer,
		Instant reviewedAt,
		String reviewNote,
		long version) {

	public MembershipRequestDetails {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(tenant, "tenant must not be null");
		Objects.requireNonNull(requester, "requester must not be null");
		Objects.requireNonNull(status, "status must not be null");
		Objects.requireNonNull(requestedAt, "requestedAt must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
		if (status == MembershipRequestStatus.PENDING) {
			if (reviewer != null || reviewedAt != null || reviewNote != null) {
				throw new IllegalArgumentException("pending membership request must not be reviewed");
			}
		} else if (reviewer == null || reviewedAt == null) {
			throw new IllegalArgumentException("resolved membership request must be reviewed");
		}
	}

}
