package com.crm.platform.user.application.dto;

public record TenantUserStatsDto(
		long totalMembers,
		long activeMembers,
		long suspendedMembers,
		long invitedMembers,
		long tenantAdmins,
		long pendingJoinRequests
) {}
