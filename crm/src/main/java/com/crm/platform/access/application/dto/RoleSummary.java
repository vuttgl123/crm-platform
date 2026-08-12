package com.crm.platform.access.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.access.domain.RoleStatus;

public record RoleSummary(
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
