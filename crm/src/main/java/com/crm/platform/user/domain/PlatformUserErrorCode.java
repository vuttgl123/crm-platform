package com.crm.platform.user.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum PlatformUserErrorCode implements ErrorCode {

	USER_NOT_FOUND("USER_NOT_FOUND", "user.not_found"),
	USER_EMAIL_ALREADY_EXISTS("USER_EMAIL_ALREADY_EXISTS", "user.email_already_exists"),
	CANNOT_REMOVE_LAST_ADMIN("CANNOT_REMOVE_LAST_ADMIN", "user.cannot_remove_last_admin"),
	CANNOT_SUSPEND_SELF("CANNOT_SUSPEND_SELF", "user.cannot_suspend_self"),
	USER_VERSION_CONFLICT("USER_VERSION_CONFLICT", "user.version_conflict"),
	INVALID_MEMBERSHIP_STATUS("INVALID_MEMBERSHIP_STATUS", "user.invalid_status");

	private final String value;
	private final String messageKey;

	PlatformUserErrorCode(String value, String messageKey) {
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
