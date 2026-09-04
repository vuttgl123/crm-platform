package com.crm.platform.access.application.command;

import java.util.UUID;

public record ReassignRoleMembersCommand(
		UUID sourceRoleId,
		UUID targetRoleId
) {}
