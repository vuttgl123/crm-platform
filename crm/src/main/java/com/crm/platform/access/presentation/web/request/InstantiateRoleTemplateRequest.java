package com.crm.platform.access.presentation.web.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InstantiateRoleTemplateRequest(
		@Size(max = 64) @Pattern(regexp = "^[A-Z0-9_]*$") String customRoleCode,
		@Size(max = 255) String customName
) {}
