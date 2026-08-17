package com.crm.integration.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.integration.application.command.CreateExternalMappingCommand;
import com.crm.integration.application.dto.ExternalMappingDetails;
import com.crm.integration.application.port.ExternalMappingRepository;
import com.crm.integration.application.usecase.IntegrationMappingFacade;
import com.crm.integration.domain.ExternalIdMapping;
import com.crm.integration.domain.ExternalMappingId;
import com.crm.integration.domain.IntegrationErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IntegrationMappingApplicationService implements IntegrationMappingFacade {

	private final ExternalMappingRepository mappingRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public IntegrationMappingApplicationService(
			ExternalMappingRepository mappingRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.mappingRepository = mappingRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public ExternalMappingDetails create(CreateExternalMappingCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		if (mappingRepository.exists(tenantId, command.integrationKey(), command.entityType(), command.externalEntityId(), command.internalEntityId())) {
			throw new ResourceConflict(IntegrationErrorCode.EXTERNAL_MAPPING_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		ExternalMappingId id = new ExternalMappingId(identifierGenerator.nextId());

		ExternalIdMapping mapping = ExternalIdMapping.create(
				tenantId,
				id,
				command.integrationKey(),
				command.entityType(),
				command.internalEntityId(),
				command.externalEntityId(),
				command.externalVersion(),
				command.metadata(),
				actorId,
				now
		);

		try {
			mappingRepository.insert(mapping);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(IntegrationErrorCode.EXTERNAL_MAPPING_ALREADY_EXISTS.code());
		}

		return ExternalMappingDetails.from(mapping);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<ExternalMappingDetails> findByExternalId(String integrationKey, String entityType, String externalEntityId) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);
		return mappingRepository.findByExternalId(tenantId, integrationKey, entityType, externalEntityId)
				.map(ExternalMappingDetails::from);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<ExternalMappingDetails> findByInternalId(String integrationKey, String entityType, UUID internalEntityId) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);
		return mappingRepository.findByInternalId(tenantId, integrationKey, entityType, internalEntityId)
				.map(ExternalMappingDetails::from);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ExternalMappingDetails> findByIntegrationKey(String integrationKey) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);
		return mappingRepository.findByIntegrationKey(tenantId, integrationKey);
	}

	@Override
	@Transactional
	public void delete(ExternalMappingId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		mappingRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(IntegrationErrorCode.EXTERNAL_MAPPING_NOT_FOUND.code()));

		mappingRepository.delete(tenantId, id);
	}

}
