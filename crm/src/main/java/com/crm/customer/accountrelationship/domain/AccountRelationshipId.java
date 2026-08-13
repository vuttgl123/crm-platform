package com.crm.customer.accountrelationship.domain;

import java.util.Objects;
import java.util.UUID;

public record AccountRelationshipId(UUID value) {

	public AccountRelationshipId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static AccountRelationshipId from(String value) {
		return new AccountRelationshipId(UUID.fromString(Objects.requireNonNull(
				value, "value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
