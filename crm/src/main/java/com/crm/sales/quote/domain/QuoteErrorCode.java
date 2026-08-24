package com.crm.sales.quote.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum QuoteErrorCode implements ErrorCode {

	QUOTE_NOT_FOUND("QUOTE_NOT_FOUND", "quote.not_found"),
	QUOTE_NUMBER_ALREADY_EXISTS("QUOTE_NUMBER_ALREADY_EXISTS", "quote.number_already_exists"),
	QUOTE_VERSION_CONFLICT("QUOTE_VERSION_CONFLICT", "quote.version_conflict"),
	QUOTE_ACCOUNT_INVALID("QUOTE_ACCOUNT_INVALID", "quote.account_invalid"),
	QUOTE_CONTACT_INVALID("QUOTE_CONTACT_INVALID", "quote.contact_invalid"),
	QUOTE_OPPORTUNITY_INVALID("QUOTE_OPPORTUNITY_INVALID", "quote.opportunity_invalid"),
	QUOTE_PRICE_BOOK_INVALID("QUOTE_PRICE_BOOK_INVALID", "quote.price_book_invalid"),
	QUOTE_PRODUCT_INVALID("QUOTE_PRODUCT_INVALID", "quote.product_invalid"),
	QUOTE_IF_MATCH_INVALID("QUOTE_IF_MATCH_INVALID", "quote.if_match_invalid"),
	QUOTE_IF_MATCH_REQUIRED("QUOTE_IF_MATCH_REQUIRED", "quote.if_match_required"),
	QUOTE_IMMUTABLE("QUOTE_IMMUTABLE", "quote.immutable"),
	QUOTE_NOT_LATEST_REVISION("QUOTE_NOT_LATEST_REVISION", "quote.not_latest_revision"),
	QUOTE_ORDER_ALREADY_EXISTS("QUOTE_ORDER_ALREADY_EXISTS", "quote.order_already_exists"),
	QUOTE_STATUS_INVALID("QUOTE_STATUS_INVALID", "quote.status_invalid"),
	QUOTE_LINES_REQUIRED("QUOTE_LINES_REQUIRED", "quote.lines_required"),
	QUOTE_CURRENCY_MISMATCH("QUOTE_CURRENCY_MISMATCH", "quote.currency_mismatch"),
	QUOTE_TOTAL_INVALID("QUOTE_TOTAL_INVALID", "quote.total_invalid"),
	QUOTE_VALIDITY_INVALID("QUOTE_VALIDITY_INVALID", "quote.validity_invalid"),
	QUOTE_REASON_REQUIRED("QUOTE_REASON_REQUIRED", "quote.reason_required"),
	QUOTE_LEGACY_ACTION_UNAVAILABLE("QUOTE_LEGACY_ACTION_UNAVAILABLE", "quote.legacy_action_unavailable");

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
