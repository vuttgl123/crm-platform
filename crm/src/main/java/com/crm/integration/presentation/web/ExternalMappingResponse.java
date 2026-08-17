package com.crm.integration.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record ExternalMappingResponse(
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
}
