package com.crm.customer.customfield.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.customfield.application.dto.EntityCustomFieldsDetails;
import com.crm.customer.customfield.application.usecase.CustomFieldFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/custom-fields/values")
public final class CustomFieldValueController {

	private final CustomFieldFacade customFields;
	private final CustomFieldWebMapper mapper;

	public CustomFieldValueController(CustomFieldFacade customFields, CustomFieldWebMapper mapper) {
		this.customFields = customFields;
		this.mapper = mapper;
	}

	@GetMapping
	public EntityCustomFieldsResponse getEntityCustomFields(
			@RequestParam String entityType,
			@RequestParam UUID entityId) {
		EntityCustomFieldsDetails details = customFields.getEntityCustomFields(entityType, entityId);
		return mapper.toEntityCustomFieldsResponse(details);
	}

	@PutMapping
	public EntityCustomFieldsResponse setEntityCustomFields(@Valid @RequestBody SetEntityCustomFieldsRequest request) {
		EntityCustomFieldsDetails details = customFields.setEntityCustomFields(mapper.toSetCommand(request));
		return mapper.toEntityCustomFieldsResponse(details);
	}

}
