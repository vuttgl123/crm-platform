package com.crm.customer.customfield.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.dto.CustomFieldValueDetails;
import com.crm.customer.customfield.domain.CustomFieldDataType;
import com.crm.customer.customfield.domain.CustomFieldDefinition;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;
import com.crm.customer.customfield.domain.CustomFieldValue;
import com.crm.customer.customfield.domain.CustomFieldValueId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class CustomFieldJdbcMapper {

	private CustomFieldJdbcMapper() {
	}

	public static CustomFieldDefinition mapDefinition(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		CustomFieldDefinitionId id = CustomFieldDefinitionId.from(rs.getObject("id", UUID.class));
		String entityType = rs.getString("entity_type");
		String fieldKey = rs.getString("field_key");
		String displayName = rs.getString("display_name");
		String dataTypeStr = rs.getString("data_type");
		CustomFieldDataType dataType = dataTypeStr != null ? CustomFieldDataType.valueOf(dataTypeStr) : CustomFieldDataType.TEXT;
		String description = rs.getString("description");
		String validationRulesJson = rs.getString("validation_rules");
		String optionValuesJson = rs.getString("option_values");
		boolean required = rs.getBoolean("is_required");
		boolean searchable = rs.getBoolean("is_searchable");
		boolean sensitive = rs.getBoolean("is_sensitive");
		boolean active = rs.getBoolean("is_active");
		int displayOrder = rs.getInt("display_order");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new CustomFieldDefinition(
				tenantId,
				id,
				entityType,
				fieldKey,
				displayName,
				dataType,
				description,
				validationRulesJson,
				optionValuesJson,
				required,
				searchable,
				sensitive,
				active,
				displayOrder,
				auditInfo,
				version
		);
	}

	public static CustomFieldDefinitionDetails mapDefinitionDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String entityType = rs.getString("entity_type");
		String fieldKey = rs.getString("field_key");
		String displayName = rs.getString("display_name");
		String dataTypeStr = rs.getString("data_type");
		CustomFieldDataType dataType = dataTypeStr != null ? CustomFieldDataType.valueOf(dataTypeStr) : CustomFieldDataType.TEXT;
		String description = rs.getString("description");
		String validationRulesJson = rs.getString("validation_rules");
		String optionValuesJson = rs.getString("option_values");
		boolean required = rs.getBoolean("is_required");
		boolean searchable = rs.getBoolean("is_searchable");
		boolean sensitive = rs.getBoolean("is_sensitive");
		boolean active = rs.getBoolean("is_active");
		int displayOrder = rs.getInt("display_order");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new CustomFieldDefinitionDetails(
				id,
				entityType,
				fieldKey,
				displayName,
				dataType,
				description,
				validationRulesJson,
				optionValuesJson,
				required,
				searchable,
				sensitive,
				active,
				displayOrder,
				createdBy,
				createdAt,
				updatedBy,
				updatedAt,
				version
		);
	}

	public static CustomFieldValue mapValue(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		CustomFieldValueId id = CustomFieldValueId.from(rs.getObject("id", UUID.class));
		CustomFieldDefinitionId definitionId = CustomFieldDefinitionId.from(rs.getObject("definition_id", UUID.class));
		String entityType = rs.getString("entity_type");
		UUID entityId = rs.getObject("entity_id", UUID.class);
		String valueJson = rs.getString("value_jsonb");
		String searchText = rs.getString("search_text");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new CustomFieldValue(
				tenantId,
				id,
				definitionId,
				entityType,
				entityId,
				valueJson,
				searchText,
				auditInfo,
				version
		);
	}

	public static CustomFieldValueDetails mapValueDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID definitionId = rs.getObject("definition_id", UUID.class);
		String fieldKey = rs.getString("field_key");
		String displayName = rs.getString("display_name");
		String dataTypeStr = rs.getString("data_type");
		CustomFieldDataType dataType = dataTypeStr != null ? CustomFieldDataType.valueOf(dataTypeStr) : CustomFieldDataType.TEXT;
		String entityType = rs.getString("entity_type");
		UUID entityId = rs.getObject("entity_id", UUID.class);
		String valueJson = rs.getString("value_jsonb");
		String searchText = rs.getString("search_text");

		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		UUID updatedBy = rs.getObject("updated_by", UUID.class);

		long version = rs.getLong("version");

		return new CustomFieldValueDetails(
				id,
				definitionId,
				fieldKey,
				displayName,
				dataType,
				entityType,
				entityId,
				valueJson,
				searchText,
				updatedAt,
				updatedBy,
				version
		);
	}

}
