package com.crm.platform.access.application.command;

import java.util.List;
import java.util.Objects;

import com.crm.platform.access.domain.RoleId;
import com.crm.platform.access.domain.RoleStatus;

public record UpdateRoleCommand(
		RoleId roleId,
		long version,
		String name,
		String description,
		RoleStatus status,
		List<String> permissionCodes,
		List<RoleScopeInput> dataScopes) {

	public UpdateRoleCommand {
		Objects.requireNonNull(roleId, "roleId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
		permissionCodes = List.copyOf(Objects.requireNonNull(
				permissionCodes, "permissionCodes must not be null"));
		dataScopes = List.copyOf(Objects.requireNonNull(
				dataScopes, "dataScopes must not be null"));
	}

}
