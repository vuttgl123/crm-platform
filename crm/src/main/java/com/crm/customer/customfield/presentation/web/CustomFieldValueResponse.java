package com.crm.customer.customfield.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.customfield.domain.CustomFieldDataType;

public record CustomFieldValueResponse(
		UUID id,
		UUID definitionId,
		String fieldKey,
		String displayName,
		CustomFieldDataType dataType,
		String entityType,
		UUID entityId,
		String valueJson,
		String searchText,
		Instant updatedAt,
		UUID updatedBy,
		long version
) {
}
