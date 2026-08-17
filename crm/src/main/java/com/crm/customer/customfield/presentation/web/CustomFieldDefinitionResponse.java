package com.crm.customer.customfield.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.customfield.domain.CustomFieldDataType;

public record CustomFieldDefinitionResponse(
		UUID id,
		String entityType,
		String fieldKey,
		String displayName,
		CustomFieldDataType dataType,
		String description,
		String validationRulesJson,
		String optionValuesJson,
		boolean required,
		boolean searchable,
		boolean sensitive,
		boolean active,
		int displayOrder,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
