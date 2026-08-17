package com.crm.catalog.category.domain;

import java.util.Objects;
import java.util.UUID;

public record CategoryId(UUID value) {

	public CategoryId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static CategoryId from(UUID value) {
		return new CategoryId(value);
	}

	public static CategoryId from(String value) {
		return new CategoryId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
