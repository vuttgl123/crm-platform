package com.crm.customer.lead.domain;

import com.crm.sharedkernel.domain.ErrorCode;

public enum LeadErrorCode implements ErrorCode {

	LEAD_NOT_FOUND("lead.not_found"),
	LEAD_NUMBER_ALREADY_EXISTS("lead.number_already_exists"),
	LEAD_VERSION_CONFLICT("lead.version_conflict"),
	LEAD_OWNER_INVALID("lead.owner_invalid"),
	LEAD_STATUS_INVALID("lead.status_invalid"),
	LEAD_SOURCE_INVALID("lead.source_invalid"),
	LEAD_ALREADY_CONVERTED("lead.already_converted"),
	LEAD_CONVERSION_INVALID("lead.conversion_invalid");

	private final String key;

	LeadErrorCode(String key) {
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
