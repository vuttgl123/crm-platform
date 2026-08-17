package com.crm.customer.config.domain;

import java.util.Objects;
import java.util.UUID;

public record OpportunityLostReasonId(UUID value) {

	public OpportunityLostReasonId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static OpportunityLostReasonId from(UUID value) {
		return new OpportunityLostReasonId(value);
	}

	public static OpportunityLostReasonId from(String value) {
		return new OpportunityLostReasonId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
