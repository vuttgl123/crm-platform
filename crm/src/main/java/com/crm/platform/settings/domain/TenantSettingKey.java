package com.crm.platform.settings.domain;

public enum TenantSettingKey {
	PROFILE("profile"),
	BILLING_INFO("billing_info"),
	LOCALIZATION("localization"),
	CURRENCIES("currencies"),
	BUSINESS_HOURS("business_hours"),
	SECURITY("security"),
	PASSWORD_POLICY("password_policy"),
	AUTOMATION("automation"),
	LEAD_ROUTING_RULES("lead_routing_rules"),
	ALERT_RULES("alert_rules"),
	NOTIFICATIONS("notifications"),
	DIGEST("digest"),
	DOCUMENT_SEQUENCES("document_sequences"),
	COMPLIANCE("compliance");

	private final String code;

	TenantSettingKey(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

	public static TenantSettingKey fromCode(String code) {
		for (TenantSettingKey key : values()) {
			if (key.code.equalsIgnoreCase(code)) {
				return key;
			}
		}
		throw new IllegalArgumentException("Unknown TenantSettingKey: " + code);
	}
}
