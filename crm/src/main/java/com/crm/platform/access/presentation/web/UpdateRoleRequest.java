package com.crm.platform.access.presentation.web;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.platform.access.domain.RoleStatus;

public record UpdateRoleRequest(
		@NotNull @Positive Long version,
		@NotBlank @Size(max = 255) String name,
		@Size(max = 4000) String description,
		@NotNull RoleStatus status,
		List<@NotBlank @Size(max = 191) String> permissionCodes,
		List<@Valid RoleDataScopeRequest> dataScopes) {

	public UpdateRoleRequest {
		permissionCodes = RoleRequestCollections.permissionCodes(
				permissionCodes);
		dataScopes = RoleRequestCollections.dataScopes(dataScopes);
	}

}
