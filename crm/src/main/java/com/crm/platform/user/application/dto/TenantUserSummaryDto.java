package com.crm.platform.user.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TenantUserSummaryDto(
		UUID id,
		String email,
		String displayName,
		String phone,
		String jobTitle,
		String employeeReference,
		String status,
		boolean isTenantAdmin,
		List<TenantUserRoleSummaryDto> roles,
		TenantUserTeamSummaryDto primaryTeam,
		Instant joinedAt,
		Instant lastLoginAt,
		long version
) {}
