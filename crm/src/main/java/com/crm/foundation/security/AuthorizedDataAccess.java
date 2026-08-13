package com.crm.foundation.security;

import java.util.Objects;
import java.util.Set;

public record AuthorizedDataAccess(
		SystemPermission permission,
		String entityType,
		Set<ResolvedDataScope> scopes) {

	public AuthorizedDataAccess {
		Objects.requireNonNull(permission, "permission must not be null");
		Objects.requireNonNull(entityType, "entityType must not be null");
		Objects.requireNonNull(scopes, "scopes must not be null");
		scopes = Set.copyOf(scopes);
		if (scopes.isEmpty()) {
			throw new IllegalArgumentException("scopes must not be empty");
		}
	}

}
