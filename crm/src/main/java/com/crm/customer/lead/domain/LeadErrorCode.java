package com.crm.customer.lead.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum LeadErrorCode implements ErrorCode {

	LEAD_NOT_FOUND("LEAD_NOT_FOUND", "lead.not_found"),
	LEAD_NUMBER_ALREADY_EXISTS(
			"LEAD_NUMBER_ALREADY_EXISTS", "lead.number_already_exists"),
	LEAD_VERSION_CONFLICT(
			"LEAD_VERSION_CONFLICT", "lead.version_conflict"),
	LEAD_OWNER_INVALID(
			"LEAD_OWNER_INVALID", "lead.owner_invalid"),
	LEAD_STATUS_INVALID(
			"LEAD_STATUS_INVALID", "lead.status_invalid"),
	LEAD_SOURCE_INVALID(
			"LEAD_SOURCE_INVALID", "lead.source_invalid"),
	LEAD_ALREADY_CONVERTED(
			"LEAD_ALREADY_CONVERTED", "lead.already_converted"),
	LEAD_CONVERSION_INVALID(
			"LEAD_CONVERSION_INVALID", "lead.conversion_invalid");

	private final String value;
	private final String messageKey;

	LeadErrorCode(String value, String messageKey) {
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
