package com.crm.platform.settings.application.dto;

public record TenantProfileDto(
		String tenantName,
		String legalName,
		String taxCode,
		String contactEmail,
		String contactPhone,
		String address,
		String website,
		String logoUrl
) {}
