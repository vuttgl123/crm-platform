package com.crm.customer.config.presentation.web;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.customer.config.domain.LeadStatusCategory;

public record CreateLeadStatusRequest(
		@NotBlank(message = "Status code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Status code must be 2-50 characters alphanumeric or underscore")
		String statusCode,

		@NotBlank(message = "Status name must not be blank")
		@Size(max = 100, message = "Status name must not exceed 100 characters")
		String name,

		@NotNull(message = "Status category is required")
		LeadStatusCategory statusCategory,

		@Min(value = 0, message = "Display order must be non-negative")
		int displayOrder,

		boolean defaultStatus,
		boolean terminal
) {
}
