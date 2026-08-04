package com.crm.sharedkernel.domain;

import java.util.Objects;
import java.util.UUID;

public record ActorId(UUID value) {

	public ActorId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ActorId from(String value) {
		return new ActorId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
