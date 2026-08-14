package com.crm.audit.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.DataAccessType;
import com.crm.sharedkernel.domain.ActorId;

public record DataAccessEventSummary(
		UUID id,
		Instant occurredAt,
		String entityType,
		UUID entityId,
		DataAccessType accessType,
		String fieldsAccessed,
		ActorId actorUserId,
		ActorType actorType,
		String purpose,
		String legalBasis,
		String sourceIp,
		String userAgent) {
}
