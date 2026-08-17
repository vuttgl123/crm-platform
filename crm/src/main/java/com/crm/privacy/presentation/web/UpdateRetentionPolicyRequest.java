package com.crm.privacy.presentation.web;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.privacy.domain.RetentionAction;

public record UpdateRetentionPolicyRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotNull(message = "Retention days is required")
		@Min(value = 0, message = "Retention days must be greater than or equal to 0")
		Integer retentionDays,

		@NotNull(message = "Action on expiry is required")
		RetentionAction actionOnExpiry,

		@Size(max = 255, message = "Legal basis must not exceed 255 characters")
		String legalBasis,

		@NotNull(message = "Active flag is required")
		Boolean active
) {
}
