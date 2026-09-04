package com.crm.platform.settings.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum TenantSettingsErrorCode implements ErrorCode {

	SETTING_NOT_FOUND("SETTING_NOT_FOUND", "settings.not_found"),
	INVALID_SETTING_PAYLOAD("INVALID_SETTING_PAYLOAD", "settings.invalid_payload"),
	SETTINGS_VERSION_CONFLICT("SETTINGS_VERSION_CONFLICT", "settings.version_conflict"),
	INVALID_CIDR_BLOCK("INVALID_CIDR_BLOCK", "settings.invalid_cidr_block"),
	IP_WHITELIST_RULE_NOT_FOUND("IP_WHITELIST_RULE_NOT_FOUND", "settings.ip_whitelist_rule_not_found"),
	DOCUMENT_SEQUENCE_NOT_FOUND("DOCUMENT_SEQUENCE_NOT_FOUND", "settings.document_sequence_not_found"),
	CURRENCY_NOT_SUPPORTED("CURRENCY_NOT_SUPPORTED", "settings.currency_not_supported"),
	CURRENCY_ALREADY_EXISTS("CURRENCY_ALREADY_EXISTS", "settings.currency_already_exists"),
	INVALID_EXCHANGE_RATE("INVALID_EXCHANGE_RATE", "settings.invalid_exchange_rate");

	private final String value;
	private final String messageKey;

	TenantSettingsErrorCode(String value, String messageKey) {
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
