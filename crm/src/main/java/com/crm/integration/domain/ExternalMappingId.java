package com.crm.integration.domain;

import java.util.Objects;
import java.util.UUID;

public record ExternalMappingId(UUID value) {

	public ExternalMappingId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ExternalMappingId from(UUID value) {
		return new ExternalMappingId(value);
	}

	public static ExternalMappingId from(String value) {
		return new ExternalMappingId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
