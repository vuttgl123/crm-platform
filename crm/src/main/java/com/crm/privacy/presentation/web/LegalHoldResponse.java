package com.crm.privacy.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record LegalHoldResponse(
		UUID id,
		String holdCode,
		String name,
		String entityType,
		UUID entityId,
		String scopeFilter,
		String reason,
		Instant effectiveFrom,
		Instant releasedAt,
		UUID releasedBy,
		Instant createdAt,
		UUID createdBy
) {
}
