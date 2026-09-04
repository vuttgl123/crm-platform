package com.crm.platform.access.presentation.web.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record CompareRolesRequest(
		@NotEmpty @Size(min = 2, max = 5) List<UUID> roleIds
) {}
