package com.crm.audit.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record AuditEvent(
		TenantId tenantId,
		Instant occurredAt,
		UUID id,
		String schemaName,
		String tableName,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		String changedFields,
		String oldValues,
		String newValues,
		ActorId actorUserId,
		ActorType actorType,
		UUID requestId,
		UUID correlationId,
		String sourceIp,
		String userAgent,
		String applicationName) {

	public AuditEvent {
		Objects.requireNonNull(tenantId, "tenantId must not be null");
		Objects.requireNonNull(occurredAt, "occurredAt must not be null");
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(schemaName, "schemaName must not be null");
		Objects.requireNonNull(tableName, "tableName must not be null");
		Objects.requireNonNull(aggregateType, "aggregateType must not be null");
		Objects.requireNonNull(action, "action must not be null");
		actorType = actorType == null ? ActorType.USER : actorType;
	}

}
