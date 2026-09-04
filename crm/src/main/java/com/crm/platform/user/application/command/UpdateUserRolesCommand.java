package com.crm.platform.user.application.command;

import java.util.List;
import java.util.UUID;

public record UpdateUserRolesCommand(
		UUID userId,
		List<UUID> roleIds
) {}
