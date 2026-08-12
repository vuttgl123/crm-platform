package com.crm.platform.access.application.command;

import java.util.Objects;

import com.crm.platform.access.domain.RoleId;

public record DeleteRoleCommand(RoleId roleId, long version) {

	public DeleteRoleCommand {
		Objects.requireNonNull(roleId, "roleId must not be null");
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
