package com.crm.customer.accountcommunicationchannel.application.command;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.domain.ChannelType;

public record CreateAccountCommunicationChannelCommand(
		AccountId accountId,
		ChannelType channelType,
		String rawValue,
		String label,
		boolean isPrimary,
		boolean doNotUse) {

	public CreateAccountCommunicationChannelCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
	}

}
