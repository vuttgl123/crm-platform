package com.crm.customer.activity.domain;

import java.util.Objects;
import java.util.UUID;

public record ActivityId(UUID value) {

	public ActivityId {
		Objects.requireNonNull(value, "Activity ID value must not be null");
	}

	public static ActivityId from(String value) {
		Objects.requireNonNull(value, "Activity ID string must not be null");
		return new ActivityId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
