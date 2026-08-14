package com.crm.customer.contact.domain;

import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;

public record ContactOwner(AccountOwnerType type, UUID id) {

	public ContactOwner {
		Objects.requireNonNull(type, "type must not be null");
		Objects.requireNonNull(id, "id must not be null");
	}

	public static ContactOwner user(UUID id) {
		return new ContactOwner(AccountOwnerType.USER, id);
	}

	public static ContactOwner team(UUID id) {
		return new ContactOwner(AccountOwnerType.TEAM, id);
	}

}
