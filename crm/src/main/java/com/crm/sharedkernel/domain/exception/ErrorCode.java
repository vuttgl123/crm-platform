package com.crm.sharedkernel.domain.exception;

public interface ErrorCode {

	String value();

	String messageKey();

	static ErrorCode of(String code) {
		return new SimpleErrorCode(code, code != null ? code.toLowerCase().replace('_', '.') : "error.unknown");
	}

	record SimpleErrorCode(String value, String messageKey) implements ErrorCode {
	}

}
