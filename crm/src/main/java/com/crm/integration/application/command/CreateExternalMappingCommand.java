package com.crm.integration.application.command;

import java.util.UUID;

public record CreateExternalMappingCommand(
		String integrationKey,
		String entityType,
		UUID internalEntityId,
		String externalEntityId,
		String externalVersion,
		String metadata
) {
}
