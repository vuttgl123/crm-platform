package com.crm.platform.settings.application.command;

public record UpdateTenantProfileCommand(
		String tenantName,
		String legalName,
		String taxCode,
		String contactEmail,
		String contactPhone,
		String address,
		String website,
		String logoUrl
) {}
