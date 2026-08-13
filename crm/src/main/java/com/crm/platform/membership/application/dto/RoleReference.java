package com.crm.platform.membership.application.dto;

import java.util.Objects;
import java.util.UUID;

public record RoleReference(
		UUID id,
		String roleCode,
		String name) {

	public RoleReference {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(roleCode, "roleCode must not be null");
		Objects.requireNonNull(name, "name must not be null");
	}

}
