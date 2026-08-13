package com.crm.customer.accountcommunicationchannel.domain;

import java.util.Objects;
import java.util.UUID;

public record AccountCommunicationChannelId(UUID value) {

	public AccountCommunicationChannelId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static AccountCommunicationChannelId from(String value) {
		return new AccountCommunicationChannelId(UUID.fromString(
				Objects.requireNonNull(value, "value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
