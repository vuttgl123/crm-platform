package com.crm.customer.customfield.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.customfield.application.dto.CustomFieldDefinitionDetails;
import com.crm.customer.customfield.application.dto.CustomFieldValueDetails;
import com.crm.customer.customfield.application.query.CustomFieldDefinitionSearchQuery;
import com.crm.customer.customfield.domain.CustomFieldDefinition;
import com.crm.customer.customfield.domain.CustomFieldDefinitionId;
import com.crm.customer.customfield.domain.CustomFieldValue;
import com.crm.sharedkernel.domain.TenantId;

public interface CustomFieldRepository {

	Optional<CustomFieldDefinition> findDefinitionById(TenantId tenantId, CustomFieldDefinitionId id);

	Optional<CustomFieldDefinition> findDefinitionByKey(TenantId tenantId, String entityType, String fieldKey);

	boolean existsDefinitionByKey(TenantId tenantId, String entityType, String fieldKey);

	List<CustomFieldDefinitionDetails> findDefinitions(TenantId tenantId, CustomFieldDefinitionSearchQuery query);

	void insertDefinition(CustomFieldDefinition definition);

	void updateDefinition(CustomFieldDefinition definition);

	Optional<CustomFieldValue> findValueByEntityAndDefinition(TenantId tenantId, CustomFieldDefinitionId definitionId, UUID entityId);

	List<CustomFieldValueDetails> findValuesByEntity(TenantId tenantId, String entityType, UUID entityId);

	void insertValue(CustomFieldValue value);

	void updateValue(CustomFieldValue value);

}
