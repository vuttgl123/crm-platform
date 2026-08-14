package com.crm.audit.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.AuditAction;
import com.crm.sharedkernel.domain.ActorId;

public record AuditEventSummary(
		UUID id,
		Instant occurredAt,
		String schemaName,
		String tableName,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		String changedFields,
		ActorId actorUserId,
		ActorType actorType,
		String sourceIp,
		String userAgent) {
}
