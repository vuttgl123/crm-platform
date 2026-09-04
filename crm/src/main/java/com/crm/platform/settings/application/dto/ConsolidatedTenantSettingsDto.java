package com.crm.platform.settings.application.dto;

import java.time.Instant;
import java.util.UUID;

public record ConsolidatedTenantSettingsDto(
		UUID tenantId,
		String tenantCode,
		TenantProfileDto profile,
		BillingInfoDto billingInfo,
		LocalizationSettingsDto localization,
		BusinessHoursDto businessHours,
		SecuritySettingsDto security,
		PasswordPolicyDto passwordPolicy,
		AutomationSettingsDto automation,
		AlertRulesDto alertRules,
		NotificationSettingsDto notifications,
		DigestScheduleDto digest,
		long version,
		Instant updatedAt
) {}
