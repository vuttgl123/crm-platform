package com.crm.platform.access.application.dto;

import java.util.List;

public record RoleTemplateDto(
		String templateCode,
		String name,
		String description,
		String recommendedFor,
		List<String> defaultPermissionCodes,
		int permissionCount
) {}
