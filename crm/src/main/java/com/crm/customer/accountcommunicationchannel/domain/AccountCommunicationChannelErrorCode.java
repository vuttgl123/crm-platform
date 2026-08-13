package com.crm.customer.accountcommunicationchannel.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum AccountCommunicationChannelErrorCode implements ErrorCode {

	ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND(
			"ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND",
			"account_communication_channel.not_found"),
	ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS(
			"ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS",
			"account_communication_channel.already_exists"),
	ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT(
			"ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT",
			"account_communication_channel.version_conflict");

	private final String value;
	private final String messageKey;

	AccountCommunicationChannelErrorCode(String value, String messageKey) {
		this.value = value;
		this.messageKey = messageKey;
	}

	@Override
	public String value() {
		return value;
	}

	@Override
	public String messageKey() {
		return messageKey;
	}

}
