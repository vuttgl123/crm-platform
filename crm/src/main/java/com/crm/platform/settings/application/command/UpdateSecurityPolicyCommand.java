package com.crm.platform.settings.application.command;

public record UpdateSecurityPolicyCommand(
		boolean enableTwoFactor,
		String twoFactorEnforceScope,
		boolean enableAuditLog,
		int sessionTimeoutMinutes,
		int maxConcurrentSessions,
		boolean ipWhitelistEnabled,
		int passwordExpiryDays
) {}
