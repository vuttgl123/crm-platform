package com.crm.customer.account.domain;

import java.util.Objects;
import java.util.UUID;

public record AccountId(UUID value) {

	public AccountId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static AccountId from(String value) {
		return new AccountId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
