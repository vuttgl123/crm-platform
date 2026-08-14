package com.crm.audit.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.AuditAction;

public record AuditEventSummaryResponse(
		UUID id,
		Instant occurredAt,
		String schemaName,
		String tableName,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		String changedFields,
		UUID actorUserId,
		ActorType actorType,
		String sourceIp,
		String userAgent) {
}
