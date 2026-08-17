package com.crm.customer.config.domain;

import java.util.Objects;
import java.util.UUID;

public record LeadSourceId(UUID value) {

	public LeadSourceId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static LeadSourceId from(UUID value) {
		return new LeadSourceId(value);
	}

	public static LeadSourceId from(String value) {
		return new LeadSourceId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
