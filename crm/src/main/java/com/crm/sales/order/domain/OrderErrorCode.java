package com.crm.sales.order.domain;

import com.crm.sharedkernel.domain.ErrorCode;

public enum OrderErrorCode implements ErrorCode {

	ORDER_NOT_FOUND("order.not_found"),
	ORDER_NUMBER_ALREADY_EXISTS("order.number_already_exists"),
	ORDER_VERSION_CONFLICT("order.version_conflict"),
	ORDER_ACCOUNT_INVALID("order.account_invalid"),
	ORDER_STATUS_INVALID("order.status_invalid"),
	ORDER_CANCELLED("order.cancelled");

	private final String key;

	OrderErrorCode(String key) {
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
