package com.crm.customer.customfield.application.query;

public record CustomFieldDefinitionSearchQuery(
		String entityType,
		Boolean active
) {
}
