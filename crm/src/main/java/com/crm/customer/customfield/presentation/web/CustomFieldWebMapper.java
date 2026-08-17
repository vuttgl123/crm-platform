package com.crm.customer.customfield.presentation.web;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.crm.customer.customfield.application.command.CreateCustomFieldDefinitionCommand;
import com.crm.customer.customfield.application.command.SetCustomFieldValueItem;
import com.crm.customer.customfield.application.command.SetEntityCustomFieldsCommand;
import com.crm.customer.customfield.application.command.UpdateCustomFieldDefinitionCommand;
import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.dto.CustomFieldValueDetails;
import com.crm.customer.customfield.application.dto.EntityCustomFieldsDetails;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;
import com.crm.customer.customfield.domain.CustomFieldValueId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CustomFieldWebMapper {

	default CreateCustomFieldDefinitionCommand toCreateDefinitionCommand(CreateCustomFieldDefinitionRequest request) {
		return new CreateCustomFieldDefinitionCommand(
				request.entityType(),
				request.fieldKey(),
				request.displayName(),
				request.dataType(),
				request.description(),
				request.validationRulesJson(),
				request.optionValuesJson(),
				request.required(),
				request.searchable(),
				request.sensitive(),
				request.displayOrder()
		);
	}

	default UpdateCustomFieldDefinitionCommand toUpdateDefinitionCommand(CustomFieldDefinitionId id, UpdateCustomFieldDefinitionRequest request) {
		return new UpdateCustomFieldDefinitionCommand(
				id,
				request.version(),
				request.displayName(),
				request.description(),
				request.validationRulesJson(),
				request.optionValuesJson(),
				request.required(),
				request.searchable(),
				request.sensitive(),
				request.active(),
				request.displayOrder()
		);
	}

	default SetEntityCustomFieldsCommand toSetCommand(SetEntityCustomFieldsRequest request) {
		List<SetCustomFieldValueItem> items = new ArrayList<>();
		if (request.fieldValues() != null) {
			for (CustomFieldValueItemRequest item : request.fieldValues()) {
				items.add(new SetCustomFieldValueItem(item.definitionId(), item.fieldKey(), item.valueJson()));
			}
		}
		return new SetEntityCustomFieldsCommand(request.entityType(), request.entityId(), items);
	}

	CustomFieldDefinitionResponse toDefinitionResponse(CustomFieldDefinitionDetails details);

	List<CustomFieldDefinitionResponse> toDefinitionResponseList(List<CustomFieldDefinitionDetails> list);

	CustomFieldValueResponse toValueResponse(CustomFieldValueDetails details);

	List<CustomFieldValueResponse> toValueResponseList(List<CustomFieldValueDetails> list);

	EntityCustomFieldsResponse toEntityCustomFieldsResponse(EntityCustomFieldsDetails details);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(CustomFieldDefinitionId value) {
		return value == null ? null : value.value();
	}

	default CustomFieldDefinitionId mapToCustomFieldDefinitionId(UUID value) {
		return value == null ? null : new CustomFieldDefinitionId(value);
	}

	default UUID map(CustomFieldValueId value) {
		return value == null ? null : value.value();
	}

	default CustomFieldValueId mapToCustomFieldValueId(UUID value) {
		return value == null ? null : new CustomFieldValueId(value);
	}

}
