package com.crm.customer.customfield.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.customfield.domain.CustomFieldDataType;
import com.crm.customer.customfield.domain.CustomFieldValue;

public record CustomFieldValueDetails(
		UUID id,
		UUID definitionId,
		String fieldKey,
		String displayName,
		CustomFieldDataType dataType,
		String entityType,
		UUID entityId,
		String valueJson,
		String searchText,
		Instant updatedAt,
		UUID updatedBy,
		long version
) {

	public static CustomFieldValueDetails from(CustomFieldValue val, CustomFieldDefinitionDetails def) {
		return new CustomFieldValueDetails(
				val.id().value(),
				val.definitionId().value(),
				def != null ? def.fieldKey() : null,
				def != null ? def.displayName() : null,
				def != null ? def.dataType() : null,
				val.entityType(),
				val.entityId(),
				val.valueJson(),
				val.searchText(),
				val.auditInfo().updatedAt(),
				val.auditInfo().updatedBy() != null ? val.auditInfo().updatedBy().value() : null,
				val.version()
		);
	}

}
