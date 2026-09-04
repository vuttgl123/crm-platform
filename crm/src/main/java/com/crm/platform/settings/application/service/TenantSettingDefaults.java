package com.crm.platform.settings.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.platform.settings.application.dto.AlertRulesDto;
import com.crm.platform.settings.application.dto.AutomationSettingsDto;
import com.crm.platform.settings.application.dto.BillingInfoDto;
import com.crm.platform.settings.application.dto.BusinessHoursDto;
import com.crm.platform.settings.application.dto.CurrencyRateDto;
import com.crm.platform.settings.application.dto.DigestScheduleDto;
import com.crm.platform.settings.application.dto.DocumentSequenceDto;
import com.crm.platform.settings.application.dto.LeadRoutingRuleDto;
import com.crm.platform.settings.application.dto.LocalizationSettingsDto;
import com.crm.platform.settings.application.dto.NotificationSettingsDto;
import com.crm.platform.settings.application.dto.PasswordPolicyDto;
import com.crm.platform.settings.application.dto.SecuritySettingsDto;
import com.crm.platform.settings.application.dto.TenantProfileDto;

/**
 * Fallback values returned for a tenant that has never saved a settings
 * section. These are what the settings screen renders on a fresh tenant, so
 * changing a value here changes what a customer sees before their first save.
 */
final class TenantSettingDefaults {

	private TenantSettingDefaults() {
	}

	static TenantProfileDto profile() {
		return new TenantProfileDto(
				"Acme Global CRM",
				"Acme Corporation JSC",
				"0109988776",
				"contact@acme-global.com",
				"+84 24 3999 8888",
				"Floor 18, Keangnam Landmark 72, Hanoi, Vietnam",
				"https://acme-global.com",
				null
		);
	}

	static BillingInfoDto billingInfo() {
		return new BillingInfoDto(
				"Vietcombank (VCB)",
				"0011004455667",
				"ACME GLOBAL JSC",
				"BFTVVNVX",
				"Thank you for choosing Acme CRM platform.",
				"All payments are due within 30 days of invoice date."
		);
	}

	static LocalizationSettingsDto localization() {
		return new LocalizationSettingsDto(
				"VND",
				List.of("VND", "USD", "EUR"),
				"Asia/Ho_Chi_Minh",
				"YYYY-MM-DD",
				"24H",
				".",
				",",
				1
		);
	}

	static List<CurrencyRateDto> currencies(Instant now) {
		return List.of(
				new CurrencyRateDto("VND", "Vietnam Dong", "₫", BigDecimal.ONE, "MANUAL", now),
				new CurrencyRateDto("USD", "US Dollar", "$", new BigDecimal("25450"), "MANUAL", now),
				new CurrencyRateDto("EUR", "Euro", "€", new BigDecimal("27500"), "MANUAL", now)
		);
	}

	static BusinessHoursDto businessHours() {
		return new BusinessHoursDto(
				"Asia/Ho_Chi_Minh",
				List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
				"08:30",
				"17:30",
				true,
				List.of("NEW_YEAR", "LUNAR_NEW_YEAR", "INDEPENDENCE_DAY")
		);
	}

	static SecuritySettingsDto security() {
		return new SecuritySettingsDto(true, "ADMINS_ONLY", true, 30, 3, false, 90);
	}

	static PasswordPolicyDto passwordPolicy() {
		return new PasswordPolicyDto(8, true, true, true, false, 5, 15, 3);
	}

	static AutomationSettingsDto automation() {
		return new AutomationSettingsDto(true, "ROUND_ROBIN", null, null, true, true, "18:00", true, 14);
	}

	static List<LeadRoutingRuleDto> routingRules() {
		return List.of(
				new LeadRoutingRuleDto(UUID.randomUUID(), "VIP High Value Routing", 1, "ANNUAL_REVENUE", "GREATER_THAN", "500000000", null, null, true),
				new LeadRoutingRuleDto(UUID.randomUUID(), "North Region Inbound", 2, "COUNTRY", "EQUALS", "VN", null, null, true)
		);
	}

	static AlertRulesDto alertRules() {
		return new AlertRulesDto(true, new BigDecimal("100000000"), List.of("SLACK", "EMAIL"), true, 14, true);
	}

	static NotificationSettingsDto notifications() {
		return new NotificationSettingsDto(false, "smtp.mailgun.org", 587, "postmaster@acme.com", "alerts@acme.com", "Acme CRM Bot", true, "https://hooks.slack.com/services/sample/webhook", "#sales-alerts", false, null, true);
	}

	static DigestScheduleDto digest() {
		return new DigestScheduleDto(true, "DAILY", "18:00", "Asia/Ho_Chi_Minh", List.of(), List.of("exec@acme.com"), List.of("DEALS_WON", "LEADS_CREATED", "REVENUE_GENERATED"));
	}

	static List<DocumentSequenceDto> documentSequences(Instant now) {
		return List.of(
				new DocumentSequenceDto("LEAD", "LEA-", "YYYYMM", 5, 42L, "LEA-202608-00043", now),
				new DocumentSequenceDto("CONTACT", "CON-", "YYYYMM", 5, 88L, "CON-202608-00089", now),
				new DocumentSequenceDto("ACCOUNT", "ACC-", "YYYYMM", 5, 25L, "ACC-202608-00026", now),
				new DocumentSequenceDto("QUOTE", "QTE-", "YYYYMM", 4, 15L, "QTE-202608-0016", now),
				new DocumentSequenceDto("ORDER", "ORD-", "YYYYMM", 4, 9L, "ORD-202608-0010", now),
				new DocumentSequenceDto("CONTRACT", "CTR-", "YYYY", 4, 5L, "CTR-2026-0006", now),
				new DocumentSequenceDto("TICKET", "TCK-", "YYYYMM", 5, 120L, "TCK-202608-00121", now)
		);
	}
}
