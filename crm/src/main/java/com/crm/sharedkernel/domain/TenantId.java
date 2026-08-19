package com.crm.sharedkernel.domain;

import java.util.Objects;
import java.util.UUID;

public record TenantId(UUID value) {

	public TenantId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TenantId from(UUID value) {
		return new TenantId(value);
	}

	public static TenantId from(String value) {
		return new TenantId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
