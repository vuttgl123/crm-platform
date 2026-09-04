package com.crm.platform.settings.application.dto;

public record SecuritySettingsDto(
		boolean enableTwoFactor,
		String twoFactorEnforceScope, // ALL_USERS, ADMINS_ONLY, OPTIONAL
		boolean enableAuditLog,
		int sessionTimeoutMinutes,
		int maxConcurrentSessions,
		boolean ipWhitelistEnabled,
		int passwordExpiryDays
) {}
