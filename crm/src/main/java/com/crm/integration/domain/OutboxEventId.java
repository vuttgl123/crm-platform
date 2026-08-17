package com.crm.integration.domain;

import java.util.Objects;
import java.util.UUID;

public record OutboxEventId(UUID value) {

	public OutboxEventId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static OutboxEventId from(UUID value) {
		return new OutboxEventId(value);
	}

	public static OutboxEventId from(String value) {
		return new OutboxEventId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
