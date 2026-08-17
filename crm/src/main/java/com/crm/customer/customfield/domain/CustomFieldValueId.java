package com.crm.customer.customfield.domain;

import java.util.Objects;
import java.util.UUID;

public record CustomFieldValueId(UUID value) {

	public CustomFieldValueId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static CustomFieldValueId from(UUID value) {
		return new CustomFieldValueId(value);
	}

	public static CustomFieldValueId from(String value) {
		return new CustomFieldValueId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
