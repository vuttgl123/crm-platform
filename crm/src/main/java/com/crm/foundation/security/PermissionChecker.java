package com.crm.foundation.security;

public interface PermissionChecker {

	boolean hasPermission(SystemPermission permission);

	void requirePermission(SystemPermission permission);

}
