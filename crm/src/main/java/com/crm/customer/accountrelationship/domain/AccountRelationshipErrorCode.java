package com.crm.customer.accountrelationship.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum AccountRelationshipErrorCode implements ErrorCode {

	ACCOUNT_RELATIONSHIP_NOT_FOUND(
			"ACCOUNT_RELATIONSHIP_NOT_FOUND", "account_relationship.not_found"),
	ACCOUNT_RELATIONSHIP_ALREADY_EXISTS(
			"ACCOUNT_RELATIONSHIP_ALREADY_EXISTS",
			"account_relationship.already_exists"),
	ACCOUNT_RELATIONSHIP_ALREADY_ENDED(
			"ACCOUNT_RELATIONSHIP_ALREADY_ENDED",
			"account_relationship.already_ended"),
	ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID(
			"ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID",
			"account_relationship.account_invalid"),
	ACCOUNT_RELATIONSHIP_SELF_REFERENCE(
			"ACCOUNT_RELATIONSHIP_SELF_REFERENCE",
			"account_relationship.self_reference"),
	ACCOUNT_RELATIONSHIP_PERIOD_INVALID(
			"ACCOUNT_RELATIONSHIP_PERIOD_INVALID",
			"account_relationship.period_invalid");

	private final String value;
	private final String messageKey;

	AccountRelationshipErrorCode(String value, String messageKey) {
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
