package com.crm.sales.order.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum OrderErrorCode implements ErrorCode {

	ORDER_NOT_FOUND("ORDER_NOT_FOUND", "order.not_found"),
	ORDER_NUMBER_ALREADY_EXISTS(
			"ORDER_NUMBER_ALREADY_EXISTS", "order.number_already_exists"),
	ORDER_VERSION_CONFLICT(
			"ORDER_VERSION_CONFLICT", "order.version_conflict"),
	ORDER_ACCOUNT_INVALID(
			"ORDER_ACCOUNT_INVALID", "order.account_invalid"),
	ORDER_STATUS_INVALID(
			"ORDER_STATUS_INVALID", "order.status_invalid"),
	ORDER_CANCELLED(
			"ORDER_CANCELLED", "order.cancelled");

	private final String value;
	private final String messageKey;

	OrderErrorCode(String value, String messageKey) {
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
