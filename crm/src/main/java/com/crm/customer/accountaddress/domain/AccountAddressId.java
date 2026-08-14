package com.crm.customer.accountaddress.domain;

import java.util.Objects;
import java.util.UUID;

public record AccountAddressId(UUID value) {

	public AccountAddressId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static AccountAddressId from(String value) {
		return new AccountAddressId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
