package com.crm.platform.tenant.application.command;

public record BootstrapTenantCommand(
		String tenantCode,
		String legalName,
		String displayName,
		String defaultCurrencyCode,
		String defaultCountryCode,
		String defaultLanguageCode,
		String defaultTimezone) {
}
