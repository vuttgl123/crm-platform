package com.crm.platform.access.presentation.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CloneRoleRequest(
		@NotBlank @Size(max = 64) @Pattern(regexp = "^[A-Z0-9_]+$") String newRoleCode,
		@NotBlank @Size(max = 255) String newName,
		@Size(max = 1000) String description
) {}
