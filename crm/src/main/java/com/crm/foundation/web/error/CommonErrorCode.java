package com.crm.foundation.web.error;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum CommonErrorCode implements ErrorCode {

	REQUEST_VALIDATION_FAILED(
			"REQUEST_VALIDATION_FAILED", "error.request.validation_failed"),
	VALIDATION_INVALID("VALIDATION_INVALID", "validation.invalid"),
	VALIDATION_REQUIRED("VALIDATION_REQUIRED", "validation.required"),
	VALIDATION_SIZE_INVALID(
			"VALIDATION_SIZE_INVALID", "validation.size_invalid"),
	VALIDATION_EMAIL_INVALID(
			"VALIDATION_EMAIL_INVALID", "validation.email_invalid"),
	ACCESS_DENIED("ACCESS_DENIED", "error.access_denied"),
	AUTHENTICATION_REQUIRED(
			"AUTHENTICATION_REQUIRED", "error.authentication_required"),
	INTERNAL_ERROR("INTERNAL_ERROR", "error.internal");

	private final String value;
	private final String messageKey;

	CommonErrorCode(String value, String messageKey) {
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
