package com.crm.platform.settings.presentation.web;

import com.crm.platform.settings.application.command.AddIpWhitelistRuleCommand;
import com.crm.platform.settings.application.command.PatchConsolidatedSettingsCommand;
import com.crm.platform.settings.application.command.UpdateAlertRulesCommand;
import com.crm.platform.settings.application.command.UpdateAutomationRulesCommand;
import com.crm.platform.settings.application.command.UpdateBillingInfoCommand;
import com.crm.platform.settings.application.command.UpdateBusinessHoursCommand;
import com.crm.platform.settings.application.command.UpdateCurrencyRateCommand;
import com.crm.platform.settings.application.command.UpdateDigestScheduleCommand;
import com.crm.platform.settings.application.command.UpdateDocumentSequenceCommand;
import com.crm.platform.settings.application.command.UpdateLocalizationCommand;
import com.crm.platform.settings.application.command.UpdateNotificationGatewaysCommand;
import com.crm.platform.settings.application.command.UpdatePasswordPolicyCommand;
import com.crm.platform.settings.application.command.UpdateSecurityPolicyCommand;
import com.crm.platform.settings.application.command.UpdateTenantProfileCommand;
import org.springframework.stereotype.Component;

@Component
public final class TenantSettingsWebMapper {

	public UpdateTenantProfileCommand toCommand(UpdateProfileRequest r) {
		return new UpdateTenantProfileCommand(
				r.tenantName(), r.legalName(), r.taxCode(),
				r.contactEmail(), r.contactPhone(), r.address(),
				r.website(), r.logoUrl()
		);
	}

	public UpdateBillingInfoCommand toCommand(UpdateBillingInfoRequest r) {
		return new UpdateBillingInfoCommand(
				r.bankName(), r.bankAccountNumber(), r.bankAccountHolder(),
				r.swiftCode(), r.invoiceHeaderNote(), r.invoiceFooterNote()
		);
	}

	public UpdateLocalizationCommand toCommand(UpdateLocalizationRequest r) {
		return new UpdateLocalizationCommand(
				r.defaultCurrency(), r.supportedCurrencies(), r.defaultTimezone(),
				r.dateFormat(), r.timeFormat(), r.decimalSeparator(),
				r.thousandsSeparator(), r.fiscalYearStartMonth()
		);
	}

	public UpdateCurrencyRateCommand toCommand(AddCurrencyRequest r) {
		return new UpdateCurrencyRateCommand(
				r.currencyCode(), r.currencyName(), r.symbol(),
				r.exchangeRateToBase(), r.rateMode()
		);
	}

	public UpdateCurrencyRateCommand toCommand(String code, UpdateCurrencyRateRequest r) {
		return new UpdateCurrencyRateCommand(
				code, r.currencyName(), r.symbol(),
				r.exchangeRateToBase(), r.rateMode()
		);
	}

	public UpdateBusinessHoursCommand toCommand(UpdateBusinessHoursRequest r) {
		return new UpdateBusinessHoursCommand(
				r.timezone(), r.workDays(), r.startTime(),
				r.endTime(), r.holidayCalendarEnabled(), r.observedHolidays()
		);
	}

	public UpdateSecurityPolicyCommand toCommand(UpdateSecurityRequest r) {
		return new UpdateSecurityPolicyCommand(
				r.enableTwoFactor(), r.twoFactorEnforceScope(), r.enableAuditLog(),
				r.sessionTimeoutMinutes(), r.maxConcurrentSessions(),
				r.ipWhitelistEnabled(), r.passwordExpiryDays()
		);
	}

	public UpdatePasswordPolicyCommand toCommand(UpdatePasswordPolicyRequest r) {
		return new UpdatePasswordPolicyCommand(
				r.minLength(), r.requireUppercase(), r.requireLowercase(),
				r.requireNumbers(), r.requireSpecialChars(), r.maxFailedAttempts(),
				r.lockoutDurationMinutes(), r.passwordHistoryCount()
		);
	}

	public AddIpWhitelistRuleCommand toCommand(AddIpWhitelistRequest r) {
		return new AddIpWhitelistRuleCommand(r.cidrBlock(), r.description());
	}

	public UpdateAutomationRulesCommand toCommand(UpdateAutomationRequest r) {
		return new UpdateAutomationRulesCommand(
				r.autoAssignLeads(), r.routingStrategy(),
				r.defaultLeadOwnerUserId(), r.defaultLeadOwnerTeamId(),
				r.notifySlack(), r.dailyDigest(), r.digestTime(),
				r.autoTaskCreationOnNewLead(), r.staleDealThresholdDays()
		);
	}

	public UpdateAlertRulesCommand toCommand(UpdateAlertRulesRequest r) {
		return new UpdateAlertRulesCommand(
				r.highValueDealAlertEnabled(), r.highValueDealThreshold(),
				r.highValueNotificationChannels(), r.staleDealAlertEnabled(),
				r.staleDealInactivityDays(), r.churnRiskAlertEnabled()
		);
	}

	public UpdateNotificationGatewaysCommand toCommand(UpdateNotificationRequest r) {
		return new UpdateNotificationGatewaysCommand(
				r.customSmtpEnabled(), r.smtpHost(), r.smtpPort(),
				r.smtpUsername(), r.smtpPassword(), r.smtpSenderEmail(),
				r.smtpSenderName(), r.slackWebhookEnabled(), r.slackWebhookUrl(),
				r.slackChannel(), r.teamsWebhookEnabled(), r.teamsWebhookUrl(),
				r.inAppNotificationsEnabled()
		);
	}

	public UpdateDigestScheduleCommand toCommand(UpdateDigestScheduleRequest r) {
		return new UpdateDigestScheduleCommand(
				r.enabled(), r.frequency(), r.deliveryTime(),
				r.timezone(), r.recipientUserIds(), r.recipientEmails(),
				r.includedMetricKeys()
		);
	}

	public UpdateDocumentSequenceCommand toCommand(UpdateDocumentSequenceRequest r) {
		return new UpdateDocumentSequenceCommand(
				"", r.prefix(), r.dateFormatPattern(), r.paddingLength()
		);
	}

	public PatchConsolidatedSettingsCommand toCommand(PatchConsolidatedSettingsRequest r) {
		return new PatchConsolidatedSettingsCommand(
				r.profile() != null ? toCommand(r.profile()) : null,
				r.billingInfo() != null ? toCommand(r.billingInfo()) : null,
				r.localization() != null ? toCommand(r.localization()) : null,
				r.businessHours() != null ? toCommand(r.businessHours()) : null,
				r.security() != null ? toCommand(r.security()) : null,
				r.passwordPolicy() != null ? toCommand(r.passwordPolicy()) : null,
				r.automation() != null ? toCommand(r.automation()) : null,
				r.alertRules() != null ? toCommand(r.alertRules()) : null,
				r.notifications() != null ? toCommand(r.notifications()) : null,
				r.digest() != null ? toCommand(r.digest()) : null
		);
	}
}
