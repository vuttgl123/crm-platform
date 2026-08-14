package com.crm.customer.opportunity.domain;

import com.crm.sharedkernel.domain.ErrorCode;

public enum OpportunityErrorCode implements ErrorCode {

	OPPORTUNITY_NOT_FOUND("opportunity.not_found"),
	OPPORTUNITY_NUMBER_ALREADY_EXISTS("opportunity.number_already_exists"),
	OPPORTUNITY_VERSION_CONFLICT("opportunity.version_conflict"),
	OPPORTUNITY_ACCOUNT_INVALID("opportunity.account_invalid"),
	OPPORTUNITY_PIPELINE_INVALID("opportunity.pipeline_invalid"),
	OPPORTUNITY_STAGE_INVALID("opportunity.stage_invalid"),
	OPPORTUNITY_CONTACT_INVALID("opportunity.contact_invalid"),
	OPPORTUNITY_OWNER_INVALID("opportunity.owner_invalid"),
	OPPORTUNITY_LOST_REASON_REQUIRED("opportunity.lost_reason_required");

	private final String key;

	OpportunityErrorCode(String key) {
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
