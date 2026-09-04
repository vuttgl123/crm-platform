package com.crm.platform.settings.application.command;

public record UpdatePasswordPolicyCommand(
		int minLength,
		boolean requireUppercase,
		boolean requireLowercase,
		boolean requireNumbers,
		boolean requireSpecialChars,
		int maxFailedAttempts,
		int lockoutDurationMinutes,
		int passwordHistoryCount
) {}
