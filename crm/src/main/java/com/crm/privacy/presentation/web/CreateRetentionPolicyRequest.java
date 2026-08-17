package com.crm.privacy.presentation.web;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.privacy.domain.RetentionAction;

public record CreateRetentionPolicyRequest(
		@NotBlank(message = "Entity type must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Entity type must be 2-50 alphanumeric characters or underscores")
		String entityType,

		@NotBlank(message = "Purpose must not be blank")
		@Size(max = 255, message = "Purpose must not exceed 255 characters")
		String purpose,

		@NotNull(message = "Retention days is required")
		@Min(value = 0, message = "Retention days must be greater than or equal to 0")
		Integer retentionDays,

		@NotNull(message = "Action on expiry is required")
		RetentionAction actionOnExpiry,

		@Size(max = 255, message = "Legal basis must not exceed 255 characters")
		String legalBasis
) {
}
