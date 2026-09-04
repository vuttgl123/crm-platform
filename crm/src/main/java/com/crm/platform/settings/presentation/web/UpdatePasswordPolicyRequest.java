package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdatePasswordPolicyRequest(
		@Min(6) @Max(128) int minLength,
		boolean requireUppercase,
		boolean requireLowercase,
		boolean requireNumbers,
		boolean requireSpecialChars,
		@Min(1) @Max(10) int maxFailedAttempts,
		@Min(1) @Max(1440) int lockoutDurationMinutes,
		@Min(0) @Max(24) int passwordHistoryCount
) {}
