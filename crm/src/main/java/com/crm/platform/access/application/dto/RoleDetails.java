package com.crm.platform.access.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleStatus;

public record RoleDetails(
		UUID id,
		String roleCode,
		String name,
		String description,
		boolean system,
		RoleStatus status,
		List<String> permissionCodes,
		List<DataScopeDetails> dataScopes,
		Instant createdAt,
		Instant updatedAt,
		long version) {

	public RoleDetails {
		permissionCodes = List.copyOf(permissionCodes);
		dataScopes = List.copyOf(dataScopes);
	}

	public static RoleDetails from(Role role) {
		return new RoleDetails(
				role.id().value(), role.roleCode(), role.name(),
				role.description(), role.system(), role.status(),
				role.permissionCodes(),
				role.dataScopes().stream()
						.map(scope -> new DataScopeDetails(
								scope.entityType(), scope.type(), scope.teamId()))
						.toList(),
				role.createdAt(), role.updatedAt(), role.version());
	}

	public record DataScopeDetails(
			String entityType,
			DataScopeType type,
			UUID teamId) {
	}

}
