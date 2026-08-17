package com.crm.privacy.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateLegalHoldRequest(
		@NotBlank(message = "Hold code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{3,64}$", message = "Hold code must be 3-64 alphanumeric characters, dashes, or underscores")
		String holdCode,

		@NotBlank(message = "Name must not be blank")
		@Size(max = 255, message = "Name must not exceed 255 characters")
		String name,

		@NotBlank(message = "Entity type must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Entity type must be 2-50 alphanumeric characters or underscores")
		String entityType,

		UUID entityId,

		String scopeFilter,

		@NotBlank(message = "Reason must not be blank")
		String reason
) {
}
