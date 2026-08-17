package com.crm.customer.customfield.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record CustomFieldValueItemRequest(
		UUID definitionId,
		String fieldKey,
		@NotNull(message = "Value JSON is required")
		String valueJson
) {
}
