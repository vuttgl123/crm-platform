package com.crm.customer.customfield.domain;

public enum CustomFieldErrorCode {

	CUSTOM_FIELD_DEFINITION_NOT_FOUND("CUSTOM_FIELD_DEFINITION_NOT_FOUND"),
	CUSTOM_FIELD_KEY_ALREADY_EXISTS("CUSTOM_FIELD_KEY_ALREADY_EXISTS"),
	INVALID_CUSTOM_FIELD_VALUE("INVALID_CUSTOM_FIELD_VALUE"),
	CUSTOM_FIELD_VALUE_REQUIRED("CUSTOM_FIELD_VALUE_REQUIRED"),
	CUSTOM_FIELD_VERSION_CONFLICT("CUSTOM_FIELD_VERSION_CONFLICT");

	private final String code;

	CustomFieldErrorCode(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

}
