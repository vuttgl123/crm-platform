package com.crm.customer.contact.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum ContactErrorCode implements ErrorCode {

	CONTACT_NOT_FOUND("CONTACT_NOT_FOUND", "contact.not_found"),
	CONTACT_NUMBER_ALREADY_EXISTS(
			"CONTACT_NUMBER_ALREADY_EXISTS",
			"contact.number_already_exists"),
	CONTACT_VERSION_CONFLICT(
			"CONTACT_VERSION_CONFLICT", "contact.version_conflict"),
	CONTACT_OWNER_INVALID(
			"CONTACT_OWNER_INVALID", "contact.owner_invalid"),
	CONTACT_ACCOUNT_INVALID(
			"CONTACT_ACCOUNT_INVALID", "contact.account_invalid");

	private final String value;
	private final String messageKey;

	ContactErrorCode(String value, String messageKey) {
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
