package com.crm.customer.contact.domain;

import java.util.Objects;
import java.util.UUID;

public record ContactId(UUID value) {

	public ContactId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ContactId from(String value) {
		return new ContactId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
