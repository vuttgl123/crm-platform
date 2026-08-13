package com.crm.customer.accountcommunicationchannel.application.command;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;

public record DeleteAccountCommunicationChannelCommand(
		AccountId accountId,
		AccountCommunicationChannelId channelId,
		long version) {

	public DeleteAccountCommunicationChannelCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(channelId, "channelId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
