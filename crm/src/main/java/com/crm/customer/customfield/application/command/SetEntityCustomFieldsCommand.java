package com.crm.customer.customfield.application.command;

import java.util.List;
import java.util.UUID;

public record SetEntityCustomFieldsCommand(
		String entityType,
		UUID entityId,
		List<SetCustomFieldValueItem> fieldValues
) {
}
