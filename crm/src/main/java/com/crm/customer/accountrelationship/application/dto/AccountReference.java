package com.crm.customer.accountrelationship.application.dto;

import java.util.Objects;
import java.util.UUID;

public record AccountReference(
		UUID id,
		String accountNumber,
		String displayName) {

	public AccountReference {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(accountNumber, "accountNumber must not be null");
		Objects.requireNonNull(displayName, "displayName must not be null");
	}

}
