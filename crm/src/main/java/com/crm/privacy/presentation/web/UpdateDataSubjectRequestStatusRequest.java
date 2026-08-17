package com.crm.privacy.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.privacy.domain.DsrStatus;

public record UpdateDataSubjectRequestStatusRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotNull(message = "Status is required")
		DsrStatus status,

		UUID assignedUserId,

		@Size(max = 500, message = "Verification reference must not exceed 500 characters")
		String verificationReference,

		String resolutionSummary,

		String rejectionReason
) {
}
