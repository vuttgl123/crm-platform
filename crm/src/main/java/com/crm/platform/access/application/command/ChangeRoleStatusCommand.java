package com.crm.platform.access.application.command;

import java.util.UUID;

import com.crm.platform.access.domain.RoleStatus;

public record ChangeRoleStatusCommand(
		UUID roleId,
		RoleStatus status
) {}
