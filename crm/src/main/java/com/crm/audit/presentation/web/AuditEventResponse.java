package com.crm.audit.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.AuditAction;

public record AuditEventResponse(
		UUID id,
		Instant occurredAt,
		String schemaName,
		String tableName,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		String changedFields,
		String oldValues,
		String newValues,
		UUID actorUserId,
		ActorType actorType,
		UUID requestId,
		UUID correlationId,
		String sourceIp,
		String userAgent,
		String applicationName) {
}
