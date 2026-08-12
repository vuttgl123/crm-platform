package com.crm.platform.access.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.access.domain.RoleStatus;

public record RoleSummaryResponse(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		long permissionCount,
		long dataScopeCount,
		Instant updatedAt,
		long version) {
}
