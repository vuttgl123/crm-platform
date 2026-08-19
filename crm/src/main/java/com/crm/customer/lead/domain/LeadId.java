package com.crm.customer.lead.domain;

import java.util.Objects;
import java.util.UUID;

public record LeadId(UUID value) {

	public LeadId {
		Objects.requireNonNull(value, "Lead ID value must not be null");
	}

	public static LeadId from(UUID value) {
		return new LeadId(value);
	}

	public static LeadId from(String value) {
		Objects.requireNonNull(value, "Lead ID string must not be null");
		return new LeadId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
