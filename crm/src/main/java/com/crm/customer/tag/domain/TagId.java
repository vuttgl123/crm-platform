package com.crm.customer.tag.domain;

import java.util.Objects;
import java.util.UUID;

public record TagId(UUID value) {

	public TagId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TagId from(UUID value) {
		return new TagId(value);
	}

	public static TagId from(String value) {
		return new TagId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
