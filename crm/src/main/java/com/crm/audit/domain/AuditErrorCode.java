package com.crm.audit.domain;

import com.crm.sharedkernel.domain.ErrorCode;

public enum AuditErrorCode implements ErrorCode {

	AUDIT_EVENT_NOT_FOUND("audit.event_not_found"),
	DATA_ACCESS_EVENT_NOT_FOUND("audit.data_access_event_not_found");

	private final String key;

	AuditErrorCode(String key) {
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
