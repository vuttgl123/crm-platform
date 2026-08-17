package com.crm.customer.customfield.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateCustomFieldDefinitionRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Display name must not be blank")
		@Size(max = 100, message = "Display name must not exceed 100 characters")
		String displayName,

		@Size(max = 500, message = "Description must not exceed 500 characters")
		String description,

		String validationRulesJson,
		String optionValuesJson,
		boolean required,
		boolean searchable,
		boolean sensitive,
		boolean active,
		int displayOrder
) {
}
