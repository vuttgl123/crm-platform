package com.crm.platform.team.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import com.crm.platform.team.domain.DataScopeType;

public record CreateRoleDataScopeRequest(
		@NotBlank(message = "Entity type must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Entity type must be 2-50 alphanumeric characters or underscores")
		String entityType,

		@NotNull(message = "Scope type is required")
		DataScopeType scopeType,

		UUID teamId
) {
}
