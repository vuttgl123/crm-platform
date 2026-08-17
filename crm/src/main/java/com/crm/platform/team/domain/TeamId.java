package com.crm.platform.team.domain;

import java.util.Objects;
import java.util.UUID;

public record TeamId(UUID value) {

	public TeamId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TeamId from(UUID value) {
		return new TeamId(value);
	}

	public static TeamId from(String value) {
		return new TeamId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
