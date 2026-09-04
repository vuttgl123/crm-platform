package com.crm.platform.settings.application.command;

public record PatchConsolidatedSettingsCommand(
		UpdateTenantProfileCommand profile,
		UpdateBillingInfoCommand billingInfo,
		UpdateLocalizationCommand localization,
		UpdateBusinessHoursCommand businessHours,
		UpdateSecurityPolicyCommand security,
		UpdatePasswordPolicyCommand passwordPolicy,
		UpdateAutomationRulesCommand automation,
		UpdateAlertRulesCommand alertRules,
		UpdateNotificationGatewaysCommand notifications,
		UpdateDigestScheduleCommand digest
) {}
