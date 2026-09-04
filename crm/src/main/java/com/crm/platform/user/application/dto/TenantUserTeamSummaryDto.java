package com.crm.platform.user.application.dto;

import java.util.UUID;

public record TenantUserTeamSummaryDto(
		UUID id,
		String name,
		String memberRole,
		boolean isPrimary
) {}
