package com.crm.customer.customfield.application.command;

import com.crm.customer.customfield.domain.CustomFieldDefinitionId;

public record UpdateCustomFieldDefinitionCommand(
		CustomFieldDefinitionId id,
		long version,
		String displayName,
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
