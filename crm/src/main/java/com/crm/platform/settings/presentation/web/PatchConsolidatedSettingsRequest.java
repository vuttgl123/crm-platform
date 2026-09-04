package com.crm.platform.settings.presentation.web;

import jakarta.validation.Valid;

public record PatchConsolidatedSettingsRequest(
		@Valid UpdateProfileRequest profile,
		@Valid UpdateBillingInfoRequest billingInfo,
		@Valid UpdateLocalizationRequest localization,
		@Valid UpdateBusinessHoursRequest businessHours,
		@Valid UpdateSecurityRequest security,
		@Valid UpdatePasswordPolicyRequest passwordPolicy,
		@Valid UpdateAutomationRequest automation,
		@Valid UpdateAlertRulesRequest alertRules,
		@Valid UpdateNotificationRequest notifications,
		@Valid UpdateDigestScheduleRequest digest
) {}
