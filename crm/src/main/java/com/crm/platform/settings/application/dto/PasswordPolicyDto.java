package com.crm.platform.settings.application.dto;

public record PasswordPolicyDto(
		int minLength,
		boolean requireUppercase,
		boolean requireLowercase,
		boolean requireNumbers,
		boolean requireSpecialChars,
		int maxFailedAttempts,
		int lockoutDurationMinutes,
		int passwordHistoryCount
) {}
