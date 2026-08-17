package com.crm.platform.team.domain;

import java.util.Objects;
import java.util.UUID;

public record RoleDataScopeId(UUID value) {

	public RoleDataScopeId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static RoleDataScopeId from(UUID value) {
		return new RoleDataScopeId(value);
	}

	public static RoleDataScopeId from(String value) {
		return new RoleDataScopeId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
