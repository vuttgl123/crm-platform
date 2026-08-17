package com.crm.customer.customfield.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.customer.customfield.domain.CustomFieldDataType;

public record CreateCustomFieldDefinitionRequest(
		@NotBlank(message = "Entity type must not be blank")
		@Pattern(regexp = "^(ACCOUNT|CONTACT|LEAD|OPPORTUNITY|ACTIVITY|TICKET|PRODUCT)$", message = "Entity type must be one of ACCOUNT, CONTACT, LEAD, OPPORTUNITY, ACTIVITY, TICKET, PRODUCT")
		String entityType,

		@NotBlank(message = "Field key must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Field key must be 2-50 characters alphanumeric or underscore")
		String fieldKey,

		@NotBlank(message = "Display name must not be blank")
		@Size(max = 100, message = "Display name must not exceed 100 characters")
		String displayName,

		@NotNull(message = "Data type is required")
		CustomFieldDataType dataType,

		@Size(max = 500, message = "Description must not exceed 500 characters")
		String description,

		String validationRulesJson,
		String optionValuesJson,
		boolean required,
		boolean searchable,
		boolean sensitive,
		int displayOrder
) {
}
