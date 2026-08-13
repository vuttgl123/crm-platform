package com.crm.platform.membership.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum MembershipRequestErrorCode implements ErrorCode {

	TENANT_NOT_AVAILABLE(
			"TENANT_NOT_AVAILABLE", "membership.tenant_not_available"),
	MEMBERSHIP_REQUEST_NOT_FOUND(
			"MEMBERSHIP_REQUEST_NOT_FOUND", "membership.request_not_found"),
	MEMBERSHIP_REQUEST_ALREADY_PENDING(
			"MEMBERSHIP_REQUEST_ALREADY_PENDING",
			"membership.request_already_pending"),
	MEMBERSHIP_ALREADY_EXISTS(
			"MEMBERSHIP_ALREADY_EXISTS", "membership.already_exists"),
	MEMBERSHIP_REQUEST_ALREADY_RESOLVED(
			"MEMBERSHIP_REQUEST_ALREADY_RESOLVED",
			"membership.request_already_resolved"),
	MEMBERSHIP_REQUEST_VERSION_CONFLICT(
			"MEMBERSHIP_REQUEST_VERSION_CONFLICT",
			"membership.request_version_conflict"),
	MEMBERSHIP_ROLE_INVALID(
			"MEMBERSHIP_ROLE_INVALID", "membership.role_invalid");

	private final String value;
	private final String messageKey;

	MembershipRequestErrorCode(String value, String messageKey) {
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
