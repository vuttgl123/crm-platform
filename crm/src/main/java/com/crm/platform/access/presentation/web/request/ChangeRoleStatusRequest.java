package com.crm.platform.access.presentation.web.request;

import jakarta.validation.constraints.NotNull;
import com.crm.platform.access.domain.RoleStatus;

public record ChangeRoleStatusRequest(
		@NotNull RoleStatus status
) {}
