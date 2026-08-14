package com.crm.customer.accountaddress.application.query;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.domain.AccountAddressType;

public record AccountAddressSearchQuery(
		AccountId accountId,
		AccountAddressType addressType,
		boolean includeHistory) {

	public AccountAddressSearchQuery {
		Objects.requireNonNull(accountId,
				"accountId must not be null");
	}

}
