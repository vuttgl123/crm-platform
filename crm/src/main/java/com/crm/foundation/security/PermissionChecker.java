package com.crm.foundation.security;

public interface PermissionChecker {

	boolean hasPermission(String permission);

	void requirePermission(String permission);

}
