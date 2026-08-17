package com.crm.customer.customfield.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record SetEntityCustomFieldsRequest(
		@NotBlank(message = "Entity type must not be blank")
		String entityType,

		@NotNull(message = "Entity ID is required")
		UUID entityId,

		@NotEmpty(message = "Field values list must not be empty")
		@Valid
		List<CustomFieldValueItemRequest> fieldValues
) {
}
