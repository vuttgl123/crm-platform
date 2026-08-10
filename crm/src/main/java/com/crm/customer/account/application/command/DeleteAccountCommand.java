package com.crm.customer.account.application.command;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;

public record DeleteAccountCommand(AccountId accountId, long version) {

	public DeleteAccountCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
