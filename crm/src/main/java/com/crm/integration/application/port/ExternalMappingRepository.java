package com.crm.integration.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.domain.ExternalIdMapping;
import com.crm.integration.domain.ExternalMappingId;
import com.crm.sharedkernel.domain.TenantId;

public interface ExternalMappingRepository {

	Optional<ExternalIdMapping> findById(TenantId tenantId, ExternalMappingId id);

	Optional<ExternalIdMapping> findByExternalId(
			TenantId tenantId, String integrationKey, String entityType, String externalEntityId);

	Optional<ExternalIdMapping> findByInternalId(
			TenantId tenantId, String integrationKey, String entityType, UUID internalEntityId);

	List<ExternalMappingDetails> findByIntegrationKey(TenantId tenantId, String integrationKey);

	boolean exists(TenantId tenantId, String integrationKey, String entityType, String externalEntityId, UUID internalEntityId);

	void insert(ExternalIdMapping mapping);

	void update(ExternalIdMapping mapping);

	void delete(TenantId tenantId, ExternalMappingId id);

}
