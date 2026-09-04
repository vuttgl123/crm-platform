package com.crm.platform.access.presentation.web.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record ReassignRoleMembersRequest(
		@NotNull UUID targetRoleId
) {}
