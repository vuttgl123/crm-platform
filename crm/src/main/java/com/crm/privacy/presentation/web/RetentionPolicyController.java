package com.crm.privacy.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.application.usecase.RetentionPolicyFacade;
import com.crm.privacy.domain.RetentionPolicyId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/privacy/retention-policies")
public final class RetentionPolicyController {

	private final RetentionPolicyFacade retentionPolicies;
	private final RetentionPolicyWebMapper mapper;

	public RetentionPolicyController(RetentionPolicyFacade retentionPolicies, RetentionPolicyWebMapper mapper) {
		this.retentionPolicies = retentionPolicies;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<RetentionPolicyResponse> create(@Valid @RequestBody CreateRetentionPolicyRequest request) {
		RetentionPolicyDetails created = retentionPolicies.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public RetentionPolicyResponse get(@PathVariable UUID id) {
		return mapper.toResponse(retentionPolicies.get(new RetentionPolicyId(id)));
	}

	@GetMapping
	public List<RetentionPolicyResponse> list() {
		return mapper.toResponseList(retentionPolicies.list());
	}

	@PutMapping("/{id}")
	public RetentionPolicyResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateRetentionPolicyRequest request) {
		return mapper.toResponse(retentionPolicies.update(mapper.toUpdateCommand(new RetentionPolicyId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		retentionPolicies.delete(new RetentionPolicyId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

}
