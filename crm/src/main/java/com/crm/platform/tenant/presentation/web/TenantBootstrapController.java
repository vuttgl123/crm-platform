package com.crm.platform.tenant.presentation.web;

import jakarta.validation.Valid;
import com.crm.platform.tenant.application.dto.TenantDetails;
import com.crm.platform.tenant.application.usecase.TenantBootstrapFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tenants")
public final class TenantBootstrapController {

	private final TenantBootstrapFacade tenants;
	private final TenantWebMapper mapper;

	public TenantBootstrapController(TenantBootstrapFacade tenants,
			TenantWebMapper mapper) {
		this.tenants = tenants;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<TenantResponse> bootstrap(
			@Valid @RequestBody BootstrapTenantRequest request) {
		TenantDetails created = tenants.bootstrap(mapper.toCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

}
