package com.crm.platform.user.presentation.web.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
		@NotBlank @Size(max = 255) String displayName,
		@Size(max = 50) String phone,
		@Size(max = 100) String jobTitle,
		@Size(max = 50) String employeeReference,
		UUID primaryTeamId,
		boolean isTenantAdmin,
		long version
) {}
