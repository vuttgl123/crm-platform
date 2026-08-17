package com.crm.customer.tag.domain;

import java.util.Objects;
import java.util.UUID;

public record EntityTagId(UUID value) {

	public EntityTagId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static EntityTagId from(UUID value) {
		return new EntityTagId(value);
	}

	public static EntityTagId from(String value) {
		return new EntityTagId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
