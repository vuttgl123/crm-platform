package com.crm.customer.customfield.presentation.web;

import java.util.List;
import java.util.UUID;

public record EntityCustomFieldsResponse(
		String entityType,
		UUID entityId,
		List<CustomFieldValueResponse> fields
) {
}
