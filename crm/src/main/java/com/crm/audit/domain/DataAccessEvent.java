package com.crm.audit.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record DataAccessEvent(
		TenantId tenantId,
		Instant occurredAt,
		UUID id,
		String entityType,
		UUID entityId,
		DataAccessType accessType,
		String fieldsAccessed,
		ActorId actorUserId,
		ActorType actorType,
		String purpose,
		String legalBasis,
		UUID requestId,
		String sourceIp,
		String userAgent,
		String metadata) {

	public DataAccessEvent {
		Objects.requireNonNull(tenantId, "tenantId must not be null");
		Objects.requireNonNull(occurredAt, "occurredAt must not be null");
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(entityType, "entityType must not be null");
		Objects.requireNonNull(accessType, "accessType must not be null");
		actorType = actorType == null ? ActorType.USER : actorType;
	}

}
