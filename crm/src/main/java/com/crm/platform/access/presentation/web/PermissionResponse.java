package com.crm.platform.access.presentation.web;

public record PermissionResponse(
		String permissionCode,
		String description,
		String moduleCode,
		String riskLevel) {
}
