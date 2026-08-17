package com.crm.customer.tag.domain;

public enum TagErrorCode {

	TAG_NOT_FOUND("TAG_NOT_FOUND"),
	TAG_KEY_ALREADY_EXISTS("TAG_KEY_ALREADY_EXISTS"),
	TAG_ALREADY_ASSIGNED("TAG_ALREADY_ASSIGNED"),
	ENTITY_TAG_NOT_FOUND("ENTITY_TAG_NOT_FOUND"),
	INVALID_TAG_TARGET("INVALID_TAG_TARGET"),
	TAG_VERSION_CONFLICT("TAG_VERSION_CONFLICT");

	private final String code;

	TagErrorCode(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

}
