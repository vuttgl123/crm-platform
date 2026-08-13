package com.crm.platform.membership.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.membership.domain.MembershipRequestStatus;

public record MembershipRequestSubmissionResponse(
		UUID id,
		Tenant tenant,
		MembershipRequestStatus status,
		String message,
		Instant requestedAt,
		Instant reviewedAt,
		String reviewNote,
		long version) {

	public record Tenant(
			UUID id,
			String tenantCode,
			String displayName) {
	}

}
