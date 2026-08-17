package com.crm.customer.customfield.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.query.CustomFieldDefinitionSearchQuery;
import com.crm.customer.customfield.application.usecase.CustomFieldFacade;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/custom-fields/definitions")
public final class CustomFieldDefinitionController {

	private final CustomFieldFacade customFields;
	private final CustomFieldWebMapper mapper;

	public CustomFieldDefinitionController(CustomFieldFacade customFields, CustomFieldWebMapper mapper) {
		this.customFields = customFields;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<CustomFieldDefinitionResponse> create(@Valid @RequestBody CreateCustomFieldDefinitionRequest request) {
		CustomFieldDefinitionDetails created = customFields.createDefinition(mapper.toCreateDefinitionCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDefinitionResponse(created));
	}

	@GetMapping("/{id}")
	public CustomFieldDefinitionResponse get(@PathVariable UUID id) {
		return mapper.toDefinitionResponse(customFields.getDefinition(new CustomFieldDefinitionId(id)));
	}

	@GetMapping
	public List<CustomFieldDefinitionResponse> list(
			@RequestParam(required = false) String entityType,
			@RequestParam(required = false) Boolean active) {
		CustomFieldDefinitionSearchQuery query = new CustomFieldDefinitionSearchQuery(entityType, active);
		return mapper.toDefinitionResponseList(customFields.listDefinitions(query));
	}

	@PutMapping("/{id}")
	public CustomFieldDefinitionResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateCustomFieldDefinitionRequest request) {
		return mapper.toDefinitionResponse(customFields.updateDefinition(mapper.toUpdateDefinitionCommand(new CustomFieldDefinitionId(id), request)));
	}

}
