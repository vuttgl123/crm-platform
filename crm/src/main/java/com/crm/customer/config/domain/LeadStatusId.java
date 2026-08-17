package com.crm.customer.config.domain;

import java.util.Objects;
import java.util.UUID;

public record LeadStatusId(UUID value) {

	public LeadStatusId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static LeadStatusId from(UUID value) {
		return new LeadStatusId(value);
	}

	public static LeadStatusId from(String value) {
		return new LeadStatusId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
