package com.crm.platform.access.application.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RoleComparisonResultDto(
		List<RoleHeader> roles,
		List<String> commonPermissions,
		List<PermissionDiff> permissionDifferences,
		List<DataScopeDiff> dataScopeDifferences
) {
	public record RoleHeader(UUID id, String roleCode, String name, boolean system) {}

	public record PermissionDiff(
			String permissionCode,
			String description,
			String moduleCode,
			String riskLevel,
			List<UUID> grantedInRoleIds
	) {}

	public record DataScopeDiff(
			String entityType,
			Map<UUID, String> scopesByRoleId
	) {}
}
