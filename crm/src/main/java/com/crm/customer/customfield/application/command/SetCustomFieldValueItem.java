package com.crm.customer.customfield.application.command;

import java.util.UUID;

public record SetCustomFieldValueItem(
		UUID definitionId,
		String fieldKey,
		String valueJson
) {
}
