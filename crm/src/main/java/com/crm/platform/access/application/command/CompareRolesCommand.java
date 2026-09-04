package com.crm.platform.access.application.command;

import java.util.List;
import java.util.UUID;

public record CompareRolesCommand(
		List<UUID> roleIds
) {}
