package com.crm.platform.membership.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitMembershipRequestRequest(
		@NotBlank @Size(max = 320) String tenantCode,
		@Size(max = 2000) String message) {

	public SubmitMembershipRequestRequest {
		tenantCode = tenantCode == null ? null : tenantCode.trim();
		message = normalizeOptional(message);
	}

	private static String normalizeOptional(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

}
