package com.crm.platform.access.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;
import com.crm.platform.access.domain.RoleStatus;

public record RoleResponse(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		List<String> permissionCodes,
		List<DataScope> dataScopes,
		Instant createdAt,
		Instant updatedAt,
		long version) {

	public RoleResponse {
		permissionCodes = List.copyOf(permissionCodes);
		dataScopes = List.copyOf(dataScopes);
	}

	public record DataScope(
			String entityType,
			DataScopeType type,
			UUID teamId) {
	}

}
