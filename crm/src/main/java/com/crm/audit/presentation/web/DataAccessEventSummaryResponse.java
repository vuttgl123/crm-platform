package com.crm.audit.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.DataAccessType;

public record DataAccessEventSummaryResponse(
		UUID id,
		Instant occurredAt,
		String entityType,
		UUID entityId,
		DataAccessType accessType,
		String fieldsAccessed,
		UUID actorUserId,
		ActorType actorType,
		String purpose,
		String legalBasis,
		String sourceIp,
		String userAgent) {
}
