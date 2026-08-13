package com.crm.customer.accountcommunicationchannel.application.command;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
import com.crm.customer.accountcommunicationchannel.domain.ChannelType;

public record UpdateAccountCommunicationChannelCommand(
		AccountId accountId,
		AccountCommunicationChannelId channelId,
		long version,
		ChannelType channelType,
		String rawValue,
		String label,
		boolean isPrimary,
		boolean doNotUse) {

	public UpdateAccountCommunicationChannelCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(channelId, "channelId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
