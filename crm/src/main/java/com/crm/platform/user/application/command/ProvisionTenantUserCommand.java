package com.crm.platform.user.application.command;

import java.util.List;
import java.util.UUID;

public record ProvisionTenantUserCommand(
		String email,
		String displayName,
		String phone,
		String jobTitle,
		String employeeReference,
		List<UUID> roleIds,
		UUID teamId,
		boolean isTenantAdmin,
		boolean sendInviteEmail
) {}
