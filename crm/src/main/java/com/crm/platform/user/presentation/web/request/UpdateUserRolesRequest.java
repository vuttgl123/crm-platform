package com.crm.platform.user.presentation.web.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

public record UpdateUserRolesRequest(
		@NotEmpty List<UUID> roleIds
) {}
