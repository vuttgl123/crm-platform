package com.crm.privacy.domain;

import java.util.Objects;
import java.util.UUID;

public record ConsentId(UUID value) {

	public ConsentId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ConsentId from(UUID value) {
		return new ConsentId(value);
	}

	public static ConsentId from(String value) {
		return new ConsentId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
