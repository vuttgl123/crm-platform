package com.crm.integration.application.usecase;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.integration.application.command.CreateExternalMappingCommand;
import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.domain.ExternalMappingId;

public interface IntegrationMappingFacade {

	ExternalMappingDetails create(CreateExternalMappingCommand command);

	Optional<ExternalMappingDetails> findByExternalId(String integrationKey, String entityType, String externalEntityId);

	Optional<ExternalMappingDetails> findByInternalId(String integrationKey, String entityType, UUID internalEntityId);

	List<ExternalMappingDetails> findByIntegrationKey(String integrationKey);

	void delete(ExternalMappingId id);

}
