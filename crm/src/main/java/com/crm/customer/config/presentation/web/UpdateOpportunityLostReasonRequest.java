package com.crm.customer.config.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateOpportunityLostReasonRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Reason name must not be blank")
		@Size(max = 100, message = "Reason name must not exceed 100 characters")
		String name,

		@Size(max = 500, message = "Description must not exceed 500 characters")
		String description,

		boolean active
) {
}
