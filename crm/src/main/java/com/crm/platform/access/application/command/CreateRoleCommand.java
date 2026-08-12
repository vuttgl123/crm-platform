package com.crm.platform.access.application.command;

import java.util.List;
import java.util.Objects;

public record CreateRoleCommand(
		String roleCode,
		String name,
		String description,
		List<String> permissionCodes,
		List<RoleScopeInput> dataScopes) {

	public CreateRoleCommand {
		permissionCodes = List.copyOf(Objects.requireNonNull(
				permissionCodes, "permissionCodes must not be null"));
		dataScopes = List.copyOf(Objects.requireNonNull(
				dataScopes, "dataScopes must not be null"));
	}

}
