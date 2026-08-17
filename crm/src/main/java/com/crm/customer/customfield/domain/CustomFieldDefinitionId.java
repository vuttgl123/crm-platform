package com.crm.customer.customfield.domain;

import java.util.Objects;
import java.util.UUID;

public record CustomFieldDefinitionId(UUID value) {

	public CustomFieldDefinitionId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static CustomFieldDefinitionId from(UUID value) {
		return new CustomFieldDefinitionId(value);
	}

	public static CustomFieldDefinitionId from(String value) {
		return new CustomFieldDefinitionId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
