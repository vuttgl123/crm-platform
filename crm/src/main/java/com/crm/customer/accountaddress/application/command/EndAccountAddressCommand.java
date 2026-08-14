package com.crm.customer.accountaddress.application.command;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.domain.AccountAddressId;

public record EndAccountAddressCommand(
		AccountId accountId,
		AccountAddressId addressId,
		long version) {

	public EndAccountAddressCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(addressId, "addressId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
