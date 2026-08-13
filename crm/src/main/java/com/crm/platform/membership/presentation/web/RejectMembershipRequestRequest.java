package com.crm.platform.membership.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RejectMembershipRequestRequest(
		@NotNull @Positive Long version,
		@Size(max = 2000) String reason) {

	public RejectMembershipRequestRequest {
		reason = normalizeOptional(reason);
	}

	private static String normalizeOptional(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

}
