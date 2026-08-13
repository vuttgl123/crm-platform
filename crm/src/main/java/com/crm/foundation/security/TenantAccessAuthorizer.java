package com.crm.foundation.security;

import java.util.Set;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public final class TenantAccessAuthorizer {

	private final PermissionChecker permissionChecker;
	private final DataScopeResolver dataScopeResolver;

	public TenantAccessAuthorizer(PermissionChecker permissionChecker,
			DataScopeResolver dataScopeResolver) {
		this.permissionChecker = permissionChecker;
		this.dataScopeResolver = dataScopeResolver;
	}

	public AuthorizedDataAccess authorize(SystemPermission permission,
			String entityType) {
		permissionChecker.requirePermission(permission);
		Set<ResolvedDataScope> scopes = dataScopeResolver.resolve(entityType);
		if (scopes.isEmpty()) {
			throw new AccessDeniedException("Required data scope is missing");
		}
		return new AuthorizedDataAccess(permission, entityType, scopes);
	}

}
