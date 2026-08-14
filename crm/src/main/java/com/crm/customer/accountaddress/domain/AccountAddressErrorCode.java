package com.crm.customer.accountaddress.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum AccountAddressErrorCode implements ErrorCode {

	ACCOUNT_ADDRESS_NOT_FOUND(
			"ACCOUNT_ADDRESS_NOT_FOUND", "account_address.not_found"),
	ACCOUNT_ADDRESS_VERSION_CONFLICT(
			"ACCOUNT_ADDRESS_VERSION_CONFLICT",
			"account_address.version_conflict"),
	ACCOUNT_ADDRESS_ALREADY_ENDED(
			"ACCOUNT_ADDRESS_ALREADY_ENDED",
			"account_address.already_ended"),
	ACCOUNT_ADDRESS_PERIOD_INVALID(
			"ACCOUNT_ADDRESS_PERIOD_INVALID",
			"account_address.period_invalid"),
	ACCOUNT_ADDRESS_PRIMARY_INVALID(
			"ACCOUNT_ADDRESS_PRIMARY_INVALID",
			"account_address.primary_invalid");

	private final String value;
	private final String messageKey;

	AccountAddressErrorCode(String value, String messageKey) {
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
