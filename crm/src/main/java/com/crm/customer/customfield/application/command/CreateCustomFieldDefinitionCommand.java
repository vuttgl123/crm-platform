package com.crm.customer.customfield.application.command;

import com.crm.customer.customfield.domain.CustomFieldDataType;

public record CreateCustomFieldDefinitionCommand(
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
		int displayOrder
) {
}
