package com.crm.customer.opportunity.domain;

import java.util.Objects;
import java.util.UUID;

public record OpportunityId(UUID value) {

	public OpportunityId {
		Objects.requireNonNull(value, "Opportunity ID value must not be null");
	}

	public static OpportunityId from(String value) {
		Objects.requireNonNull(value, "Opportunity ID string must not be null");
		return new OpportunityId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
