package com.crm.platform.user.application.dto;

import java.util.UUID;

public record TenantUserRoleSummaryDto(
		UUID id,
		String roleCode,
		String name
) {}
