package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateSecurityRequest(
		boolean enableTwoFactor,
		@Size(max = 50) String twoFactorEnforceScope,
		boolean enableAuditLog,
		@Min(5) @Max(480) int sessionTimeoutMinutes,
		@Min(1) @Max(20) int maxConcurrentSessions,
		boolean ipWhitelistEnabled,
		@Min(0) @Max(365) int passwordExpiryDays
) {}
