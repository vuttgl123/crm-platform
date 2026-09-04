package com.crm.platform.access.application.command;

import java.util.UUID;

public record CloneRoleCommand(
		UUID sourceRoleId,
		String newRoleCode,
		String newName,
		String description
) {}
