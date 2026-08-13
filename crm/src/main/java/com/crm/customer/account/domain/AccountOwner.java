package com.crm.customer.account.domain;

import java.util.Objects;
import java.util.UUID;

public record AccountOwner(AccountOwnerType type, UUID id) {

	public AccountOwner {
		Objects.requireNonNull(type, "type must not be null");
		Objects.requireNonNull(id, "id must not be null");
	}

	public static AccountOwner user(UUID id) {
		return new AccountOwner(AccountOwnerType.USER, id);
	}

	public static AccountOwner team(UUID id) {
		return new AccountOwner(AccountOwnerType.TEAM, id);
	}

}
