package com.crm.customer.activity.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum ActivityErrorCode implements ErrorCode {

	ACTIVITY_NOT_FOUND("ACTIVITY_NOT_FOUND", "activity.not_found"),
	ACTIVITY_VERSION_CONFLICT(
			"ACTIVITY_VERSION_CONFLICT", "activity.version_conflict"),
	ACTIVITY_OWNER_INVALID(
			"ACTIVITY_OWNER_INVALID", "activity.owner_invalid"),
	ACTIVITY_STATUS_INVALID(
			"ACTIVITY_STATUS_INVALID", "activity.status_invalid"),
	ACTIVITY_TIME_RANGE_INVALID(
			"ACTIVITY_TIME_RANGE_INVALID", "activity.time_range_invalid");

	private final String value;
	private final String messageKey;

	ActivityErrorCode(String value, String messageKey) {
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
