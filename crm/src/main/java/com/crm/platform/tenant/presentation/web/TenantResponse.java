package com.crm.platform.tenant.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.tenant.domain.TenantStatus;

public record TenantResponse(
		UUID id,
		String tenantCode,
		String legalName,
		String displayName,
		TenantStatus status,
		String defaultCurrencyCode,
		String defaultCountryCode,
		String defaultLanguageCode,
		String defaultTimezone,
		boolean tenantAdmin,
		Instant createdAt,
		long version) {
}
