package com.crm.customer.account.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum AccountErrorCode implements ErrorCode {

	ACCOUNT_NOT_FOUND("ACCOUNT_NOT_FOUND", "account.not_found"),
	ACCOUNT_NUMBER_ALREADY_EXISTS(
			"ACCOUNT_NUMBER_ALREADY_EXISTS",
			"account.number_already_exists"),
	ACCOUNT_VERSION_CONFLICT(
			"ACCOUNT_VERSION_CONFLICT", "account.version_conflict"),
	ACCOUNT_OWNER_INVALID(
			"ACCOUNT_OWNER_INVALID", "account.owner_invalid"),
	ACCOUNT_PARENT_INVALID(
			"ACCOUNT_PARENT_INVALID", "account.parent_invalid"),
	ACCOUNT_REVENUE_CURRENCY_REQUIRED(
			"ACCOUNT_REVENUE_CURRENCY_REQUIRED",
			"account.revenue_currency_required");

	private final String value;
	private final String messageKey;

	AccountErrorCode(String value, String messageKey) {
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
