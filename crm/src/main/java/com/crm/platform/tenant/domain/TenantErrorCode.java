package com.crm.platform.tenant.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum TenantErrorCode implements ErrorCode {

	TENANT_CODE_ALREADY_EXISTS(
			"TENANT_CODE_ALREADY_EXISTS",
			"tenant.code_already_exists"),
	TENANT_BOOTSTRAP_NOT_ALLOWED(
			"TENANT_BOOTSTRAP_NOT_ALLOWED",
			"tenant.bootstrap_not_allowed");

	private final String value;
	private final String messageKey;

	TenantErrorCode(String value, String messageKey) {
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
