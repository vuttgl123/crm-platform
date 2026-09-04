package com.crm.platform.access.application.dto;

public record RoleStatsDto(
		long totalRoles,
		long systemRoles,
		long customRoles,
		long activeRoles,
		long totalPermissionsCatalog,
		long totalAssignedMembers
) {}
