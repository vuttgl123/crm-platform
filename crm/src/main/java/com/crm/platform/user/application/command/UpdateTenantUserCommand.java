package com.crm.platform.user.application.command;

import java.util.UUID;

public record UpdateTenantUserCommand(
		UUID userId,
		String displayName,
		String phone,
		String jobTitle,
		String employeeReference,
		UUID primaryTeamId,
		boolean isTenantAdmin,
		long version
) {}
