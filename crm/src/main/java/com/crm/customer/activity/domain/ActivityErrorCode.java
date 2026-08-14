package com.crm.customer.activity.domain;

import com.crm.sharedkernel.domain.ErrorCode;

public enum ActivityErrorCode implements ErrorCode {

	ACTIVITY_NOT_FOUND("activity.not_found"),
	ACTIVITY_VERSION_CONFLICT("activity.version_conflict"),
	ACTIVITY_OWNER_INVALID("activity.owner_invalid"),
	ACTIVITY_STATUS_INVALID("activity.status_invalid"),
	ACTIVITY_TIME_RANGE_INVALID("activity.time_range_invalid");

	private final String key;

	ActivityErrorCode(String key) {
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
