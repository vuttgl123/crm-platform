package com.crm.platform.user.presentation.web.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProvisionUserRequest(
		@NotBlank @Email @Size(max = 320) String email,
		@NotBlank @Size(max = 255) String displayName,
		@Size(max = 50) String phone,
		@Size(max = 100) String jobTitle,
		@Size(max = 50) String employeeReference,
		List<UUID> roleIds,
		UUID teamId,
		boolean isTenantAdmin,
		boolean sendInviteEmail
) {}
