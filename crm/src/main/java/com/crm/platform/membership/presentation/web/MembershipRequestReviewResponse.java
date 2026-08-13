package com.crm.platform.membership.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.membership.domain.MembershipRequestStatus;

public record MembershipRequestReviewResponse(
		UUID id,
		Requester requester,
		MembershipRequestStatus status,
		String message,
		Instant requestedAt,
		Instant reviewedAt,
		Reviewer reviewedBy,
		String reviewNote,
		long version) {

	public record Requester(
			UUID id,
			String email,
			String displayName) {
	}

	public record Reviewer(
			UUID id,
			String displayName) {
	}

}
