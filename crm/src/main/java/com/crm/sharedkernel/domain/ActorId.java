package com.crm.sharedkernel.domain;

import java.util.Objects;
import java.util.UUID;

public record ActorId(UUID value) {

	public ActorId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ActorId from(UUID value) {
		return new ActorId(value);
	}

	public static ActorId from(String value) {
		return new ActorId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	public UUID actorId() {
		return value;
	}

	public UUID id() {
		return value;
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
