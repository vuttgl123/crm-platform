package com.crm.platform.access.presentation.web;

import java.util.List;

import com.crm.platform.access.application.usecase.RoleManagementFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/permissions")
public final class PermissionCatalogueController {

	private final RoleManagementFacade roles;
	private final RoleWebMapper mapper;

	public PermissionCatalogueController(
			RoleManagementFacade roles, RoleWebMapper mapper) {
		this.roles = roles;
		this.mapper = mapper;
	}

	@GetMapping
	public List<PermissionResponse> list() {
		return roles.permissions().stream()
				.map(mapper::toPermissionResponse)
				.toList();
	}

}
