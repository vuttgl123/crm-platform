package com.crm.platform.access.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum RoleErrorCode implements ErrorCode {

	ROLE_NOT_FOUND("ROLE_NOT_FOUND", "role.not_found"),
	ROLE_CODE_ALREADY_EXISTS(
			"ROLE_CODE_ALREADY_EXISTS", "role.code_already_exists"),
	SYSTEM_ROLE_IMMUTABLE(
			"SYSTEM_ROLE_IMMUTABLE", "role.system_immutable"),
	ROLE_VERSION_CONFLICT(
			"ROLE_VERSION_CONFLICT", "role.version_conflict"),
	ROLE_PERMISSION_UNKNOWN(
			"ROLE_PERMISSION_UNKNOWN", "role.permission_unknown"),
	ROLE_DATA_SCOPE_INVALID(
			"ROLE_DATA_SCOPE_INVALID", "role.data_scope_invalid");

	private final String value;
	private final String messageKey;

	RoleErrorCode(String value, String messageKey) {
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
