package com.crm.platform.tenant.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.tenant.domain.Tenant;
import com.crm.platform.tenant.domain.TenantStatus;

public record TenantDetails(
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

	public static TenantDetails from(Tenant tenant) {
		return new TenantDetails(
				tenant.id().value(),
				tenant.tenantCode(),
				tenant.legalName(),
				tenant.displayName(),
				tenant.status(),
				tenant.defaultCurrencyCode(),
				tenant.defaultCountryCode(),
				tenant.defaultLanguageCode(),
				tenant.defaultTimezone(),
				true,
				tenant.createdAt(),
				tenant.version());
	}

}
