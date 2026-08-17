package com.crm.platform.team.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.application.usecase.RoleDataScopeFacade;
import com.crm.platform.team.domain.RoleDataScopeId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/roles/{roleId}/scopes")
public final class RoleDataScopeController {

	private final RoleDataScopeFacade scopes;
	private final RoleDataScopeWebMapper mapper;

	public RoleDataScopeController(RoleDataScopeFacade scopes, RoleDataScopeWebMapper mapper) {
		this.scopes = scopes;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<RoleDataScopeResponse> create(
			@PathVariable UUID roleId,
			@Valid @RequestBody CreateRoleDataScopeRequest request) {
		RoleDataScopeDetails created = scopes.create(mapper.toCreateCommand(roleId, request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping
	public List<RoleDataScopeResponse> list(@PathVariable UUID roleId) {
		return mapper.toResponseList(scopes.listByRole(roleId));
	}

	@DeleteMapping("/{scopeId}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID roleId,
			@PathVariable UUID scopeId) {
		scopes.delete(new RoleDataScopeId(scopeId));
		return ResponseEntity.noContent().build();
	}

}
