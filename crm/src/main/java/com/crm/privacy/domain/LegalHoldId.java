package com.crm.privacy.domain;

import java.util.Objects;
import java.util.UUID;

public record LegalHoldId(UUID value) {

	public LegalHoldId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static LegalHoldId from(UUID value) {
		return new LegalHoldId(value);
	}

	public static LegalHoldId from(String value) {
		return new LegalHoldId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
