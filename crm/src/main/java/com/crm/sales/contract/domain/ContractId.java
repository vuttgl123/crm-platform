package com.crm.sales.contract.domain;

import java.util.Objects;
import java.util.UUID;

public record ContractId(UUID value) {

	public ContractId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ContractId from(UUID value) {
		return new ContractId(value);
	}

	public static ContractId from(String value) {
		return new ContractId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
