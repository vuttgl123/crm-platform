package com.crm.sales.quote.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum QuoteErrorCode implements ErrorCode {

	QUOTE_NOT_FOUND("QUOTE_NOT_FOUND", "quote.not_found"),
	QUOTE_NUMBER_ALREADY_EXISTS(
			"QUOTE_NUMBER_ALREADY_EXISTS", "quote.number_already_exists"),
	QUOTE_VERSION_CONFLICT(
			"QUOTE_VERSION_CONFLICT", "quote.version_conflict"),
	QUOTE_ACCOUNT_INVALID(
			"QUOTE_ACCOUNT_INVALID", "quote.account_invalid"),
	QUOTE_STATUS_INVALID(
			"QUOTE_STATUS_INVALID", "quote.status_invalid"),
	QUOTE_IMMUTABLE(
			"QUOTE_IMMUTABLE", "quote.immutable");

	private final String value;
	private final String messageKey;

	QuoteErrorCode(String value, String messageKey) {
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
