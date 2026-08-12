package com.crm.platform.access.domain;

import java.util.Objects;
import java.util.UUID;

public record RoleId(UUID value) {

	public RoleId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static RoleId from(String value) {
		return new RoleId(UUID.fromString(Objects.requireNonNull(
				value, "value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
