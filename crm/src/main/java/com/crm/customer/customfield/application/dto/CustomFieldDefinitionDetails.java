package com.crm.customer.customfield.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.customfield.domain.CustomFieldDataType;
import com.crm.customer.customfield.domain.CustomFieldDefinition;

public record CustomFieldDefinitionDetails(
		UUID id,
		String entityType,
		String fieldKey,
		String displayName,
		CustomFieldDataType dataType,
		String description,
		String validationRulesJson,
		String optionValuesJson,
		boolean required,
		boolean searchable,
		boolean sensitive,
		boolean active,
		int displayOrder,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static CustomFieldDefinitionDetails from(CustomFieldDefinition def) {
		return new CustomFieldDefinitionDetails(
				def.id().value(),
				def.entityType(),
				def.fieldKey(),
				def.displayName(),
				def.dataType(),
				def.description(),
				def.validationRulesJson(),
				def.optionValuesJson(),
				def.isRequired(),
				def.isSearchable(),
				def.isSensitive(),
				def.isActive(),
				def.displayOrder(),
				def.auditInfo().createdBy() != null ? def.auditInfo().createdBy().value() : null,
				def.auditInfo().createdAt(),
				def.auditInfo().updatedBy() != null ? def.auditInfo().updatedBy().value() : null,
				def.auditInfo().updatedAt(),
				def.version()
		);
	}

}
