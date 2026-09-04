package com.crm.platform.access.application.dto;

import java.util.List;

public record PermissionMatrixDto(
		List<ModuleGroup> modules,
		int totalPermissions
) {
	public record ModuleGroup(
			String moduleCode,
			String moduleName,
			List<PermissionItem> permissions
	) {}

	public record PermissionItem(
			String permissionCode,
			String description,
			String riskLevel
	) {}
}
