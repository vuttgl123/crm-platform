package com.crm.sales.quote.domain;

import com.crm.sharedkernel.domain.ErrorCode;

public enum QuoteErrorCode implements ErrorCode {

	QUOTE_NOT_FOUND("quote.not_found"),
	QUOTE_NUMBER_ALREADY_EXISTS("quote.number_already_exists"),
	QUOTE_VERSION_CONFLICT("quote.version_conflict"),
	QUOTE_ACCOUNT_INVALID("quote.account_invalid"),
	QUOTE_STATUS_INVALID("quote.status_invalid"),
	QUOTE_IMMUTABLE("quote.immutable");

	private final String key;

	QuoteErrorCode(String key) {
		this.key = key;
	}

	@Override
	public String key() {
		return key;
	}

	@Override
	public String code() {
		return name();
	}

}
