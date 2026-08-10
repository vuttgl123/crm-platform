package com.crm.platform.tenant.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BootstrapTenantRequest(
		@NotBlank @Size(max = 320) String tenantCode,
		@NotBlank @Size(max = 255) String legalName,
		@NotBlank @Size(max = 255) String displayName,
		@NotBlank @Pattern(regexp = "^[A-Z]{3}$")
		String defaultCurrencyCode,
		@NotBlank @Pattern(regexp = "^[A-Z]{2}$")
		String defaultCountryCode,
		@Size(max = 10)
		@Pattern(regexp = "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$")
		String defaultLanguageCode,
		@Size(max = 255) @ValidZoneId String defaultTimezone) {

	public BootstrapTenantRequest {
		if (defaultLanguageCode == null) {
			defaultLanguageCode = "en";
		}
		if (defaultTimezone == null) {
			defaultTimezone = "UTC";
		}
	}

}
