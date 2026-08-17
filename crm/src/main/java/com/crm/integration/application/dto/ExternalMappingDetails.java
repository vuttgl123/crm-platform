package com.crm.integration.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.integration.domain.ExternalIdMapping;

public record ExternalMappingDetails(
		UUID id,
		String integrationKey,
		String entityType,
		UUID internalEntityId,
		String externalEntityId,
		String externalVersion,
		Instant lastSyncedAt,
		String metadata,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static ExternalMappingDetails from(ExternalIdMapping mapping) {
		return new ExternalMappingDetails(
				mapping.id().value(),
				mapping.integrationKey(),
				mapping.entityType(),
				mapping.internalEntityId(),
				mapping.externalEntityId(),
				mapping.externalVersion(),
				mapping.lastSyncedAt(),
				mapping.metadata(),
				mapping.auditInfo().createdBy() != null ? mapping.auditInfo().createdBy().value() : null,
				mapping.auditInfo().createdAt(),
				mapping.auditInfo().updatedBy() != null ? mapping.auditInfo().updatedBy().value() : null,
				mapping.auditInfo().updatedAt(),
				mapping.version()
		);
	}

}
