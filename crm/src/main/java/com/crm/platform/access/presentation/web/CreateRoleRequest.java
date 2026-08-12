package com.crm.platform.access.presentation.web;

import java.util.List;
import java.util.Locale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRoleRequest(
		@NotBlank @Size(max = 191)
		@Pattern(regexp = "^[A-Z][A-Z0-9_]*$")
		String roleCode,
		@NotBlank @Size(max = 255) String name,
		@Size(max = 4000) String description,
		List<@NotBlank @Size(max = 191) String> permissionCodes,
		List<@Valid RoleDataScopeRequest> dataScopes) {

	public CreateRoleRequest {
		if (roleCode != null) {
			roleCode = roleCode.trim().toUpperCase(Locale.ROOT);
		}
		permissionCodes = RoleRequestCollections.permissionCodes(
				permissionCodes);
		dataScopes = RoleRequestCollections.dataScopes(dataScopes);
	}

}
