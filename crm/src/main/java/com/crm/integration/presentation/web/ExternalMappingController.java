package com.crm.integration.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.application.usecase.IntegrationMappingFacade;
import com.crm.integration.domain.ExternalMappingId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integration/mappings")
public final class ExternalMappingController {

	private final IntegrationMappingFacade mappings;
	private final ExternalMappingWebMapper mapper;

	public ExternalMappingController(IntegrationMappingFacade mappings, ExternalMappingWebMapper mapper) {
		this.mappings = mappings;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ExternalMappingResponse> create(@Valid @RequestBody CreateExternalMappingRequest request) {
		ExternalMappingDetails created = mappings.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping
	public ResponseEntity<?> find(
			@RequestParam String integrationKey,
			@RequestParam(required = false) String entityType,
			@RequestParam(required = false) String externalEntityId,
			@RequestParam(required = false) UUID internalEntityId) {

		if (entityType != null && externalEntityId != null) {
			return mappings.findByExternalId(integrationKey, entityType, externalEntityId)
					.map(mapper::toResponse)
					.map(ResponseEntity::ok)
					.orElseGet(() -> ResponseEntity.notFound().build());
		}

		if (entityType != null && internalEntityId != null) {
			return mappings.findByInternalId(integrationKey, entityType, internalEntityId)
					.map(mapper::toResponse)
					.map(ResponseEntity::ok)
					.orElseGet(() -> ResponseEntity.notFound().build());
		}

		List<ExternalMappingDetails> list = mappings.findByIntegrationKey(integrationKey);
		return ResponseEntity.ok(mapper.toResponseList(list));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		mappings.delete(new ExternalMappingId(id));
		return ResponseEntity.noContent().build();
	}

}
