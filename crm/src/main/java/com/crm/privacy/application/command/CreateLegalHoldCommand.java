package com.crm.privacy.application.command;

import java.util.UUID;

public record CreateLegalHoldCommand(
		String holdCode,
		String name,
		String entityType,
		UUID entityId,
		String scopeFilter,
		String reason
) {
}
