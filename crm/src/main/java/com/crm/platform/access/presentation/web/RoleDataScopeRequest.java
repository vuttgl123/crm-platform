package com.crm.platform.access.presentation.web;

import java.util.Locale;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.foundation.security.DataScopeType;

public record RoleDataScopeRequest(
		@NotBlank @Size(max = 191)
		@Pattern(regexp = "^[A-Z][A-Z0-9_]*$")
		String entityType,
		@NotNull DataScopeType type,
		UUID teamId) {

	public RoleDataScopeRequest {
		if (entityType != null) {
			entityType = entityType.trim().toUpperCase(Locale.ROOT);
		}
	}

}
