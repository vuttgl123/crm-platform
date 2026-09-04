package com.crm.platform.user.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TenantUserDetailsDto(
		UUID id,
		String email,
		String displayName,
		String phone,
		String jobTitle,
		String employeeReference,
		String status,
		boolean isTenantAdmin,
		List<TenantUserRoleSummaryDto> roles,
		List<TenantUserTeamSummaryDto> teams,
		List<String> permissionCodes,
		Instant joinedAt,
		Instant lastLoginAt,
		Instant updatedAt,
		UUID updatedBy,
		long version
) {}
