package com.crm.customer.config.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateLeadSourceRequest(
		@NotBlank(message = "Source code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Source code must be 2-50 characters alphanumeric or underscore")
		String sourceCode,

		@NotBlank(message = "Source name must not be blank")
		@Size(max = 100, message = "Source name must not exceed 100 characters")
		String name,

		@Size(max = 500, message = "Description must not exceed 500 characters")
		String description
) {
}
