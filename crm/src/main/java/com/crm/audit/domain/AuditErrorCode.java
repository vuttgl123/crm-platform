package com.crm.audit.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum AuditErrorCode implements ErrorCode {

	AUDIT_EVENT_NOT_FOUND("AUDIT_EVENT_NOT_FOUND", "audit.event_not_found"),
	DATA_ACCESS_EVENT_NOT_FOUND("DATA_ACCESS_EVENT_NOT_FOUND", "audit.data_access_event_not_found");

	private final String value;
	private final String messageKey;

	AuditErrorCode(String value, String messageKey) {
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
