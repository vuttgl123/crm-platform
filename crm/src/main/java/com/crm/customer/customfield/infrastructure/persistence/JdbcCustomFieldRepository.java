package com.crm.customer.customfield.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.dto.CustomFieldValueDetails;
import com.crm.customer.customfield.application.port.CustomFieldRepository;
import com.crm.customer.customfield.application.query.CustomFieldDefinitionSearchQuery;
import com.crm.customer.customfield.domain.CustomFieldDefinition;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;
import com.crm.customer.customfield.domain.CustomFieldValue;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcCustomFieldRepository implements CustomFieldRepository {

	private static final String DEFINITION_SELECT = """
			SELECT cfd.tenant_id, cfd.id, cfd.entity_type, cfd.field_key, cfd.display_name,
			       cfd.data_type, cfd.description, cfd.validation_rules, cfd.option_values,
			       cfd.is_required, cfd.is_searchable, cfd.is_sensitive, cfd.is_active,
			       cfd.display_order, cfd.created_at, cfd.updated_at, cfd.created_by,
			       cfd.updated_by, cfd.version
			FROM crm.custom_field_definitions cfd
			""";

	private static final String VALUE_SELECT = """
			SELECT cfv.tenant_id, cfv.id, cfv.definition_id, cfv.entity_type, cfv.entity_id,
			       cfv.value_jsonb, cfv.search_text, cfv.created_at, cfv.updated_at,
			       cfv.created_by, cfv.updated_by, cfv.version
			FROM crm.custom_field_values cfv
			""";

	private static final String VALUE_DETAILS_SELECT = """
			SELECT cfv.id, cfv.definition_id, cfd.field_key, cfd.display_name, cfd.data_type,
			       cfv.entity_type, cfv.entity_id, cfv.value_jsonb, cfv.search_text,
			       cfv.updated_at, cfv.updated_by, cfv.version
			FROM crm.custom_field_values cfv
			JOIN crm.custom_field_definitions cfd ON cfd.tenant_id = cfv.tenant_id AND cfd.id = cfv.definition_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcCustomFieldRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<CustomFieldDefinition> findDefinitionById(TenantId tenantId, CustomFieldDefinitionId id) {
		String sql = DEFINITION_SELECT + """
				WHERE cfd.tenant_id = :tenantId
				  AND cfd.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(CustomFieldJdbcMapper::mapDefinition)
				.optional();
	}

	@Override
	public Optional<CustomFieldDefinition> findDefinitionByKey(TenantId tenantId, String entityType, String fieldKey) {
		String sql = DEFINITION_SELECT + """
				WHERE cfd.tenant_id = :tenantId
				  AND cfd.entity_type = :entityType
				  AND lower(cfd.field_key) = lower(:fieldKey)
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("entityType", entityType.trim().toUpperCase())
				.param("fieldKey", fieldKey.trim().toLowerCase())
				.query(CustomFieldJdbcMapper::mapDefinition)
				.optional();
	}

	@Override
	public boolean existsDefinitionByKey(TenantId tenantId, String entityType, String fieldKey) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.custom_field_definitions cfd
				WHERE cfd.tenant_id = :tenantId
				  AND cfd.entity_type = :entityType
				  AND lower(cfd.field_key) = lower(:fieldKey)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("entityType", entityType.trim().toUpperCase())
				.param("fieldKey", fieldKey.trim().toLowerCase())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<CustomFieldDefinitionDetails> findDefinitions(TenantId tenantId, CustomFieldDefinitionSearchQuery query) {
		StringBuilder whereClause = new StringBuilder("WHERE cfd.tenant_id = :tenantId ");
		if (query.entityType() != null && !query.entityType().isBlank()) {
			whereClause.append("AND cfd.entity_type = :entityType ");
		}
		if (query.active() != null) {
			whereClause.append("AND cfd.is_active = :active ");
		}

		String sql = DEFINITION_SELECT + whereClause + "ORDER BY cfd.entity_type ASC, cfd.display_order ASC, cfd.field_key ASC";
		var spec = jdbcClient.sql(sql).param("tenantId", tenantId.value());

		if (query.entityType() != null && !query.entityType().isBlank()) {
			spec.param("entityType", query.entityType().trim().toUpperCase());
		}
		if (query.active() != null) {
			spec.param("active", query.active());
		}

		return spec.query(CustomFieldJdbcMapper::mapDefinitionDetails).list();
	}

	@Override
	public void insertDefinition(CustomFieldDefinition def) {
		String sql = """
				INSERT INTO crm.custom_field_definitions (
				    tenant_id, id, entity_type, field_key, display_name,
				    data_type, description, validation_rules, option_values,
				    is_required, is_searchable, is_sensitive, is_active,
				    display_order, created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :entityType, :fieldKey, :displayName,
				    :dataType, :description, CAST(:validationRules AS jsonb), CAST(:optionValues AS jsonb),
				    :required, :searchable, :sensitive, :active,
				    :displayOrder, :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", def.tenantId().value())
				.param("id", def.id().value())
				.param("entityType", def.entityType())
				.param("fieldKey", def.fieldKey())
				.param("displayName", def.displayName())
				.param("dataType", def.dataType().name())
				.param("description", def.description())
				.param("validationRules", def.validationRulesJson())
				.param("optionValues", def.optionValuesJson())
				.param("required", def.isRequired())
				.param("searchable", def.isSearchable())
				.param("sensitive", def.isSensitive())
				.param("active", def.isActive())
				.param("displayOrder", def.displayOrder())
				.param("createdAt", Timestamp.from(def.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(def.auditInfo().updatedAt()))
				.param("createdBy", def.auditInfo().createdBy() != null ? def.auditInfo().createdBy().value() : null)
				.param("updatedBy", def.auditInfo().updatedBy() != null ? def.auditInfo().updatedBy().value() : null)
				.param("version", def.version())
				.update();
	}

	@Override
	public void updateDefinition(CustomFieldDefinition def) {
		String sql = """
				UPDATE crm.custom_field_definitions
				SET display_name = :displayName,
				    description = :description,
				    validation_rules = CAST(:validationRules AS jsonb),
				    option_values = CAST(:optionValues AS jsonb),
				    is_required = :required,
				    is_searchable = :searchable,
				    is_sensitive = :sensitive,
				    is_active = :active,
				    display_order = :displayOrder,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", def.tenantId().value())
				.param("id", def.id().value())
				.param("displayName", def.displayName())
				.param("description", def.description())
				.param("validationRules", def.validationRulesJson())
				.param("optionValues", def.optionValuesJson())
				.param("required", def.isRequired())
				.param("searchable", def.isSearchable())
				.param("sensitive", def.isSensitive())
				.param("active", def.isActive())
				.param("displayOrder", def.displayOrder())
				.param("updatedAt", Timestamp.from(def.auditInfo().updatedAt()))
				.param("updatedBy", def.auditInfo().updatedBy() != null ? def.auditInfo().updatedBy().value() : null)
				.param("newVersion", def.version())
				.param("expectedVersion", def.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("CustomFieldDefinition update failed due to version mismatch");
		}
	}

	@Override
	public Optional<CustomFieldValue> findValueByEntityAndDefinition(TenantId tenantId, CustomFieldDefinitionId definitionId, UUID entityId) {
		String sql = VALUE_SELECT + """
				WHERE cfv.tenant_id = :tenantId
				  AND cfv.definition_id = :definitionId
				  AND cfv.entity_id = :entityId
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("definitionId", definitionId.value())
				.param("entityId", entityId)
				.query(CustomFieldJdbcMapper::mapValue)
				.optional();
	}

	@Override
	public List<CustomFieldValueDetails> findValuesByEntity(TenantId tenantId, String entityType, UUID entityId) {
		String sql = VALUE_DETAILS_SELECT + """
				WHERE cfv.tenant_id = :tenantId
				  AND cfv.entity_type = :entityType
				  AND cfv.entity_id = :entityId
				ORDER BY cfd.display_order ASC, cfd.field_key ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("entityType", entityType.trim().toUpperCase())
				.param("entityId", entityId)
				.query(CustomFieldJdbcMapper::mapValueDetails)
				.list();
	}

	@Override
	public void insertValue(CustomFieldValue val) {
		String sql = """
				INSERT INTO crm.custom_field_values (
				    tenant_id, id, definition_id, entity_type, entity_id,
				    value_jsonb, search_text, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :definitionId, :entityType, :entityId,
				    CAST(:valueJsonb AS jsonb), :searchText, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", val.tenantId().value())
				.param("id", val.id().value())
				.param("definitionId", val.definitionId().value())
				.param("entityType", val.entityType())
				.param("entityId", val.entityId())
				.param("valueJsonb", val.valueJson())
				.param("searchText", val.searchText())
				.param("createdAt", Timestamp.from(val.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(val.auditInfo().updatedAt()))
				.param("createdBy", val.auditInfo().createdBy() != null ? val.auditInfo().createdBy().value() : null)
				.param("updatedBy", val.auditInfo().updatedBy() != null ? val.auditInfo().updatedBy().value() : null)
				.param("version", val.version())
				.update();
	}

	@Override
	public void updateValue(CustomFieldValue val) {
		String sql = """
				UPDATE crm.custom_field_values
				SET value_jsonb = CAST(:valueJsonb AS jsonb),
				    search_text = :searchText,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", val.tenantId().value())
				.param("id", val.id().value())
				.param("valueJsonb", val.valueJson())
				.param("searchText", val.searchText())
				.param("updatedAt", Timestamp.from(val.auditInfo().updatedAt()))
				.param("updatedBy", val.auditInfo().updatedBy() != null ? val.auditInfo().updatedBy().value() : null)
				.param("newVersion", val.version())
				.param("expectedVersion", val.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("CustomFieldValue update failed due to version mismatch");
		}
	}

}
