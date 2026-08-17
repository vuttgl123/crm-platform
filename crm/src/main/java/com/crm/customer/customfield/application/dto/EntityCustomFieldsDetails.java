package com.crm.customer.customfield.application.dto;

import java.util.List;
import java.util.UUID;

public record EntityCustomFieldsDetails(
		String entityType,
		UUID entityId,
		List<CustomFieldValueDetails> fields
) {
}
