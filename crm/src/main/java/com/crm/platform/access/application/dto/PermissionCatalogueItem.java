package com.crm.platform.access.application.dto;

public record PermissionCatalogueItem(
		String permissionCode,
		String description,
		String moduleCode,
		String riskLevel) {
}
